import { randomUUID } from "node:crypto";
import { currentUser } from "@clerk/nextjs/server";
import type { IdentifiedSanityDocumentStub } from "@sanity/client";
import { type NextRequest, NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin";
import {
  type AdminDocumentDetail,
  type AdminDocumentSummary,
  type AdminDocumentType,
  type AdminReference,
  type AdminReferenceOption,
  isAdminDocumentType,
} from "@/lib/admin-document-types";
import { writeClient } from "@/sanity/lib/client";

type SanityAdminDocument = {
  _id: string;
  _type: AdminDocumentType;
  _createdAt?: string;
  _updatedAt?: string;
  _rev?: string;
  title?: string;
  description?: string;
  icon?: string;
  slug?: { current?: string };
  tier?: "free" | "pro" | "ultra";
  featured?: boolean;
  category?: AdminReference | null;
  modules?: AdminReference[];
  lessons?: AdminReference[];
  videoUrl?: string;
  duration?: number;
  content?: Array<Record<string, unknown>>;
  moduleCount?: number;
  lessonCount?: number;
  categoryTitle?: string;
  [key: string]: unknown;
};

type WritableSanityDocument = IdentifiedSanityDocumentStub<
  Record<string, unknown>
>;

const listProjection = `{
  _id,
  _type,
  _updatedAt,
  title,
  description,
  slug,
  icon,
  tier,
  featured,
  category,
  modules,
  lessons,
  videoUrl,
  duration,
  content,
  "categoryTitle": category->title,
  "moduleCount": count(modules),
  "lessonCount": count(lessons)
}`;

function baseDocumentId(id: string) {
  return id.replace(/^drafts\./, "");
}

function draftDocumentId(id: string) {
  const baseId = baseDocumentId(id);
  return `drafts.${baseId}`;
}

function isDraftId(id: string) {
  return id.startsWith("drafts.");
}

function documentPath(documentType: AdminDocumentType) {
  if (documentType === "category") return "categories";
  return `${documentType}s`;
}

function reference(id: string): AdminReference {
  return {
    _key: randomUUID(),
    _ref: baseDocumentId(id),
    _type: "reference",
  };
}

function textToBlocks(text: string) {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => ({
      _key: randomUUID().replaceAll("-", ""),
      _type: "block",
      children: [
        {
          _key: randomUUID().replaceAll("-", ""),
          _type: "span",
          marks: [],
          text: block,
        },
      ],
      markDefs: [],
      style: "normal",
    }));
}

function blocksToText(blocks: SanityAdminDocument["content"]) {
  if (!Array.isArray(blocks)) return "";

  return blocks
    .map((block) => {
      const children = block.children;
      if (!Array.isArray(children)) return "";

      return children
        .map((child) => {
          if (
            child &&
            typeof child === "object" &&
            "text" in child &&
            typeof child.text === "string"
          ) {
            return child.text;
          }
          return "";
        })
        .join("");
    })
    .filter(Boolean)
    .join("\n\n");
}

function stripSystemFields(document: SanityAdminDocument, nextId: string) {
  const rest = { ...document };
  delete rest._createdAt;
  delete rest._updatedAt;
  delete rest._rev;

  return {
    ...rest,
    _id: nextId,
  };
}

function writableDocument(
  document: SanityAdminDocument,
): WritableSanityDocument {
  return document as unknown as WritableSanityDocument;
}

function preferDrafts(documents: SanityAdminDocument[]) {
  const grouped = new Map<string, SanityAdminDocument>();

  for (const document of documents) {
    const baseId = baseDocumentId(document._id);
    const current = grouped.get(baseId);

    if (!current || isDraftId(document._id)) {
      grouped.set(baseId, document);
    }
  }

  return Array.from(grouped.values());
}

function toSummary(document: SanityAdminDocument): AdminDocumentSummary {
  const documentId = baseDocumentId(document._id);

  return {
    _id: document._id,
    documentId,
    _type: document._type,
    title: document.title || `Untitled ${document._type}`,
    description: document.description,
    slug: document.slug,
    isDraft: isDraftId(document._id),
    updatedAt: document._updatedAt,
    moduleCount: document.moduleCount,
    lessonCount: document.lessonCount,
    categoryTitle: document.categoryTitle,
  };
}

function toReferenceOption(
  document: SanityAdminDocument,
): AdminReferenceOption {
  return {
    _id: document._id,
    documentId: baseDocumentId(document._id),
    _type: document._type,
    title: document.title || `Untitled ${document._type}`,
    description: document.description,
  };
}

function toDetail(
  document: SanityAdminDocument,
  hasPublishedVersion: boolean,
): AdminDocumentDetail {
  return {
    ...toSummary(document),
    icon: document.icon,
    tier: document.tier,
    featured: document.featured,
    category: document.category,
    modules: document.modules || [],
    lessons: document.lessons || [],
    videoUrl: document.videoUrl,
    duration: document.duration,
    contentText: blocksToText(document.content),
    hasPublishedVersion,
  };
}

