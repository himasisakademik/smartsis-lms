import { defineQuery } from "next-sanity";

export const FEATURED_COURSES_QUERY = defineQuery(`*[
  _type == "course"
  && featured == true
] | order(_createdAt desc)[0...6] {
  _id,
  title,
  slug,
  description,

  featured,
  thumbnail {
    asset-> {
      _id,
      url
    }
  },
  "moduleCount": count(modules),
  "lessonCount": count(modules[]->lessons[])
}`);

export const ALL_COURSES_QUERY = defineQuery(`*[
  _type == "course"
] | order(_createdAt desc) {
  _id,
  title,
  slug,
  description,

  featured,
  thumbnail {
    asset-> {
      _id,
      url
    }
  },
  "moduleCount": count(modules),
  "lessonCount": count(modules[]->lessons[])
}`);

export const COURSE_BY_ID_QUERY = defineQuery(`*[
  _type == "course"
  && _id == $id
][0] {
  _id,
  title,
  slug,
  description,

  featured,
  thumbnail {
    asset-> {
      _id,
      url
    }
  },
  category-> {
    _id,
    title
  },
  modules[]-> {
    _id,
    title,
    description,
    lessons[]-> {
      _id,
      title,
      slug
    }
  }
}`);

export const COURSE_BY_SLUG_QUERY = defineQuery(`*[
  _type == "course"
  && slug.current == $slug
][0] {
  _id,
  title,
  slug,
  description,

  featured,
  thumbnail {
    asset-> {
      _id,
      url
    }
  },
  category-> {
    _id,
    title
  },
  modules[]-> {
    _id,
    title,
    description,
    lessons[]-> {
      _id,
      title,
      slug
    }
  }
}`);

export const STATS_QUERY = defineQuery(`{
  "courseCount": count(*[_type == "course"]),
  "lessonCount": count(*[_type == "lesson"]),
  "studentCount": count(*[_type == "userProgress"])
}`);

export const DASHBOARD_COURSES_QUERY = defineQuery(`*[
  _type == "course"
] | order(_createdAt desc) {
  _id,
  title,
  slug,
  description,

  featured,
  completedBy,
  thumbnail {
    asset-> {
      _id,
      url
    }
  },
  category-> {
    _id,
    title
  },
  modules[]-> {
    lessons[]-> {
      _id,
      title,
      slug,
      completedBy,
      duration
    }
  },
  "moduleCount": count(modules),
  "lessonCount": count(modules[]->lessons[])
}`);

export const COURSE_WITH_MODULES_QUERY = defineQuery(`*[
  _type == "course"
  && slug.current == $slug
][0] {
  _id,
  title,
  slug,
  description,

  featured,
  thumbnail {
    asset-> {
      _id,
      url
    }
  },
  category-> {
    _id,
    title
  },
  modules[]-> {
    _id,
    title,
    description,
    completedBy,
    lessons[]-> {
      _id,
      title,
      slug,
      description,
      completedBy,
      videoUrl,
      duration
    }
  },
  completedBy,
  "moduleCount": count(modules),
  "lessonCount": count(modules[]->lessons[]),
  "completedLessonCount": count(modules[]->lessons[]->completedBy[@==$userId])
}`);

export const LESSON_BY_ID_QUERY = defineQuery(`*[
  _type == "lesson"
  && _id == $id
][0] {
  _id,
  title,
  slug,
  description,
  videoUrl,
  duration,
  content,
  completedBy,
  "courses": *[_type == "course" && ^._id in modules[]->lessons[]->_id] | order(
    select(tier == "free" => 0, tier == "pro" => 1, tier == "ultra" => 2)
  ) {
    _id,
    title,
    slug,

    modules[]-> {
      _id,
      title,
      lessons[]-> {
        _id,
        title,
        slug,
        completedBy
      }
    }
  }
}`);

export const LESSON_BY_SLUG_QUERY = defineQuery(`*[
  _type == "lesson"
  && slug.current == $slug
][0] {
  _id,
  title,
  slug,
  description,
  videoUrl,
  duration,
  content,
  completedBy,
  "quiz": quiz[]{
    _key,
    questionText,
    options[]{
      _key,
      text,
      isCorrect
    },
    explanation
  },
  "courses": *[_type == "course" && ^._id in modules[]->lessons[]->_id] | order(
    select(tier == "free" => 0, tier == "pro" => 1, tier == "ultra" => 2)
  ) {
    _id,
    title,
    slug,

    modules[]-> {
      _id,
      title,
      lessons[]-> {
        _id,
        title,
        slug,
        completedBy
      }
    }
  }
}`);

export const LESSON_NAVIGATION_QUERY = defineQuery(`*[
  _type == "course"
  && $lessonId in modules[]->lessons[]->_id
][0] {
  _id,
  title,

  modules[]-> {
    _id,
    title,
    lessons[]-> {
      _id,
      title
    }
  }
}`);

export const COURSE_REVIEWS_QUERY = defineQuery(`*[
  _type == "review"
  && courseId == $courseId
] | order(_createdAt desc) {
  _id,
  courseId,
  userId,
  userName,
  userImage,
  rating,
  comment,
  _createdAt
}`);

export const USER_REVIEW_QUERY = defineQuery(`*[
  _type == "review"
  && courseId == $courseId
  && userId == $userId
][0] {
  _id,
  rating,
  rating,
  comment
}`);

export const ANALYTICS_QUERY = defineQuery(`{
  "courses": *[_type == "course"] | order(_createdAt desc) {
    _id,
    title,
    price,
    tier,
    "moduleCount": count(modules),
    "lessonCount": count(modules[]->lessons[]),
    "completedLessonCount": count(modules[]->lessons[]->completedBy),
    "enrolledStudents": count(*[_type == "userProgress" && course._ref == ^._id]),
    "totalRevenue": math::sum(*[_type == "userProgress" && course._ref == ^._id].amountPaid)
  },
  "totalRevenue": math::sum(*[_type == "userProgress"].amountPaid),
  "totalStudents": count(*[_type == "userProgress"]),
  "totalCertificates": count(*[_type == "certificate"]),
  "totalLessonsCompleted": count(*[_type == "lesson" && defined(completedBy)].completedBy)
}`);

export const ADMIN_DASHBOARD_QUERY = defineQuery(`{
  "totalStudents": count(*[_type == "userProgress"]),
  "activeCourses": count(*[_type == "course"]),
  "totalRevenue": math::sum(*[_type == "userProgress"].amountPaid),
  "completionRate": math::round(count(*[_type == "certificate"]) / max([1, count(*[_type == "userProgress"])]) * 100),
  "recentActivities": *[_type in ["userProgress", "certificate", "review"]] | order(_createdAt desc)[0...10] {
    _type,
    _id,
    _createdAt,
    "title": select(
      _type == "userProgress" => "New Enrollment",
      _type == "certificate" => "Course Completed",
      _type == "review" => "New Review",
      "Unknown Action"
    ),
    "description": select(
      _type == "userProgress" => "A student enrolled in " + course->title,
      _type == "certificate" => "A student earned a certificate for " + course->title,
      _type == "review" => "A student left a " + rating + "-star review for " + course->title,
      "System activity"
    )
  }
}`);
