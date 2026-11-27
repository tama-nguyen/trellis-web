"use client";

import { LayoutDashboard, Megaphone } from "@/ui/icons/lucide";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { SITE_ROUTES } from "@/shared/constants/routes/site.routes";
import { NOTIFICATION_ROUTES } from "@/shared/constants/routes/notification.routes";
import { cn } from "@/ui/lib/cn";
import { Icon } from "@astryxdesign/core/Icon";

type AdminNavItem = {
  href: string;
  labelKey: "dashboard" | "notifications";
  icon: LucideIcon;
};

/** Admin sections. Add an entry here when an admin page is added. */
const ADMIN_NAV: readonly AdminNavItem[] = [
  { href: SITE_ROUTES.admin, labelKey: "dashboard", icon: LayoutDashboard },
  { href: NOTIFICATION_ROUTES.notifications, labelKey: "notifications", icon: Megaphone },
];

/** Sidebar on wide screens, a horizontal scroller above the content on phones. */
export function AdminShell({ children }: { children: ReactNode }) {
  const t = useTranslations("admin");
  const pathname = usePathname();
  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[14rem_1fr] md:px-6">
      <nav aria-label={t("navLabel")} className="flex gap-1 overflow-x-auto md:flex-col">
        {ADMIN_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={pathname === item.href ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-control px-3 py-2 text-sm text-fg-muted hover:bg-surface-hover hover:text-fg",
              pathname === item.href && "bg-surface-hover font-medium text-fg",
            )}
          >
            <Icon icon={item.icon} size="sm" />
            {t(`nav.${item.labelKey}`)}
          </Link>
        ))}
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
