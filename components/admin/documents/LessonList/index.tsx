"use client";

import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { ListPageHeader, SearchInput } from "@/components/admin/shared";
import { HierarchicalListSkeleton } from "@/components/admin/shared/DocumentSkeleton";
import { createAdminDocument } from "../createAdminDocument";
import { LessonListContent } from "./LessonListContent";
import type { LessonListProps } from "./types";

export function LessonList({ projectId, dataset }: LessonListProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateLesson = async () => {
    if (isCreating) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      const result = await createAdminDocument("lesson");
      router.push(`/admin/lessons/${result.documentId}`);
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Gagal membuat lesson",
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Lessons"
        description="Manage lessons organized by course and module"
        actionLabel="New lesson"
        onAction={handleCreateLesson}
        isLoading={isCreating}
      />

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search lessons..."
      />

      {createError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {createError}
        </p>
      )}

      <Suspense fallback={<HierarchicalListSkeleton />}>
        <LessonListContent
          projectId={projectId}
          dataset={dataset}
          onCreateLesson={handleCreateLesson}
          isCreating={isCreating}
          searchQuery={searchQuery}
        />
      </Suspense>
    </div>
  );
}

export type { LessonListProps } from "./types";
