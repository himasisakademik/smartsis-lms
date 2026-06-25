"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { writeClient } from "@/sanity/lib/client";
import { awardXP } from "@/lib/actions/gamification";

const SANITY_ID_REGEX = /^[a-zA-Z0-9._-]+$/;

export async function toggleCourseCompletion(
  courseId: string,
  courseSlug: string,
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
    !courseId ||
    typeof courseId !== "string" ||
    !SANITY_ID_REGEX.test(courseId)
  ) {
    return { success: false, isCompleted: false };
  }

  if (
    !courseSlug ||
    typeof courseSlug !== "string" ||
    courseSlug.length > 200
  ) {
    return { success: false, isCompleted: false };
  }

  try {
    if (markComplete) {
      await writeClient
        .patch(courseId)
        .setIfMissing({ completedBy: [] })
        .append("completedBy", [userId])
        .commit();
    } else {
      await writeClient
        .patch(courseId)
        .unset([`completedBy[@ == "${userId}"]`])
        .commit();
    }

    revalidatePath(`/courses/${courseSlug}`);
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

        const result = await awardXP(userId, "course", userName, userImage);
        xpGained = result.xpGained;
        newBadges = result.newBadges;
      } catch (err) {
        console.error("XP award error:", err);
      }
    }

    return { success: true, isCompleted: markComplete, xpGained, newBadges };
  } catch (error) {
    console.error(
      "Failed to toggle course completion:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return { success: false, isCompleted: !markComplete };
  }
}
