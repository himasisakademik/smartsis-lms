"use client";

import { DocumentList } from "@/components/admin/documents/DocumentList";

export function CourseList() {
  return (
    <DocumentList
      documentType="course"
      title="Courses"
      description="Manage your courses and their content"
      basePath="/admin/courses"
    />
  );
}
