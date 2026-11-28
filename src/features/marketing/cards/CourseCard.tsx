import { Star } from "@/ui/icons/lucide";
import { useTranslations } from "next-intl";
import type { FeaturedCourse } from "@/entities/marketing/marketing.types";
import { Link } from "@/i18n/navigation";
import { LEARNING_ROUTES } from "@/shared/constants/routes/learning.routes";
import { Badge } from "@astryxdesign/core/Badge";
import { Icon } from "@astryxdesign/core/Icon";
import { CourseThumbnail } from "@/features/learning/shared/CourseThumbnail";
import { BESTSELLER_TONE } from "../shared/marketing.tones";

/** `Ms Chen` -> `MC`: the avatar stands in for a teacher photo the mock does not have. */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * One course in a grid, laid out like a video in a feed: a frameless thumbnail, then the teacher's
 * avatar beside the title, the teacher, and the rating with the course length.
 *
 * There is no card box: on a grid of photos the thumbnails already make the rhythm, and a frame
 * around each would double every edge.
 */
export function CourseCard({ course }: { course: FeaturedCourse }) {
  const t = useTranslations("marketing.card");
  const tLevels = useTranslations("learning.levels");

  return (
    <Link
      href={LEARNING_ROUTES.catalogCourse(course.slug)}
      className="group relative flex h-full flex-col gap-3 rounded-card"
    >
      <CourseThumbnail
        art={course.art}
        title={course.title}
        hook={course.thumbnailHook}
        durationMinutes={course.durationMinutes}
        className="transition-[border-radius] duration-normal ease-standard group-hover:rounded-control"
      />

      <div className="flex gap-3">
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-full bg-info-subtle text-xs font-bold text-fg-brand"
        >
          {initialsOf(course.instructor)}
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="line-clamp-2 text-base leading-snug font-semibold text-fg transition-colors duration-fast ease-standard group-hover:text-fg-brand">
            {course.title}
          </h3>
          <p className="text-sm text-fg-muted">{course.instructor}</p>
          <p className="flex flex-wrap items-center gap-x-1.5 text-sm text-fg-muted">
            <span className="flex items-center gap-1 font-semibold text-warning">
              <Icon icon={Star} size="sm" className="fill-current" />
              {course.rating}
            </span>
            <span className="text-fg-subtle">{t("ratingCount", { count: course.ratingCount })}</span>
          </p>
          <p className="text-xs text-fg-subtle">
            {t("meta", { level: tLevels(course.level), weeks: course.weeks })}
          </p>
          {course.isBestseller ? (
            <Badge variant={BESTSELLER_TONE} className="mt-1.5 self-start" label={t("bestseller")} />
          ) : null}
        </div>
      </div>
    </Link>
  );
}
