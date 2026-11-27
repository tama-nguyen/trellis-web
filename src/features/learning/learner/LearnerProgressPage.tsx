"use client";

import { BookOpen, CircleCheck, Clock, Flame } from "@/ui/icons/lucide";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { COURSE_PROGRESS, PROGRESS_SUMMARY } from "@/entities/learning/progress.fixtures";
import type { CourseProgressRow } from "@/entities/learning/progress.types";
import { Link } from "@/i18n/navigation";
import { LEARNING_ROUTES } from "@/shared/constants/routes/learning.routes";
import { Badge } from "@astryxdesign/core/Badge";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { AsOfBadge } from "../shell/AsOfBadge";
import { PageHeading } from "../shell/PageHeading";
import { useDurationLabel } from "@/features/learning/hooks/useDurationLabel";

/** M4 — progress and grades. The summary is a projection; the grade is not. */
export function LearnerProgressPage() {
  const t = useTranslations("learning.progressPage");
  const durationLabel = useDurationLabel();
  const summary = PROGRESS_SUMMARY;
  const courses = COURSE_PROGRESS;

  return (
    <div className="flex flex-col gap-4">
      <PageHeading
        title={t("title")}
        description={t("description")}
        actions={<AsOfBadge asOf={summary.asOf} />}
      />

      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Tile icon={BookOpen} term={t("coursesEnrolled")} value={`${summary.coursesEnrolled}`} />
        <Tile
          icon={CircleCheck}
          term={t("lessonsCompleted")}
          value={t("lessonsOf", { done: summary.lessonsCompleted, total: summary.lessonsTotal })}
        />
        <Tile icon={Clock} term={t("studyTime")} value={durationLabel(summary.studyMinutes)} />
        <Tile
          icon={Flame}
          term={t("streak")}
          value={t("streakValue", { count: summary.currentStreakDays })}
        />
      </dl>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-fg">{t("coursesTitle")}</h2>
        {courses.length === 0 ? (
          <EmptyState
            icon={<Icon icon={BookOpen} size="lg" />}
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {courses.map((course) => (
              <li key={course.slug}>
                <CourseProgressCard course={course} />
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-fg-subtle">{t("gradeNote")}</p>
      </section>
    </div>
  );
}

function Tile({ icon, term, value }: { icon: LucideIcon; term: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-control bg-info-subtle text-fg-brand">
        <Icon icon={icon} size="md" />
      </span>
      <div className="min-w-0">
        <dd className="text-xl font-semibold text-fg">{value}</dd>
        <dt className="text-xs text-fg-muted">{term}</dt>
      </div>
    </div>
  );
}

function CourseProgressCard({ course }: { course: CourseProgressRow }) {
  const t = useTranslations("learning.progressPage");
  return (
    <article className="flex flex-wrap items-center gap-4 rounded-card border border-border bg-surface p-4">
      <div className="min-w-0 flex-1 basis-64">
        <Link
          href={LEARNING_ROUTES.learnCourse(course.slug)}
          className="text-sm font-semibold text-fg hover:text-fg-brand"
        >
          {course.title}
        </Link>
        <p className="mt-1 text-xs text-fg-muted">
          {t("lessonsOf", { done: course.lessonsCompleted, total: course.lessonsTotal })}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <ProgressBar isLabelHidden value={course.percentComplete} label={course.title} />
          <span className="shrink-0 text-xs text-fg-muted">{course.percentComplete}%</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-fg-muted">{t("gradeLabel")}</span>
        {course.grade === undefined ? (
          <Badge label={t("gradeNone")} />
        ) : (
          <span className="text-lg font-semibold text-fg">{course.grade}</span>
        )}
      </div>
    </article>
  );
}
