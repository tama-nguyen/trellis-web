"use client";

import { useDateLabel } from "@/features/learning/hooks/useDateLabel";
import {
  ArrowLeft,
  CircleCheck,
  CircleX,
  Clock,
  History,
  Info,
  ListChecks,
  RotateCcw,
  ShieldCheck,
} from "@/ui/icons/lucide";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  ANSWER_OUTCOMES,
  ATTEMPT_STATES,
  type AnswerOutcome,
  REVEAL_POLICIES,
} from "@/entities/learning/assessment.constants";
import { ATTEMPT_HISTORY, ATTEMPT_RESULT, EXPIRED_ATTEMPT } from "@/entities/learning/assessment.fixtures";
import {
  type AttemptHistoryRow,
  type AttemptResult,
  type QuestionResult,
} from "@/entities/learning/assessment.types";
import { Link } from "@/i18n/navigation";
import { LEARNING_ROUTES } from "@/shared/constants/routes/learning.routes";
import { ASSESSMENT_ROUTES } from "@/shared/constants/routes/assessment.routes";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { cn } from "@/ui/lib/cn";
import { Icon } from "@astryxdesign/core/Icon";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { SHORT_DATE, SHORT_DATE_TIME } from "../shared/learning.format";
import { ATTEMPT_STATE_TONES, passTone } from "../shared/learning.tones";

const RESULT_TABS = { QUESTIONS: "questions", HISTORY: "history" } as const;
type ResultTab = (typeof RESULT_TABS)[keyof typeof RESULT_TABS];

const OUTCOME_ICONS: Record<AnswerOutcome, LucideIcon> = {
  [ANSWER_OUTCOMES.CORRECT]: CircleCheck,
  [ANSWER_OUTCOMES.INCORRECT]: CircleX,
  [ANSWER_OUTCOMES.PENDING]: Clock,
};

const OUTCOME_TONES: Record<AnswerOutcome, string> = {
  [ANSWER_OUTCOMES.CORRECT]: "text-success",
  [ANSWER_OUTCOMES.INCORRECT]: "text-danger",
  [ANSWER_OUTCOMES.PENDING]: "text-fg-subtle",
};

const HISTORY: readonly AttemptHistoryRow[] = [EXPIRED_ATTEMPT, ...ATTEMPT_HISTORY];

/**
 * M8/M9 — the result of one attempt, plus the history that decides what actually counts.
 *
 * Two things the screen states rather than computes, because the backend owns them: the revisions
 * the grade was produced against (BR-05), and the grading rule that picks which attempt reaches the
 * course grade (BR-15). Feedback respects the reveal policy (BR-18): the attempt being graded hides
 * it instead of showing an empty space.
 */
export function AssessmentResultPage() {
  const t = useTranslations("learning.result");
  const tRules = useTranslations("learning.gradingRules");
  const dateLabel = useDateLabel();
  const [tab, setTab] = useState<ResultTab>(RESULT_TABS.QUESTIONS);

  const result: AttemptResult = ATTEMPT_RESULT;
  const isGrading = result.state === ATTEMPT_STATES.GRADING;
  const canReveal =
    result.policy.revealPolicy === REVEAL_POLICIES.AFTER_FINALIZE && result.state === ATTEMPT_STATES.GRADED;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <Link
        href={LEARNING_ROUTES.learnCourse("chinese-i-foundations")}
        className="flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
      >
        <Icon icon={ArrowLeft} size="sm" />
        {t("backToCourse")}
      </Link>

      <p className="mt-6 text-xs font-semibold tracking-wide text-fg-brand uppercase">
        {t("eyebrow", { course: result.courseTitle })}
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-fg">{result.assessmentTitle}</h1>
      <p className="mt-2 text-sm text-fg-muted">
        {t("submittedAt", { date: dateLabel(result.submittedAt, SHORT_DATE_TIME) })}
      </p>

      {isGrading ? (
        <section className="mt-6 flex flex-col gap-2 rounded-card border border-border bg-surface p-6">
          <h2 className="text-base font-semibold text-fg">{t("gradingTitle")}</h2>
          <p className="text-sm text-fg-muted">{t("gradingDescription")}</p>
        </section>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_18rem]">
          <section className="flex flex-col gap-5 rounded-card border border-border bg-surface p-5">
            <ScoreHeader result={result} />

            <div
              role="tablist"
              aria-label={t("questionsTitle")}
              className="flex gap-1 border-b border-border"
            >
              <TabButton
                icon={ListChecks}
                isActive={tab === RESULT_TABS.QUESTIONS}
                onClick={() => setTab(RESULT_TABS.QUESTIONS)}
                label={t("questionsTab")}
              />
              <TabButton
                icon={History}
                isActive={tab === RESULT_TABS.HISTORY}
                onClick={() => setTab(RESULT_TABS.HISTORY)}
                label={t("historyTab")}
              />
            </div>

            {tab === RESULT_TABS.QUESTIONS ? (
              <ul className="flex flex-col gap-3">
                {result.questions.map((question) => (
                  <li key={question.questionId}>
                    <QuestionRow question={question} canReveal={canReveal} />
                  </li>
                ))}
              </ul>
            ) : (
              <AttemptHistoryPanel rule={tRules(result.policy.gradingRule)} />
            )}
          </section>

          <aside className="flex flex-col gap-4">
            <section className="rounded-card border border-border bg-surface p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
                <Icon icon={ShieldCheck} size="sm" className="text-fg-brand" />
                {t("revisionTitle")}
              </h2>
              <dl className="mt-3 flex flex-col gap-2 text-sm">
                <SummaryRow term={t("assessmentRevision")} value={result.policy.assessmentRevision} />
                <SummaryRow term={t("gradingRuleRevision")} value={result.policy.gradingRuleRevision} />
              </dl>
              <p className="mt-2 text-xs text-fg-subtle">{t("revisionNote")}</p>
            </section>

            {result.adjustments.length > 0 ? (
              <section className="rounded-card border border-border bg-surface p-4">
                <h2 className="text-sm font-semibold text-fg">{t("adjustmentsTitle")}</h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {result.adjustments.map((adjustment) => (
                    <li key={adjustment.id} className="flex flex-col gap-1 text-xs">
                      <span className="text-fg">
                        {t("adjustmentRow", {
                          actor: adjustment.actor,
                          from: adjustment.fromScore,
                          to: adjustment.toScore,
                        })}
                      </span>
                      <span className="text-fg-muted">{adjustment.reason}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-fg-subtle">{t("adjustmentsNote")}</p>
              </section>
            ) : null}

            <Button
              variant="secondary"
              className="w-full"
              icon={<Icon icon={RotateCcw} size="sm" />}
              href={ASSESSMENT_ROUTES.assessmentStart(result.assessmentId)}
              label={t("tryAgain")}
            />
          </aside>
        </div>
      )}
    </main>
  );
}

function ScoreHeader({ result }: { result: AttemptResult }) {
  const t = useTranslations("learning.result");
  const percent = Math.round((result.score / result.maxScore) * 100);
  return (
    <div className="flex flex-wrap items-center gap-5">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-fg-muted">{t("scoreLabel")}</p>
        <p className="mt-1 text-4xl font-semibold text-fg">
          {t("scoreValue", { score: result.score, max: result.maxScore })}
        </p>
        <ProgressBar isLabelHidden className="mt-3" value={percent} label={t("scoreLabel")} />
        <p className="mt-2 text-xs text-fg-subtle">{t("passMark", { score: result.policy.passScore })}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Badge variant={passTone(result.isPassed)} label={result.isPassed ? t("passed") : t("failed")} />
        <span className="text-xs text-fg-muted">{t("effectiveScore")}</span>
        <span className="text-lg font-semibold text-fg">{result.effectiveScore}</span>
      </div>
    </div>
  );
}

function TabButton({
  icon,
  isActive,
  onClick,
  label,
}: {
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        "-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm",
        isActive
          ? "border-brand font-medium text-fg-brand"
          : "border-transparent text-fg-muted hover:text-fg",
      )}
    >
      <Icon icon={icon} size="sm" />
      {label}
    </button>
  );
}

