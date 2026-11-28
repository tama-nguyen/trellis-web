"use client";

import { ArrowLeft, CircleCheck, CircleX, Clock, Info, RotateCcw, Upload } from "@/ui/icons/lucide";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { PUBLISH_CHECK_STATES, type PublishCheckState } from "@/entities/learning/studio.constants";
import { PUBLISH_CHECKS, STUDIO_COURSE } from "@/entities/learning/studio.fixtures";
import type { PublishCheck } from "@/entities/learning/studio.types";
import { Link } from "@/i18n/navigation";
import { STUDIO_ROUTES } from "@/shared/constants/routes/studio.routes";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { cn } from "@/ui/lib/cn";
import { Icon } from "@astryxdesign/core/Icon";

const CHECK_ICONS: Record<PublishCheckState, LucideIcon> = {
  [PUBLISH_CHECK_STATES.PASS]: CircleCheck,
  [PUBLISH_CHECK_STATES.FAIL]: CircleX,
  [PUBLISH_CHECK_STATES.PENDING]: Clock,
};

const CHECK_TONES: Record<PublishCheckState, string> = {
  [PUBLISH_CHECK_STATES.PASS]: "text-success",
  [PUBLISH_CHECK_STATES.FAIL]: "text-danger",
  [PUBLISH_CHECK_STATES.PENDING]: "text-warning",
};

function checkTone(state: PublishCheckState) {
  return state === PUBLISH_CHECK_STATES.PASS
    ? "success"
    : state === PUBLISH_CHECK_STATES.FAIL
      ? "error"
      : "warning";
}

/**
 * M13 — the gate in front of publishing. A pending check blocks exactly as a failure does: an
 * unscanned file cannot be served, so a version cut now would publish a course that breaks on open.
 */
export function PublishPreflightPage() {
  const t = useTranslations("learning.studio.preflight");
  const course = STUDIO_COURSE;
  const blocking = PUBLISH_CHECKS.filter((check) => check.state !== PUBLISH_CHECK_STATES.PASS);
  const canPublish = blocking.length === 0;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <Link
        href={STUDIO_ROUTES.studioCourse(course.slug)}
        className="flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
      >
        <Icon icon={ArrowLeft} size="sm" />
        {t("backToCourse")}
      </Link>

      <h1 className="mt-6 text-2xl font-semibold text-fg">{t("title")}</h1>
      <p className="mt-2 text-sm text-fg-muted">{t("description")}</p>

      {canPublish ? null : (
        <div className="mt-5 flex flex-col gap-1 rounded-card border border-danger bg-danger-subtle p-4">
          <p className="text-sm font-semibold text-danger">{t("blockedTitle")}</p>
          <p className="text-xs text-fg-muted">{t("blockedDescription", { count: blocking.length })}</p>
        </div>
      )}

      <section className="mt-5 rounded-card border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-fg">{t("checksTitle")}</h2>
          <Button
            variant="secondary"
            size="sm"
            icon={<Icon icon={RotateCcw} size="sm" />}
            label={t("recheck")}
          />
        </div>
        <ul className="mt-4 flex flex-col gap-2">
          {PUBLISH_CHECKS.map((check) => (
            <li key={check.id}>
              <CheckRow check={check} />
            </li>
          ))}
        </ul>
        <p className="mt-4 flex items-start gap-2 rounded-control bg-info-subtle p-3 text-xs text-fg-muted">
          <Icon icon={Info} size="sm" className="mt-0.5 text-fg-brand" />
          {t("pendingNote")}
        </p>
      </section>

      <Button
        variant="primary"
        className="mt-5"
        isDisabled={!canPublish}
        icon={<Icon icon={Upload} size="sm" />}
        label={t("publishNow")}
      />
    </main>
  );
}

function CheckRow({ check }: { check: PublishCheck }) {
  const t = useTranslations("learning.studio.preflight");
  const tStates = useTranslations("learning.publishCheckStates");
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-control border border-border px-3 py-2.5">
      <Icon icon={CHECK_ICONS[check.state]} size="md" className={cn("shrink-0", CHECK_TONES[check.state])} />
      <span className="min-w-0 flex-1 text-sm text-fg">{t(`checks.${check.id}` as never)}</span>
      {check.detail === "" ? null : <span className="truncate text-xs text-fg-subtle">{check.detail}</span>}
      <Badge variant={checkTone(check.state)} label={tStates(check.state)} />
    </div>
  );
}
