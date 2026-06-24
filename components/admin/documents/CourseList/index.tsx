"use client";

import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { ListPageHeader, SearchInput } from "@/components/admin/shared";
import { DocumentGridSkeleton } from "@/components/admin/shared/DocumentSkeleton";
import { createAdminDocument } from "../createAdminDocument";
import { CourseGrid } from "./CourseGrid";
import type { CourseListProps } from "./types";

export function CourseList({ projectId, dataset }: CourseListProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateCourse = async () => {
    if (isCreating) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      const result = await createAdminDocument("course");
      router.push(`/admin/courses/${result.documentId}`);
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Gagal membuat course",
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Courses"
        description="Manage your courses and their content"
        actionLabel="New course"
        onAction={handleCreateCourse}
        isLoading={isCreating}
      />

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search courses..."
      />

      {createError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {createError}
        </p>
      )}

      <Suspense fallback={<DocumentGridSkeleton count={4} />}>
        <CourseGrid
          projectId={projectId}
          dataset={dataset}
          onCreateCourse={handleCreateCourse}
          isCreating={isCreating}
          searchQuery={searchQuery}
        />
      </Suspense>
    </div>
  );
}

export type { CourseListProps } from "./types";
