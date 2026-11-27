import { useTranslations } from "next-intl";
import { Button } from "@astryxdesign/core/Button";
import { Heading, Text } from "@astryxdesign/core/Text";
import { Container } from "@/ui/layout/Container";
import { AUTH_ROUTES } from "@/shared/constants/routes/auth.routes";

/** A quieter final prompt; the decorative collage belongs to the opening hero, not both CTAs. */
export function HomeClosing() {
  const t = useTranslations("home.closing");

  return (
    <section className="bg-surface">
      <Container className="py-10 md:py-14 lg:py-16">
        <article className="relative isolate grid min-h-80 place-items-center overflow-hidden rounded-dialog border border-border bg-surface-warm px-5 py-12 text-center md:px-10 md:py-14">
          <header className="relative max-w-2xl">
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
                  href={AUTH_ROUTES.login}
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
