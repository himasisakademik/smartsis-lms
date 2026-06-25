"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Save,
  Send,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type {
  AdminDocumentDetail,
  AdminDocumentType,
  AdminReferenceOption,
  AdminReferenceOptions,
} from "@/lib/admin-document-types";
import {
  deleteAdminDocument,
  fetchAdminDocument,
  publishAdminDocument,
  saveAdminDocument,
} from "../documents/createAdminDocument";

type Tier = "free" | "pro" | "ultra";

type FormState = {
  title: string;
  description: string;
  slug: string;
  icon: string;
  tier: Tier;
  featured: boolean;
  categoryId: string;
  moduleIds: string[];
  lessonIds: string[];
  videoUrl: string;
  duration: number;
  contentText: string;
};

const EMPTY_REFERENCES: AdminReferenceOptions = {
  categories: [],
  courses: [],
  modules: [],
  lessons: [],
};

const DOCUMENT_META: Record<
  AdminDocumentType,
  { listHref: string; singular: string; plural: string }
> = {
  category: {
    listHref: "/admin/categories",
    singular: "Category",
    plural: "Categories",
  },
  course: {
    listHref: "/admin/courses",
    singular: "Course",
    plural: "Courses",
  },
  lesson: {
    listHref: "/admin/lessons",
    singular: "Lesson",
    plural: "Lessons",
  },
  module: {
    listHref: "/admin/modules",
    singular: "Module",
    plural: "Modules",
  },
};

function selectedRefs(refs: AdminDocumentDetail["modules"]) {
  return refs?.map((ref) => ref._ref) ?? [];
}

function formFromDocument(document: AdminDocumentDetail): FormState {
  return {
    title: document.title,
    description: document.description ?? "",
    slug: document.slug?.current ?? "",
    icon: document.icon ?? "",
    tier: document.tier ?? "free",
    featured: Boolean(document.featured),
    categoryId: document.category?._ref ?? "",
    moduleIds: selectedRefs(document.modules),
    lessonIds: selectedRefs(document.lessons),
    videoUrl: document.videoUrl ?? "",
    duration: document.duration ?? 0,
    contentText: document.contentText ?? "",
  };
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-medium text-slate-700">{children}</span>;
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number" | "url";
}) {
  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function TextAreaInput({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function ReferenceSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "No reference",
}: {
  label: string;
  value: string;
  options: AdminReferenceOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.documentId} value={option.documentId}>
            {option.title}
          </option>
        ))}
      </select>
    </div>
  );
}

