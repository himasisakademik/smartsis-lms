import { randomUUID } from "node:crypto";
import { currentUser } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin";
import { writeClient } from "@/sanity/lib/client";

const creatableDocumentTypes = [
  "course",
  "module",
  "lesson",
  "category",
] as const;

type CreatableDocumentType = (typeof creatableDocumentTypes)[number];

type InitialSanityDocument = {
  _id: string;
  _type: CreatableDocumentType;
  title: string;
  [key: string]: unknown;
};

function isCreatableDocumentType(
  value: unknown,
): value is CreatableDocumentType {
  return (
    typeof value === "string" &&
    creatableDocumentTypes.includes(value as CreatableDocumentType)
  );
}

function getInitialDocument(documentType: CreatableDocumentType): {
  documentId: string;
  document: InitialSanityDocument;
} {
  const documentId = randomUUID();
  const title =
    documentType === "course"
      ? "Untitled Course"
      : documentType === "module"
        ? "Untitled Module"
        : documentType === "lesson"
          ? "Untitled Lesson"
          : "Untitled Category";

  const baseDocument: InitialSanityDocument = {
    _id: `drafts.${documentId}`,
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
        tier: "free",
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

export async function POST(req: NextRequest) {
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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Body request tidak valid" },
      { status: 400 },
    );
  }

  const documentType =
    body && typeof body === "object" && "documentType" in body
      ? (body as { documentType?: unknown }).documentType
      : undefined;

  if (!isCreatableDocumentType(documentType)) {
    return NextResponse.json(
      { error: "Document type tidak diizinkan" },
      { status: 400 },
    );
  }

  try {
    const { documentId, document } = getInitialDocument(documentType);
    await writeClient.createIfNotExists(document, { visibility: "sync" });

    return NextResponse.json({
      success: true,
      documentId,
      draftId: document._id,
      documentType,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal membuat dokumen Sanity";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
