"use client";

import { ArrowLeft, ArrowRight, CircleCheck, Clock, Flag, GraduationCap } from "@/ui/icons/lucide";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ANSWER_LETTERS, QUESTION_STATES } from "@/entities/learning/assessment.constants";
import {
  SAMPLE_ASSESSMENT,
  SAMPLE_ASSESSMENT_OPEN_QUESTION_ID,
} from "@/entities/learning/assessment.fixtures";
import { type AssessmentQuestion } from "@/entities/learning/assessment.types";
import { SAMPLE_LEARNER } from "@/entities/learning/progress.fixtures";
import { Link } from "@/i18n/navigation";
import { LEARNING_ROUTES } from "@/shared/constants/routes/learning.routes";
import { ASSESSMENT_ROUTES } from "@/shared/constants/routes/assessment.routes";
import { Button } from "@astryxdesign/core/Button";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { cn } from "@/ui/lib/cn";
import { Icon } from "@astryxdesign/core/Icon";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { formatClock } from "../shared/learning.format";

/** Keys the footer advertises; they are glyphs, not copy. */
const SHORTCUT_KEYS = { CHOOSE: "1–4", NEXT: "→", FLAG: "F" } as const;

export function AssessmentPage() {
  const t = useTranslations("learning.assessment");
  const assessment = SAMPLE_ASSESSMENT;
  const [currentId, setCurrentId] = useState(SAMPLE_ASSESSMENT_OPEN_QUESTION_ID);
  const [answers, setAnswers] = useState<Readonly<Record<string, number>>>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [flagged, setFlagged] = useState<readonly string[]>(
    assessment.questions.filter((q) => q.state === QUESTION_STATES.FLAGGED).map((q) => q.id),
  );

  const current = assessment.questions.find((question) => question.id === currentId);
  const total = assessment.questions.length;
  const answeredCount =
    assessment.answeredCount + Object.keys(answers).filter((id) => !isSeeded(assessment, id)).length;

  function goToNext() {
    const index = assessment.questions.findIndex((question) => question.id === currentId);
    const next = assessment.questions[index + 1];
    if (next) setCurrentId(next.id);
  }

  function goToPrevious() {
    const index = assessment.questions.findIndex((question) => question.id === currentId);
    const previous = assessment.questions[index - 1];
    if (previous) setCurrentId(previous.id);
  }

  function toggleFlag(id: string) {
    setFlagged((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]));
  }

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-control bg-brand text-on-brand">
                <Icon icon={GraduationCap} size="sm" />
              </span>
              <span className="text-sm font-semibold text-fg">{useBrand()}</span>
            </span>
            <Link
              href={LEARNING_ROUTES.learnCourse("chinese-i-foundations")}
              className="flex items-center gap-1 border-l border-border pl-4 text-sm text-fg-muted hover:text-fg"
            >
              <Icon icon={ArrowLeft} size="sm" />
              {t("backToCourse")}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" label={t("rules")} />
            <span className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-control bg-surface-sunken text-xs font-medium text-fg">
                {SAMPLE_LEARNER.initials}
              </span>
              <span className="text-sm text-fg">{SAMPLE_LEARNER.name}</span>
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-fg-brand uppercase">
              {t("eyebrow", { course: assessment.courseTitle })}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-fg">{assessment.title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-fg-muted">{t("instructions")}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-control bg-success-subtle px-3 py-2 text-sm text-success">
              <Icon icon={CircleCheck} size="sm" />
              {t("savedLocally")}
            </span>
            <span className="flex items-center gap-2 rounded-control bg-info-subtle px-3 py-2">
              <Icon icon={Clock} size="sm" className="text-fg-brand" />
              <span className="flex flex-col leading-tight">
                <span className="text-base font-semibold text-fg">
                  {formatClock(assessment.timeRemainingSeconds)}
                </span>
                <span className="text-xs text-fg-muted">{t("timeRemaining")}</span>
              </span>
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-fg">
            {t("questionPosition", { current: current?.number ?? 1, total })}
          </span>
          <span className="text-sm text-fg-muted">
            {t("questionsViewed", { viewed: current?.number ?? 1, total })}
            {" · "}
            {t("attemptPosition", { current: assessment.attempt, total: assessment.attemptsAllowed })}
          </span>
        </div>
        <ProgressBar
          isLabelHidden
          className="mt-2"
          value={((current?.number ?? 1) / total) * 100}
          label={assessment.title}
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_20rem]">
          {current ? (
            <QuestionCard
              question={current}
              selected={answers[current.id]}
              isFlagged={flagged.includes(current.id)}
              onSelect={(index) => setAnswers((previous) => ({ ...previous, [current.id]: index }))}
              onToggleFlag={() => toggleFlag(current.id)}
              onPrevious={goToPrevious}
              onNext={goToNext}
            />
          ) : null}

          <aside className="flex flex-col gap-4">
            <section className="rounded-card border border-border bg-surface p-4">
              <h2 className="text-sm font-semibold text-fg">{t("navigatorTitle")}</h2>
              <p className="mt-1 text-xs text-fg-muted">{t("navigatorDescription")}</p>
              <ul className="mt-3 grid grid-cols-5 gap-2">
                {assessment.questions.map((question) => {
                  const isCurrent = question.id === currentId;
                  const isFlagged = flagged.includes(question.id);
                  const isAnswered =
                    question.state === QUESTION_STATES.ANSWERED || answers[question.id] !== undefined;
                  return (
                    <li key={question.id}>
                      <button
                        type="button"
                        onClick={() => setCurrentId(question.id)}
                        aria-label={t("goToQuestion", { number: question.number })}
                        aria-current={isCurrent ? "step" : undefined}
                        className={cn(
                          "grid h-9 w-full place-items-center rounded-control border text-sm",
                          isCurrent && "border-brand bg-brand font-medium text-on-brand",
                          !isCurrent && isFlagged && "border-warning bg-warning-subtle text-warning",
                          !isCurrent &&
                            !isFlagged &&
                            isAnswered &&
                            "border-success bg-success-subtle text-success",
                          !isCurrent &&
                            !isFlagged &&
                            !isAnswered &&
                            "border-border text-fg-muted hover:bg-surface-hover",
                        )}
                      >
                        {question.number}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <ul className="mt-3 flex flex-wrap gap-3 text-xs text-fg-muted">
                <LegendItem toneClassName="bg-success" label={t("legendAnswered")} />
                <LegendItem toneClassName="bg-brand" label={t("legendCurrent")} />
                <LegendItem toneClassName="bg-warning" label={t("legendFlagged")} />
              </ul>
            </section>

            <section className="rounded-card border border-border bg-surface p-4">
              <h2 className="text-sm font-semibold text-fg">{t("attemptTitle")}</h2>
              <dl className="mt-3 flex flex-col gap-2.5 text-sm">
                <SummaryRow term={t("answered")} value={t("answeredOf", { done: answeredCount, total })} />
                <SummaryRow term={t("flaggedForReview")} value={flagged.length} />
                <SummaryRow term={t("attemptsAllowed")} value={assessment.attemptsAllowed} />
                <SummaryRow term={t("submission")} value={t("notSubmitted")} isStrong />
              </dl>
              <Button
                variant="secondary"
                className="mt-4 w-full"
                onClick={() => setIsConfirmOpen(true)}
                endContent={<Icon icon={ArrowRight} size="sm" />}
                label={t("submit")}
              />
            </section>
          </aside>
        </div>
      </main>

      <SubmitConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        assessmentId={assessment.id}
        answered={answeredCount}
        total={total}
      />

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs text-fg-subtle md:px-6">
          <span>{t("footerNote")}</span>
          <span className="flex flex-wrap items-center gap-3">
            <span>{t("shortcutsLabel")}</span>
            <Shortcut keyLabel={SHORTCUT_KEYS.CHOOSE} label={t("shortcutChoose")} />
            <Shortcut keyLabel={SHORTCUT_KEYS.NEXT} label={t("shortcutNext")} />
            <Shortcut keyLabel={SHORTCUT_KEYS.FLAG} label={t("shortcutFlag")} />
          </span>
        </div>
      </footer>
    </div>
  );
}

function useBrand() {
  return useTranslations("learning.shell")("brand");
}

function isSeeded(assessment: typeof SAMPLE_ASSESSMENT, id: string): boolean {
  return assessment.questions.some(
    (question) => question.id === id && question.state === QUESTION_STATES.ANSWERED,
  );
}

function QuestionCard({
  question,
  selected,
  isFlagged,
  onSelect,
  onToggleFlag,
  onPrevious,
  onNext,
}: {
  question: AssessmentQuestion;
  selected: number | undefined;
  isFlagged: boolean;
  onSelect: (index: number) => void;
  onToggleFlag: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const t = useTranslations("learning.assessment");
  const numberLabel = question.number.toString().padStart(2, "0");

  return (
    <section className="rounded-card border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-control bg-surface-sunken px-2 py-1 text-xs font-medium text-fg-muted">
          {numberLabel}
        </span>
        <span className="rounded-control bg-surface-sunken px-2 py-1 text-xs text-fg-muted">
          {t("questionType")}
        </span>
        <span className="text-xs text-fg-subtle">{t("points", { count: question.points })}</span>
      </div>

      <h2 className="mt-4 text-xl font-semibold text-fg">{question.prompt}</h2>
      <p className="mt-2 text-sm text-fg-subtle">{t("selectHint")}</p>

      <ul className="mt-5 flex flex-col gap-3">
        {question.options.map((option, index) => {
          const isSelected = selected === index;
          return (
            <li key={option}>
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-pressed={isSelected}
                className={cn(
                  "flex w-full items-center gap-4 rounded-card border px-4 py-4 text-left transition-colors duration-fast ease-standard",
                  isSelected
                    ? "border-brand bg-info-subtle"
                    : "border-border hover:border-border-strong hover:bg-surface-hover",
                )}
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-control border text-xs font-medium",
                    isSelected ? "border-brand bg-brand text-on-brand" : "border-border text-fg-muted",
                  )}
                >
                  {ANSWER_LETTERS[index]}
                </span>
                <span lang={question.optionsLang} className="text-base text-fg">
                  {option}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={onPrevious}
            icon={<Icon icon={ArrowLeft} size="sm" />}
            label={t("previous")}
          />
          <Button
            variant={isFlagged ? "primary" : "secondary"}
            onClick={onToggleFlag}
            icon={<Icon icon={Flag} size="sm" />}
            label={isFlagged ? t("unflag") : t("flag")}
          />
        </div>
        <Button
          variant="primary"
          onClick={onNext}
          endContent={<Icon icon={ArrowRight} size="sm" />}
          label={t("saveAndNext")}
        />
      </div>
    </section>
  );
}

function LegendItem({ toneClassName, label }: { toneClassName: string; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className={cn("size-2 rounded-control", toneClassName)} />
      {label}
    </li>
  );
}

function SummaryRow({ term, value, isStrong }: { term: string; value: string | number; isStrong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-2.5 last:border-b-0 last:pb-0">
      <dt className="text-fg-muted">{term}</dt>
      <dd className={cn(isStrong ? "font-semibold text-fg" : "text-fg")}>{value}</dd>
    </div>
  );
}

function Shortcut({ keyLabel, label }: { keyLabel: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <kbd className="rounded-control border border-border px-1.5 py-0.5 text-fg-muted">{keyLabel}</kbd>
      {label}
    </span>
  );
}

/** Submitting ends the attempt, so it asks first and says exactly what is still blank. */
function SubmitConfirmDialog({
  open,
  onOpenChange,
  assessmentId,
  answered,
  total,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentId: string;
  answered: number;
  total: number;
}) {
  const t = useTranslations("learning.submitConfirm");
  const unanswered = total - answered;
  return (
    <Dialog isOpen={open} onOpenChange={onOpenChange} purpose="form" width={460}>
      <DialogHeader
        title={t("title")}
        subtitle={t("description", { answered, total })}
        onOpenChange={onOpenChange}
      />
      <div className="px-6 py-5">
        {unanswered > 0 ? (
          <p className="text-sm text-warning">{t("unanswered", { count: unanswered })}</p>
        ) : null}
      </div>
      <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
        {
          <>
            <Button variant="secondary" onClick={() => onOpenChange(false)} label={t("cancel")} />
            <Button
              variant="primary"
              href={ASSESSMENT_ROUTES.assessmentResult(assessmentId, "attempt-2")}
              label={t("confirm")}
            />
          </>
        }
      </div>
    </Dialog>
  );
}