function QuestionRow({ question, canReveal }: { question: QuestionResult; canReveal: boolean }) {
  const t = useTranslations("learning.result");
  const tOutcomes = useTranslations("learning.answerOutcomes");
  const isPending = question.outcome === ANSWER_OUTCOMES.PENDING;
  return (
    <article className="flex gap-3 rounded-card border border-border p-4">
      <Icon
        icon={OUTCOME_ICONS[question.outcome]}
        size="md"
        className={cn("mt-0.5 shrink-0", OUTCOME_TONES[question.outcome])}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-fg">{question.prompt}</p>
          <span className="shrink-0 text-xs text-fg-muted">
            {t("questionPoints", { earned: question.pointsEarned, possible: question.pointsPossible })}
          </span>
        </div>
        <p className={cn("mt-1 text-xs", OUTCOME_TONES[question.outcome])}>{tOutcomes(question.outcome)}</p>
        {isPending ? (
          <p className="mt-2 text-xs text-fg-muted">{t("pendingNote")}</p>
        ) : canReveal ? (
          <p className="mt-2 text-xs text-fg-muted">{question.feedback}</p>
        ) : (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-fg-subtle">
            <Icon icon={Info} size="sm" />
            {t("feedbackHidden")}
          </p>
        )}
      </div>
    </article>
  );
}

function AttemptHistoryPanel({ rule }: { rule: string }) {
  const t = useTranslations("learning.result");
  const tStates = useTranslations("learning.attemptStates");
  const tStart = useTranslations("learning.attemptStart");
  const dateLabel = useDateLabel();
  const best = Math.max(...HISTORY.filter((a) => a.isCountedTowardsGrade).map((a) => a.score ?? 0));

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-fg-muted">{t("historyNote", { rule })}</p>
      <ul className="flex flex-col gap-2">
        {HISTORY.map((attempt) => (
          <li
            key={attempt.id}
            className={cn(
              "flex flex-wrap items-center gap-3 rounded-card border p-3",
              attempt.score === best && attempt.isCountedTowardsGrade
                ? "border-success bg-success-subtle"
                : "border-border",
            )}
          >
            <span className="text-sm font-medium text-fg">
              {attempt.number > 0 ? tStart("attemptNumber", { number: attempt.number }) : null}
            </span>
            <span className="text-xs text-fg-subtle">{dateLabel(attempt.startedAt, SHORT_DATE)}</span>
            <Badge
              variant={ATTEMPT_STATE_TONES[attempt.state]}
              className="ml-auto"
              label={tStates(attempt.state)}
            />
            <span className="text-sm font-semibold text-fg">{attempt.score ?? null}</span>
            {attempt.isCountedTowardsGrade ? null : (
              <span className="w-full text-xs text-warning">{tStart("notCounted")}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SummaryRow({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-fg-muted">{term}</dt>
      <dd className="font-mono text-fg">{value}</dd>
    </div>
  );
}
