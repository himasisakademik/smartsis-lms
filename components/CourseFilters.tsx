"use client";

import { Check, ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export const CourseFilters = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const currentSort = searchParams.get("sort") || "recent";
  const currentLimit = searchParams.get("limit") || "12";

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isLimitOpen, setIsLimitOpen] = useState(false);
  const [sortPosition, setSortPosition] = useState<DOMRect | null>(null);
  const [limitPosition, setLimitPosition] = useState<DOMRect | null>(null);

  const sortRef = useRef<HTMLDivElement>(null);
  const limitRef = useRef<HTMLDivElement>(null);

  const updatePositions = useCallback(() => {
    if (sortRef.current) {
      setSortPosition(sortRef.current.getBoundingClientRect());
    }
    if (limitRef.current) {
      setLimitPosition(limitRef.current.getBoundingClientRect());
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
      if (
        limitRef.current &&
        !limitRef.current.contains(event.target as Node)
      ) {
        setIsLimitOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isSortOpen && !isLimitOpen) return;

    updatePositions();
    window.addEventListener("resize", updatePositions);
    window.addEventListener("scroll", updatePositions, true);

    return () => {
      window.removeEventListener("resize", updatePositions);
      window.removeEventListener("scroll", updatePositions, true);
    };
  }, [isSortOpen, isLimitOpen, updatePositions]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSortOpen(false);
        setIsLimitOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const getDropdownStyle = (
    rect: DOMRect | null,
    width: number,
  ): CSSProperties => {
    if (!rect) {
      return { width };
    }

    const left = Math.min(
      window.innerWidth - width - 16,
      Math.max(16, rect.right - width),
    );

    return {
      width,
      left,
      top: rect.bottom + 8,
    };
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", sort);
    replace(`${pathname}?${params.toString()}`);
    setIsSortOpen(false);
  };

  const handleLimitChange = (limit: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("limit", limit);
    params.set("page", "1");
    replace(`${pathname}?${params.toString()}`);
    setIsLimitOpen(false);
  };

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

  return (
    <div className="flex w-full items-center gap-2 sm:w-auto">
      <div className="relative" ref={sortRef}>
        <button
          type="button"
          onClick={() => {
            updatePositions();
            setIsSortOpen((open) => !open);
            setIsLimitOpen(false);
          }}
          className="flex min-w-[158px] items-center justify-between gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-500 shadow-sm backdrop-blur-xl transition-all hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 sm:min-w-[190px]"
          aria-expanded={isSortOpen}
        >
          <span className="truncate">
            {sortOptions.find((o) => o.value === currentSort)?.label ||
              "Sort By"}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform ${isSortOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isSortOpen && (
          <div
            className="fixed z-[9999] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 animate-in fade-in zoom-in-95 duration-200"
            style={getDropdownStyle(sortPosition, 224)}
          >
            <div className="p-1">
              {sortOptions.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${currentSort === option.value ? "bg-blue-50 font-medium text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
                >
                  {option.label}
                  {currentSort === option.value && (
                    <Check className="h-3.5 w-3.5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative hidden sm:block" ref={limitRef}>
        <button
          type="button"
          onClick={() => {
            updatePositions();
            setIsLimitOpen((open) => !open);
            setIsSortOpen(false);
          }}
          className="flex min-w-[138px] items-center justify-between gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-500 shadow-sm backdrop-blur-xl transition-all hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          aria-expanded={isLimitOpen}
        >
          <span className="truncate">
            {limitOptions.find((o) => o.value === currentLimit)?.label ||
              "Limit"}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform ${isLimitOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isLimitOpen && (
          <div
            className="fixed z-[9999] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 animate-in fade-in zoom-in-95 duration-200"
            style={getDropdownStyle(limitPosition, 160)}
          >
            <div className="p-1">
              {limitOptions.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => handleLimitChange(option.value)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${currentLimit === option.value ? "bg-blue-50 font-medium text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
                >
                  {option.label}
                  {currentLimit === option.value && (
                    <Check className="h-3.5 w-3.5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
