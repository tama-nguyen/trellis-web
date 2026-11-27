import { createLocalizedMetadata } from "@/i18n/metadata";
import { useTranslations } from "next-intl";
import { EmptyState } from "@astryxdesign/core/EmptyState";

export const generateMetadata = createLocalizedMetadata("admin.dashboard.title");

/** Placeholder: products add their admin pages under this segment. */
export default function AdminDashboardPage() {
  const t = useTranslations("admin.dashboard");
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-fg">{t("title")}</h1>
      <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
    </section>
  );
}
