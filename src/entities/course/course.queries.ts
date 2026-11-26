"use client";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { courseApi, type CourseStatus } from "./course.api";

export function useCourses(query: string, status: CourseStatus | undefined) {
  return useInfiniteQuery({
    queryKey: ["course", "list", query, status],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      courseApi.list({ first: 20, after: pageParam, query, status }, signal),
    getNextPageParam: (page) => (page.hasNext ? (page.nextCursor ?? undefined) : undefined),
  });
}

export function useCourse(code: string) {
  return useQuery({
    queryKey: ["course", "detail", code],
    queryFn: ({ signal }) => courseApi.detail(code, signal),
  });
}
