import { GraduationCap } from "@/ui/icons/lucide";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/shared/constants/routes";
import { Container } from "@/ui/layout/Container";
import { Icon } from "@astryxdesign/core/Icon";

type FooterLinkKey =
  | "catalog"
  | "myCourses"
  | "progress"
  | "studio"
  | "questionBank"
  | "analytics"
  | "search"
  | "notifications"
  | "signIn";

type FooterColumn = {
  key: "learn" | "teach" | "about";
  links: readonly { key: FooterLinkKey; href: string }[];
};

const COLUMNS: readonly FooterColumn[] = [
  {
    key: "learn",
    links: [
      { key: "catalog", href: ROUTES.courses },
      { key: "myCourses", href: ROUTES.myCourses },
      { key: "progress", href: ROUTES.learnProgress },
    ],
  },
  {
    key: "teach",
    links: [
      { key: "studio", href: ROUTES.studio },
      { key: "questionBank", href: ROUTES.studioQuestionBank },
      { key: "analytics", href: ROUTES.studioAnalytics },
    ],
  },
  {
    key: "about",
    links: [
      { key: "search", href: ROUTES.search },
      { key: "notifications", href: ROUTES.notifications },
      { key: "signIn", href: ROUTES.login },
    ],
  },
];

/**
 * Site-wide footer. It shares `bg-surface` with the header, so the page's chrome frames the tinted
 * hero and the bands between. Every link goes to a screen that exists; nothing is a placeholder.
 */
export function AppFooter() {
  const t = useTranslations("home.footer");
  const tNav = useTranslations("home.nav");

  return (
    <footer className="border-t border-border bg-surface">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div className="min-w-0">
            <Link href={ROUTES.home} className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-control bg-info-subtle text-fg-brand">
                <Icon icon={GraduationCap} size="md" />
              </span>
              <span className="text-base font-semibold text-fg">{tNav("brandName")}</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-fg-muted">{t("tagline")}</p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.key} aria-label={t(`${column.key}Title`)} className="min-w-0">
              <h2 className="text-sm font-semibold text-fg">{t(`${column.key}Title`)}</h2>
              <ul className="mt-3 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      className="text-sm text-fg-muted transition-colors duration-fast ease-standard hover:text-fg-brand"
                    >
                      {t(`links.${link.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mt-10 border-t border-border pt-6 text-xs text-fg-subtle">{t("note")}</p>
      </Container>
    </footer>
  );
}
