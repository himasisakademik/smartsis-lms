export type AdminDocumentType = "course" | "module" | "lesson" | "category";

type CreateAdminDocumentResponse = {
  success: true;
  documentId: string;
  draftId: string;
  documentType: AdminDocumentType;
};

export async function createAdminDocument(documentType: AdminDocumentType) {
  const response = await fetch("/api/admin-documents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ documentType }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      payload?.error || "Gagal membuat dokumen. Coba refresh lalu ulangi.",
    );
  }

  return payload as CreateAdminDocumentResponse;
}
