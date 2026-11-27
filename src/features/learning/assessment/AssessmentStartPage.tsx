"use client";

import { useDateLabel } from "@/features/learning/hooks/useDateLabel";
import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  CircleCheck,
  Clock,
  Eye,
  Info,
  RotateCcw,
  Target,
  TriangleAlert,
} from "@/ui/icons/lucide";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  ATTEMPT_ENTRIES,
  ATTEMPT_STATES,
  type AttemptEntry,
  type AttemptState,
} from "@/entities/learning/assessment.constants";
import {
  ATTEMPT_HISTORY,
  EXPIRED_ATTEMPT,
  PROPOSED_ASSESSMENT_POLICY,
  SAMPLE_ASSESSMENT,
} from "@/entities/learning/assessment.fixtures";
import { type AttemptHistoryRow } from "@/entities/learning/assessment.types";
import { Link } from "@/i18n/navigation";
import { LEARNING_ROUTES } from "@/shared/constants/routes/learning.routes";
import { ASSESSMENT_ROUTES } from "@/shared/constants/routes/assessment.routes";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { cn } from "@/ui/lib/cn";
import { Icon } from "@astryxdesign/core/Icon";
import { SHORT_DATE } from "../shared/learning.format";
import { ATTEMPT_STATE_TONES } from "../shared/learning.tones";

const HISTORY: readonly AttemptHistoryRow[] = [EXPIRED_ATTEMPT, ...ATTEMPT_HISTORY];

/**
 * M7 — the gate in front of an attempt. It exists because BR-17 says the server decides whether a
 * new attempt may start: an in-progress attempt is resumed, not duplicated, and a used-up quota
 * stops the learner here rather than on submit.
 */
