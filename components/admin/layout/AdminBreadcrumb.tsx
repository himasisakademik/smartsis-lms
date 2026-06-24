"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const SECTION_LABELS: Record<string, string> = {
  categories: "Categories",
  courses: "Courses",
  lessons: "Lessons",
  modules: "Modules",
  users: "Users",
};

function compactDocumentLabel(id: string) {
  const baseId = id.replace(/^drafts\./, "");
  if (baseId.length <= 12) return baseId;
  return `${baseId.slice(0, 8)}...`;
}

function AdminBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const section = segments[1];
  const documentId = segments[2];

  if (segments.length <= 1) return null;

  const items: { href: string; label: string }[] = [
    { href: "/admin", label: "Admin" },
  ];

  if (section && SECTION_LABELS[section]) {
    items.push({
      href: `/admin/${section}`,
      label: SECTION_LABELS[section],
    });
  }

  if (section && documentId) {
    items.push({
      href: pathname,
      label: compactDocumentLabel(documentId),
    });
  }

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-slate-500">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <span
              key={`${item.href}-${item.label}`}
              className="flex items-center gap-2"
            >
              {index > 0 && <BreadcrumbSeparator className="text-slate-400" />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="max-w-[180px] truncate text-slate-500">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={item.href}
                    className="max-w-[120px] truncate hover:text-slate-900"
                  >
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default AdminBreadcrumb;
