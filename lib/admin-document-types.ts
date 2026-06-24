export const ADMIN_DOCUMENT_TYPES = [
  "course",
  "module",
  "lesson",
  "category",
] as const;

export type AdminDocumentType = (typeof ADMIN_DOCUMENT_TYPES)[number];

export type AdminReference = {
  _key?: string;
  _ref: string;
  _type: "reference";
};

export type AdminDocumentSummary = {
  _id: string;
  documentId: string;
  _type: AdminDocumentType;
  title: string;
  description?: string;
  slug?: { current?: string };
  isDraft: boolean;
  updatedAt?: string;
  moduleCount?: number;
  lessonCount?: number;
  categoryTitle?: string;
};

export type AdminDocumentDetail = AdminDocumentSummary & {
  icon?: string;
  tier?: "free" | "pro" | "ultra";
  featured?: boolean;
  category?: AdminReference | null;
  modules?: AdminReference[];
  lessons?: AdminReference[];
  videoUrl?: string;
  duration?: number;
  contentText?: string;
  hasPublishedVersion: boolean;
};

export type AdminReferenceOption = {
  _id: string;
  documentId: string;
  _type: AdminDocumentType;
  title: string;
  description?: string;
};

export type AdminReferenceOptions = {
  categories: AdminReferenceOption[];
  courses: AdminReferenceOption[];
  modules: AdminReferenceOption[];
  lessons: AdminReferenceOption[];
};

export function isAdminDocumentType(value: unknown): value is AdminDocumentType {
  return (
    typeof value === "string" &&
    ADMIN_DOCUMENT_TYPES.includes(value as AdminDocumentType)
  );
}