function getInitialDocument(documentType: AdminDocumentType) {
  const documentId = randomUUID();
  const title =
    documentType === "course"
      ? "Untitled Course"
      : documentType === "module"
        ? "Untitled Module"
        : documentType === "lesson"
          ? "Untitled Lesson"
          : "Untitled Category";

  const baseDocument: SanityAdminDocument = {
    _id: draftDocumentId(documentId),
    _type: documentType,
    title,
  };

  if (documentType === "course") {
    return {
      documentId,
      document: {
        ...baseDocument,
        slug: { _type: "slug", current: `course-${documentId}` },
        description: "",
        featured: false,
        tier: "free" as const,
        modules: [],
        completedBy: [],
      },
    };
  }

  if (documentType === "module") {
    return {
      documentId,
      document: {
        ...baseDocument,
        description: "",
        lessons: [],
        completedBy: [],
      },
    };
  }

  if (documentType === "lesson") {
    return {
      documentId,
      document: {
        ...baseDocument,
        slug: { _type: "slug", current: `lesson-${documentId}` },
        description: "",
        content: [],
        duration: 0,
        quiz: [],
        completedBy: [],
      },
    };
  }

  return {
    documentId,
    document: {
      ...baseDocument,
      description: "",
      icon: "",
    },
  };
}

async function requireAdmin() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  if (!email) {
    return { error: "Unauthorized", status: 401 };
  }

  if (!(await isAdminEmail(email))) {
    return { error: "Forbidden: Admin only", status: 403 };
  }

  return { email };
}

async function fetchDocuments(documentType: AdminDocumentType) {
  const documents = await writeClient.fetch<SanityAdminDocument[]>(
    `*[_type == $documentType && !(_id in path("versions.**"))] | order(_updatedAt desc) ${listProjection}`,
    { documentType },
  );

  return preferDrafts(documents);
}

async function fetchReferenceOptions() {
  const [categories, courses, modules, lessons] = await Promise.all([
    fetchDocuments("category"),
    fetchDocuments("course"),
    fetchDocuments("module"),
    fetchDocuments("lesson"),
  ]);

  return {
    categories: categories.map(toReferenceOption),
    courses: courses.map(toReferenceOption),
    modules: modules.map(toReferenceOption),
    lessons: lessons.map(toReferenceOption),
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchDocumentDetailOnce(
  documentType: AdminDocumentType,
  documentId: string,
) {
  const baseId = baseDocumentId(documentId);
  const draftId = draftDocumentId(baseId);

  const documents = await writeClient.fetch<SanityAdminDocument[]>(
    `*[_type == $documentType && _id in [$draftId, $baseId]] ${listProjection}`,
    { documentType, draftId, baseId },
  );

  const draft = documents.find((document) => document._id === draftId);
  const published = documents.find((document) => document._id === baseId);
  const document = draft || published;

  if (!document) return null;

  return toDetail(document, Boolean(published));
}

async function fetchDocumentDetail(
  documentType: AdminDocumentType,
  documentId: string,
  retries = 3,
) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const result = await fetchDocumentDetailOnce(documentType, documentId);
    if (result) return result;

    if (attempt < retries) {
      await sleep(500 * (attempt + 1));
    }
  }

  return null;
}

function payloadObject(body: unknown) {
  return body && typeof body === "object"
    ? (body as Record<string, unknown>)
    : {};
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function optionalBoolean(value: unknown) {
  return typeof value === "boolean" ? value : false;
}

function optionalNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function stringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function patchFor(
  documentType: AdminDocumentType,
  body: Record<string, unknown>,
) {
  const set: Record<string, unknown> = {
    title: optionalString(body.title),
    description: optionalString(body.description),
  };

  const unset: string[] = [];

  if (documentType === "course") {
    const categoryId = optionalString(body.categoryId);
    set.slug = { _type: "slug", current: optionalString(body.slug) };
    set.tier = optionalString(body.tier) || "free";
    set.featured = optionalBoolean(body.featured);
    set.modules = stringArray(body.moduleIds).map(reference);

    if (categoryId) {
      set.category = reference(categoryId);
    } else {
      unset.push("category");
    }
  }

  if (documentType === "module") {
    set.lessons = stringArray(body.lessonIds).map(reference);
  }

  if (documentType === "lesson") {
    set.slug = { _type: "slug", current: optionalString(body.slug) };
    set.videoUrl = optionalString(body.videoUrl);
    set.duration = optionalNumber(body.duration);
    set.content = textToBlocks(optionalString(body.contentText));
  }

  if (documentType === "category") {
    set.icon = optionalString(body.icon);
  }

  return { set, unset };
}

async function ensureDraft(
  documentType: AdminDocumentType,
  documentId: string,
) {
  const baseId = baseDocumentId(documentId);
  const draftId = draftDocumentId(baseId);

  const documents = await writeClient.fetch<SanityAdminDocument[]>(
    `*[_type == $documentType && _id in [$draftId, $baseId]] ${listProjection}`,
    { documentType, draftId, baseId },
  );

  const draft = documents.find((document) => document._id === draftId);
  if (draft) return { draft, draftId, baseId };

  const published = documents.find((document) => document._id === baseId);
  if (published) {
    const draftFromPublished = stripSystemFields(published, draftId);
    await writeClient.createIfNotExists(writableDocument(draftFromPublished), {
      visibility: "sync",
    });
    return { draft: draftFromPublished, draftId, baseId };
  }

  const initial = getInitialDocument(documentType);
  const document = { ...initial.document, _id: draftId };
  await writeClient.createIfNotExists(writableDocument(document), {
    visibility: "sync",
  });

  return { draft: document, draftId, baseId };
}

async function parseBody(req: NextRequest) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

async function guard() {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "SANITY_API_WRITE_TOKEN belum tersedia di server" },
      { status: 500 },
    );
  }

  return null;
}

