import { ArrowRight } from "@/ui/icons/lucide";
import { useTranslations } from "next-intl";
import { MARKETING_STATS } from "@/entities/marketing/marketing.fixtures";
import { MARKETING_ROUTES } from "@/shared/constants/routes/marketing.routes";
import { LEARNING_ROUTES } from "@/shared/constants/routes/learning.routes";
import { Button } from "@astryxdesign/core/Button";
import { Grid } from "@astryxdesign/core/Grid";
import { HStack } from "@astryxdesign/core/HStack";
import { Heading, Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { Container } from "@/ui/layout/Container";
import { Icon } from "@astryxdesign/core/Icon";
import { CountUp } from "../components/CountUp";
import { HeroVisual } from "./HeroVisual";

const ARROW_CLASSES = "transition-transform duration-normal ease-emphasized group-hover:translate-x-0.5";

/** A quiet, centered hero framed by small learning icons. */
export function HomeHero() {
  const t = useTranslations("home.hero");
  return (
    <section className="bg-surface">
      <Container className="py-4 sm:py-6 lg:py-8">
        <article className="relative isolate overflow-hidden rounded-dialog border border-border bg-surface-warm px-5 py-14 text-center md:px-10 md:py-16 xl:py-20">
          <HeroVisual />
          <VStack gap={0} hAlign="center" className="relative z-dropdown mx-auto max-w-3xl">
            <Text type="label" color="accent">
              {t("badge")}
            </Text>
            <Heading level={1} type="display-1" weight="bold" textWrap="balance" className="mt-3 text-fg">
              {t("title")}
            </Heading>
            <Text as="p" type="body" size="lg" color="secondary" className="mt-5 max-w-2xl leading-relaxed">
              {t("subtitle")}
            </Text>
            <HStack gap={3} wrap="wrap" hAlign="center" className="mt-8">
              <Button
                variant="primary"
                size="lg"
                className="group rounded-full bg-fg text-canvas hover:bg-fg-muted"
                endContent={<Icon icon={ArrowRight} size="sm" className={ARROW_CLASSES} />}
                href={LEARNING_ROUTES.learn}
                label={t("ctaPrimary")}
              />
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full"
                href={MARKETING_ROUTES.courses}
                label={t("ctaSecondary")}
              />
            </HStack>
            <HomeStats />
          </VStack>
        </article>
      </Container>
    </section>
  );
}

/** Keep the catalogue figures, but make them a quiet footer to the centered hero copy. */
function HomeStats() {
  const t = useTranslations("home.stats");
  return (
    <Grid
      columns={{ minWidth: 128, max: 4, repeat: "fit" }}
      gap={3}
      className="mt-10 w-full max-w-3xl border-t border-border pt-6"
    >
      {MARKETING_STATS.map((stat) => (
        <dl key={stat.key} className="flex flex-col gap-1">
          <dt>
            <Text type="supporting" color="secondary">
              {t(stat.key)}
            </Text>
          </dt>
          <dd>
            <Text type="large" weight="bold" hasTabularNumbers>
              <CountUp value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
            </Text>
          </dd>
        </dl>
      ))}
    </Grid>
  );
}
