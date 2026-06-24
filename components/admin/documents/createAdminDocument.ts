import type {
  AdminDocumentDetail,
  AdminDocumentSummary,
  AdminDocumentType,
  AdminReferenceOptions,
} from "@/lib/admin-document-types";

type CreateAdminDocumentResponse = {
  success: true;
  documentId: string;
  draftId: string;
  documentType: AdminDocumentType;
  href: string;
};

async function readJson(response: Response) {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      payload?.error || "Request admin dokumen gagal. Coba refresh ulang.",
    );
  }

  return payload;
}

export async function createAdminDocument(documentType: AdminDocumentType) {
  const response = await fetch("/api/admin-documents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ documentType }),
  });

  return (await readJson(response)) as CreateAdminDocumentResponse;
}

export async function fetchAdminDocuments(documentType: AdminDocumentType) {
  const params = new URLSearchParams({ type: documentType });
  const response = await fetch(`/api/admin-documents?${params.toString()}`, {
    cache: "no-store",
  });

  return (await readJson(response)) as {
    documents: AdminDocumentSummary[];
  };
}

export async function fetchAdminDocument(
  documentType: AdminDocumentType,
  documentId: string,
) {
  const params = new URLSearchParams({ type: documentType, id: documentId });
  const response = await fetch(`/api/admin-documents?${params.toString()}`, {
    cache: "no-store",
  });

  return (await readJson(response)) as {
    document: AdminDocumentDetail;
    references: AdminReferenceOptions;
  };
}

export async function saveAdminDocument(
  documentType: AdminDocumentType,
  documentId: string,
  values: Record<string, unknown>,
) {
  const response = await fetch("/api/admin-documents", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ documentType, documentId, ...values }),
  });

  return (await readJson(response)) as {
    success: true;
    document: AdminDocumentDetail;
  };
}

export async function publishAdminDocument(
  documentType: AdminDocumentType,
  documentId: string,
) {
  const response = await fetch("/api/admin-documents", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ documentType, documentId, action: "publish" }),
  });

  return (await readJson(response)) as {
    success: true;
    document: AdminDocumentDetail;
  };
}

export async function deleteAdminDocument(
  documentType: AdminDocumentType,
  documentId: string,
) {
  const params = new URLSearchParams({ type: documentType, id: documentId });
  const response = await fetch(`/api/admin-documents?${params.toString()}`, {
    method: "DELETE",
  });

  return (await readJson(response)) as {
    success: true;
    href: string;
  };
}
