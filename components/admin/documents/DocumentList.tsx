"use client";

import { ChevronRight, Loader2, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import type {
  AdminDocumentSummary,
  AdminDocumentType,
} from "@/lib/admin-document-types";
import {
  createAdminDocument,
  fetchAdminDocuments,
} from "./createAdminDocument";

interface DocumentListProps {
  documentType: AdminDocumentType;
  title: string;
  description?: string;
  basePath: string;
  projectId?: string;
  dataset?: string;
  showCreateButton?: boolean;
}

function documentTypeLabel(documentType: AdminDocumentType) {
  return documentType === "category" ? "category" : documentType;
}

function DocumentListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-16 w-full animate-pulse rounded-xl border border-slate-200 bg-white"
        />
      ))}
    </div>
  );
}

function DocumentItem({
  document,
  basePath,
}: {
  document: AdminDocumentSummary;
  basePath: string;
}) {
  const meta = [
    document.isDraft ? "Draft" : "Published",
    document.categoryTitle,
    typeof document.moduleCount === "number"
      ? `${document.moduleCount} module`
      : null,
    typeof document.lessonCount === "number"
      ? `${document.lessonCount} lesson`
      : null,
  ].filter(Boolean);

  return (
    <Link href={`${basePath}/${document.documentId}`}>
      <div className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50/40">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-medium text-slate-900">
                {document.title}
              </h3>
              {document.isDraft && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                  Draft
                </span>
              )}
            </div>
            {document.description && (
              <p className="line-clamp-1 text-xs text-slate-500">
                {document.description}
              </p>
            )}
            {meta.length > 0 && (
              <p className="text-[11px] text-slate-400">{meta.join(" / ")}</p>
            )}
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-blue-500" />
        </div>
      </div>
    </Link>
  );
}

export function DocumentList({
  documentType,
  title,
  description,
  basePath,
  showCreateButton = true,
}: DocumentListProps) {
  const router = useRouter();
  const [documents, setDocuments] = useState<AdminDocumentSummary[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDocuments() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchAdminDocuments(documentType);
        if (isMounted) {
          setDocuments(result.documents);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Gagal memuat dokumen admin",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDocuments();

    return () => {
      isMounted = false;
    };
  }, [documentType]);

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return documents;

    return documents.filter((document) => {
      return [document.title, document.description, document.categoryTitle]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query));
    });
  }, [documents, searchQuery]);

  const handleCreateDocument = async () => {
    if (isCreating) return;

    setIsCreating(true);
    setError(null);

    try {
      const result = await createAdminDocument(documentType);
      router.push(`${basePath}/${result.documentId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Gagal membuat ${documentTypeLabel(documentType)}`,
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
        {showCreateButton && (
          <button
            type="button"
            onClick={handleCreateDocument}
            disabled={isCreating}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-600 disabled:opacity-50"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {isCreating
              ? "Creating..."
              : `New ${documentTypeLabel(documentType)}`}
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          placeholder={`Search ${documentTypeLabel(documentType)}s...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 rounded-lg border-slate-200 bg-white pl-10 pr-10 text-slate-900 placeholder:text-slate-400 focus:border-blue-600/40 focus:ring-1 focus:ring-blue-600/20"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {isLoading ? (
        <DocumentListSkeleton />
      ) : filteredDocuments.length > 0 ? (
        <div className="space-y-2">
          {filteredDocuments.map((document) => (
            <DocumentItem
              key={document.documentId}
              document={document}
              basePath={basePath}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-16 text-center">
          <p className="mb-4 text-sm text-slate-500">
            No {documentTypeLabel(documentType)}s found
          </p>
          {showCreateButton && (
            <button
              type="button"
              onClick={handleCreateDocument}
              disabled={isCreating}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-600 disabled:opacity-50"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {isCreating
                ? "Creating..."
                : `Create your first ${documentTypeLabel(documentType)}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
