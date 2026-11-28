"use client";

import { LEARNING_ROUTES } from "@/shared/constants/routes/learning.routes";

import { BookOpen, Clock, Flame } from "@/ui/icons/lucide";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { CATALOG_COURSES } from "@/entities/learning/course.fixtures";
import { COURSE_PROGRESS, PROGRESS_SUMMARY } from "@/entities/learning/progress.fixtures";
import type { CourseProgressRow } from "@/entities/learning/progress.types";
import { Badge } from "@astryxdesign/core/Badge";
import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Grid } from "@astryxdesign/core/Grid";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { List, ListItem } from "@astryxdesign/core/List";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { Section } from "@astryxdesign/core/Section";
import { Heading, Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { AsOfBadge } from "../shell/AsOfBadge";
import { PageHeading } from "../shell/PageHeading";
import { CourseArtwork } from "../shared/CourseArtwork";
import { useDurationLabel } from "@/features/learning/hooks/useDurationLabel";

const COURSE_LIST_EDGE = "flush" as const;
const COURSE_LIST_DENSITY = "balanced" as const;
const COURSE_ARTWORK_SIZES = "44px";

/** M4 — progress and grades. The summary is a projection; the grade is not. */
export function LearnerProgressPage() {
  const t = useTranslations("learning.progressPage");
  const durationLabel = useDurationLabel();
  const summary = PROGRESS_SUMMARY;
  const courses = COURSE_PROGRESS;
  const overallPercent = summary.lessonsTotal
    ? Math.round((summary.lessonsCompleted / summary.lessonsTotal) * 100)
    : 0;
  const summaryStats: readonly { icon: LucideIcon; label: string; value: string }[] = [
    { icon: BookOpen, label: t("coursesEnrolled"), value: String(summary.coursesEnrolled) },
    { icon: Clock, label: t("studyTime"), value: durationLabel(summary.studyMinutes) },
    { icon: Flame, label: t("streak"), value: t("streakValue", { count: summary.currentStreakDays }) },
  ];

  return (
    <VStack gap={8}>
      <PageHeading
        title={t("title")}
        description={t("description")}
        actions={<AsOfBadge asOf={summary.asOf} />}
      />

      <Card padding={5} className="rounded-card">
        <Grid columns={{ minWidth: 280, max: 2, repeat: "fit" }} gap={6} align="center">
          <VStack gap={3} className="min-w-0">
            <Text type="supporting" color="secondary">
              {t("overallTitle")}
            </Text>
            <HStack gap={3} wrap="wrap" vAlign="center">
              <Heading level={2} type="display-2" weight="bold">
                {overallPercent}%
              </Heading>
              <Text type="body" color="secondary">
                {t("lessonsOf", { done: summary.lessonsCompleted, total: summary.lessonsTotal })}{" "}
                {t("lessonsCompleted")}
              </Text>
            </HStack>
            <ProgressBar value={overallPercent} label={t("overallTitle")} isLabelHidden />
          </VStack>

          <VStack as="ul" gap={0}>
            {summaryStats.map((stat) => (
              <ProgressStat key={stat.label} {...stat} />
            ))}
          </VStack>
        </Grid>
      </Card>

      <Section variant="transparent" padding={0}>
        {courses.length === 0 ? (
          <EmptyState
            icon={<Icon icon={BookOpen} size="lg" />}
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        ) : (
          <List
            header={
              <HStack gap={3} wrap="wrap" vAlign="center" hAlign="between">
                <Heading level={2}>{t("coursesTitle")}</Heading>
                <Text type="supporting" color="secondary">
                  {t("coursesCount", { count: courses.length })}
                </Text>
              </HStack>
            }
            hasDividers
            edge={COURSE_LIST_EDGE}
            density={COURSE_LIST_DENSITY}
          >
            {courses.map((course) => (
              <CourseProgressItem key={course.slug} course={course} />
            ))}
          </List>
        )}
        <Text as="p" type="supporting" color="secondary" className="mt-4">
          {t("gradeNote")}
        </Text>
      </Section>
    </VStack>
  );
}

function ProgressStat({ icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <HStack
      as="li"
      gap={3}
      vAlign="center"
      className="border-t border-border py-3 first:border-t-0 first:pt-0"
    >
      <Icon icon={icon} size="sm" className="shrink-0 text-fg-subtle" />
      <Text type="supporting" color="secondary" className="min-w-0 flex-1">
        {label}
      </Text>
      <Text as="span" type="body" weight="semibold" hasTabularNumbers>
        {value}
      </Text>
    </HStack>
  );
}

function CourseProgressItem({ course }: { course: CourseProgressRow }) {
  const t = useTranslations("learning.progressPage");
  const courseArt = CATALOG_COURSES.find((catalogCourse) => catalogCourse.slug === course.slug)?.art;

  return (
    <ListItem
      href={LEARNING_ROUTES.learnCourse(course.slug)}
      align="start"
      startContent={
        courseArt ? (
          <CourseArtwork
            art={courseArt}
            title=""
            sizes={COURSE_ARTWORK_SIZES}
            className="size-11 shrink-0 rounded-control"
          />
        ) : (
          <Icon icon={BookOpen} size="md" className="text-fg-subtle" />
        )
      }
      label={<Text weight="semibold">{course.title}</Text>}
      description={
        <VStack gap={2} className="mt-1 min-w-0">
          <HStack gap={3} vAlign="center" hAlign="between">
            <Text type="supporting" color="secondary">
              {t("lessonsOf", { done: course.lessonsCompleted, total: course.lessonsTotal })}
            </Text>
            <Text type="supporting" color="secondary" weight="semibold" hasTabularNumbers>
              {course.percentComplete}%
            </Text>
          </HStack>
          <ProgressBar isLabelHidden value={course.percentComplete} label={course.title} />
        </VStack>
      }
      endContent={
        <VStack gap={1} hAlign="end" className="min-w-24">
          <Text type="supporting" color="secondary">
            {t("gradeLabel")}
          </Text>
          {course.grade === undefined ? (
            <Badge variant="neutral" label={t("gradeNone")} />
          ) : (
            <Text type="large" weight="semibold" hasTabularNumbers>
              {course.grade}
            </Text>
          )}
        </VStack>
      }
    />
  );
}
