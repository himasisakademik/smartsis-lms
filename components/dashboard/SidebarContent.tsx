"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import {
  LayoutDashboard,
  Compass,
  Trophy,
  Clock,
  Zap,
  Target,
  Flame,
  X,
  GraduationCap,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import React from "react";

interface SidebarContentProps {
  isOpen: boolean;
  onClose: () => void;
  firstName: string;
  hoursLearned: string;
  totalCompletedLessons: number;
  activeCourses: any[];
  completedCoursesCount: number;
  enrichedCourses: any[];
  userId: string;
  xpWidget: React.ReactNode;
}

export function SidebarContent({
  isOpen,
  onClose,
  firstName,
  hoursLearned,
  totalCompletedLessons,
  activeCourses,
  completedCoursesCount,
  enrichedCourses,
  userId,
  xpWidget,
}: SidebarContentProps) {
  const averageProgress = enrichedCourses.length > 0
    ? Math.round(
        enrichedCourses.reduce(
          (sum: number, c: any) => sum + (c.progress || 0),
          0
        ) / enrichedCourses.length
      )
    : 0;

  const renderInnerContent = () => (
    <>
      {/* Brand Logo */}
      <div className="h-20 flex items-center px-6 border-b border-slate-200">
        <Logo />
      </div>

      {/* Navigation and Stats */}
      <div className="p-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
        {/* Navigation */}
        <div>
          <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Platform
          </h3>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-medium border border-blue-100 shadow-sm relative group overflow-hidden text-left">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-600 rounded-full" />
              <LayoutDashboard className="w-4 h-4 text-blue-600" />
              <span className="relative z-10">Dashboard</span>
            </button>

            <Link
              href="/dashboard/courses"
              onClick={onClose}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all font-medium group"
            >
              <Compass className="w-4 h-4 group-hover:text-blue-600 transition-colors" />
              <span>Browse</span>
            </Link>

            <Link
              href="/leaderboard"
              onClick={onClose}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all font-medium group"
            >
              <Trophy className="w-4 h-4 group-hover:text-amber-500 transition-colors" />
              <span>Leaderboard</span>
            </Link>
          </div>
        </div>

        {/* Active Learning */}
        {activeCourses.length > 0 && (
          <div>
            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>Active Learning</span>
              <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[9px] border border-blue-100">
                {activeCourses.length}
              </span>
            </h3>
            <div className="space-y-1">
              {activeCourses.slice(0, 3).map((course: any) => (
                <Link
                  key={course.slug?.current}
                  href={`/courses/${course.slug?.current}`}
                  onClick={onClose}
                  className="group w-full flex flex-col gap-2 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 truncate max-w-[140px]">
                      {course.title}
                    </span>
                    <span className="text-[10px] font-mono text-blue-600">
                      {course.progress}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 group-hover:bg-blue-500 transition-all duration-500"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div>
          <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Your Stats
          </h3>
          <div className="space-y-2 px-1">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{hoursLearned}h</p>
                <p className="text-[10px] text-slate-400">Hours Learned</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{totalCompletedLessons}</p>
                <p className="text-[10px] text-slate-400">Lessons Done</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Target className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{averageProgress}%</p>
                <p className="text-[10px] text-slate-400">Avg. Progress</p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        {completedCoursesCount > 0 && (
          <div>
            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Achievements
            </h3>
            <div className="mx-1 p-3 rounded-xl bg-gradient-to-br from-amber-50 via-yellow-50/50 to-transparent border border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {completedCoursesCount}{" "}
                    {completedCoursesCount === 1 ? "Course" : "Courses"}
                  </p>
                  <p className="text-[10px] text-amber-600/70">Completed</p>
                </div>
              </div>
              {completedCoursesCount >= 3 && (
                <div className="mt-2 pt-2 border-t border-amber-200 flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span className="text-[10px] text-orange-500 font-medium">
                    On a learning streak!
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Gamification widget */}
      <div className="mt-4 px-4 pb-4">
        {xpWidget}
      </div>

      {/* User profile card */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-xs font-bold text-white shadow-lg group-hover:scale-105 transition-transform shrink-0">
            {firstName[0] || "C"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
              {firstName}
            </p>
            <p className="text-[10px] text-slate-400 truncate font-mono">
              Student Account
            </p>
          </div>
          <div className="scale-75 origin-right opacity-50 group-hover:opacity-100 transition-opacity">
            <UserButton
              appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }}
            />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar Layout */}
      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 left-0 border-r border-slate-200 bg-white z-40">
        {renderInnerContent()}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Mobile Sidebar Layout (Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-white flex flex-col z-50 border-r border-slate-200 transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute top-6 right-4 z-50">
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {renderInnerContent()}
      </aside>
    </>
  );
}
