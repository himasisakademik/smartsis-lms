import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  BookOpen,
  Clock,
  Zap,
  Play,
  Bookmark,
  ChevronRight,
} from "lucide-react";
import { sanityFetch } from "@/sanity/lib/live";
import { CertificateDownloadButton } from "@/components/CertificateDownloadButton";
import { XPWidget } from "@/components/dashboard/XPWidget";
import { DashboardLayoutWrapper } from "@/components/dashboard/DashboardLayoutWrapper";
import { SidebarContent } from "@/components/dashboard/SidebarContent";
import { HeaderContent } from "@/components/dashboard/HeaderContent";

import { DASHBOARD_COURSES_QUERY } from "@/sanity/lib/queries";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  const { data: courses } = await sanityFetch({
    query: DASHBOARD_COURSES_QUERY,
    params: { userId: user.id },
  });

  const firstName = user.firstName ?? user.username ?? "Cadet";

  const hour = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Jakarta",
    hour: "numeric",
    hour12: false,
  });
  const numericHour = parseInt(hour, 10);
  let greeting = "Good Morning";
  if (numericHour >= 12 && numericHour < 18) greeting = "Good Afternoon";
  else if (numericHour >= 18) greeting = "Good Evening";

  let totalDurationSeconds = 0;
  let totalCompletedLessons = 0;

  const isLessonCompleted = (lesson: any) => {
    return (
      Array.isArray(lesson.completedBy) && lesson.completedBy.includes(user.id)
    );
  };

  const enrichedCourses = courses.map((course: any) => {
    const courseTotalLessons =
      course.modules?.reduce(
        (acc: number, module: any) => acc + (module.lessons?.length || 0),
        0,
      ) || 0;

    const courseCompletedLessons =
      course.modules?.reduce(
        (acc: number, module: any) =>
          acc + (module.lessons?.filter(isLessonCompleted)?.length || 0),
        0,
      ) || 0;

    const progress =
      courseTotalLessons > 0
        ? Math.round((courseCompletedLessons / courseTotalLessons) * 100)
        : 0;

    if (course.modules) {
      course.modules.forEach((module: any) => {
        module.lessons?.forEach((lesson: any) => {
          if (isLessonCompleted(lesson)) {
            totalCompletedLessons++;
            totalDurationSeconds += (lesson.duration ?? 0) * 60;
          }
        });
      });
    }

    return {
      ...course,
      progress,
      isCompleted: progress === 100,
      totalLessons: courseTotalLessons,
      completedLessons: courseCompletedLessons,
    };
  });

  const activeCourses = enrichedCourses.filter(
    (c: any) => c.progress > 0 && c.progress < 100,
  );
  const completedCourses = enrichedCourses.filter(
    (c: any) => c.progress === 100,
  );
  const completedCoursesCount = completedCourses.length;

  let resumeCourseSlug = "";
  let resumeLessonSlug = "";

  const resumeCourse =
    activeCourses.length > 0 ? activeCourses[0] : enrichedCourses[0];

  if (resumeCourse) {
    resumeCourseSlug = resumeCourse.slug?.current ?? "";

    if (resumeCourse.modules) {
      for (const module of resumeCourse.modules) {
        const uncompletedLesson = module.lessons?.find(
          (l: any) => !isLessonCompleted(l),
        );
        if (uncompletedLesson) {
          resumeLessonSlug = uncompletedLesson.slug?.current ?? "";
          break;
        }
      }
    }
  }

  const hoursLearned = (totalDurationSeconds / 3600).toFixed(1);

  const resumeLink = resumeLessonSlug
    ? `/courses/${resumeCourseSlug}/lessons/${resumeLessonSlug}`
    : resumeCourseSlug
      ? `/courses/${resumeCourseSlug}`
      : "/dashboard/courses";

  return (
    <DashboardLayoutWrapper
      sidebar={(isOpen, onClose) => (
        <SidebarContent
          isOpen={isOpen}
          onClose={onClose}
          firstName={firstName}
          hoursLearned={hoursLearned}
          totalCompletedLessons={totalCompletedLessons}
          activeCourses={activeCourses}
          completedCoursesCount={completedCoursesCount}
          enrichedCourses={enrichedCourses}
          userId={user.id}
          xpWidget={<XPWidget userId={user.id} />}
        />
      )}
      header={(onOpen) => (
        <HeaderContent
          onOpenSidebar={onOpen}
          completedCoursesCount={completedCoursesCount}
          enrichedCoursesCount={enrichedCourses.length}
        />
      )}
    >
      <main className="px-6 lg:px-10 pb-10 max-w-[1600px] mx-auto w-full space-y-12">
        {/* Welcome Banner */}
        <div className="relative mt-4 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-1000" />
          <div className="relative p-8 md:p-10 rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xl shadow-blue-500/5">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-blue-500/5 to-transparent rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-sky-500/5 to-transparent rounded-full blur-[80px]" />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-2">
                  <Bookmark className="w-3 h-3 fill-current text-blue-600" />
                  <span>Premium Student Access</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                  {greeting}, <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-slate-400">
                    {firstName}
                  </span>
                </h1>
                <p className="text-slate-500 text-sm md:text-base max-w-lg leading-relaxed">
                  Ready to level up? You have{" "}
                  <span className="text-slate-900 font-bold">
                    {courses.length} active courses
                  </span>{" "}
                  pending your attention today.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Link href={resumeLink}>
                  <button className="relative group/btn overflow-hidden rounded-full bg-blue-600 text-white px-6 py-3 font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:bg-blue-700 transition-all duration-300">
                    <span className="relative flex items-center gap-2">
                      <Play className="w-4 h-4 fill-white" />
                      Resume Learning
                    </span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: "Active Courses",
              value: courses.length,
              icon: BookOpen,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Hours Learned",
              value: `${hoursLearned}h`,
              icon: Clock,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              label: "Lessons Completed",
              value: totalCompletedLessons,
              icon: Zap,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="group p-5 rounded-2xl bg-white border border-slate-200 hover:shadow-lg hover:shadow-blue-500/5 hover:border-slate-300 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Curriculum Section */}
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-1">
                <BookOpen className="w-5 h-5 text-blue-600" />
                My Curriculum
              </h2>
              <p className="text-xs text-slate-400">
                Pick up where you left off
              </p>
            </div>
            <Link
              href="/dashboard/courses"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 group"
            >
              View All{" "}
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {enrichedCourses.length > 0 ? (
              enrichedCourses.map((course: any) => (
                <div
                  key={course.slug!.current!}
                  className="group relative block w-full h-full"
                >
                  <div className="relative h-full flex flex-col rounded-2xl bg-white border border-slate-200 overflow-hidden hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 hover:-translate-y-1">
                    <Link
                      href={`/courses/${course.slug!.current!}`}
                      className="absolute inset-0 z-10"
                    >
                      <span className="sr-only">
                        View course {course.title}
                      </span>
                    </Link>

                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                      {course.thumbnail?.asset?.url ? (
                        <img
                          src={course.thumbnail.asset.url}
                          alt={course.title}
                          className="object-cover w-full h-full opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center relative">
                          <BookOpen className="w-8 h-8 text-slate-300" />
                        </div>
                      )}

                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-bold text-slate-700 bg-white/90 backdrop-blur-md border border-slate-200 px-2 py-1 rounded-lg shadow-sm">
                          {course.moduleCount ?? 1} Modules
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1 relative z-0">
                      <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors relative">
                        {course.title}
                      </h3>
                      <div className="mt-auto pt-4 space-y-4">
                        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          <span>Progress</span>
                          <span
                            className={
                              course.progress === 100
                                ? "text-emerald-600"
                                : "text-blue-600"
                            }
                          >
                            {course.progress}%
                          </span>
                        </div>
                        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              course.progress === 100
                                ? "bg-emerald-500"
                                : "bg-blue-600 group-hover:bg-blue-500"
                            }`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>

                        {course.progress === 100 && (
                          <div className="pt-2 relative z-20">
                            <CertificateDownloadButton
                              studentName={firstName}
                              courseTitle={course.title}
                              completedAt={new Date()}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center rounded-3xl bg-white border border-dashed border-slate-300 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 items-center justify-center mb-4 flex animate-pulse">
                  <BookOpen className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-base font-medium text-slate-900 mb-1">
                  No active courses
                </h3>
                <p className="text-slate-400 text-sm">
                  Start your journey today.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </DashboardLayoutWrapper>
  );
}
