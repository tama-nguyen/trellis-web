import { ArrowRight, Check, ChevronDown } from "@/ui/icons/lucide";
import { useTranslations } from "next-intl";
import { PRICING_PLANS } from "@/entities/marketing/marketing.fixtures";
import type { PricingPlan } from "@/entities/marketing/marketing.types";
import { AUTH_ROUTES } from "@/shared/constants/routes/auth.routes";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { CallToAction } from "@/ui/layout/CallToAction";
import { Card } from "@/ui/card/Card";
import { cn } from "@/ui/lib/cn";
import { Icon } from "@astryxdesign/core/Icon";
import { PageHero } from "@/ui/layout/PageHero";
import { Section } from "@/ui/layout/Section";
import { PLAN_FEATURED_TONE } from "../shared/marketing.tones";

const FAQ_KEYS = ["billing", "trial", "team"] as const;

/** Hero (tint) → plans (canvas) → questions (surface) → closing band (brand). */
export function PricingPage() {
  const t = useTranslations("marketing.pricing");
  const tClosing = useTranslations("home.closing");

  return (
    <main>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("subtitle")} />

      <Section>
        <ul className="grid items-stretch gap-6 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <li key={plan.key} className="reveal">
              <PlanCard plan={plan} />
            </li>
          ))}
        </ul>
      </Section>

      <Section variant="surface" title={t("faqTitle")}>
        <div className="flex max-w-3xl flex-col divide-y divide-border border-y border-border">
          {FAQ_KEYS.map((key) => (
            <details key={key} className="group reveal">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-base font-semibold text-fg transition-colors duration-fast ease-standard hover:text-fg-brand [&::-webkit-details-marker]:hidden">
                {t(`faq.${key}Question`)}
                <Icon
                  icon={ChevronDown}
                  size="md"
                  className="text-fg-subtle transition-transform duration-normal ease-emphasized group-open:rotate-180"
                />
              </summary>
              <p className="animate-slide-in pb-5 text-sm leading-relaxed text-fg-muted">
                {t(`faq.${key}Answer`)}
              </p>
            </details>
          ))}
        </div>
      </Section>

      <CallToAction
        title={tClosing("title")}
        actions={
          <Button
            size="lg"
            variant="secondary"
            className="group border-transparent"
            endContent={
              <Icon
                icon={ArrowRight}
                size="sm"
                className="transition-transform duration-normal ease-emphasized group-hover:translate-x-0.5"
              />
            }
            href={AUTH_ROUTES.login}
            label={tClosing("cta")}
          />
        }
      />
    </main>
  );
}

/**
 * The featured plan is marked by a brand border, a badge and a primary button rather than by being
 * taller, so the three cards still line up and compare row by row.
 */
function PlanCard({ plan }: { plan: PricingPlan }) {
  const t = useTranslations("marketing.pricing");

  return (
    <Card
      as="article"
      isInteractive
      size="lg"
      className={cn(
        "flex h-full flex-col",
        plan.isFeatured ? "border-2 border-brand shadow-raised hover:border-brand" : null,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-fg">{t(`plans.${plan.key}Name`)}</h2>
        {plan.isFeatured ? <Badge variant={PLAN_FEATURED_TONE} label={t("featuredLabel")} /> : null}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">{t(`plans.${plan.key}Body`)}</p>

      <p className="mt-6 flex items-baseline gap-1.5">
        <span className="text-4xl font-bold tracking-tight text-fg">{plan.price}</span>
        {plan.hasPeriod ? <span className="text-sm text-fg-muted">{t("perMonth")}</span> : null}
      </p>

      <Button
        size="lg"
        className="mt-6 w-full"
        variant={plan.isFeatured ? "primary" : "secondary"}
        href={AUTH_ROUTES.login}
        label={t(`plans.${plan.key}Cta`)}
      />

      <h3 className="mt-8 border-t border-border pt-6 text-sm font-semibold text-fg">{t("includedTitle")}</h3>
      <ul className="mt-4 flex flex-col gap-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-fg-muted">
            <span className="mt-0.5 text-success">
              <Icon icon={Check} size="sm" />
            </span>
            {t(`features.${feature}`)}
          </li>
        ))}
      </ul>
    </Card>
  );
}
