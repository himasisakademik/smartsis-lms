"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { writeClient } from "@/sanity/lib/client";
import { awardXP } from "@/lib/actions/gamification";

const SANITY_ID_REGEX = /^[a-zA-Z0-9._-]+$/;

export async function toggleLessonCompletion(
  lessonId: string,
  lessonSlug: string,
  markComplete: boolean,
): Promise<{
  success: boolean;
  isCompleted: boolean;
  xpGained?: number;
  newBadges?: string[];
}> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, isCompleted: false };
  }

  if (
    !lessonId ||
    typeof lessonId !== "string" ||
    !SANITY_ID_REGEX.test(lessonId)
  ) {
    return { success: false, isCompleted: false };
  }

  if (
    !lessonSlug ||
    typeof lessonSlug !== "string" ||
    lessonSlug.length > 200
  ) {
    return { success: false, isCompleted: false };
  }

  try {
    if (!markComplete) {
      return { success: false, isCompleted: true };
    }

    await writeClient
      .patch(lessonId)
      .setIfMissing({ completedBy: [] })
      .append("completedBy", [userId])
      .commit();

    revalidatePath(`/lessons/${lessonSlug}`);
    revalidatePath("/dashboard");

    let xpGained: number | undefined;
    let newBadges: string[] | undefined;

    if (markComplete) {
      try {
        const user = await currentUser();
        const userName = user?.firstName
          ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
          : "Student";
        const userImage = user?.imageUrl;

        const result = await awardXP(userId, "lesson", userName, userImage);
        xpGained = result.xpGained;
        newBadges = result.newBadges;
      } catch (err) {
        console.error("XP award error:", err);
      }
    }

    return { success: true, isCompleted: markComplete, xpGained, newBadges };
  } catch (error) {
    console.error(
      "Failed to toggle lesson completion:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return { success: false, isCompleted: !markComplete };
  }
}
