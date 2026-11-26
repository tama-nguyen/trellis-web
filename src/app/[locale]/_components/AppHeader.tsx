"use client";

import { AuthMenu } from "@/features/auth/forms/AuthMenu";
import { GraduationCap, Menu, Search, X } from "@/ui/icons/lucide";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/shared/constants/routes";
import { Container } from "@/ui/layout/Container";
import { Icon } from "@astryxdesign/core/Icon";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ThemeToggle } from "./ThemeToggle";

type NavEntry = {
  key: "courses" | "educators" | "pricing" | "resources";
  href: string;
};

/*
 * The underline grows from the centre on hover. A pseudo-element, so the link's box and the row's
 * height never change while it animates.
 */
const NAV_LINK_CLASSES =
  "relative flex items-center px-3 text-sm font-medium whitespace-nowrap text-fg-muted transition-colors duration-fast ease-standard after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-center after:scale-x-0 after:bg-brand after:transition-transform after:duration-normal after:ease-emphasized hover:text-fg hover:after:scale-x-100";

const NAV: readonly NavEntry[] = [
  { key: "courses", href: ROUTES.courses },
  { key: "educators", href: ROUTES.educators },
  { key: "pricing", href: ROUTES.pricing },
  { key: "resources", href: ROUTES.resources },
];

export function AppHeader() {
  const t = useTranslations("home.nav");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-sticky scroll-raise border-b border-border bg-surface">
      <Container className="flex h-16 items-center gap-3 lg:gap-4">
        {/* The logo always returns to the landing page, from every screen that shows this header. */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? t("closeMenu") : t("openMenu")}
          aria-expanded={isMenuOpen}
          className="grid size-9 shrink-0 place-items-center rounded-control text-fg-muted hover:bg-surface-hover hover:text-fg lg:hidden"
        >
          <Icon icon={isMenuOpen ? X : Menu} size="sm" />
        </button>

        <Link href={ROUTES.home} className="flex shrink-0 items-center gap-2">
          <span className="grid size-8 place-items-center rounded-control bg-info-subtle text-fg-brand">
            <Icon icon={GraduationCap} size="md" />
          </span>
          <span className="text-lg font-semibold text-fg">{t("brandName")}</span>
        </Link>

        <nav
          aria-label={t("label")}
          className="hidden items-stretch self-stretch border-l border-border pl-3 lg:flex"
        >
          {NAV.map((entry) => (
            <Link key={entry.key} href={entry.href} className={NAV_LINK_CLASSES}>
              {t(entry.key)}
            </Link>
          ))}
        </nav>

        <label className="ml-auto hidden w-72 min-w-0 shrink items-center gap-2 rounded-control border border-border bg-canvas px-3 py-2 transition-colors duration-fast ease-standard focus-within:border-brand focus-within:bg-surface hover:border-border-strong xl:flex">
          <Icon icon={Search} size="sm" className="text-fg-subtle" />
          <span className="sr-only">{t("searchLabel")}</span>
          <input
            type="search"
            placeholder={t("searchPlaceholder")}
            className="w-full min-w-0 bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle"
          />
          <kbd className="shrink-0 rounded-control bg-surface px-1.5 py-0.5 text-xs text-fg-subtle">
            {t("searchShortcut")}
          </kbd>
        </label>

        <div className="ml-auto flex shrink-0 items-center gap-2 xl:ml-3">
          <Link
            href={ROUTES.search}
            aria-label={t("searchLabel")}
            className="grid size-9 place-items-center rounded-control border border-border text-fg-muted hover:bg-surface-hover hover:text-fg xl:hidden"
          >
            <Icon icon={Search} size="sm" />
          </Link>
          {/* Not in the design, but without them neither theme nor language is reachable here. */}
          {/* Below `sm` these move into the menu: a phone row has room for the main action only. */}
          <div className="hidden items-center gap-2 sm:flex">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
          <AuthMenu />
        </div>
      </Container>

      {/* Below `lg` the nav lives here instead of being unreachable. */}
      {isMenuOpen ? (
        <nav
          aria-label={t("label")}
          className="mx-auto flex w-full animate-slide-in flex-col gap-1 border-t border-border px-4 py-3 sm:px-6 lg:hidden"
        >
          {NAV.map((entry) => (
            <Link
              key={entry.key}
              href={entry.href}
              onClick={() => setIsMenuOpen(false)}
              className="rounded-control px-3 py-2 text-sm text-fg-muted hover:bg-surface-hover hover:text-fg"
            >
              {t(entry.key)}
            </Link>
          ))}
          <div className="mt-2 flex items-center gap-2 border-t border-border pt-3 sm:hidden">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </nav>
      ) : null}
    </header>
  );
}
