"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleLessonCompletion } from "@/lib/actions";

interface LessonCompleteButtonProps {
  lessonId: string;
  lessonSlug: string;
  isCompleted: boolean;
}

export function LessonCompleteButton({
  lessonId,
  lessonSlug,
  isCompleted: initialCompleted,
}: LessonCompleteButtonProps) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    if (isCompleted) return;
    startTransition(async () => {
      const result = await toggleLessonCompletion(
        lessonId,
        lessonSlug,
        true,
      );
      if (result.success) {
        setIsCompleted(true);
      }
    });
  };

  return (
    <div className="flex items-center gap-4">
      {isCompleted ? (
        <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium text-sm">
          <CheckCircle2 className="w-4 h-4" />
          Completed
        </div>
      ) : (
        <Button
          onClick={handleToggle}
          disabled={isPending}
          className="bg-gradient-to-r from-blue-700 to-sky-600 hover:from-blue-600 hover:to-sky-500 text-white border-0"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Circle className="w-4 h-4 mr-2" />
          )}
          Mark as Complete
        </Button>
      )}
    </div>
  );
}
