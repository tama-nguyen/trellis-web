"use client";

import { useDateLabel } from "@/features/learning/hooks/useDateLabel";
import {
  ArrowRight,
  Award,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Download,
  Layers3,
  LockKeyhole,
  MonitorSmartphone,
  PlayCircle,
  Signal,
  Star,
  Users,
} from "@/ui/icons/lucide";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";

import type { CourseEdition } from "@/entities/learning/course.types";
import { ENROLMENT_STATES, type EnrolmentPolicy } from "@/entities/learning/learning.constants";
import type { CourseLandingDetail } from "@/entities/marketing/courseDetail.types";
import { BESTSELLER_TONE } from "@/features/marketing/shared/marketing.tones";
import { Link } from "@/i18n/navigation";
import { MARKETING_ROUTES } from "@/shared/constants/routes/marketing.routes";
import { LEARNING_ROUTES } from "@/shared/constants/routes/learning.routes";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Collapsible, CollapsibleGroup } from "@astryxdesign/core/Collapsible";
import { Divider } from "@astryxdesign/core/Divider";
import { Grid } from "@astryxdesign/core/Grid";
import { HStack } from "@astryxdesign/core/HStack";
import { Layout, LayoutContent } from "@astryxdesign/core/Layout";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { Section as AstryxSection } from "@astryxdesign/core/Section";
import { Heading, Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { Container } from "@/ui/layout/Container";
import { Icon } from "@astryxdesign/core/Icon";
import { EnrolDialog } from "./EnrolDialog";
import { CourseThumbnail } from "../shared/CourseThumbnail";
import { editionTone, ENROLLED_TONE, LANGUAGE_TONES } from "../shared/learning.tones";
import { MONTH_YEAR } from "@/features/learning/shared/learning.format";
import { useDurationLabel } from "@/features/learning/hooks/useDurationLabel";

/** The preview follows the two-thirds course column on desktop. */
const PREVIEW_SIZES = "(min-width: 1024px) 50vw, 100vw";

const SECTION_IDS = {
  overview: "overview",
  editions: "editions",
  curriculum: "curriculum",
  instructor: "instructor",
  faq: "faq",
} as const;

/** Keep the course badges distinct from the neutral hero surface. */
const HERO_BADGE_CLASSES = "bg-surface";

const FAQ_KEYS = ["faqCertificate", "faqAccess", "faqLevel"] as const;
const STARS = [1, 2, 3, 4, 5];

const ARROW_CLASSES = "transition-transform duration-normal ease-emphasized group-hover:translate-x-0.5";

/**
 * Public course page: two-thirds for the course and its content, one-third for a sticky facts and
 * editions panel. Each enrolment action remains attached to the specific edition it opens.
 *
 * - Displays only public course metadata and lesson titles (D-12).
 * - Enrolment is tied to a specific immutable course edition (D-05).
 */
export function CourseLandingPage({ course }: { course: CourseLandingDetail }) {
  const t = useTranslations("learning.landing");
  const tCard = useTranslations("marketing.card");
  const tNav = useTranslations("home.nav");
  const tLanguages = useTranslations("learning.languages");
  const tLevels = useTranslations("learning.levels");
  const tUnits = useTranslations("learning.units");
  const dateLabel = useDateLabel();
  const durationLabel = useDurationLabel();

  const [enrolment, setEnrolment] = useState(course.enrolment);
  const [editionInDialog, setEditionInDialog] = useState<CourseEdition | null>(null);
  const isEnrolled = enrolment === ENROLMENT_STATES.ENROLLED;
  const moduleCount = course.modules.length;

  const courseFacts: readonly { icon: LucideIcon; label: string; value: ReactNode }[] = [
    { icon: Signal, label: t("metadataLevel"), value: tLevels(course.level) },
    { icon: CalendarDays, label: t("metadataWeeks"), value: tCard("weeksCount", { count: course.weeks }) },
    {
      icon: Layers3,
      label: t("metadataLessons"),
      value: tUnits("lessonCount", { count: course.lessonCount }),
    },
    { icon: Clock3, label: t("metadataDuration"), value: durationLabel(course.durationMinutes) },
    { icon: Download, label: t("metadataResources"), value: course.resourceCount },
  ];

  const continueAction = isEnrolled ? (
    <Button
      variant="primary"
      size="md"
      className="group w-full sm:w-auto"
      endContent={<Icon icon={ArrowRight} size="sm" className={ARROW_CLASSES} />}
      href={LEARNING_ROUTES.learnCourse(course.slug)}
      label={t("continueCourse")}
    />
  ) : null;

  return (
    <Layout height="auto" contentWidth={1280}>
      <LayoutContent role="main" padding={0} isScrollable={false}>
        <Container className="grid grid-cols-1 items-start gap-x-8 gap-y-3 py-8 md:gap-x-10 md:gap-y-4 md:py-10 xl:max-w-9/12 xl:grid-cols-3 xl:gap-x-10 xl:gap-y-4 xl:py-12">
          <section
            aria-labelledby="course-title"
            className="min-w-0 border-b border-border bg-canvas pb-2 xl:col-span-2 xl:col-start-1 xl:row-start-1"
          >
            <VStack gap={0} className="min-w-0">
              <HStack
                as="nav"
                aria-label={t("breadcrumbLabel")}
                gap={1.5}
                vAlign="center"
                className="animate-rise text-sm"
              >
                <Link
                  href={MARKETING_ROUTES.courses}
                  className="font-semibold text-fg-brand hover:text-brand-hover"
                >
                  {tNav("courses")}
                </Link>
                <Icon icon={ChevronRight} size="sm" className="text-fg-subtle" />
                <Text type="supporting">{tLanguages(course.language)}</Text>
              </HStack>

              <HStack gap={2} wrap="wrap" vAlign="center" className="mt-4 animate-rise stagger-1">
                <Badge
                  variant={LANGUAGE_TONES[course.language]}
                  className={HERO_BADGE_CLASSES}
                  label={tLanguages(course.language)}
                />
                {course.isBestseller ? (
                  <Badge
                    variant={BESTSELLER_TONE}
                    className={HERO_BADGE_CLASSES}
                    label={tCard("bestseller")}
                  />
                ) : null}
              </HStack>

              <Heading
                level={1}
                type="display-2"
                id="course-title"
                weight="bold"
                textWrap="balance"
                className="mt-4 max-w-3xl animate-rise text-fg stagger-1"
              >
                {course.title}
              </Heading>
              <Text
                as="p"
                type="body"
                size="lg"
                color="secondary"
                className="mt-3 max-w-2xl animate-rise leading-relaxed stagger-2"
              >
                {course.summary}
              </Text>

              <HStack gap={5} wrap="wrap" vAlign="center" className="mt-5 animate-rise text-sm stagger-3">
                <span className="flex items-center gap-1.5 font-semibold text-warning">
                  {course.rating}
                  <span
                    aria-label={t("ratedLabel", { rating: course.rating })}
                    className="flex items-center gap-0.5"
                  >
                    {STARS.map((star) => (
                      <Icon
                        key={star}
                        icon={Star}
                        size="sm"
                        className={star <= Math.round(course.rating) ? "fill-current" : "text-fg-subtle"}
                      />
                    ))}
                  </span>
                  <span className="font-normal text-fg-muted">
                    {tCard("ratingCount", { count: course.ratingCount })}
                  </span>
                </span>
                <span className="flex items-center gap-1.5 text-fg-muted">
                  <Icon icon={Users} size="sm" />
                  {tCard("learnersCount", { count: course.learners })}
                </span>
                <span className="text-fg-muted">
                  {t("updated", { date: dateLabel(course.updatedAt, MONTH_YEAR) })}
                </span>
              </HStack>

              <Card padding={0} className="mt-6 w-full animate-rise overflow-hidden rounded-card stagger-3">
                <a href={`#${SECTION_IDS.curriculum}`} aria-label={t("previewLabel")} className="group block">
                  <CourseThumbnail
                    art={course.art}
                    title={course.title}
                    hook={course.thumbnailHook}
                    durationMinutes={course.durationMinutes}
                    playLabel={t("previewLabel")}
                    isPlayVisible
                    sizes={PREVIEW_SIZES}
                    className="rounded-none"
                  />
                </a>
              </Card>
            </VStack>
          </section>

          <aside className="min-w-0 self-start xl:col-start-3 xl:row-span-2 xl:row-start-1">
            <Card padding={5} className="rounded-card">
              <VStack gap={4}>
                <Heading level={2}>{t("quickFactsTitle")}</Heading>
                <dl className="divide-y divide-border">
                  {courseFacts.map(({ icon, label, value }) => (
                    <HStack as="div" key={label} gap={3} vAlign="center" hAlign="between" className="py-2.5">
                      <HStack as="dt" gap={2} vAlign="center" className="min-w-0">
                        <Icon icon={icon} size="sm" className="shrink-0 text-fg-subtle" />
                        <Text type="supporting" color="secondary">
                          {label}
                        </Text>
                      </HStack>
                      <dd className="shrink-0 text-right">
                        <Text type="body" weight="semibold" hasTabularNumbers>
                          {value}
                        </Text>
                      </dd>
                    </HStack>
                  ))}
                </dl>
                <Divider />
                <VStack as="ul" gap={2}>
                  <HStack as="li" gap={2} vAlign="center">
                    <Icon icon={Award} size="sm" className="shrink-0 text-fg-subtle" />
                    <Text type="supporting" color="secondary">
                      {t("includesCertificate")}
                    </Text>
                  </HStack>
                  <HStack as="li" gap={2} vAlign="center">
                    <Icon icon={MonitorSmartphone} size="sm" className="shrink-0 text-fg-subtle" />
                    <Text type="supporting" color="secondary">
                      {t("includesAccess")}
                    </Text>
                  </HStack>
                </VStack>
                <Divider />
                <HStack gap={3} vAlign="center">
                  <Avatar name={course.instructor.name} size="sm" />
                  <VStack gap={0.5} className="min-w-0">
                    <Text type="body" weight="semibold" maxLines={1}>
                      {course.instructor.name}
                    </Text>
                    <Text type="supporting" color="secondary" maxLines={1}>
                      {course.instructor.role}
                    </Text>
                  </VStack>
                </HStack>
                <Divider />
                <VStack as="section" id={SECTION_IDS.editions} aria-labelledby="editions-heading" gap={3}>
                  <Heading id="editions-heading" level={2}>
                    {t("editionsTitle")}
                  </Heading>
                  {course.editions.length === 0 ? (
                    <Text as="p" type="body" color="secondary">
                      {t("noOpenEditionDescription")}
                    </Text>
                  ) : null}
                  <VStack as="ul" gap={3}>
                    {course.editions.map((edition) => (
                      <EditionCard
                        key={edition.id}
                        edition={edition}
                        isEnrolled={isEnrolled}
                        onEnrol={() => setEditionInDialog(edition)}
                      />
                    ))}
                  </VStack>
                </VStack>
                {isEnrolled ? (
                  <>
                    <Badge
                      variant={ENROLLED_TONE}
                      icon={<Icon icon={Check} size="sm" />}
                      label={t("alreadyEnrolled")}
                    />
                    {continueAction}
                  </>
                ) : null}
              </VStack>
            </Card>
          </aside>

          <VStack
            gap={8}
            className="min-w-0 pt-3 pb-8 md:pt-4 md:pb-10 xl:col-span-2 xl:col-start-1 xl:row-start-2"
          >
            <AstryxSection
              variant="transparent"
              padding={5}
              id={SECTION_IDS.overview}
              aria-labelledby="outcomes-heading"
              className="scroll-mt-32 rounded-card border border-border"
            >
              <VStack gap={5}>
                <VStack gap={4}>
                  <Heading id="outcomes-heading" level={2}>
                    {t("outcomesTitle")}
                  </Heading>
                  <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                    {course.outcomes.map((outcome) => (
                      <li key={outcome} className="flex min-w-0 items-start gap-3 text-sm leading-relaxed">
                        <span className="mt-0.5 text-success">
                          <Icon icon={Check} size="md" />
                        </span>
                        <Text as="span" type="body" className="min-w-0 flex-1">
                          {outcome}
                        </Text>
                      </li>
                    ))}
                  </ul>
                </VStack>

                <Divider />

                <Grid columns={{ minWidth: 280, max: 2, repeat: "fit" }} gap={6}>
                  <InfoList title={t("requirementsTitle")} items={course.requirements} />
                  <InfoList title={t("audienceTitle")} items={course.audience} />
                </Grid>
              </VStack>
            </AstryxSection>

            <AstryxSection
              variant="transparent"
              padding={0}
              id={SECTION_IDS.curriculum}
              aria-labelledby="curriculum-heading"
              className="scroll-mt-32"
            >
              <VStack gap={3}>
                <Heading id="curriculum-heading" level={2}>
                  {t("outlineTitle")}
                </Heading>
                <Text as="p" type="body" color="secondary">
                  {t("outlineSummary", {
                    modules: moduleCount,
                    lessons: tUnits("lessonCount", { count: course.lessonCount }),
                    duration: durationLabel(course.durationMinutes),
                  })}
                </Text>
                <Text as="p" type="supporting">
                  {t("outlineNote")}
                </Text>

                <CollapsibleGroup
                  type="multiple"
                  defaultValue={course.modules[0] ? [course.modules[0].id] : []}
                  hasDividers
                  className="mt-4 border-y border-border"
                >
                  {course.modules.map((module, moduleIndex) => {
                    const hiddenLessons = module.lessonCount - module.lessons.length;
                    const minutesPerLesson = Math.round(module.minutes / module.lessonCount);
                    return (
                      <Collapsible
                        key={module.id}
                        value={module.id}
                        trigger={
                          <HStack gap={3} vAlign="center" className="w-full">
                            <Text
                              as="span"
                              type="supporting"
                              weight="bold"
                              className="w-7 shrink-0 text-fg-brand"
                            >
                              {moduleIndex + 1}
                            </Text>
                            <VStack gap={0.5} className="min-w-0 flex-1">
                              <Text as="span" type="large" weight="bold" maxLines={1}>
                                {module.title}
                              </Text>
                              <Text type="supporting" color="secondary">
                                {tUnits("lessonCount", { count: module.lessonCount })} •{" "}
                                {durationLabel(module.minutes)}
                              </Text>
                            </VStack>
                          </HStack>
                        }
                      >
                        <VStack
                          as="ol"
                          gap={0}
                          className="divide-y divide-border border-t border-border px-4 py-1"
                        >
                          {module.lessons.map((lesson, lessonIndex) => {
                            const isPreview = moduleIndex === 0 && lessonIndex === 0;
                            return (
                              <HStack as="li" key={lesson} gap={3} vAlign="center" className="py-2.5 text-sm">
                                <span className={isPreview ? "text-fg-brand" : "text-fg-subtle"}>
                                  <Icon
                                    icon={isPreview ? PlayCircle : LockKeyhole}
                                    size="sm"
                                    label={isPreview ? t("previewBadge") : t("lockedLabel")}
                                  />
                                </span>
                                <Text as="span" type="body" maxLines={1} className="min-w-0 flex-1">
                                  {lesson}
                                </Text>
                                {isPreview ? (
                                  <Badge variant={PREVIEW_TONE} label={t("previewBadge")} />
                                ) : null}
                                <Text
                                  as="span"
                                  type="supporting"
                                  color="secondary"
                                  className="shrink-0 tabular-nums"
                                >
                                  {tUnits("minutes", { count: minutesPerLesson })}
                                </Text>
                              </HStack>
                            );
                          })}
                          {hiddenLessons > 0 ? (
                            <li className="py-2">
                              <Text as="span" type="supporting">
                                {t("moreLessons", { count: hiddenLessons })}
                              </Text>
                            </li>
                          ) : null}
                        </VStack>
                      </Collapsible>
                    );
                  })}
                </CollapsibleGroup>
              </VStack>
            </AstryxSection>

            <Grid columns={{ minWidth: 320, max: 2, repeat: "fit" }} gap={8} align="start">
              <VStack
                as="section"
                id={SECTION_IDS.instructor}
                aria-labelledby="instructor-heading"
                gap={4}
                className="scroll-mt-32"
              >
                <Heading id="instructor-heading" level={2}>
                  {t("instructorTitle")}
                </Heading>
                <Card padding={5} className="rounded-card">
                  <VStack gap={4}>
                    <HStack gap={4} vAlign="start">
                      <Avatar name={course.instructor.name} size="lg" />
                      <VStack gap={1} className="min-w-0">
                        <Heading level={3}>{course.instructor.name}</Heading>
                        <Text type="body" color="accent">
                          {course.instructor.role}
                        </Text>
                        <HStack gap={4} wrap="wrap" vAlign="center">
                          <HStack gap={1} vAlign="center" className="text-warning">
                            <Icon icon={Star} size="sm" className="fill-current" />
                            <Text type="body" weight="semibold">
                              {course.instructor.rating}
                            </Text>
                          </HStack>
                          <Text type="supporting" color="secondary">
                            {t("instructorStats", {
                              courses: course.instructor.courseCount,
                              learners: course.instructor.learnerCount,
                            })}
                          </Text>
                        </HStack>
                      </VStack>
                    </HStack>
                    <Text as="p" type="body" color="secondary" className="leading-relaxed">
                      {course.instructor.bio}
                    </Text>
                  </VStack>
                </Card>
              </VStack>

              <AstryxSection
                variant="transparent"
                padding={0}
                id={SECTION_IDS.faq}
                aria-labelledby="faq-heading"
                className="scroll-mt-32"
              >
                <VStack gap={4}>
                  <Heading id="faq-heading" level={2}>
                    {t("faqTitle")}
                  </Heading>
                  <CollapsibleGroup type="multiple" hasDividers className="border-y border-border">
                    {FAQ_KEYS.map((key) => (
                      <Collapsible
                        key={key}
                        value={key}
                        trigger={
                          <Text as="span" type="large" weight="bold">
                            {t(`${key}Question`)}
                          </Text>
                        }
                      >
                        <Text as="p" type="body" color="secondary" className="leading-relaxed">
                          {t(`${key}Answer`)}
                        </Text>
                      </Collapsible>
                    ))}
                  </CollapsibleGroup>
                </VStack>
              </AstryxSection>
            </Grid>
          </VStack>
        </Container>

        <EnrolDialog
          courseTitle={course.title}
          edition={editionInDialog}
          onOpenChange={(open) => {
            if (!open) setEditionInDialog(null);
          }}
          onEnrolled={() => setEnrolment(ENROLMENT_STATES.ENROLLED)}
          courseSlug={course.slug}
          isAlreadyEnrolled={isEnrolled}
        />
      </LayoutContent>
    </Layout>
  );
}

const PREVIEW_TONE = "info" as const;

/** A plain list under a heading, for requirements and audience. */
function InfoList({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <VStack gap={3}>
      <Heading level={3}>{title}</Heading>
      <VStack as="ul" gap={2}>
        {items.map((item) => (
          <HStack as="li" key={item} gap={3} vAlign="start" className="min-w-0">
            <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-fg-subtle" />
            <Text type="body" color="secondary" className="min-w-0 flex-1">
              {item}
            </Text>
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
}

function EditionCard({
  edition,
  isEnrolled,
  onEnrol,
}: {
  edition: CourseEdition;
  isEnrolled: boolean;
  onEnrol: () => void;
}) {
  const t = useTranslations("learning.landing");
  const tPolicies = useTranslations("learning.enrolmentPolicies");
  const percent = Math.round((edition.seatsTaken / edition.seatsTotal) * 100);

  return (
    <VStack as="li" gap={3} className="border-t border-border pt-3 first:border-t-0 first:pt-0">
      <HStack gap={2} vAlign="center" hAlign="between" wrap="wrap">
        <VStack gap={1} className="min-w-0">
          <Heading level={3}>{edition.label}</Heading>
          <Text type="supporting" color="secondary">
            {t("editionVersion", { version: edition.version })}
          </Text>
        </VStack>
        <Badge
          variant={editionTone(edition.isOpen)}
          label={edition.isOpen ? tPolicies(policyKey(edition.policy)) : t("editionClosed")}
        />
      </HStack>

      <HStack gap={1.5} vAlign="center">
        <Icon icon={Users} size="sm" className="text-fg-subtle" />
        <Text type="supporting" color="secondary">
          {t("editionSeats", { taken: edition.seatsTaken, total: edition.seatsTotal })}
        </Text>
      </HStack>
      <ProgressBar
        value={percent}
        label={t("editionSeats", { taken: edition.seatsTaken, total: edition.seatsTotal })}
        isLabelHidden
      />

      {edition.isOpen ? (
        <Button
          variant="primary"
          className="w-full"
          isDisabled={isEnrolled}
          onClick={onEnrol}
          label={t("enrol")}
        />
      ) : null}
    </VStack>
  );
}

function policyKey(policy: EnrolmentPolicy): "free" | "invite" | "paid" {
  return policy;
}
