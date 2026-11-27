"use client";

import { useDateLabel } from "@/features/learning/hooks/useDateLabel";
import { ChevronRight, FileText } from "@/ui/icons/lucide";
import { useTranslations } from "next-intl";
import { LEARNER_NOTES } from "@/entities/learning/library.fixtures";
import { Link } from "@/i18n/navigation";
import { LEARNING_ROUTES } from "@/shared/constants/routes/learning.routes";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { Prose } from "@/ui/primitives/Prose";
import { SHORT_DATE } from "../shared/learning.format";
import { PageHeading } from "../shell/PageHeading";

export function NotesPage() {
  const t = useTranslations("learning.notesPage");
  const dateLabel = useDateLabel();
  const notes = LEARNER_NOTES;

  return (
    <div className="flex flex-col gap-4">
      <PageHeading title={t("title")} description={t("description")} />

      {notes.length === 0 ? (
        <EmptyState
          icon={<Icon icon={FileText} size="lg" />}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {notes.map((note) => (
            <li key={note.id}>
              <article className="rounded-card border border-border bg-surface p-5">
                <header className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-fg">{note.lessonTitle}</h2>
                    <p className="text-xs text-fg-muted">{note.courseTitle}</p>
                  </div>
                  <span className="text-xs text-fg-subtle">
                    {t("updated", { date: dateLabel(note.updatedAt, SHORT_DATE) })}
                  </span>
                </header>
                <Prose className="mt-3 text-sm">
                  <ul>
                    {note.body.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </Prose>
                <Link
                  href={LEARNING_ROUTES.learnCourse("english-everyday-communication")}
                  className="mt-3 inline-flex items-center gap-1 text-sm text-fg-brand hover:text-brand-hover"
                >
                  {t("openLesson")}
                  <Icon icon={ChevronRight} size="sm" />
                </Link>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
