/**
 * Every in-app path, without the locale prefix: link with `Link` from `@/i18n/navigation`,
 * which adds it. Build parameterised paths with the helpers, never by string concatenation.
 */
export const ROUTES = {
  home: "/",
  register: "/register",
  verifyEmail: "/verify-email",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  login: "/login",
  account: "/account",
  admin: "/admin",
  notices: "/notices",
  noticeDetail: (noticeCode: string) => `/notices/${encodeURIComponent(noticeCode)}`,

  /** Public marketing pages, reachable from the header without signing in. */
  courses: "/courses",
  educators: "/educators",
  pricing: "/pricing",
  resources: "/resources",

  /** Learning (LMS mock): learner area under /learn, instructor area under /studio. */
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
  learnAssessment: (assessmentId: string) => `/assessments/${encodeURIComponent(assessmentId)}`,
  assessmentStart: (assessmentId: string) => `/assessments/${encodeURIComponent(assessmentId)}/start`,
  assessmentResult: (assessmentId: string, attemptId: string) =>
    `/assessments/${encodeURIComponent(assessmentId)}/attempts/${encodeURIComponent(attemptId)}`,
  /** Public course page, outside the learner shell: a visitor has no sidebar. */
  catalogCourse: (courseSlug: string) => `/catalog/courses/${encodeURIComponent(courseSlug)}`,
  studio: "/studio",
  studioNewCourse: "/studio/courses/new",
  studioQuestionBank: "/studio/question-bank",
  studioStudents: "/studio/students",
  studioGrading: "/studio/grading",
  studioAnalytics: "/studio/analytics",
  studioAssignments: "/studio/assignments",
  studioCertificates: "/studio/certificates",
  studioResources: "/studio/resources",
  studioCourse: (courseSlug: string) => `/studio/courses/${encodeURIComponent(courseSlug)}`,
  studioPublish: (courseSlug: string) => `/studio/courses/${encodeURIComponent(courseSlug)}/publish`,
  studioAssessment: (assessmentId: string) => `/studio/assessments/${encodeURIComponent(assessmentId)}`,
} as const;

/** Query parameter carrying the path to return to after sign-in. */
export const REDIRECT_PARAM = "redirect";
