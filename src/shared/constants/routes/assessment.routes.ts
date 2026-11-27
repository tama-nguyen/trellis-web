/** Taking a test (LMS mock). */
export const ASSESSMENT_ROUTES = {
  learnAssessment: (assessmentId: string) => `/assessments/${encodeURIComponent(assessmentId)}`,
  assessmentStart: (assessmentId: string) => `/assessments/${encodeURIComponent(assessmentId)}/start`,
  assessmentResult: (assessmentId: string, attemptId: string) =>
    `/assessments/${encodeURIComponent(assessmentId)}/attempts/${encodeURIComponent(attemptId)}`,
} as const;
