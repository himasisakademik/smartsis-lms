"use client";

import { LayoutGrid, List } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ViewMode = "grid" | "list";

export function CourseViewToggle({ value }: { value: ViewMode }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const setView = (view: ViewMode) => {
    const params = new URLSearchParams(searchParams);
    params.set("view", view);
    replace(`${pathname}?${params.toString()}`);
  };

  const options = [
    { value: "grid" as const, label: "Grid view", icon: LayoutGrid },
    { value: "list" as const, label: "List view", icon: List },
  ];

  return (
    <div className="flex shrink-0 gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 shadow-sm">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setView(option.value)}
            aria-label={option.label}
            aria-pressed={isActive}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
              isActive
                ? "bg-white text-blue-600 shadow-sm ring-1 ring-blue-100"
                : "text-slate-500 hover:bg-white hover:text-slate-900"
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
