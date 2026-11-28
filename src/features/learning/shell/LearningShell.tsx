"use client";

import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Bookmark,
  Calendar,
  ChevronDown,
  ClipboardCheck,
  FileText,
  Folder,
  GraduationCap,
  Home,
  LayoutGrid,
  Library,
  MessageSquare,
  NotebookPen,
  Pencil,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Users,
  Menu,
} from "@/ui/icons/lucide";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { LocaleSwitcher } from "@/app/[locale]/_components/LocaleSwitcher";
import { ThemeToggle } from "@/app/[locale]/_components/ThemeToggle";
import { SHELL_ROLES, type ShellRole } from "@/entities/learning/learning.constants";
import { SAMPLE_LEARNER } from "@/entities/learning/progress.fixtures";
import { ASSESSMENT_DRAFT, STUDIO_COURSE } from "@/entities/learning/studio.fixtures";
import { Link, usePathname } from "@/i18n/navigation";
import { SITE_ROUTES } from "@/shared/constants/routes/site.routes";
import { LEARNING_ROUTES } from "@/shared/constants/routes/learning.routes";
import { STUDIO_ROUTES } from "@/shared/constants/routes/studio.routes";
import { Button } from "@astryxdesign/core/Button";
import { cn } from "@/ui/lib/cn";
import { Icon } from "@astryxdesign/core/Icon";

type NavKey = Parameters<ReturnType<typeof useTranslations<"learning.nav">>>[0];

type NavItem = {
  key: NavKey;
  icon: LucideIcon;
  href: string;
  hasDot?: boolean;
};

type NavGroup = {
  /** `null` for the first group, which carries no heading. */
  titleKey: "toolsLabel" | "instructorToolsLabel" | null;
  items: readonly NavItem[];
};

const LEARNER_NAV: readonly NavGroup[] = [
  {
    titleKey: null,
    items: [
      { key: "dashboard", icon: Home, href: LEARNING_ROUTES.learn },
      { key: "myCourses", icon: BookOpen, href: LEARNING_ROUTES.myCourses },
      { key: "catalog", icon: LayoutGrid, href: LEARNING_ROUTES.catalog },
      { key: "progress", icon: BarChart3, href: LEARNING_ROUTES.learnProgress },
      { key: "achievements", icon: Award, href: LEARNING_ROUTES.learnAchievements },
      { key: "messages", icon: MessageSquare, href: LEARNING_ROUTES.learnMessages, hasDot: true },
    ],
  },
  {
    titleKey: "toolsLabel",
    items: [
      { key: "notes", icon: FileText, href: LEARNING_ROUTES.learnNotes },
      { key: "bookmarks", icon: Bookmark, href: LEARNING_ROUTES.learnBookmarks },
      { key: "studyPlan", icon: Calendar, href: LEARNING_ROUTES.learnStudyPlan },
    ],
  },
];

const INSTRUCTOR_NAV: readonly NavGroup[] = [
  {
    titleKey: null,
    items: [
      { key: "dashboard", icon: Home, href: LEARNING_ROUTES.learn },
      { key: "myCourses", icon: BookOpen, href: STUDIO_ROUTES.studio },
      { key: "catalog", icon: LayoutGrid, href: LEARNING_ROUTES.catalog },
      { key: "students", icon: Users, href: STUDIO_ROUTES.studioStudents },
      { key: "grading", icon: ClipboardCheck, href: STUDIO_ROUTES.studioGrading },
      { key: "analytics", icon: BarChart3, href: STUDIO_ROUTES.studioAnalytics },
      { key: "messages", icon: MessageSquare, href: LEARNING_ROUTES.learnMessages, hasDot: true },
    ],
  },
  {
    titleKey: "instructorToolsLabel",
    items: [
      { key: "courseStudio", icon: Pencil, href: STUDIO_ROUTES.studioCourse(STUDIO_COURSE.slug) },
      { key: "assessments", icon: ClipboardCheck, href: STUDIO_ROUTES.studioAssessment(ASSESSMENT_DRAFT.id) },
      { key: "assignments", icon: NotebookPen, href: STUDIO_ROUTES.studioAssignments },
      { key: "questionBank", icon: Library, href: STUDIO_ROUTES.studioQuestionBank },
      { key: "certificates", icon: Award, href: STUDIO_ROUTES.studioCertificates },
      { key: "resources", icon: Folder, href: STUDIO_ROUTES.studioResources },
    ],
  },
];

/** Shared by the linked and the inert rows, so they keep the same metrics. */
const MOBILE_NAV_ID = "learning-mobile-nav";

const NAV_ITEM_CLASSES =
  "flex shrink-0 items-center gap-3 rounded-control px-3 py-2.5 text-sm whitespace-nowrap";

export type LearningShellProps = {
  role?: ShellRole;
  children: ReactNode;
};

