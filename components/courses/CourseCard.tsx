"use client";

import { BookOpen, CheckCircle2, Layers, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { DASHBOARD_COURSES_QUERYResult } from "@/sanity.types";

type SanityCourse = DASHBOARD_COURSES_QUERYResult[number];

export interface CourseCardProps
  extends Pick<
    SanityCourse,
    "title" | "description" | "thumbnail" | "moduleCount" | "lessonCount"
  > {
  slug?: { current: string } | null;
  href?: string;
  variant?: "grid" | "list";
  completedLessonCount?: number | null;
  isCompleted?: boolean;
  showProgress?: boolean;
}

export function CourseCard({
  slug,
  href,
  variant = "grid",
  title,
  description,
  thumbnail,
  moduleCount,
  lessonCount,
  completedLessonCount = 0,
  isCompleted = false,
  showProgress = false,
}: CourseCardProps) {
  const totalLessons = lessonCount ?? 0;
  const completed = completedLessonCount ?? 0;
  const progressPercent =
    totalLessons > 0 ? (completed / totalLessons) * 100 : 0;

  const linkHref = href ?? `/courses/${slug?.current ?? ""}`;

  if (variant === "list") {
    return (
      <Link href={linkHref} className="group block w-full">
        <div className="relative flex min-h-[164px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 sm:flex-row">
          <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-slate-100 sm:w-60 lg:w-72">
            {thumbnail?.asset?.url ? (
              <Image
                src={thumbnail.asset.url}
                alt={title ?? "Course thumbnail"}
                fill
                className="object-cover opacity-90 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-50">
                <BookOpen className="h-14 w-14 text-blue-600/40" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            {isCompleted && (
              <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-emerald-400 bg-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Done
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <h3 className="line-clamp-2 text-xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-blue-600">
                  {title ?? "Untitled Course"}
                </h3>
                {description && (
                  <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-relaxed text-slate-500 transition-colors group-hover:text-slate-600">
                    {description}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-wrap gap-2 text-xs font-medium text-slate-600">
                <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
                  <Layers className="h-3.5 w-3.5 text-blue-600" />
                  {moduleCount ?? 0} modules
                </span>
                <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
                  <Play className="h-3.5 w-3.5 text-sky-500" />
                  {lessonCount ?? 0} lessons
                </span>
              </div>
            </div>

            {showProgress && totalLessons > 0 && (
              <div className="mt-auto pt-5">
                <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-500">Progress</span>
                  <span
                    className={
                      isCompleted ? "text-emerald-600" : "text-blue-600"
                    }
                  >
                    {Math.round(progressPercent)}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full transition-all duration-1000 ease-out ${isCompleted ? "bg-emerald-500" : "bg-blue-600"}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={linkHref} className="group block w-full h-full">
      <div className="relative h-full flex flex-col rounded-2xl bg-white border border-slate-200 overflow-hidden hover:border-blue-200 hover:bg-white transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10 group-hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 via-transparent to-sky-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none" />

        <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
          {thumbnail?.asset?.url ? (
            <Image
              src={thumbnail.asset.url}
              alt={title ?? "Course thumbnail"}
              fill
              className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-50">
              <div className="text-6xl opacity-30 grayscale group-hover:grayscale-0 transition-all duration-500">
                <BookOpen className="w-16 h-16 text-blue-600" />
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          {isCompleted && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white shadow-lg backdrop-blur-md border border-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Done
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1 relative z-10">
          <h3 className="text-lg font-bold mb-2 text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
            {title ?? "Untitled Course"}
          </h3>

          {description && (
            <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed group-hover:text-slate-600 transition-colors">
              {description}
            </p>
          )}

          <div className="mt-auto pt-2 flex items-center gap-4 text-xs font-medium text-slate-600 group-hover:text-slate-700 transition-colors">
            <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              {moduleCount ?? 0} modules
            </span>
            <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200">
              <Play className="w-3.5 h-3.5 text-sky-400" />
              {lessonCount ?? 0} lessons
            </span>
          </div>

          {showProgress && totalLessons > 0 && (
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider">
                <span className="text-slate-500">Progress</span>
                <span
                  className={isCompleted ? "text-emerald-400" : "text-blue-600"}
                >
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${isCompleted ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-blue-600 shadow-[0_0_10px_rgba(139,92,246,0.5)]"}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
