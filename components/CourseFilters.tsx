"use client";

import { Check, ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const CourseFilters = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const currentSort = searchParams.get("sort") || "recent";
  const currentLimit = searchParams.get("limit") || "12";

  const sortOptions = [
    { value: "recent", label: "Recently Accessed" },
    { value: "title", label: "Title (A-Z)" },
    { value: "progress_desc", label: "Progress (High-Low)" },
    { value: "progress_asc", label: "Progress (Low-High)" },
  ];

  const limitOptions = [
    { value: "12", label: "12 per page" },
    { value: "24", label: "24 per page" },
    { value: "48", label: "48 per page" },
    { value: "all", label: "View All" },
  ];

  const setParam = (key: "sort" | "limit", value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);

    if (key === "limit") {
      params.set("page", "1");
    }

    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex min-w-[168px] flex-1 items-center justify-between gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/30 data-[state=open]:border-blue-200 data-[state=open]:ring-2 data-[state=open]:ring-blue-500/25 sm:min-w-[210px] sm:flex-none [&[data-state=open]>svg]:rotate-180"
          >
            <span className="truncate">
              {sortOptions.find((option) => option.value === currentSort)
                ?.label || "Sort By"}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={12}
          collisionPadding={16}
          className="z-[100000] w-60 rounded-2xl border-slate-200 bg-white p-1.5 text-slate-700 shadow-2xl shadow-slate-900/20"
        >
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => setParam("sort", option.value)}
              className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm outline-none transition-colors ${
                currentSort === option.value
                  ? "bg-blue-50 font-medium text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 focus:bg-slate-50 focus:text-slate-950"
              }`}
            >
              {option.label}
              {currentSort === option.value && (
                <Check className="h-3.5 w-3.5" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="hidden min-w-[148px] items-center justify-between gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/30 data-[state=open]:border-blue-200 data-[state=open]:ring-2 data-[state=open]:ring-blue-500/25 sm:flex [&[data-state=open]>svg]:rotate-180"
          >
            <span className="truncate">
              {limitOptions.find((option) => option.value === currentLimit)
                ?.label || "Limit"}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={12}
          collisionPadding={16}
          className="z-[100000] w-44 rounded-2xl border-slate-200 bg-white p-1.5 text-slate-700 shadow-2xl shadow-slate-900/20"
        >
          {limitOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => setParam("limit", option.value)}
              className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm outline-none transition-colors ${
                currentLimit === option.value
                  ? "bg-blue-50 font-medium text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 focus:bg-slate-50 focus:text-slate-950"
              }`}
            >
              {option.label}
              {currentLimit === option.value && (
                <Check className="h-3.5 w-3.5" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
