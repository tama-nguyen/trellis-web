"use client";

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronRight,
  CircleCheck,
  Clock,
  Flame,
  Layers,
  Play,
  Star,
  Trophy,
} from "@/ui/icons/lucide";
import type { LucideIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { CATALOG_COURSES, CONTINUE_LEARNING, RECOMMENDED_SLUGS } from "@/entities/learning/course.fixtures";
import { type CourseInProgress } from "@/entities/learning/course.types";
import { type COURSE_ART, type CourseLanguage } from "@/entities/learning/learning.constants";
import {
  ACHIEVEMENTS,
  LEARNING_STATS,
  SAMPLE_LEARNER,
  WEEKLY_PROGRESS,
} from "@/entities/learning/progress.fixtures";
import { type Achievement, type LearningStat } from "@/entities/learning/progress.types";
import { Link } from "@/i18n/navigation";
import { LEARNING_ROUTES } from "@/shared/constants/routes/learning.routes";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { cn } from "@/ui/lib/cn";
import { Icon } from "@astryxdesign/core/Icon";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { ProgressRing } from "@/ui/feedback/ProgressRing";
import { Selector } from "@astryxdesign/core/Selector";
import { CourseArtwork } from "../shared/CourseArtwork";
import { LANGUAGE_TONES } from "../shared/learning.tones";
import { useDurationLabel } from "@/features/learning/hooks/useDurationLabel";

const STAT_ICONS: Record<LearningStat["key"], LucideIcon> = {
  coursesInProgress: BookOpen,
  lessonsCompleted: CircleCheck,
  learningTime: Clock,
  progressVsLastMonth: BarChart3,
};

const ACHIEVEMENT_ICONS: Record<Achievement["icon"], LucideIcon> = {
  trophy: Trophy,
  flame: Flame,
  star: Star,
};

const RANGE_VALUES = { LAST_30: "last30", LAST_7: "last7", ALL: "all" } as const;
type RangeValue = (typeof RANGE_VALUES)[keyof typeof RANGE_VALUES];

export function LearningDashboardPage() {
  const t = useTranslations("learning.dashboard");
  const tUnits = useTranslations("learning.units");
  const [range, setRange] = useState<RangeValue>(RANGE_VALUES.LAST_30);
  const resumed = CONTINUE_LEARNING[1];
  const recommended = CATALOG_COURSES.filter((course) => RECOMMENDED_SLUGS.includes(course.slug));

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
      <div className="flex min-w-0 flex-col gap-4">
        <HeroCard resumed={resumed} />

        <section className="rounded-card border border-border bg-surface p-5">
          <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-fg">{t("progressTitle")}</h2>
            <Selector
              label={t("rangeLabel")}
              isLabelHidden
              variant="secondary"
              size="sm"
              value={range}
              onChange={(value) => setRange(value as RangeValue)}
              options={[
                { value: RANGE_VALUES.LAST_30, label: t("rangeLast30Days") },
                { value: RANGE_VALUES.LAST_7, label: t("rangeLast7Days") },
                { value: RANGE_VALUES.ALL, label: t("rangeAllTime") },
              ]}
            />
          </header>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LEARNING_STATS.map((stat, index) => (
              <div
                key={stat.key}
                className={cn("flex items-center gap-3", index > 0 && "lg:border-l lg:border-border lg:pl-4")}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-control bg-info-subtle text-fg-brand">
                  <Icon icon={STAT_ICONS[stat.key]} size="md" />
                </span>
                <div className="min-w-0">
                  <dd className="text-xl font-semibold text-fg">
                    {stat.value}
                    {stat.key === "learningTime" ? (
                      <span className="ml-1 text-sm font-normal text-fg-muted">{tUnits("hoursShort")}</span>
                    ) : null}
                  </dd>
                  <dt className="text-xs text-fg-muted">{t(`stats.${stat.key}`)}</dt>
                </div>
              </div>
            ))}
          </dl>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader
            title={t("continueTitle")}
            actionLabel={t("continueViewAll")}
            href={LEARNING_ROUTES.learn}
          />
          <div className="flex flex-col gap-3">
            {CONTINUE_LEARNING.map((course) => (
              <ContinueRow key={course.slug} course={course} />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <SectionHeader
            title={t("recommendedTitle")}
            actionLabel={t("recommendedViewAll")}
            href={LEARNING_ROUTES.catalog}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {recommended.map((course) => (
              <RecommendedCard
                key={course.slug}
                slug={course.slug}
                title={course.title}
                description={course.description}
                language={course.language}
                art={course.art}
                lessonCount={course.lessonCount}
                durationMinutes={course.durationMinutes}
              />
            ))}
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-4">
        <AchievementsCard achievements={ACHIEVEMENTS} />
        <WeeklyProgressCard />
      </div>
    </div>
  );
}

/**
 * The resume card used to be absolutely positioned, which let it sit on top of the intro text at
 * some widths. It is a grid column now: two things that must not overlap should not be told to
 * overlap and then kept apart with padding.
 */
function HeroCard({ resumed }: { resumed: CourseInProgress | undefined }) {
  const t = useTranslations("learning.dashboard");
  return (
    <section className="overflow-hidden rounded-card bg-info-subtle p-6 md:p-8">
      <div className="grid items-end gap-6 lg:grid-cols-[1fr_19rem]">
        <div className="max-w-xl min-w-0">
          <p className="text-xs font-semibold tracking-wide text-fg-brand uppercase">{t("eyebrow")}</p>
          <h1 className="mt-2 text-3xl font-semibold text-fg">
            {t("greeting", { name: SAMPLE_LEARNER.name })}
          </h1>
          <p className="mt-2 text-sm text-fg-muted">{t("intro")}</p>
          <Button
            variant="primary"
            className="mt-5"
            endContent={<Icon icon={ArrowRight} size="sm" />}
            href={LEARNING_ROUTES.learnCourse(CONTINUE_LEARNING[0]?.slug ?? "")}
            label={t("continueCta")}
          />
        </div>

        {resumed ? (
          <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-3 shadow-raised">
            <span className="grid size-9 shrink-0 place-items-center rounded-control bg-info-subtle text-fg-brand">
              <Icon icon={BookOpen} size="md" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-fg">{resumed.title}</p>
              <p className="truncate text-xs text-fg-muted">
                {t("resumeLabel")}
                {" · "}
                {t("resumeLesson", { number: resumed.currentLessonNumber })}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <ProgressBar isLabelHidden value={resumed.percentComplete} label={resumed.title} />
                <span className="text-xs text-fg-muted">{resumed.percentComplete}%</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SectionHeader({ title, actionLabel, href }: { title: string; actionLabel: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold text-fg">{title}</h2>
      <Link href={href} className="flex items-center gap-1 text-sm text-fg-muted hover:text-fg">
        {actionLabel}
        <Icon icon={ChevronRight} size="sm" />
      </Link>
    </div>
  );
}

function ContinueRow({ course }: { course: CourseInProgress }) {
  const t = useTranslations("learning.dashboard");
  return (
    <article className="flex flex-wrap items-center gap-4 rounded-card border border-border bg-surface p-3">
      <div className="relative">
        <CourseArtwork art={course.art} title={course.title} className="size-16 rounded-control" />
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-7 place-items-center rounded-control bg-surface/90 text-fg">
            <Icon icon={Play} size="sm" />
          </span>
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-fg">{course.title}</h3>
        <p className="truncate text-xs text-fg-muted">
          {t("lessonLine", { number: course.currentLessonNumber, title: course.currentLessonTitle })}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <ProgressBar isLabelHidden value={course.percentComplete} label={course.title} />
          <span className="shrink-0 text-xs text-fg-muted">{course.percentComplete}%</span>
        </div>
      </div>
      <Button
        variant="secondary"
        size="sm"
        endContent={<Icon icon={ChevronRight} size="sm" />}
        href={LEARNING_ROUTES.learnCourse(course.slug)}
        label={t("continueAction")}
      />
    </article>
  );
}

function RecommendedCard({
  slug,
  title,
  description,
  language,
  art,
  lessonCount,
  durationMinutes,
}: {
  slug: string;
  title: string;
  description: string;
  language: CourseLanguage;
  art: (typeof COURSE_ART)[keyof typeof COURSE_ART];
  lessonCount: number;
  durationMinutes: number;
}) {
  const tLanguages = useTranslations("learning.languages");
  const tUnits = useTranslations("learning.units");
  const durationLabel = useDurationLabel();
  return (
    <article className="flex gap-3 rounded-card border border-border bg-surface p-3">
      <CourseArtwork art={art} title={title} className="size-24 shrink-0 rounded-control" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Badge variant={LANGUAGE_TONES[language]} className="self-start" label={tLanguages(language)} />
        <h3 className="text-sm font-semibold text-fg">{title}</h3>
        <p className="line-clamp-2 text-xs text-fg-muted">{description}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="flex items-center gap-3 text-xs text-fg-subtle">
            <span className="flex items-center gap-1">
              <Icon icon={Layers} size="sm" />
              {tUnits("lessonCount", { count: lessonCount })}
            </span>
            <span className="flex items-center gap-1">
              <Icon icon={Clock} size="sm" />
              {durationLabel(durationMinutes)}
            </span>
          </span>
          <Button
            variant="primary"
            size="sm"
            isIconOnly
            href={LEARNING_ROUTES.learnCourse(slug)}
            label={title}
            icon={<Icon icon={Play} size="sm" />}
          />
        </div>
      </div>
    </article>
  );
}

function AchievementsCard({ achievements }: { achievements: readonly Achievement[] }) {
  const t = useTranslations("learning.dashboard");
  return (
    <section className="rounded-card border border-border bg-surface p-5">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-fg">{t("achievementsTitle")}</h2>
        <Link
          href={LEARNING_ROUTES.learn}
          className="flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
        >
          {t("achievementsViewAll")}
          <Icon icon={ChevronRight} size="sm" />
        </Link>
      </header>
      <ul className="grid grid-cols-3 gap-3">
        {achievements.map((achievement) => (
          <li
            key={achievement.key}
            className="flex flex-col items-center gap-2 rounded-card border border-border p-3 text-center"
          >
            <span className="grid size-10 place-items-center rounded-control bg-warning-subtle text-warning">
              <Icon icon={ACHIEVEMENT_ICONS[achievement.icon]} size="md" />
            </span>
            <span className="text-xs font-medium text-fg">{t(`achievements.${achievement.key}`)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function WeeklyProgressCard() {
  const t = useTranslations("learning.dashboard");
  const format = useFormatter();
  const dateRange = {
    from: format.dateTime(new Date(WEEKLY_PROGRESS.fromDate), { day: "numeric", month: "short" }),
    to: format.dateTime(new Date(WEEKLY_PROGRESS.toDate), { day: "numeric", month: "short" }),
  };

  return (
    <section className="rounded-card border border-border bg-surface p-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-fg">{t("weeklyTitle")}</h2>
        <span className="text-xs text-fg-subtle">{t("weeklyRange", dateRange)}</span>
      </header>
      <div className="flex items-center gap-5">
        <ProgressRing value={WEEKLY_PROGRESS.percent} label={t("weeklyTitle")} className="size-28 shrink-0">
          <span className="flex flex-col">
            <span className="text-lg font-semibold text-fg">{WEEKLY_PROGRESS.percent}%</span>
            <span className="text-[0.625rem] text-fg-subtle">
              {t("weeklyGoalsMet", { done: WEEKLY_PROGRESS.goalsDone, total: WEEKLY_PROGRESS.goalsTotal })}
            </span>
          </span>
        </ProgressRing>
        <ul className="flex min-w-0 flex-1 flex-col gap-2">
          {WEEKLY_PROGRESS.goals.map((goal) => (
            <li key={goal.key} className="flex items-start gap-2 text-sm">
              <span
                className={cn(
                  "mt-0.5 grid size-4 shrink-0 place-items-center rounded-control border",
                  goal.isDone ? "border-brand bg-brand text-on-brand" : "border-border-strong",
                )}
              >
                {goal.isDone ? <Icon icon={Check} size="xsm" /> : null}
              </span>
              <span className={cn(goal.isDone ? "text-fg" : "text-fg-muted")}>{t(`goals.${goal.key}`)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
