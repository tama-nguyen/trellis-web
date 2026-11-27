"use client";

import { useDateLabel } from "@/features/learning/hooks/useDateLabel";
import { ChevronRight, Layers, Plus, Users } from "@/ui/icons/lucide";
import { useTranslations } from "next-intl";
import { STUDIO_COURSES } from "@/entities/learning/studio.fixtures";
import type { StudioCourseRow } from "@/entities/learning/studio.types";
import { STUDIO_ROUTES } from "@/shared/constants/routes/studio.routes";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { CourseArtwork } from "../shared/CourseArtwork";
import { SHORT_DATE } from "../shared/learning.format";
import { LANGUAGE_TONES, PUBLISH_TONES } from "../shared/learning.tones";

/** M10 — what an instructor owns. The entry point the studio never had. */
export function StudioCoursesPage() {
  const t = useTranslations("learning.studio.home");
  const courses = STUDIO_COURSES;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-fg">{t("title")}</h1>
          <p className="mt-1 text-sm text-fg-muted">{t("description")}</p>
        </div>
        <Button
          variant="primary"
          icon={<Icon icon={Plus} size="sm" />}
          href={STUDIO_ROUTES.studioNewCourse}
          label={t("newCourse")}
        />
      </header>

      {courses.length === 0 ? (
        <EmptyState
          icon={<Icon icon={Layers} size="lg" />}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          actions={<Button variant="primary" href={STUDIO_ROUTES.studioNewCourse} label={t("newCourse")} />}
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

function CourseRow({ course }: { course: StudioCourseRow }) {
  const t = useTranslations("learning.studio.home");
  const tLanguages = useTranslations("learning.languages");
  const tStates = useTranslations("learning.studio.publishStates");
  const dateLabel = useDateLabel();

  return (
    <article className="flex flex-wrap items-center gap-4 rounded-card border border-border bg-surface p-4">
      <CourseArtwork art={course.art} title={course.title} className="size-14 shrink-0 rounded-control" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold text-fg">{course.title}</h2>
          <Badge variant={PUBLISH_TONES[course.publishState]} label={tStates(course.publishState)} />
          <Badge variant={LANGUAGE_TONES[course.language]} label={tLanguages(course.language)} />
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-fg-muted">
          <span>{t("versions", { count: course.versionCount })}</span>
          <span className="flex items-center gap-1">
            <Icon icon={Users} size="sm" />
            {t("learners", { count: course.learnerCount })}
          </span>
          <span>{t("updated", { date: dateLabel(course.updatedAt, SHORT_DATE) })}</span>
        </p>
      </div>
      <Button
        variant="secondary"
        size="sm"
        endContent={<Icon icon={ChevronRight} size="sm" />}
        href={STUDIO_ROUTES.studioCourse(course.slug)}
        label={t("open")}
      />
    </article>
  );
}
