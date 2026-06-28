import { currentUser } from "@clerk/nextjs/server";
import { BookOpen } from "lucide-react";
import { redirect } from "next/navigation";
import { CourseFilters } from "@/components/CourseFilters";
import { CourseViewToggle } from "@/components/CourseViewToggle";
import { CourseCard } from "@/components/courses";
import { Header } from "@/components/Header";
import { Pagination } from "@/components/Pagination";
import { SearchInput } from "@/components/SearchInput";
import { sanityFetch } from "@/sanity/lib/live";
import { DASHBOARD_COURSES_QUERY } from "@/sanity/lib/queries";

interface SearchParamsProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MyCoursesPage({
  searchParams,
}: SearchParamsProps) {
  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  const { data: courses } = await sanityFetch({
    query: DASHBOARD_COURSES_QUERY,
    params: { userId: user.id },
  });

  type Course = (typeof courses)[number];
  type CourseWithProgress = Course & {
    totalLessons: number;
    completedLessons: number;
    progress: number;
  };
  type LessonProgress = {
    completedBy?: string | string[] | null;
  };
  type CourseModule = {
    lessons?: LessonProgress[] | null;
  };

  const allCourses = courses.reduce(
    (acc: CourseWithProgress[], course: Course) => {
      const modules = (course.modules ?? []) as CourseModule[];
      const { total, completed } = modules.reduce(
        (stats: { total: number; completed: number }, module) =>
          (module.lessons ?? []).reduce(
            (s: { total: number; completed: number }, lesson) => ({
              total: s.total + 1,
              completed:
                s.completed + (lesson.completedBy?.includes(user.id) ? 1 : 0),
            }),
            stats,
          ),
        { total: 0, completed: 0 },
      );

      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      if (completed > 0) {
        acc.push({
          ...course,
          totalLessons: total,
          completedLessons: completed,
          progress,
        });
      }
      return acc;
    },
    [],
  );

  const resolvedParams = await searchParams;
  const query = (resolvedParams.q as string)?.toLowerCase() || "";
  const sort = (resolvedParams.sort as string) || "recent";
  const limitParam = resolvedParams.limit as string;
  const pageParam = resolvedParams.page as string;
  const view = resolvedParams.view === "list" ? "list" : "grid";

  const filteredCourses = allCourses.filter((course: CourseWithProgress) =>
    course.title?.toLowerCase().includes(query),
  );

  if (sort === "title") {
    filteredCourses.sort((a: CourseWithProgress, b: CourseWithProgress) =>
      (a.title ?? "").localeCompare(b.title ?? ""),
    );
  } else if (sort === "progress_desc") {
    filteredCourses.sort(
      (a: CourseWithProgress, b: CourseWithProgress) => b.progress - a.progress,
    );
  } else if (sort === "progress_asc") {
    filteredCourses.sort(
      (a: CourseWithProgress, b: CourseWithProgress) => a.progress - b.progress,
    );
  }

  const limit =
    limitParam === "all" ? filteredCourses.length : Number(limitParam) || 12;
  const currentPage = Number(pageParam) || 1;
  const totalPages = Math.ceil(filteredCourses.length / limit);
  const startIndex = (currentPage - 1) * limit;
  const paginatedCourses = filteredCourses.slice(
    startIndex,
    startIndex + limit,
  );

  return (
    <div className="h-[100dvh] overflow-hidden bg-white text-slate-900">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none z-0" />
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <Header />

      <main className="relative z-10 mx-auto flex h-[calc(100dvh-80px)] w-full max-w-[1600px] flex-col overflow-hidden px-4 py-6 sm:px-6 lg:px-12 lg:py-8">
        <div className="relative z-30 mb-6 flex shrink-0 flex-col gap-5 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="relative z-10">
            <h1 className="mb-3 text-4xl font-black tracking-tighter text-slate-900 md:text-5xl">
              My Courses
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-slate-500 md:text-lg">
              Track your progress and continue mastering your skills.
              <br className="hidden md:block" />
              <span className="text-blue-600 font-medium">
                Keep the streak alive!
              </span>
            </p>
          </div>

          <div className="relative z-40 flex w-full flex-col gap-3 rounded-3xl border border-slate-200 bg-white/95 p-2 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:flex-row sm:items-center lg:w-auto lg:rounded-full">
            <div className="min-w-0 flex-1 lg:w-72">
              <SearchInput />
            </div>
            <div className="hidden h-8 w-px bg-slate-200 lg:block" />

            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 sm:flex-nowrap">
              <CourseFilters />
              <CourseViewToggle value={view} />
            </div>
          </div>

          <div className="absolute -top-10 -left-10 w-full h-full bg-gradient-to-r from-blue-600/5 via-transparent to-transparent blur-3xl -z-10 opacity-50" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain pr-1 pb-6 [scrollbar-gutter:stable]">
          {paginatedCourses.length > 0 ? (
            <>
              <div
                className={
                  view === "grid"
                    ? "relative z-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "relative z-10 flex flex-col gap-4"
                }
              >
                {paginatedCourses.map((course: CourseWithProgress) => {
                  const slug = course.slug?.current ?? "";

                  return (
                    <div
                      key={slug || course.title || "course"}
                      className={
                        view === "grid"
                          ? "group transition-all duration-500 hover:-translate-y-2"
                          : "group"
                      }
                    >
                      <CourseCard
                        slug={{ current: slug }}
                        variant={view}
                        title={course.title}
                        description={course.description}
                        thumbnail={course.thumbnail}
                        moduleCount={course.moduleCount}
                        lessonCount={course.totalLessons}
                        completedLessonCount={course.completedLessons}
                        isCompleted={
                          course.completedBy?.includes(user.id) ?? false
                        }
                        showProgress
                      />
                    </div>
                  );
                })}
              </div>

              <Pagination totalPages={totalPages} />
            </>
          ) : (
            <div className="relative flex h-full min-h-[360px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 text-center">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-100/50 to-transparent opacity-50" />
              <div className="relative z-10 mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-blue-50 to-sky-50 shadow-sm ring-1 ring-slate-200">
                <BookOpen className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-slate-900">
                {query ? "No courses found" : "No courses started yet"}
              </h3>
              <p className="mx-auto mb-8 max-w-md text-lg text-slate-500">
                {query
                  ? `No results for "${query}". Try another search term.`
                  : "Browse our catalog to find your next challenge."}
              </p>
              <button
                type="button"
                className="rounded-full bg-blue-600 px-8 py-3 font-bold text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-700"
              >
                Explore Catalog
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
