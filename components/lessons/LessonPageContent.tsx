"use client";

import Link from "next/link";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { YouTubePlayer } from "./YouTubePlayer";
import { LessonContent } from "./LessonContent";
import { LessonCompleteButton } from "./LessonCompleteButton";
import { LessonSidebar } from "./LessonSidebar";
import { QuizSection } from "./QuizSection";
import type { LESSON_BY_ID_QUERYResult } from "@/sanity.types";

interface LessonPageContentProps {
  lesson: NonNullable<LESSON_BY_ID_QUERYResult>;
  userId: string | null;
  quizResult?: {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    attempts: number;
  } | null;
}

export function LessonPageContent({
  lesson,
  userId,
  quizResult,
}: LessonPageContentProps) {
  const courses = lesson.courses ?? [];
  const activeCourse = courses[0];

  const isCompleted = userId
    ? (lesson.completedBy?.includes(userId) ?? false)
    : false;

  const modules = activeCourse?.modules;
  let prevLesson: { id: string; slug: string; title: string } | null = null;
  let nextLesson: { id: string; slug: string; title: string } | null = null;
  const completedLessonIds: string[] = [];

  if (modules) {
    const allLessons: Array<{ id: string; slug: string; title: string }> = [];

    for (const module of modules) {
      if (module.lessons) {
        for (const l of module.lessons) {
          allLessons.push({
            id: l._id,
            slug: l.slug!.current!,
            title: l.title ?? "Untitled Lesson",
          });
          if (userId && l.completedBy?.includes(userId)) {
            completedLessonIds.push(l._id);
          }
        }
      }
    }

    const currentIndex = allLessons.findIndex((l) => l.id === lesson._id);
    prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    nextLesson =
      currentIndex < allLessons.length - 1
        ? allLessons[currentIndex + 1]
        : null;
  }

  const quizQuestions = (lesson as any).quiz as
    | Array<{
        _key: string;
        questionText: string;
        options: Array<{
          _key: string;
          text: string;
          isCorrect: boolean;
        }>;
        explanation?: string;
      }>
    | null
    | undefined;

  const hasQuiz = quizQuestions && quizQuestions.length > 0;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {activeCourse && (
        <LessonSidebar
          courseSlug={activeCourse.slug!.current!}
          courseTitle={activeCourse.title}
          modules={activeCourse.modules ?? null}
          currentLessonId={lesson._id}
          completedLessonIds={completedLessonIds}
        />
      )}

      <div className="flex-1 min-w-0">
        {lesson.videoUrl && (
          <YouTubePlayer
            videoUrl={lesson.videoUrl}
            title={lesson.title ?? undefined}
            className="mb-6"
          />
        )}

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              {lesson.title ?? "Untitled Lesson"}
            </h1>
            {lesson.description && (
              <p className="text-slate-500">{lesson.description}</p>
            )}
          </div>

          {userId && (
            <LessonCompleteButton
              lessonId={lesson._id}
              lessonSlug={lesson.slug!.current!}
              isCompleted={isCompleted}
            />
          )}
        </div>

        {lesson.content && (
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 md:p-8 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">Lesson Notes</h2>
            </div>
            <LessonContent content={lesson.content} />
          </div>
        )}

        {hasQuiz && userId && (
          <div className="mb-6">
            <QuizSection
              lessonId={lesson._id}
              lessonTitle={lesson.title ?? "Untitled Lesson"}
              questions={quizQuestions}
              previousResult={quizResult ?? null}
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          {prevLesson ? (
            <Link href={`/lessons/${prevLesson.slug}`}>
              <Button
                variant="ghost"
                className="text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{prevLesson.title}</span>
                <span className="sm:hidden">Previous</span>
              </Button>
            </Link>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Link href={`/lessons/${nextLesson.slug}`}>
              <Button className="bg-blue-700 hover:bg-blue-600 text-white">
                <span className="hidden sm:inline">{nextLesson.title}</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
