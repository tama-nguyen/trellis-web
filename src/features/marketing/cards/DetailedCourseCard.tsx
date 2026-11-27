"use client";

import { BookOpen, CalendarDays, Clock3, Signal, Star, Users } from "@/ui/icons/lucide";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CatalogCourse } from "@/entities/marketing/marketing.types";
import { CourseThumbnail } from "@/features/learning/shared/CourseThumbnail";
import { LANGUAGE_TONES } from "@/features/learning/shared/learning.tones";
import { useDurationLabel } from "@/features/learning/hooks/useDurationLabel";
import { Link } from "@/i18n/navigation";
import { LEARNING_ROUTES } from "@/shared/constants/routes/learning.routes";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Badge } from "@astryxdesign/core/Badge";
import { HStack } from "@astryxdesign/core/HStack";
import { Heading, Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { cardVariants } from "@/ui/card/Card";
import { cn } from "@/ui/lib/cn";
import { Icon } from "@astryxdesign/core/Icon";
import { BESTSELLER_TONE } from "../shared/marketing.tones";

/**
 * A course in a shelf, with everything a learner compares before opening it: who teaches it, a
 * summary, rating and audience size, and the numbers that say how big a commitment it is
 * (lessons, hours, level, weeks). Taller than `CourseCard` on purpose; the shelf has the room.
 */
export function DetailedCourseCard({ course }: { course: CatalogCourse }) {
  const t = useTranslations("marketing.card");
  const tLevels = useTranslations("learning.levels");
  const tLanguages = useTranslations("learning.languages");
  const tUnits = useTranslations("learning.units");
  const durationLabel = useDurationLabel();

  const facts: readonly { icon: LucideIcon; label: string }[] = [
    { icon: BookOpen, label: tUnits("lessonCount", { count: course.lessonCount }) },
    { icon: Clock3, label: durationLabel(course.durationMinutes) },
    { icon: Signal, label: tLevels(course.level) },
    { icon: CalendarDays, label: t("weeksCount", { count: course.weeks }) },
  ];

  return (
    <Link
      href={LEARNING_ROUTES.catalogCourse(course.slug)}
      className={cn(
        cardVariants({ size: "none", isInteractive: true }),
        "group flex h-full flex-col overflow-hidden",
      )}
    >
      <CourseThumbnail
        art={course.art}
        title={course.title}
        hook={course.thumbnailHook}
        durationMinutes={course.durationMinutes}
        className="rounded-none"
      />

      <VStack gap={3} className="flex-1 p-4 sm:p-5">
        <HStack gap={2} wrap="wrap">
          <Badge variant={LANGUAGE_TONES[course.language]} label={tLanguages(course.language)} />
          {course.isBestseller ? <Badge variant={BESTSELLER_TONE} label={t("bestseller")} /> : null}
        </HStack>

        <Heading
          level={3}
          className="line-clamp-2 text-lg leading-snug transition-colors duration-fast ease-standard group-hover:text-fg-brand"
        >
          {course.title}
        </Heading>

        <HStack gap={2} vAlign="center">
          <Avatar name={course.instructor} size="sm" />
          <Text type="supporting" color="secondary" maxLines={1}>
            {t("taughtBy", { name: course.instructor })}
          </Text>
        </HStack>

        <Text as="p" type="supporting" color="secondary" maxLines={3} className="leading-relaxed">
          {course.summary}
        </Text>

        <HStack gap={3} wrap="wrap" vAlign="center" className="text-sm">
          <HStack gap={1} vAlign="center" className="text-warning">
            <Icon icon={Star} size="sm" className="fill-current" />
            <Text as="span" type="supporting" weight="semibold">
              {course.rating}
            </Text>
            <Text as="span" type="supporting" color="secondary">
              {t("ratingCount", { count: course.ratingCount })}
            </Text>
          </HStack>
          <HStack gap={1.5} vAlign="center" className="text-fg-muted">
            <Icon icon={Users} size="sm" />
            <Text as="span" type="supporting" color="secondary">
              {t("learnersCount", { count: course.learners })}
            </Text>
          </HStack>
        </HStack>

        <ul
          aria-label={t("factsLabel")}
          className="mt-auto grid grid-cols-2 gap-x-2 gap-y-2.5 border-t border-border pt-4"
        >
          {facts.map(({ icon, label }) => (
            <HStack as="li" key={label} gap={1.5} vAlign="center" className="min-w-0">
              <Icon icon={icon} size="sm" className="shrink-0 text-fg-subtle" />
              <Text as="span" type="supporting" color="secondary" className="min-w-0 leading-tight">
                {label}
              </Text>
            </HStack>
          ))}
        </ul>

        <span className="inline-flex h-10 items-center justify-center rounded-control bg-brand text-sm font-medium text-on-brand transition-colors duration-fast ease-standard group-hover:bg-brand-hover">
          {t("viewCourse")}
        </span>
      </VStack>
    </Link>
  );
}
