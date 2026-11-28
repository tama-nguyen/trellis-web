"use client";

import { ArrowRight, CircleCheck, Info } from "@/ui/icons/lucide";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { type CourseEdition } from "@/entities/learning/course.types";
import { ENROLMENT_RESULTS, type EnrolmentResult } from "@/entities/learning/learning.constants";
import { LEARNING_ROUTES } from "@/shared/constants/routes/learning.routes";
import { Button } from "@astryxdesign/core/Button";
import { cn } from "@/ui/lib/cn";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Icon } from "@astryxdesign/core/Icon";

export type EnrolDialogProps = {
  courseTitle: string;
  courseSlug: string;
  /** `null` closes the dialog; the edition is what the learner picked. */
  edition: CourseEdition | null;
  isAlreadyEnrolled: boolean;
  onOpenChange: (open: boolean) => void;
  onEnrolled: () => void;
};

/**
 * M2 — enrolment. Enrolling twice is the interesting case: BR-01 says the server returns the same
 * enrolment, so the second confirm reports `alreadyEnrolled` and creates nothing, rather than
 * looking like a second success.
 */
export function EnrolDialog({
  courseTitle,
  courseSlug,
  edition,
  isAlreadyEnrolled,
  onOpenChange,
  onEnrolled,
}: EnrolDialogProps) {
  const t = useTranslations("learning.enrol");
  const [result, setResult] = useState<EnrolmentResult | null>(null);

  function confirm() {
    if (!edition) return;
    if (!edition.isOpen) {
      setResult(ENROLMENT_RESULTS.EDITION_CLOSED);
      return;
    }
    if (edition.seatsTaken >= edition.seatsTotal) {
      setResult(ENROLMENT_RESULTS.EDITION_FULL);
      return;
    }
    setResult(isAlreadyEnrolled ? ENROLMENT_RESULTS.ALREADY_ENROLLED : ENROLMENT_RESULTS.CREATED);
    onEnrolled();
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) setResult(null);
    onOpenChange(open);
  };

  const isDone = result === ENROLMENT_RESULTS.CREATED || result === ENROLMENT_RESULTS.ALREADY_ENROLLED;

  return (
    <Dialog isOpen={edition !== null} onOpenChange={handleOpenChange} purpose="form" width={460}>
      <DialogHeader
        title={t("title", { course: courseTitle })}
        subtitle={
          edition ? t("description", { edition: edition.label, version: edition.version }) : undefined
        }
        onOpenChange={handleOpenChange}
      />
      <div className="px-6 py-5">
        {result === null ? (
          <p className="flex items-start gap-2 text-sm text-fg-muted">
            <Icon icon={Info} size="sm" className="mt-0.5 text-fg-subtle" />
            {t("policyNote")}
          </p>
        ) : (
          <ResultMessage result={result} />
        )}
      </div>
      <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
        {isDone ? (
          <Button
            variant="primary"
            endContent={<Icon icon={ArrowRight} size="sm" />}
            href={LEARNING_ROUTES.learnCourse(courseSlug)}
            label={t("startLearning")}
          />
        ) : (
          <>
            <Button variant="secondary" onClick={() => onOpenChange(false)} label={t("cancel")} />
            <Button variant="primary" onClick={confirm} label={t("confirm")} />
          </>
        )}
      </div>
    </Dialog>
  );
}

function ResultMessage({ result }: { result: EnrolmentResult }) {
  const t = useTranslations("learning.enrol");
  const isGood = result === ENROLMENT_RESULTS.CREATED || result === ENROLMENT_RESULTS.ALREADY_ENROLLED;
  return (
    <p className={cn("flex items-start gap-2 text-sm", isGood ? "text-success" : "text-danger")}>
      <Icon icon={CircleCheck} size="sm" className="mt-0.5" />
      {t(result)}
    </p>
  );
}
