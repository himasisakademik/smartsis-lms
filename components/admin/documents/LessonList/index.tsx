"use client";

import { DocumentList } from "@/components/admin/documents/DocumentList";

export function LessonList() {
  return (
    <DocumentList
      documentType="lesson"
      title="Lessons"
      description="Manage lessons organized by course and module"
      basePath="/admin/lessons"
    />
  );
}
