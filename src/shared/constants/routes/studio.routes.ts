/** The instructor area under /studio (LMS mock). */
export const STUDIO_ROUTES = {
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
