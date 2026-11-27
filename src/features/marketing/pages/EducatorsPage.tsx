import Image from "next/image";
import { ArrowRight, BarChart3, ClipboardCheck, PenLine, Rocket, Timer, Users } from "@/ui/icons/lucide";
import { useTranslations } from "next-intl";
import { EDUCATOR_PROOF, EDUCATOR_STEPS } from "@/entities/marketing/marketing.fixtures";
import type { EducatorStep } from "@/entities/marketing/marketing.types";
import { LEARNING_ROUTES } from "@/shared/constants/routes/learning.routes";
import { STUDIO_ROUTES } from "@/shared/constants/routes/studio.routes";
import { Button } from "@astryxdesign/core/Button";
import { CallToAction } from "@/ui/layout/CallToAction";
import { Card } from "@/ui/card/Card";
import { Icon } from "@astryxdesign/core/Icon";
import { IconTile } from "@/ui/primitives/IconTile";
import { TintCard, type TintCardPropsDefaults } from "@/ui/card/TintCard";
import { PageHero } from "@/ui/layout/PageHero";
import { Section } from "@/ui/layout/Section";

const PROOF_ICONS = { setup: Timer, reach: Users, insight: BarChart3 } as const;
const STEP_ICONS = {
  design: PenLine,
  publish: ClipboardCheck,
  teach: Rocket,
  measure: BarChart3,
} as const;

const SAMPLE_COURSE_SLUG = "english-everyday-communication";

/** Half the hero column on desktop, full width on a phone. */
const ASIDE_IMAGE_SIZES = "(min-width: 1024px) 30rem, 100vw";

const ARROW_CLASSES = "transition-transform duration-normal ease-emphasized group-hover:translate-x-0.5";

/** Hero (tint) → steps (canvas) → closing band (brand). */
export function EducatorsPage() {
  const t = useTranslations("marketing.educators");

  return (
    <main>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("subtitle")}
        actions={
          <>
            <Button
              variant="primary"
              size="lg"
              className="group"
              endContent={<Icon icon={ArrowRight} size="sm" className={ARROW_CLASSES} />}
              href={STUDIO_ROUTES.studio}
              label={t("ctaPrimary")}
            />
            <Button
              size="lg"
              variant="secondary"
              href={LEARNING_ROUTES.catalogCourse(SAMPLE_COURSE_SLUG)}
              label={t("ctaSecondary")}
            />
          </>
        }
        aside={<ProofPanel />}
      />

      <Section title={t("stepsTitle")} description={t("stepsSubtitle")}>
        <ol className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {EDUCATOR_STEPS.map((step, index) => (
            <Step key={step.key} step={step} number={index + 1} />
          ))}
        </ol>
      </Section>

      <CallToAction
        title={t("closingTitle")}
        description={t("closingBody")}
        actions={
          <Button
            size="lg"
            variant="secondary"
            className="group border-transparent"
            endContent={<Icon icon={ArrowRight} size="sm" className={ARROW_CLASSES} />}
            href={STUDIO_ROUTES.studioNewCourse}
            label={t("closingCta")}
          />
        }
      />
    </main>
  );
}

/** A still from Studio over the three figures an educator asks about first. */
function ProofPanel() {
  const t = useTranslations("marketing.educators");
  return (
    <Card size="none" className="overflow-hidden shadow-raised">
      <div className="relative aspect-video border-b border-border">
        <Image
          src="/images/hero-lesson.jpg"
          alt={t("proofTitle")}
          fill
          sizes={ASIDE_IMAGE_SIZES}
          className="object-cover"
          loading="eager"
        />
      </div>
      <dl className="divide-y divide-border">
        {EDUCATOR_PROOF.map((proof) => (
          <div key={proof.key} className="flex items-center gap-4 px-5 py-4">
            <IconTile icon={PROOF_ICONS[proof.key]} />
            <dt className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-fg">{t(`proof.${proof.key}Title`)}</span>
              <span className="block text-xs text-fg-subtle">{t(`proof.${proof.key}Body`)}</span>
            </dt>
            <dd className="shrink-0 text-xl font-bold tracking-tight text-fg-brand">{proof.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

const STEP_VARIANTS: readonly TintCardPropsDefaults["variant"][] = ["amber", "mint", "rose", "sky"];

/** Steps are numbered because the order is the point: each one gates the next. */
function Step({ step, number }: { step: EducatorStep; number: number }) {
  const t = useTranslations("marketing.educators.steps");
  return (
    <li className="reveal">
      <TintCard
        variant={STEP_VARIANTS[(number - 1) % STEP_VARIANTS.length]}
        media={
          <div className="flex items-center justify-between p-6 pb-0 md:p-7 md:pb-0">
            <span className="grid size-11 place-items-center rounded-control bg-surface text-fg">
              <Icon icon={STEP_ICONS[step.key]} size="md" />
            </span>
            <span className="text-4xl font-bold tabular-nums opacity-40">{number}</span>
          </div>
        }
        title={t(`${step.key}Title`)}
        body={t(`${step.key}Body`)}
      />
    </li>
  );
}