export async function GET(req: NextRequest) {
  const errorResponse = await guard();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const documentType = searchParams.get("type");
  const documentId = searchParams.get("id");

  if (!isAdminDocumentType(documentType)) {
    return NextResponse.json(
      { error: "Document type tidak diizinkan" },
      { status: 400 },
    );
  }

  try {
    if (documentId) {
      const [document, references] = await Promise.all([
        fetchDocumentDetail(documentType, documentId),
        fetchReferenceOptions(),
      ]);

      if (!document) {
        return NextResponse.json(
          { error: "Dokumen tidak ditemukan" },
          { status: 404 },
        );
      }

      return NextResponse.json({ document, references });
    }

    const documents = await fetchDocuments(documentType);
    return NextResponse.json({ documents: documents.map(toSummary) });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal memuat dokumen Sanity";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const errorResponse = await guard();
  if (errorResponse) return errorResponse;

  const body = await parseBody(req);
  const payload = payloadObject(body);
  const documentType = payload.documentType;

  if (!isAdminDocumentType(documentType)) {
    return NextResponse.json(
      { error: "Document type tidak diizinkan" },
      { status: 400 },
    );
  }

  try {
    const { documentId, document } = getInitialDocument(documentType);
    await writeClient.createIfNotExists(writableDocument(document), {
      visibility: "sync",
    });

    return NextResponse.json({
      success: true,
      documentId,
      draftId: document._id,
      documentType,
      href: `/admin/${documentPath(documentType)}/${documentId}`,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal membuat dokumen Sanity";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const errorResponse = await guard();
  if (errorResponse) return errorResponse;

  const body = await parseBody(req);
  const payload = payloadObject(body);
  const documentType = payload.documentType;
  const documentId = optionalString(payload.documentId);

  if (!isAdminDocumentType(documentType) || !documentId) {
    return NextResponse.json(
      { error: "Document type atau ID tidak valid" },
      { status: 400 },
    );
  }

  try {
    const { draftId } = await ensureDraft(documentType, documentId);
    const { set, unset } = patchFor(documentType, payload);
    const patch = writeClient.patch(draftId).set(set);

    if (unset.length > 0) {
      patch.unset(unset);
    }

    await patch.commit({ visibility: "sync" });
    const document = await fetchDocumentDetail(documentType, documentId);
    if (!document) {
      return NextResponse.json(
        { error: "Dokumen tidak ditemukan setelah disimpan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, document });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal menyimpan dokumen Sanity";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const errorResponse = await guard();
  if (errorResponse) return errorResponse;

  const body = await parseBody(req);
  const payload = payloadObject(body);
  const documentType = payload.documentType;
  const documentId = optionalString(payload.documentId);
  const action = optionalString(payload.action);

  if (!isAdminDocumentType(documentType) || !documentId) {
    return NextResponse.json(
      { error: "Document type atau ID tidak valid" },
      { status: 400 },
    );
  }

  try {
    const baseId = baseDocumentId(documentId);
    const draftId = draftDocumentId(baseId);

    if (action === "publish") {
      const draft = await writeClient.fetch<SanityAdminDocument | null>(
        `*[_type == $documentType && _id == $draftId][0] ${listProjection}`,
        { documentType, draftId },
      );

      if (!draft) {
        return NextResponse.json(
          { error: "Draft belum ada untuk dipublish" },
          { status: 404 },
        );
      }

      await writeClient
        .transaction()
        .createOrReplace(writableDocument(stripSystemFields(draft, baseId)))
        .delete(draftId)
        .commit({ visibility: "sync" });

      const document = await fetchDocumentDetail(documentType, baseId);
      if (!document) {
        return NextResponse.json(
          { error: "Dokumen tidak ditemukan setelah publish" },
          { status: 404 },
        );
      }

      return NextResponse.json({ success: true, document });
    }

    return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal memproses dokumen Sanity";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const errorResponse = await guard();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const documentType = searchParams.get("type");
  const documentId = searchParams.get("id");

  if (!isAdminDocumentType(documentType) || !documentId) {
    return NextResponse.json(
      { error: "Document type atau ID tidak valid" },
      { status: 400 },
    );
  }

  try {
    const baseId = baseDocumentId(documentId);
    const draftId = draftDocumentId(baseId);

    await writeClient
      .transaction()
      .delete(draftId)
      .delete(baseId)
      .commit({ visibility: "sync" });

    return NextResponse.json({
      success: true,
      href: `/admin/${documentPath(documentType)}`,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal menghapus dokumen Sanity";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
