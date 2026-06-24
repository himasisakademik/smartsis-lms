"use client";

import { use } from "react";
import { AdminDocumentEditor } from "@/components/admin/editors/AdminDocumentEditor";

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <AdminDocumentEditor documentId={id} documentType="category" />;
}
