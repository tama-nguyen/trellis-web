import { BookOpen, Globe, Sparkles, Trophy } from "@/ui/icons/lucide";
import { useTranslations } from "next-intl";
import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
import { Heading, Text } from "@astryxdesign/core/Text";
import { Container } from "@/ui/layout/Container";
import { ROUTES } from "@/shared/constants/routes";
import { cn } from "@/ui/lib/cn";

const CLOSING_STICKERS = [
  {
    icon: BookOpen,
    tile: "bg-tint-amber",
    position: "top-8 left-8 size-16 rounded-dialog -rotate-6",
    motion: "animate-drift-right-down",
    delay: "stagger-1",
  },
  {
    icon: Sparkles,
    tile: "bg-tint-mint",
    position: "top-7 right-10 size-12 rounded-full rotate-6",
    motion: "animate-drift-left-down",
    delay: "stagger-3",
  },
  {
    icon: Globe,
    tile: "bg-tint-rose",
    position: "bottom-8 left-16 size-14 rounded-full rotate-6",
    motion: "animate-drift-right-up",
    delay: "stagger-5",
  },
  {
    icon: Trophy,
    tile: "bg-info-subtle",
    position: "right-14 bottom-8 size-16 rounded-dialog -rotate-6",
    motion: "animate-drift-left-up",
    delay: "stagger-7",
  },
] as const;

/** A quiet final prompt, framed by a few learning symbols. */
export function HomeClosing() {
  const t = useTranslations("home.closing");

  return (
    <section className="bg-surface">
      <Container className="py-10 md:py-14 lg:py-16">
        <article className="relative isolate grid min-h-80 place-items-center overflow-hidden rounded-dialog border border-border bg-surface-warm px-5 py-12 text-center md:px-10 md:py-14">
          <ul aria-hidden className="pointer-events-none absolute inset-0 hidden xl:block">
            {CLOSING_STICKERS.map(({ icon, tile, position, motion, delay }) => (
              <li
                key={position}
                className={cn(
                  "absolute grid place-items-center border border-border text-fg-brand",
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
          <header className="relative z-dropdown max-w-2xl">
            <Heading level={2} type="display-2" weight="semibold" textWrap="balance" className="text-fg">
              {t("title")}
            </Heading>
            <Text as="p" type="large" color="secondary" className="mx-auto mt-5 max-w-xl leading-relaxed">
              {t("description")}
            </Text>
            <ul className="mt-8 flex flex-wrap justify-center gap-3 [&_a]:rounded-full [&_button]:rounded-full">
              <li>
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-fg text-canvas hover:bg-fg-muted"
                  href={ROUTES.login}
                  label={t("cta")}
                />
              </li>
            </ul>
          </header>
        </article>
      </Container>
    </section>
  );
}
