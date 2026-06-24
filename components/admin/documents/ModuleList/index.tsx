"use client";

import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { ListPageHeader, SearchInput } from "@/components/admin/shared";
import { ModuleListSkeleton } from "@/components/admin/shared/DocumentSkeleton";
import { createAdminDocument } from "../createAdminDocument";
import { ModuleListContent } from "./ModuleListContent";
import type { ModuleListProps } from "./types";

export function ModuleList({ projectId, dataset }: ModuleListProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateModule = async () => {
    if (isCreating) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      const result = await createAdminDocument("module");
      router.push(`/admin/modules/${result.documentId}`);
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Gagal membuat module",
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Modules"
        description="Manage course modules organized by course"
        actionLabel="New module"
        onAction={handleCreateModule}
        isLoading={isCreating}
      />

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search modules..."
      />

      {createError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {createError}
        </p>
      )}

      <Suspense fallback={<ModuleListSkeleton />}>
        <ModuleListContent
          projectId={projectId}
          dataset={dataset}
          onCreateModule={handleCreateModule}
          isCreating={isCreating}
          searchQuery={searchQuery}
        />
      </Suspense>
    </div>
  );
}

export type { ModuleListProps } from "./types";
