"use client";

import { useDateLabel } from "@/features/learning/hooks/useDateLabel";
import { ArrowRight, CalendarClock, ChevronRight, LayoutGrid } from "@/ui/icons/lucide";
import { useTranslations } from "next-intl";
import { MY_COURSES } from "@/entities/learning/course.fixtures";
import { type MyCourseRow } from "@/entities/learning/course.types";
import { LEARNING_ROUTES } from "@/shared/constants/routes/learning.routes";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { CourseArtwork } from "../shared/CourseArtwork";
import { SHORT_DATE } from "../shared/learning.format";
import { LANGUAGE_TONES } from "../shared/learning.tones";

/** M3 — everything the learner is enrolled in. */
export function MyCoursesPage() {
  const t = useTranslations("learning.myCourses");
  const courses = MY_COURSES;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold text-fg">{t("title")}</h1>
        <p className="mt-1 text-sm text-fg-muted">{t("description")}</p>
      </header>

      {courses.length === 0 ? (
        <EmptyState
          icon={<Icon icon={LayoutGrid} size="lg" />}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          actions={
            <Button
              variant="primary"
              endContent={<Icon icon={ArrowRight} size="sm" />}
              href={LEARNING_ROUTES.catalog}
              label={t("emptyAction")}
            />
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {courses.map((course) => (
            <li key={course.slug}>
              <CourseRow course={course} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CourseRow({ course }: { course: MyCourseRow }) {
  const t = useTranslations("learning.myCourses");
  const tLanguages = useTranslations("learning.languages");
  const dateLabel = useDateLabel();
  const isStarted = course.percentComplete > 0;

  return (
    <article className="flex flex-wrap items-center gap-4 rounded-card border border-border bg-surface p-4">
      <CourseArtwork art={course.art} title={course.title} className="size-16 shrink-0 rounded-control" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold text-fg">{course.title}</h2>
          <Badge variant={LANGUAGE_TONES[course.language]} label={tLanguages(course.language)} />
          {/* Pinned version, because a newer one may already be published (BR-19). */}
          <Badge label={t("pinnedVersion", { version: course.pinnedVersion })} />
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-fg-muted">
          <span>
            {isStarted
              ? t("lastActivity", {
                  date: dateLabel(course.lastActivityAt, SHORT_DATE),
                })
              : t("notStarted")}
          </span>
          {course.dueAt ? (
            <span className="flex items-center gap-1 text-warning">
              <Icon icon={CalendarClock} size="sm" />
              {t("dueAt", { date: dateLabel(course.dueAt, SHORT_DATE) })}
            </span>
          ) : null}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <ProgressBar isLabelHidden value={course.percentComplete} label={course.title} />
          <span className="shrink-0 text-xs text-fg-muted">{course.percentComplete}%</span>
        </div>
      </div>
      <Button
        variant={isStarted ? "secondary" : "primary"}
        size="sm"
        endContent={<Icon icon={ChevronRight} size="sm" />}
        href={LEARNING_ROUTES.learnCourse(course.slug)}
        label={isStarted ? t("continueAction") : t("startAction")}
      />
    </article>
  );
}
