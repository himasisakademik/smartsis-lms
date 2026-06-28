"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { awardXP } from "@/lib/actions/gamification";
import { client, writeClient } from "@/sanity/lib/client";

interface QuizAnswer {
  questionIndex: number;
  selectedOptionIndex: number;
  isCorrect: boolean;
}

interface QuizResult {
  _id: string;
  clerkUserId: string;
  lessonId: string;
  lessonTitle: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  answers: QuizAnswer[];
  completedAt: string;
  attempts: number;
  xpAwarded?: boolean;
  xpGained?: number;
  xpAwardedAt?: string;
}

export async function submitQuiz(
  lessonId: string,
  lessonTitle: string,
  answers: QuizAnswer[],
  totalQuestions: number,
): Promise<{
  success: boolean;
  score: number;
  correctAnswers: number;
  xpGained: number;
  newBadges?: string[];
  isNewBest: boolean;
  xpEligible: boolean;
  attempts: number;
}> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      score: 0,
      correctAnswers: 0,
      xpGained: 0,
      isNewBest: false,
      xpEligible: false,
      attempts: 0,
    };
  }

  const correctAnswers = answers.filter((a) => a.isCorrect).length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);

  const existing = await client.fetch<QuizResult | null>(
    `*[_type == "quizResult" && clerkUserId == $userId && lessonId == $lessonId][0]`,
    { userId, lessonId },
  );

  const isNewBest = !existing || score > (existing.score ?? 0);
  const xpEligible = !existing;
  const attempt = existing ? (existing.attempts ?? 1) + 1 : 1;
  let quizResultId = existing?._id;

  if (existing) {
    if (isNewBest) {
      await writeClient
        .patch(existing._id)
        .set({
          score,
          correctAnswers,
          totalQuestions,
          answers: answers.map((a, i) => ({
            _type: "object",
            _key: `ans-${i}`,
            ...a,
          })),
          completedAt: new Date().toISOString(),
          attempts: attempt,
        })
        .commit();
    } else {
      await writeClient.patch(existing._id).set({ attempts: attempt }).commit();
    }
  } else {
    const created = await writeClient.create({
      _type: "quizResult",
      clerkUserId: userId,
      lessonId,
      lessonTitle,
      score,
      correctAnswers,
      totalQuestions,
      answers: answers.map((a, i) => ({
        _type: "object",
        _key: `ans-${i}`,
        ...a,
      })),
      completedAt: new Date().toISOString(),
      attempts: 1,
      xpAwarded: false,
      xpGained: 0,
    });
    quizResultId = created._id;
  }

  let xpGained = 0;
  let newBadges: string[] | undefined;

  if (xpEligible && quizResultId) {
    try {
      const user = await currentUser();
      const userName = user?.firstName
        ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
        : "Student";
      const userImage = user?.imageUrl;

      const result = await awardXP(userId, "lesson", userName, userImage);
      xpGained = result.xpGained;

      if (score === 100) {
        const progress = await client.fetch<{
          _id: string;
          totalXp: number;
        } | null>(
          `*[_type == "userProgress" && clerkUserId == $userId][0]{ _id, totalXp }`,
          { userId },
        );
        if (progress) {
          await writeClient
            .patch(progress._id)
            .inc({ totalXp: 15 })
            .setIfMissing({ xpHistory: [] })
            .append("xpHistory", [
              {
                _type: "object",
                _key: `xp-quiz-perfect-${Date.now()}`,
                amount: 15,
                reason: "quiz_perfect",
                earnedAt: new Date().toISOString(),
              },
            ])
            .commit();
          xpGained += 15;
        }
      }

      newBadges = result.newBadges;

      await writeClient
        .patch(quizResultId)
        .set({
          xpAwarded: true,
          xpGained,
          xpAwardedAt: new Date().toISOString(),
        })
        .commit();
    } catch (err) {
      console.error("Quiz XP award error:", err);
    }
  }

  return {
    success: true,
    score,
    correctAnswers,
    xpGained,
    newBadges,
    isNewBest,
    xpEligible,
    attempts: attempt,
  };
}

export async function getQuizResult(
  lessonId: string,
): Promise<QuizResult | null> {
  const { userId } = await auth();
  if (!userId) return null;

  return client.fetch<QuizResult | null>(
    `*[_type == "quizResult" && clerkUserId == $userId && lessonId == $lessonId][0]{
      _id, clerkUserId, lessonId, lessonTitle,
      score, correctAnswers, totalQuestions,
      answers[]{ questionIndex, selectedOptionIndex, isCorrect },
      completedAt, attempts, xpAwarded, xpGained, xpAwardedAt
    }`,
    { userId, lessonId },
  );
}