function ReferenceChecklist({
  label,
  options,
  selectedIds,
  onChange,
  emptyText,
}: {
  label: string;
  options: AdminReferenceOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  emptyText: string;
}) {
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggle = (documentId: string) => {
    if (selectedSet.has(documentId)) {
      onChange(selectedIds.filter((id) => id !== documentId));
      return;
    }

    onChange([...selectedIds, documentId]);
  };

  return (
    <div className="space-y-3">
      <FieldLabel>{label}</FieldLabel>
      <div className="rounded-lg border border-slate-200 bg-white">
        {options.length > 0 ? (
          <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
            {options.map((option) => (
              <label
                key={option.documentId}
                className="flex cursor-pointer items-start gap-3 px-3 py-3 transition hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={selectedSet.has(option.documentId)}
                  onChange={() => toggle(option.documentId)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-slate-800">
                    {option.title}
                  </span>
                  {option.description && (
                    <span className="line-clamp-1 text-xs text-slate-500">
                      {option.description}
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="px-3 py-4 text-sm text-slate-500">{emptyText}</p>
        )}
      </div>
    </div>
  );
}

function LoadingEditor() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200" />
      <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white" />
    </div>
  );
}

export function AdminDocumentEditor({
  documentType,
  documentId,
}: {
  documentType: AdminDocumentType;
  documentId: string;
}) {
  const router = useRouter();
  const meta = DOCUMENT_META[documentType];
  const [document, setDocument] = useState<AdminDocumentDetail | null>(null);
  const [references, setReferences] =
    useState<AdminReferenceOptions>(EMPTY_REFERENCES);
  const [form, setForm] = useState<FormState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDocument() {
      setIsLoading(true);
      setError(null);

      const maxRetries = 4;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const result = await fetchAdminDocument(documentType, documentId);
          if (isMounted) {
            setDocument(result.document);
            setReferences(result.references);
            setForm(formFromDocument(result.document));
            setError(null);
          }
          break;
        } catch (err) {
          if (attempt < maxRetries) {
            await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
            continue;
          }
          if (isMounted) {
            setError(
              err instanceof Error ? err.message : "Gagal memuat dokumen",
            );
          }
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    loadDocument();

    return () => {
      isMounted = false;
    };
  }, [documentId, documentType]);

  const updateForm = <Key extends keyof FormState>(
    key: Key,
    value: FormState[Key],
  ) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!form || isSaving) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await saveAdminDocument(documentType, documentId, form);
      setDocument(result.document);
      setForm(formFromDocument(result.document));
      setSuccess("Draft tersimpan.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!form || isPublishing) return;

    setIsPublishing(true);
    setError(null);
    setSuccess(null);

    try {
      const saved = await saveAdminDocument(documentType, documentId, form);
      const published = await publishAdminDocument(
        documentType,
        saved.document.documentId,
      );
      setDocument(published.document);
      setForm(formFromDocument(published.document));
      setSuccess("Dokumen berhasil dipublish.");
      router.replace(`${meta.listHref}/${published.document.documentId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal publish dokumen");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    const confirmed = window.confirm(
      `Hapus ${meta.singular.toLowerCase()} ini dari draft dan published?`,
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await deleteAdminDocument(documentType, documentId);
      router.push(result.href);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus dokumen");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingEditor />;
  }

  if (!form || !document) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {error || "Dokumen tidak ditemukan."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Link
            href={meta.listHref}
            className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {meta.plural}
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {form.title || `Untitled ${meta.singular}`}
              </h1>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  document.isDraft
                    ? "bg-amber-50 text-amber-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {document.isDraft ? "Draft" : "Published"}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Edit {meta.singular.toLowerCase()} melalui admin server-backed.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isPublishing || isDeleting}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save draft
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={isSaving || isPublishing || isDeleting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:opacity-50"
          >
            {isPublishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Publish
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSaving || isPublishing || isDeleting}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {success && (
        <p className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {success}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5">
          <TextInput
            label="Title"
            value={form.title}
            onChange={(value) => updateForm("title", value)}
            placeholder={`${meta.singular} title`}
          />

          <TextAreaInput
            label="Description"
            value={form.description}
            onChange={(value) => updateForm("description", value)}
            placeholder={`Short description for this ${meta.singular.toLowerCase()}`}
          />

          {(documentType === "course" || documentType === "lesson") && (
            <TextInput
              label="Slug"
              value={form.slug}
              onChange={(value) => updateForm("slug", value)}
              placeholder="url-friendly-slug"
            />
          )}

          {documentType === "lesson" && (
            <>
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
                <TextInput
                  label="YouTube Video URL"
                  type="url"
                  value={form.videoUrl}
                  onChange={(value) => updateForm("videoUrl", value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <TextInput
                  label="Duration"
                  type="number"
                  value={form.duration}
                  onChange={(value) =>
                    updateForm("duration", Number(value) || 0)
                  }
                  placeholder="0"
                />
              </div>
              <TextAreaInput
                label="Lesson Content"
                value={form.contentText}
                onChange={(value) => updateForm("contentText", value)}
                rows={10}
                placeholder="Materi teks lesson. Pisahkan paragraf dengan baris kosong."
              />
            </>
          )}

          {documentType === "category" && (
            <TextInput
              label="Icon"
              value={form.icon}
              onChange={(value) => updateForm("icon", value)}
              placeholder="code, palette, database"
            />
          )}
        </section>

        <aside className="space-y-5">
          {documentType === "course" && (
            <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5">
              <ReferenceSelect
                label="Category"
                value={form.categoryId}
                options={references.categories}
                onChange={(value) => updateForm("categoryId", value)}
                placeholder="Select category"
              />

              <div className="space-y-2">
                <FieldLabel>Tier</FieldLabel>
                <select
                  value={form.tier}
                  onChange={(event) =>
                    updateForm("tier", event.target.value as Tier)
                  }
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="ultra">Ultra</option>
                </select>
              </div>

              <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) =>
                    updateForm("featured", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
                />
                Featured course
              </label>
            </section>
          )}

          {documentType === "course" && (
            <ReferenceChecklist
              label="Modules"
              options={references.modules}
              selectedIds={form.moduleIds}
              onChange={(ids) => updateForm("moduleIds", ids)}
              emptyText="Belum ada module. Buat module dulu, lalu kembali ke course."
            />
          )}

          {documentType === "module" && (
            <ReferenceChecklist
              label="Lessons"
              options={references.lessons}
              selectedIds={form.lessonIds}
              onChange={(ids) => updateForm("lessonIds", ids)}
              emptyText="Belum ada lesson. Buat lesson dulu, lalu kembali ke module."
            />
          )}

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-medium text-slate-900">
              Document Info
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">
                  ID
                </dt>
                <dd className="mt-1 break-all font-mono text-xs text-slate-600">
                  {document.documentId}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">
                  Published version
                </dt>
                <dd className="mt-1 text-slate-600">
                  {document.hasPublishedVersion ? "Available" : "Not yet"}
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
