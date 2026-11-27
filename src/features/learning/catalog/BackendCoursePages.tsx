"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { useCourse, useCourses } from "@/entities/course/course.queries";
import { Link } from "@/i18n/navigation";
import { screenStateOf } from "@/shared/lib/screenState";
import { PageShell } from "@/ui/layout/PageShell";

const statuses = ["ACTIVE", "DRAFT", "ARCHIVED"] as const;

export function CourseDirectory() {
  const t = useTranslations();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statuses)[number]>();
  const courses = useCourses(query, status);
  const rows = courses.data?.pages.flatMap((page) => page.items) ?? [];
  return (
    <PageShell
      title={t("learning.catalog.title")}
      actions={
        <>
          <input
            type="search"
            value={query}
            aria-label={t("learning.catalog.searchLabel")}
            placeholder={t("learning.catalog.searchLabel")}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            value={status ?? ""}
            aria-label={t("learning.catalog.statusLabel")}
            onChange={(event) => setStatus(statuses.find((item) => item === event.target.value))}
          >
            <option value="">{t("learning.catalog.allStatuses")}</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {t(`learning.catalog.statuses.${item}`)}
              </option>
            ))}
          </select>
        </>
      }
      state={screenStateOf(courses, { isEmpty: !rows.length })}
      loading={<Skeleton className="h-24" />}
      empty={t("learning.catalog.emptyTitle")}
      error={
        <button onClick={() => void courses.refetch()}>
          {t("common.states.errorTitle")} · {t("common.actions.retry")}
        </button>
      }
    >
      <ul>
        {rows.map((course) => (
          <li key={course.code}>
            <Link href={`/learn/catalog/${encodeURIComponent(course.code)}`}>{course.name}</Link>
          </li>
        ))}
      </ul>
      {courses.hasNextPage && (
        <button disabled={courses.isFetchingNextPage} onClick={() => void courses.fetchNextPage()}>
          {t("notification.list.loadMore")}
        </button>
      )}
    </PageShell>
  );
}

export function CourseDetails({ code }: { code: string }) {
  const t = useTranslations();
  const course = useCourse(code);
  return (
    <PageShell
      title={course.data?.name}
      state={course.isSuccess && !course.data ? "notFound" : screenStateOf(course)}
      notFound={t("common.states.notFoundTitle")}
      loading={<Skeleton className="h-24" />}
      error={
        <button onClick={() => void course.refetch()}>
          {t("common.states.errorTitle")} · {t("common.actions.retry")}
        </button>
      }
    >
      <p>{course.data?.description}</p>
      <Link href="/learn/catalog">{t("learning.catalog.title")}</Link>
    </PageShell>
  );
}
