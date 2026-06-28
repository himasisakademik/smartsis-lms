import { EditIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const quizResultType = defineType({
  name: "quizResult",
  title: "Quiz Result",
  type: "document",
  icon: EditIcon,
  fields: [
    defineField({
      name: "clerkUserId",
      title: "User ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "lessonId",
      title: "Lesson ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "lessonTitle",
      title: "Lesson Title",
      type: "string",
    }),
    defineField({
      name: "score",
      title: "Score (%)",
      type: "number",
      validation: (Rule) => Rule.min(0).max(100),
    }),
    defineField({
      name: "correctAnswers",
      title: "Correct Answers",
      type: "number",
    }),
    defineField({
      name: "totalQuestions",
      title: "Total Questions",
      type: "number",
    }),
    defineField({
      name: "answers",
      title: "User Answers",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "questionIndex",
              type: "number",
            }),
            defineField({
              name: "selectedOptionIndex",
              type: "number",
            }),
            defineField({
              name: "isCorrect",
              type: "boolean",
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "completedAt",
      title: "Completed At",
      type: "datetime",
    }),
    defineField({
      name: "attempts",
      title: "Attempt Number",
      type: "number",
      initialValue: 1,
    }),
    defineField({
      name: "xpAwarded",
      title: "XP Awarded",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "xpGained",
      title: "XP Gained",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "xpAwardedAt",
      title: "XP Awarded At",
      type: "datetime",
    }),
  ],

  preview: {
    select: {
      userId: "clerkUserId",
      lessonTitle: "lessonTitle",
      score: "score",
    },
    prepare({ userId, lessonTitle, score }) {
      return {
        title: lessonTitle || "Unknown Lesson",
        subtitle: `Score: ${score ?? 0}% — User: ${userId?.slice(0, 8)}...`,
        media: EditIcon,
      };
    },
  },
});
