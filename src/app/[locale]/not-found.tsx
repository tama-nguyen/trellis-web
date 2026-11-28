import { Icon } from "@astryxdesign/core/Icon";
import { SearchX } from "@/ui/icons/lucide";
import { useTranslations } from "next-intl";
import { SITE_ROUTES } from "@/shared/constants/routes/site.routes";
import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { PageShell } from "@/ui/layout/PageShell";

export default function NotFound() {
  const t = useTranslations("common");
  return (
    <PageShell>
      <EmptyState
        icon={<Icon icon={SearchX} size="lg" />}
        title={t("states.notFoundTitle")}
        description={t("states.notFoundDescription")}
        actions={<Button variant="secondary" size="sm" href={SITE_ROUTES.home} label={t("nav.home")} />}
      />
    </PageShell>
  );
}
