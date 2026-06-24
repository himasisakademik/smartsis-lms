"use client";

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Circle,
  ExternalLink,
  Layers,
  PlayCircle,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchAdminDocuments } from "@/components/admin/documents/createAdminDocument";
import type { AdminDocumentType } from "@/lib/admin-document-types";

type Counts = Record<AdminDocumentType, number>;

const EMPTY_COUNTS: Counts = {
  category: 0,
  course: 0,
  lesson: 0,
  module: 0,
};

const STAT_CARDS = [
  {
    title: "Courses",
    icon: BookOpen,
    documentType: "course" as const,
    href: "/admin/courses",
    accent: "text-blue-600",
    iconBg: "bg-blue-600/10",
  },
  {
    title: "Modules",
    icon: Layers,
    documentType: "module" as const,
    href: "/admin/modules",
    accent: "text-indigo-600",
    iconBg: "bg-indigo-600/10",
  },
  {
    title: "Lessons",
    icon: PlayCircle,
    documentType: "lesson" as const,
    href: "/admin/lessons",
    accent: "text-emerald-600",
    iconBg: "bg-emerald-600/10",
  },
  {
    title: "Categories",
    icon: Tag,
    documentType: "category" as const,
    href: "/admin/categories",
    accent: "text-amber-600",
    iconBg: "bg-amber-600/10",
  },
];

const QUICK_LINKS = [
  {
    label: "Courses",
    desc: "Create and manage courses",
    href: "/admin/courses",
    icon: BookOpen,
    accent: "text-blue-600",
  },
  {
    label: "Modules",
    desc: "Organize course modules",
    href: "/admin/modules",
    icon: Layers,
    accent: "text-indigo-600",
  },
  {
    label: "Lessons",
    desc: "Edit lesson content",
    href: "/admin/lessons",
    icon: PlayCircle,
    accent: "text-emerald-600",
  },
  {
    label: "Categories",
    desc: "Manage content categories",
    href: "/admin/categories",
    icon: Tag,
    accent: "text-amber-600",
  },
];

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Categories",
    desc: "Create categories to organize courses by topic",
  },
  {
    step: "02",
    title: "Lessons",
    desc: "Build individual lessons with video and text content",
  },
  {
    step: "03",
    title: "Modules",
    desc: "Group related lessons into structured modules",
  },
  {
    step: "04",
    title: "Courses",
    desc: "Assemble modules into a complete course curriculum",
  },
];

function StatCard({
  title,
  icon: Icon,
  href,
  accent,
  iconBg,
  count,
}: (typeof STAT_CARDS)[number] & { count: number }) {
  return (
    <Link href={href} className="group">
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50/40">
        <div className="mb-6 flex items-start justify-between">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}
          >
            <Icon className={`h-5 w-5 ${accent}`} />
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-500" />
        </div>
        <span className="text-3xl font-semibold tracking-tight text-slate-900">
          {count}
        </span>
        <p className="mt-1 text-[13px] font-medium text-slate-500">{title}</p>
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Counts>(EMPTY_COUNTS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCounts() {
      setIsLoading(true);
      setError(null);

      try {
        const [courses, modules, lessons, categories] = await Promise.all([
          fetchAdminDocuments("course"),
          fetchAdminDocuments("module"),
          fetchAdminDocuments("lesson"),
          fetchAdminDocuments("category"),
        ]);

        if (isMounted) {
          setCounts({
            category: categories.documents.length,
            course: courses.documents.length,
            lesson: lessons.documents.length,
            module: modules.documents.length,
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Gagal memuat ringkasan admin",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCounts();

    return () => {
      isMounted = false;
    };
  }, []);

  const checks = useMemo(
    () =>
      STAT_CARDS.map((card) => ({
        label: card.title,
        passed: counts[card.documentType] > 0,
        count: counts[card.documentType],
      })),
    [counts],
  );

  const passedCount = checks.filter((check) => check.passed).length;
  const percentage = Math.round((passedCount / checks.length) * 100);

  return (
    <div className="mx-auto max-w-[1200px] space-y-10">
      <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of your content management system
          </p>
        </div>
        <Link href="/studio" target="_blank">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open Studio
          </button>
        </Link>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <StatCard
            key={card.documentType}
            {...card}
            count={isLoading ? 0 : counts[card.documentType]}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
            Quick Access
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {QUICK_LINKS.map((item) => {
              const Icon = item.icon;

              return (
                <Link key={item.href} href={item.href} className="group">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50/40">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 shrink-0 ${item.accent}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {item.label}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {item.desc}
                        </p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-blue-500" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
            Content Health
          </h2>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">
                  {percentage}% Complete
                </span>
                <span className="text-xs text-slate-500">
                  {passedCount}/{checks.length} checks
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="space-y-3">
                {checks.map((check) => (
                  <div
                    key={check.label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      {check.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-slate-300" />
                      )}
                      <span className="text-sm text-slate-700">
                        {check.label}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-slate-500">
                      {check.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
          Recommended Workflow
        </h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {WORKFLOW_STEPS.map((item) => (
              <div key={item.step} className="p-5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Step {item.step}
                </span>
                <h3 className="mb-1 mt-2 text-sm font-medium text-slate-900">
                  {item.title}
                </h3>
                <p className="text-xs leading-relaxed text-slate-500">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
