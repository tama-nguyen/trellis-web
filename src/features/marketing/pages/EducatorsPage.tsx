import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  MessageSquare,
  PenLine,
  Rocket,
  Sparkles,
  Target,
  Timer,
  Trophy,
  Users,
} from "@/ui/icons/lucide";
import { useTranslations } from "next-intl";
import { EDUCATOR_PROOF, EDUCATOR_STEPS } from "@/entities/marketing/marketing.fixtures";
import type { EducatorStep } from "@/entities/marketing/marketing.types";
import { ROUTES } from "@/shared/constants/routes";
import { Button } from "@astryxdesign/core/Button";
import { CallToAction } from "@/ui/layout/CallToAction";
import { Card } from "@/ui/card/Card";
import { Icon } from "@astryxdesign/core/Icon";
import { IconTile } from "@/ui/primitives/IconTile";
import { TintCard, type TintCardPropsDefaults } from "@/ui/card/TintCard";
import { PageHero } from "@/ui/layout/PageHero";
import { Section } from "@/ui/layout/Section";
import { cn } from "@/ui/lib/cn";

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

const EDUCATOR_HERO_STICKERS = [
  {
    icon: BookOpen,
    tile: "bg-tint-amber",
    position: "top-4 left-4 rounded-dialog",
    motion: "animate-drift-right-down",
    delay: "stagger-1",
  },
  {
    icon: Sparkles,
    tile: "bg-tint-mint",
    position: "top-4 right-4 rounded-full",
    motion: "animate-drift-left-down",
    delay: "stagger-3",
  },
  {
    icon: GraduationCap,
    tile: "bg-tint-rose",
    position: "bottom-4 left-4 rounded-full",
    motion: "animate-drift-right-up",
    delay: "stagger-5",
  },
] as const;

const EDUCATOR_OUTER_STICKERS = [
  {
    icon: Target,
    tile: "bg-info-subtle",
    position: "-left-10 top-12 rounded-full",
    motion: "animate-drift-right-down",
    delay: "stagger-2",
  },
  {
    icon: MessageSquare,
    tile: "bg-surface",
    position: "-right-10 top-20 rounded-dialog",
    motion: "animate-drift-left-down",
    delay: "stagger-4",
  },
  {
    icon: Trophy,
    tile: "bg-tint-amber",
    position: "-left-10 bottom-20 rounded-dialog",
    motion: "animate-drift-right-up",
    delay: "stagger-6",
  },
  {
    icon: BarChart3,
    tile: "bg-tint-rose",
    position: "-right-10 bottom-12 rounded-full",
    motion: "animate-drift-left-up",
    delay: "stagger-8",
  },
] as const;

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
              href={ROUTES.studio}
              label={t("ctaPrimary")}
            />
            <Button
              size="lg"
              variant="secondary"
              href={ROUTES.catalogCourse(SAMPLE_COURSE_SLUG)}
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
            href={ROUTES.studioNewCourse}
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
    <figure className="relative isolate mx-auto w-full">
      <Card size="none" className="overflow-hidden shadow-raised">
        <div className="relative isolate aspect-video overflow-hidden border-b border-border">
          <Image
            src="/images/home-features/educator-hero.jpg"
            alt=""
            fill
            sizes={ASIDE_IMAGE_SIZES}
            className="object-cover"
            loading="eager"
          />
          <ul aria-hidden className="pointer-events-none absolute inset-0 z-dropdown">
            {EDUCATOR_HERO_STICKERS.map(({ icon, tile, position, motion, delay }) => (
              <li
                key={position}
                className={cn(
                  "absolute grid size-12 place-items-center border border-border text-fg-brand",
                  tile,
                  position,
                  motion,
                  delay,
                )}
              >
                <Icon icon={icon} size="md" />
              </li>
            ))}
          </ul>
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
      <ul aria-hidden className="pointer-events-none absolute inset-0 z-dropdown hidden xl:block">
        {EDUCATOR_OUTER_STICKERS.map(({ icon, tile, position, motion, delay }) => (
          <li
            key={position}
            className={cn(
              "absolute grid size-10 place-items-center border border-border text-fg-brand",
              tile,
              position,
              motion,
              delay,
            )}
          >
            <Icon icon={icon} size="sm" />
          </li>
        ))}
      </ul>
    </figure>
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