/**
 * The LMS frame: the sidebar sits directly on the app canvas, and everything else — header
 * included — is one rounded white panel. The header is a row inside that panel, not a bar of its
 * own, so the page starts at the same left edge as its own content.
 */
export function LearningShell({ role = SHELL_ROLES.LEARNER, children }: LearningShellProps) {
  const groups = role === SHELL_ROLES.INSTRUCTOR ? INSTRUCTOR_NAV : LEARNER_NAV;
  // Layout state, so it survives navigation inside the area without a store or storage.
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Below `xl` there is no sidebar, so the same nav opens from a menu button in the top bar.
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex flex-1 gap-3 bg-canvas p-3">
      <Sidebar
        groups={groups}
        role={role}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((collapsed) => !collapsed)}
      />
      <div className="flex min-w-0 flex-1 flex-col rounded-card bg-surface">
        <TopBar role={role} isMenuOpen={isMenuOpen} onToggleMenu={() => setIsMenuOpen((open) => !open)} />
        {isMenuOpen ? <MobileNav groups={groups} onNavigate={() => setIsMenuOpen(false)} /> : null}
        <main className="min-w-0 px-4 py-4 pb-8 md:px-6">{children}</main>
      </div>
    </div>
  );
}

function Sidebar({
  groups,
  role,
  isCollapsed,
  onToggle,
}: {
  groups: readonly NavGroup[];
  role: ShellRole;
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations("learning.shell");
  const tSidebar = useTranslations("learning.sidebar");
  return (
    <aside
      className={cn(
        "sticky top-3 hidden h-[calc(100dvh-1.5rem)] shrink-0 flex-col gap-5 px-2 py-2 transition-[width] duration-normal ease-standard xl:flex",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className={cn("flex items-center gap-2.5 px-1 py-1", isCollapsed && "flex-col gap-2")}>
        <Link href={SITE_ROUTES.home} className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-control bg-info-subtle text-fg-brand">
            <Icon icon={GraduationCap} size="md" />
          </span>
          {isCollapsed ? null : <span className="truncate text-lg font-semibold text-fg">{t("brand")}</span>}
        </Link>
        <button
          type="button"
          onClick={onToggle}
          aria-label={isCollapsed ? tSidebar("expand") : tSidebar("collapse")}
          aria-expanded={!isCollapsed}
          className="ml-auto grid size-8 shrink-0 place-items-center rounded-control text-fg-subtle hover:bg-surface-hover hover:text-fg"
        >
          <Icon icon={isCollapsed ? PanelLeftOpen : PanelLeftClose} size="sm" />
        </button>
      </div>

      {isCollapsed ? null : (
        <label className="flex items-center gap-2 rounded-control border border-border bg-surface px-3 py-2.5 text-sm text-fg-subtle">
          <Icon icon={Search} size="sm" />
          <span className="sr-only">
            {role === SHELL_ROLES.INSTRUCTOR ? t("searchTools") : t("searchCourses")}
          </span>
          <input
            type="search"
            placeholder={role === SHELL_ROLES.INSTRUCTOR ? t("searchTools") : t("searchCourses")}
            className="w-full min-w-0 bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle"
          />
          <kbd className="shrink-0 rounded-control bg-surface-sunken px-1.5 py-0.5 text-xs text-fg-subtle">
            {t("searchShortcut")}
          </kbd>
        </label>
      )}

      <nav aria-label={t("navLabel")} className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto">
        {groups.map((group, index) => (
          <NavGroupList key={group.titleKey ?? index} group={group} isCollapsed={isCollapsed} />
        ))}
      </nav>

      {isCollapsed ? null : <PromoCard role={role} />}
    </aside>
  );
}

/** The nav as a panel under the top bar, for screens without the sidebar. It closes on navigation. */
function MobileNav({ groups, onNavigate }: { groups: readonly NavGroup[]; onNavigate: () => void }) {
  const t = useTranslations("learning.shell");
  const tNav = useTranslations("learning.nav");
  const pathname = usePathname();
  return (
    <nav
      id={MOBILE_NAV_ID}
      aria-label={t("navLabel")}
      className="animate-slide-in border-b border-border px-4 pb-3 md:px-6 xl:hidden"
    >
      <ul className="grid gap-1 sm:grid-cols-2">
        {groups
          .flatMap((group) => group.items)
          .map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={pathname === item.href ? "page" : undefined}
                className={cn(
                  NAV_ITEM_CLASSES,
                  "w-full text-fg-muted hover:bg-surface-hover hover:text-fg",
                  pathname === item.href && "bg-info-subtle font-medium text-fg-brand",
                )}
              >
                <Icon icon={item.icon} size="sm" />
                {tNav(item.key)}
              </Link>
            </li>
          ))}
      </ul>
    </nav>
  );
}

function NavGroupList({ group, isCollapsed }: { group: NavGroup; isCollapsed: boolean }) {
  const t = useTranslations("learning.shell");
  const tNav = useTranslations("learning.nav");
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-1">
      {group.titleKey ? (
        <h2
          className={cn(
            "border-t border-border pt-4 pb-1 text-xs text-fg-subtle",
            isCollapsed ? "px-0" : "px-3",
          )}
        >
          {isCollapsed ? null : t(group.titleKey)}
        </h2>
      ) : null}
      <ul className="flex flex-col gap-1">
        {group.items.map((item) => {
          const isCurrent = pathname === item.href;
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                title={isCollapsed ? tNav(item.key) : undefined}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  NAV_ITEM_CLASSES,
                  "w-full text-fg-muted transition-colors duration-fast ease-standard hover:bg-surface-hover hover:text-fg",
                  isCollapsed && "justify-center px-0",
                  isCurrent &&
                    "bg-info-subtle font-medium text-fg-brand hover:bg-info-subtle hover:text-fg-brand",
                )}
              >
                <Icon icon={item.icon} size="md" />
                {isCollapsed ? null : <span className="truncate">{tNav(item.key)}</span>}
                {item.hasDot && !isCollapsed ? (
                  <span className="ml-auto size-1.5 rounded-full bg-brand" />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PromoCard({ role }: { role: ShellRole }) {
  const t = useTranslations("learning.shell");
  const isInstructor = role === SHELL_ROLES.INSTRUCTOR;
  return (
    <div className="flex flex-col items-center gap-2 rounded-card bg-info-subtle p-4 text-center">
      <span className="grid size-12 place-items-center rounded-card bg-surface text-fg-brand">
        <Icon icon={isInstructor ? Pencil : BookOpen} size="lg" />
      </span>
      <h3 className="text-sm font-semibold text-fg">
        {isInstructor ? t("studioPromoTitle") : t("promoTitle")}
      </h3>
      <p className="text-xs text-fg-muted">
        {isInstructor ? t("studioPromoDescription") : t("promoDescription")}
      </p>
      {/* The design's call to action is near-black, which is `fg` on `canvas`, not the brand. */}
      <Button
        variant="primary"
        size="sm"
        className="mt-1 w-full bg-fg text-canvas hover:bg-fg-muted"
        href={LEARNING_ROUTES.catalog}
        label={isInstructor ? t("studioPromoAction") : t("promoAction")}
      />
    </div>
  );
}

function TopBar({
  role,
  isMenuOpen,
  onToggleMenu,
}: {
  role: ShellRole;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
}) {
  const t = useTranslations("learning.shell");
  return (
    <div className="flex items-center justify-end gap-2 px-4 py-4 md:px-6">
      <div className="mr-auto xl:hidden">
        <Button
          variant="secondary"
          isIconOnly
          icon={<Icon icon={Menu} size="sm" />}
          label={t("menu")}
          aria-expanded={isMenuOpen}
          aria-controls={MOBILE_NAV_ID}
          onClick={onToggleMenu}
        />
      </div>
      <AreaSwitcher role={role} />
      <LocaleSwitcher />
      <ThemeToggle />
      <button
        type="button"
        aria-label={t("notifications")}
        className="grid size-10 place-items-center rounded-control border border-border text-fg-muted hover:bg-surface-hover hover:text-fg"
      >
        <Icon icon={Bell} size="sm" />
      </button>
      <button type="button" aria-label={t("accountMenu")} className="flex items-center gap-2 text-left">
        <span className="grid size-10 place-items-center rounded-full bg-surface-sunken text-sm font-medium text-fg">
          {SAMPLE_LEARNER.initials}
        </span>
        <span className="hidden flex-col leading-tight sm:flex">
          <span className="text-sm font-semibold text-fg">{SAMPLE_LEARNER.name}</span>
          <span className="text-xs text-fg-subtle">
            {role === SHELL_ROLES.INSTRUCTOR ? t("roleInstructor") : t("roleLearner")}
          </span>
        </span>
        <Icon icon={ChevronDown} size="sm" className="text-fg-subtle" />
      </button>
    </div>
  );
}

/**
 * One account holds both hats (decision Q3), so the areas are a switch rather than two logins.
 * It is a pair of links, not a toggle: each area is a URL someone can share.
 */
function AreaSwitcher({ role }: { role: ShellRole }) {
  const t = useTranslations("learning.roleSwitch");
  const isStudio = role === SHELL_ROLES.INSTRUCTOR;
  return (
    <div aria-label={t("label")} className="mr-1 hidden rounded-control border border-border p-0.5 sm:flex">
      <AreaLink href={LEARNING_ROUTES.learn} isActive={!isStudio} label={t("learn")} />
      <AreaLink href={STUDIO_ROUTES.studio} isActive={isStudio} label={t("studio")} />
    </div>
  );
}

function AreaLink({ href, isActive, label }: { href: string; isActive: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "rounded-control px-2.5 py-1 text-xs",
        isActive ? "bg-info-subtle font-medium text-fg-brand" : "text-fg-muted hover:text-fg",
      )}
    >
      {label}
    </Link>
  );
}
