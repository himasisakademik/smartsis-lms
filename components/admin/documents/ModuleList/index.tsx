"use client";

import { DocumentList } from "@/components/admin/documents/DocumentList";

export function ModuleList() {
  return (
    <DocumentList
      documentType="module"
      title="Modules"
      description="Manage course modules organized by course"
      basePath="/admin/modules"
    />
  );
}