export function AssessmentStartPage() {
  const t = useTranslations("learning.attemptStart");
  const tRules = useTranslations("learning.gradingRules");
  const tReveal = useTranslations("learning.revealPolicies");
  const dateLabel = useDateLabel();

  const policy = PROPOSED_ASSESSMENT_POLICY;
  const counted = HISTORY.filter((attempt) => attempt.isCountedTowardsGrade);
  const inProgress = HISTORY.find((attempt) => attempt.state === ATTEMPT_STATES.IN_PROGRESS);
  const entry: AttemptEntry = inProgress
    ? ATTEMPT_ENTRIES.RESUME
    : counted.length >= policy.maxAttempts
      ? ATTEMPT_ENTRIES.NO_ATTEMPTS_LEFT
      : ATTEMPT_ENTRIES.START;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <Link
        href={LEARNING_ROUTES.learnCourse("chinese-i-foundations")}
        className="flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
      >
        <Icon icon={ArrowLeft} size="sm" />
        {t("backToCourse")}
      </Link>

      <p className="mt-6 text-xs font-semibold tracking-wide text-fg-brand uppercase">
        {t("eyebrow", { course: SAMPLE_ASSESSMENT.courseTitle })}
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-fg">{SAMPLE_ASSESSMENT.title}</h1>
      <p className="mt-2 text-sm text-fg-muted">{t("title")}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_18rem]">
        <section className="rounded-card border border-border bg-surface p-5">
          <h2 className="text-base font-semibold text-fg">{t("rulesTitle")}</h2>
          <dl className="mt-4 flex flex-col gap-3">
            <RuleRow
              icon={RotateCcw}
              term={t("attemptsAllowed")}
              value={t("attemptsUsed", { used: counted.length, total: policy.maxAttempts })}
            />
            <RuleRow
              icon={Clock}
              term={t("timeLimit")}
              value={t("timeLimitValue", { count: policy.timeLimitMinutes })}
            />
            <RuleRow
              icon={Target}
              term={t("passScore")}
              value={t("passScoreValue", { score: policy.passScore })}
            />
            <RuleRow icon={CircleCheck} term={t("gradingRule")} value={tRules(policy.gradingRule)} />
            <RuleRow icon={Eye} term={t("revealPolicy")} value={tReveal(policy.revealPolicy)} />
          </dl>
          <p className="mt-4 flex items-start gap-2 rounded-control bg-info-subtle p-3 text-xs text-fg-muted">
            <Icon icon={Info} size="sm" className="mt-0.5 text-fg-brand" />
            {t("serverTimeNote")}
          </p>
          {/* The numbers above are proposals, and saying so costs one line now instead of a
              retraction later. */}
          <p className="mt-2 text-xs text-fg-subtle">{t("proposedNote")}</p>
        </section>

        <aside className="flex flex-col gap-3">
          <EntryPanel entry={entry} attemptsTotal={policy.maxAttempts} resumeNumber={inProgress?.number} />
          <section className="rounded-card border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold text-fg">{t("historyTitle")}</h2>
            {HISTORY.length === 0 ? (
              <p className="mt-2 text-xs text-fg-muted">{t("historyEmpty")}</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {HISTORY.map((attempt) => (
                  <li
                    key={attempt.id}
                    className="flex flex-col gap-1 border-b border-border pb-2 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-fg">
                        {attempt.number > 0 ? t("attemptNumber", { number: attempt.number }) : null}
                      </span>
                      <AttemptBadge state={attempt.state} score={attempt.score} />
                    </div>
                    <span className="text-xs text-fg-subtle">{dateLabel(attempt.startedAt, SHORT_DATE)}</span>
                    {attempt.isCountedTowardsGrade ? null : (
                      <span className="text-xs text-warning">{t("notCounted")}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}

function RuleRow({ icon, term, value }: { icon: LucideIcon; term: string; value: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <span className="grid size-8 shrink-0 place-items-center rounded-control bg-info-subtle text-fg-brand">
        <Icon icon={icon} size="sm" />
      </span>
      <dt className="min-w-0 flex-1 text-sm text-fg-muted">{term}</dt>
      <dd className="text-sm font-medium text-fg">{value}</dd>
    </div>
  );
}

function AttemptBadge({ state, score }: { state: AttemptState; score: number | undefined }) {
  const t = useTranslations("learning.attemptStates");
  return <Badge variant={ATTEMPT_STATE_TONES[state]} label={score === undefined ? t(state) : `${score}`} />;
}

function EntryPanel({
  entry,
  attemptsTotal,
  resumeNumber,
}: {
  entry: AttemptEntry;
  attemptsTotal: number;
  resumeNumber: number | undefined;
}) {
  const t = useTranslations("learning.attemptStart");

  if (entry === ATTEMPT_ENTRIES.NO_ATTEMPTS_LEFT) {
    return (
      <section className="flex flex-col gap-2 rounded-card border border-warning bg-warning-subtle p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-warning">
          <Icon icon={TriangleAlert} size="sm" />
          {t("noAttemptsLeftTitle")}
        </h2>
        <p className="text-xs text-fg-muted">{t("noAttemptsLeftDescription", { total: attemptsTotal })}</p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-1 w-full"
          href={ASSESSMENT_ROUTES.assessmentResult(SAMPLE_ASSESSMENT.id, "attempt-2")}
          label={t("viewResult")}
        />
      </section>
    );
  }

  const isResume = entry === ATTEMPT_ENTRIES.RESUME;
  return (
    <section className={cn("flex flex-col gap-2 rounded-card border border-border bg-surface p-4")}>
      {isResume ? (
        <p className="flex items-start gap-2 text-xs text-fg-muted">
          <Icon icon={CircleAlert} size="sm" className="mt-0.5 text-warning" />
          {t("resumeNote")}
        </p>
      ) : null}
      <Button
        variant="primary"
        className="w-full"
        endContent={<Icon icon={ArrowRight} size="sm" />}
        href={ASSESSMENT_ROUTES.learnAssessment(SAMPLE_ASSESSMENT.id)}
        label={isResume && resumeNumber !== undefined ? t("resume", { number: resumeNumber }) : t("start")}
      />
    </section>
  );
}
