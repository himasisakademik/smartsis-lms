"use client";

import {
  type DocumentHandle,
  useDocumentProjection,
  useDocuments,
} from "@sanity/sdk-react";
import { ChevronRight, Loader2, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type AdminDocumentType,
  createAdminDocument,
} from "./createAdminDocument";

interface DocumentListProps {
  documentType: AdminDocumentType;
  title: string;
  description?: string;
  basePath: string;
  projectId: string;
  dataset: string;
  showCreateButton?: boolean;
}

function DocumentListFallback() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-16 w-full bg-slate-50 rounded-xl" />
      ))}
    </div>
  );
}

function DocumentItem({
  documentId,
  documentType,
  projectId,
  dataset,
  basePath,
}: DocumentHandle & { basePath: string }) {
  const { data } = useDocumentProjection({
    documentId,
    documentType,
    projectId,
    dataset,
    projection: "{ title, description }",
  });

  const title = (data as { title?: string })?.title || "Untitled";
  const description = (data as { description?: string })?.description;

  return (
    <Link href={`${basePath}/${documentId}`}>
      <div className="p-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-200 transition-all duration-200 cursor-pointer group">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1 min-w-0">
            <h3 className="font-medium text-sm text-slate-200 truncate group-hover:text-slate-900 transition-colors">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-slate-600 line-clamp-1">
                {description}
              </p>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-4" />
        </div>
      </div>
    </Link>
  );
}

function DocumentListContent({
  documentType,
  basePath,
  projectId,
  dataset,
  onCreateDocument,
  isCreating,
  searchQuery,
}: Omit<DocumentListProps, "title" | "description" | "showCreateButton"> & {
  onCreateDocument: () => void;
  isCreating: boolean;
  searchQuery: string;
}) {
  const { data: documents } = useDocuments({
    documentType,
    projectId,
    dataset,
    search: searchQuery || undefined,
  });

  if (!documents || documents.length === 0) {
    return (
      <div className="p-16 rounded-xl bg-white border border-slate-200 border-dashed text-center">
        <p className="text-sm text-slate-500 mb-4">No {documentType}s found</p>
        <button
          type="button"
          onClick={onCreateDocument}
          disabled={isCreating}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-600 disabled:opacity-50 rounded-lg transition-all duration-200"
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {isCreating ? "Creating..." : `Create your first ${documentType}`}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <Suspense
          key={doc.documentId}
          fallback={<Skeleton className="h-16 w-full bg-slate-50 rounded-xl" />}
        >
          <DocumentItem {...doc} basePath={basePath} />
        </Suspense>
      ))}
    </div>
  );
}

export function DocumentList({
  documentType,
  title,
  description,
  basePath,
  projectId,
  dataset,
  showCreateButton = true,
}: DocumentListProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateDocument = async () => {
    if (isCreating) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      const result = await createAdminDocument(documentType);
      router.push(`${basePath}/${result.documentId}`);
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : `Gagal membuat ${documentType}`,
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-slate-500 mt-1">{description}</p>
          )}
        </div>
        {showCreateButton && (
          <button
            type="button"
            onClick={handleCreateDocument}
            disabled={isCreating}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-600 disabled:opacity-50 rounded-lg transition-all duration-200"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {isCreating ? "Creating..." : `New ${documentType}`}
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
        <Input
          type="text"
          placeholder={`Search ${documentType}s...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 bg-white border-slate-200 text-white placeholder:text-slate-600 focus:border-blue-600/40 focus:ring-1 focus:ring-blue-600/20 h-10 rounded-lg"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {createError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {createError}
        </p>
      )}

      <Suspense fallback={<DocumentListFallback />}>
        <DocumentListContent
          documentType={documentType}
          basePath={basePath}
          projectId={projectId}
          dataset={dataset}
          onCreateDocument={handleCreateDocument}
          isCreating={isCreating}
          searchQuery={searchQuery}
        />
      </Suspense>
    </div>
  );
}
