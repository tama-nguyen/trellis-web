/** Course discovery and the learner area under /learn (LMS mock). */
export const LEARNING_ROUTES = {
  learn: "/learn",
  catalog: "/learn/catalog",
  learnCourse: (courseSlug: string) => `/learn/courses/${encodeURIComponent(courseSlug)}`,
  myCourses: "/learn/courses",
  learnProgress: "/learn/progress",
  learnAchievements: "/learn/achievements",
  learnMessages: "/learn/messages",
  learnNotes: "/learn/notes",
  learnBookmarks: "/learn/bookmarks",
  learnStudyPlan: "/learn/study-plan",
  search: "/search",
  /** Public course page, outside the learner shell: a visitor has no sidebar. */
  catalogCourse: (courseSlug: string) => `/catalog/courses/${encodeURIComponent(courseSlug)}`,
} as const;
