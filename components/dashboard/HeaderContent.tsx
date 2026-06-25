"use client";

import { Logo } from "@/components/Logo";
import { GlobalSearch } from "@/components/GlobalSearch";
import { ChevronRight, Trophy, GraduationCap, Menu } from "lucide-react";

interface HeaderContentProps {
  onOpenSidebar: () => void;
  completedCoursesCount: number;
  enrichedCoursesCount: number;
}

export function HeaderContent({
  onOpenSidebar,
  completedCoursesCount,
  enrichedCoursesCount,
}: HeaderContentProps) {
  return (
    <header className="h-20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">
      {/* Header Backdrop */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md border-b border-slate-200/60" />

      {/* Breadcrumb (Desktop) */}
      <div className="hidden lg:flex items-center text-slate-400 text-xs font-medium gap-2 relative z-10">
        <span className="hover:text-slate-600 cursor-pointer transition-colors">
          Pages
        </span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-900 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
          Dashboard
        </span>
      </div>

      {/* Mobile Brand & Sidebar Toggle */}
      <div className="lg:hidden flex items-center gap-3 relative z-10">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Logo size={28} showText={true} />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 relative z-10">
        {/* Search */}
        <div className="relative hidden sm:block group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <GlobalSearch />
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-medium shadow-sm">
          {completedCoursesCount > 0 ? (
            <>
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-amber-600">{completedCoursesCount}</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-500">{enrichedCoursesCount}</span>
            </>
          ) : (
            <>
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-slate-500">{enrichedCoursesCount} Courses</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
