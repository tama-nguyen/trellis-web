import { useTranslations } from "next-intl";
import {
  NOTIFICATION_SEVERITIES,
  type NotificationSeverity,
} from "@/entities/notification/notification.constants";
import { cn } from "@/ui/lib/cn";

const SEVERITY_CLASS: Record<NotificationSeverity, string> = {
  [NOTIFICATION_SEVERITIES.INFO]: "bg-info-subtle text-info",
  [NOTIFICATION_SEVERITIES.WARNING]: "bg-warning-subtle text-warning",
  [NOTIFICATION_SEVERITIES.CRITICAL]: "bg-danger-subtle text-danger",
};

export function NotificationSeverityBadge({
  severity,
  className,
}: {
  severity: NotificationSeverity;
  className?: string;
}) {
  const t = useTranslations("notification.severity");
  return (
    <span
      className={cn(
        "inline-flex rounded-control px-2 py-0.5 text-xs font-medium",
        SEVERITY_CLASS[severity],
        className,
      )}
    >
      {t(severity)}
    </span>
  );
}
