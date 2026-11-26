import { get } from "@/shared/api/http";
import type { components, operations } from "@/shared/api/generated/openapi";

type ListCoursesParams = NonNullable<operations["listCourses"]["parameters"]["query"]>;
export type CourseStatus = components["schemas"]["CourseView"]["status"];

const COURSES = "/api/courses";

export const courseApi = {
  list: (params: ListCoursesParams, signal?: AbortSignal) =>
    get<components["schemas"]["CoursePage"]>(COURSES, { params, signal }),
  detail: (code: string, signal?: AbortSignal) =>
    get<components["schemas"]["CourseView"]>(`${COURSES}/:code`, { pathParams: { code }, signal }),
};
