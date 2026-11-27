"use client";

import {
  Bold,
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleCheck,
  CirclePlay,
  Clock,
  Download,
  FileText,
  Highlighter,
  Home,
  Italic,
  Link2,
  List,
  Lock,
  ListOrdered,
  Maximize,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Play,
  Settings,
  Signal,
  SkipBack,
  SkipForward,
  Target,
  Underline,
} from "@/ui/icons/lucide";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { COURSE_DETAIL, COURSE_MODULE_LESSON_COUNTS } from "@/entities/learning/course.fixtures";
import { type Lesson } from "@/entities/learning/course.types";
import {
  LESSON_LOCK_REASONS,
  LESSON_STATES,
  LESSON_TABS,
  type LessonState,
  type LessonTab,
} from "@/entities/learning/learning.constants";
import { Link } from "@/i18n/navigation";
import { LEARNING_ROUTES } from "@/shared/constants/routes/learning.routes";
import { Button } from "@astryxdesign/core/Button";
import { cn } from "@/ui/lib/cn";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { Prose } from "@/ui/primitives/Prose";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { CourseArtwork } from "../shared/CourseArtwork";
import { formatClock, toMegabytes } from "../shared/learning.format";

const LESSON_STATE_ICONS: Record<LessonState, LucideIcon> = {
  [LESSON_STATES.COMPLETED]: CircleCheck,
  [LESSON_STATES.IN_PROGRESS]: CirclePlay,
  [LESSON_STATES.NOT_STARTED]: Circle,
  [LESSON_STATES.LOCKED]: Lock,
};

const LESSON_STATE_TONES: Record<LessonState, string> = {
  [LESSON_STATES.COMPLETED]: "text-success",
  [LESSON_STATES.IN_PROGRESS]: "text-fg-brand",
  [LESSON_STATES.NOT_STARTED]: "text-fg-subtle",
  [LESSON_STATES.LOCKED]: "text-fg-subtle",
};

/** Seconds already played, for the progress bar under the player. */
const PLAYHEAD_SECONDS = 30;

const FORMAT_BUTTONS: readonly {
  key: "bold" | "italic" | "underline" | "bulletList" | "numberedList" | "link" | "highlight";
  icon: LucideIcon;
}[] = [
  { key: "bold", icon: Bold },
  { key: "italic", icon: Italic },
  { key: "underline", icon: Underline },
  { key: "bulletList", icon: List },
  { key: "numberedList", icon: ListOrdered },
  { key: "link", icon: Link2 },
  { key: "highlight", icon: Highlighter },
];

export function CoursePlayerPage() {
  const t = useTranslations("learning.player");
  const course = COURSE_DETAIL;
  const [openModuleId, setOpenModuleId] = useState<string | null>(course.modules[0]?.id ?? null);
  const [tab, setTab] = useState<LessonTab>(LESSON_TABS.NOTES);
  const [selectedLessonId, setSelectedLessonId] = useState(course.currentLessonId);
  // Marking a lesson complete is local to the mock; the server owns it for real (see `complete.note`).
  const [completedIds, setCompletedIds] = useState<readonly string[]>([]);

  const lessons = course.modules.flatMap((module) => module.lessons);
  const currentLesson = lessons.find((lesson) => lesson.id === selectedLessonId);
  const isCurrentComplete =
    currentLesson !== undefined &&
    (currentLesson.state === LESSON_STATES.COMPLETED || completedIds.includes(currentLesson.id));

  const completedCount =
    Math.round((course.percentComplete / 100) * course.lessonCount) + completedIds.length;

  // Derived, not three constants: the outline only lists some of the lessons, so everything the
  // fixture does not spell out is counted as not started.
  const listed = lessons.filter((lesson) => lesson.state !== LESSON_STATES.NOT_STARTED);
  const lessonStateCounts: Record<LessonState, number> = {
    [LESSON_STATES.COMPLETED]: completedCount,
    [LESSON_STATES.IN_PROGRESS]: lessons.filter((l) => l.state === LESSON_STATES.IN_PROGRESS).length,
    [LESSON_STATES.LOCKED]: lessons.filter((l) => l.state === LESSON_STATES.LOCKED).length,
    [LESSON_STATES.NOT_STARTED]: Math.max(0, course.lessonCount - completedCount - listed.length),
  };

  return (
    <div className="flex flex-col gap-4">
      <nav aria-label={t("breadcrumbLabel")} className="flex items-center gap-1.5 text-sm text-fg-muted">
        <Link href={LEARNING_ROUTES.learn} aria-label={t("breadcrumbHome")} className="hover:text-fg">
          <Icon icon={Home} size="sm" />
        </Link>
        <Icon icon={ChevronRight} size="sm" className="text-fg-subtle" />
        <Link href={LEARNING_ROUTES.catalog} className="hover:text-fg">
          {t("breadcrumbMyCourses")}
        </Link>
        <Icon icon={ChevronRight} size="sm" className="text-fg-subtle" />
        <span className="truncate text-fg">{course.title}</span>
      </nav>

      <div className="grid gap-4 xl:grid-cols-[18rem_1fr_18rem]">
        <aside className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
          <div className="flex gap-3">
            <CourseArtwork
              art={course.art}
              title={course.title}
              className="size-12 shrink-0 rounded-control"
            />
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-fg">{course.title}</h1>
              <p className="mt-1 flex items-center gap-1 text-xs text-fg-muted">
                <Icon icon={Signal} size="xsm" />
                {useLevelLabel(course.level)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ProgressBar isLabelHidden value={course.percentComplete} label={course.title} />
            <span className="shrink-0 text-xs text-fg-muted">
              {t("percentComplete", { percent: course.percentComplete })}
            </span>
          </div>

          <ul aria-label={t("outlineLabel")} className="mt-1 flex flex-col gap-1">
            {course.modules.map((module, index) => {
              const total = COURSE_MODULE_LESSON_COUNTS[module.id] ?? module.lessons.length;
              const done = module.lessons.filter((lesson) => lesson.state === LESSON_STATES.COMPLETED).length;
              const isOpen = openModuleId === module.id;
              return (
                <li key={module.id} className="rounded-control border border-border">
                  <button
                    type="button"
                    onClick={() => setOpenModuleId(isOpen ? null : module.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left"
                  >
                    <span className="rounded-control bg-surface-sunken px-1.5 py-0.5 text-xs text-fg-muted">
                      {t("moduleNumber", { number: index + 1 })}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-fg">
                      {module.title}
                    </span>
                    <span className="shrink-0 text-xs text-fg-subtle">
                      {t("moduleLessons", { done, total })}
                    </span>
                    <Icon
                      icon={ChevronDown}
                      size="sm"
                      className={cn(
                        "text-fg-subtle transition-transform duration-fast",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>
                  {isOpen && module.lessons.length > 0 ? (
                    <ul className="flex flex-col gap-0.5 p-1">
                      {module.lessons.map((lesson) => (
                        <LessonRow
                          key={lesson.id}
                          lesson={lesson}
                          isCurrent={lesson.id === selectedLessonId}
                          isDone={completedIds.includes(lesson.id)}
                          onSelect={() => setSelectedLessonId(lesson.id)}
                        />
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="flex min-w-0 flex-col gap-4">
          {currentLesson?.state === LESSON_STATES.LOCKED ? (
            <LockedStage lesson={currentLesson} />
          ) : currentLesson?.body ? (
            <ReadingStage body={currentLesson.body} />
          ) : (
            <VideoStage
              title={currentLesson?.title ?? course.title}
              durationSeconds={currentLesson?.durationSeconds ?? 0}
            />
          )}

          <section className="rounded-card border border-border bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-2xl font-semibold text-fg">{currentLesson?.title ?? course.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-fg-muted">
                  <span className="flex items-center gap-1.5">
                    <Icon icon={FileText} size="sm" />
                    {t("lessonPosition", { number: course.currentLessonNumber, total: course.lessonCount })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icon icon={Clock} size="sm" />
                    {formatClock(currentLesson?.durationSeconds ?? 0)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icon icon={Signal} size="sm" />
                    {useLevelLabel(course.level)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={t("bookmark")}
                  className="grid size-10 place-items-center rounded-control border border-border text-fg-muted hover:bg-surface-hover hover:text-fg"
                >
                  <Icon icon={Bookmark} size="sm" />
                </button>
                {currentLesson?.state === LESSON_STATES.LOCKED ? null : (
                  <CompleteLessonButton
                    isDone={isCurrentComplete}
                    onComplete={() =>
                      setCompletedIds((ids) =>
                        currentLesson && !ids.includes(currentLesson.id) ? [...ids, currentLesson.id] : ids,
                      )
                    }
                  />
                )}
                <Button
                  variant="secondary"
                  endContent={<Icon icon={ChevronRight} size="sm" />}
                  label={t("nextLesson")}
                />
              </div>
            </div>

            <div
              role="tablist"
              aria-label={t("outlineLabel")}
              className="mt-5 flex gap-1 border-b border-border"
            >
              {Object.values(LESSON_TABS).map((value) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={tab === value}
                  onClick={() => setTab(value)}
                  className={cn(
                    "-mb-px rounded-t-control border-b-2 px-4 py-2 text-sm",
                    tab === value
                      ? "border-brand font-medium text-fg-brand"
                      : "border-transparent text-fg-muted hover:text-fg",
                  )}
                >
                  {t(`tabs.${value}`)}
                </button>
              ))}
            </div>

            <div className="pt-5">
              {tab === LESSON_TABS.NOTES ? <NotesPanel notes={course.notes} /> : null}
              {tab === LESSON_TABS.OVERVIEW ? (
                <p className="text-sm text-fg-muted">{t("overviewBody")}</p>
              ) : null}
              {tab === LESSON_TABS.RESOURCES ? <ResourceList /> : null}
              {tab === LESSON_TABS.QNA ? (
                <EmptyState
                  icon={<Icon icon={MessageSquare} size="lg" />}
                  title={t("qnaEmptyTitle")}
                  description={t("qnaEmptyDescription")}
                />
              ) : null}
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-4">
          <section className="rounded-card border border-border bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-fg">{t("progressTitle")}</h2>
              <span className="text-sm font-semibold text-fg">{course.percentComplete}%</span>
            </div>
            <ProgressBar
              isLabelHidden
              className="mt-3"
              value={course.percentComplete}
              label={t("progressTitle")}
            />
            <p className="mt-2 text-xs text-fg-muted">
              {t("lessonsCompleted", { done: completedCount, total: course.lessonCount })}
            </p>
          </section>

          <section className="rounded-card border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold text-fg">{t("lessonStatusTitle")}</h2>
            <ul className="mt-3 flex flex-col gap-2.5">
              {Object.values(LESSON_STATES).map((state) => (
                <LessonStatusRow key={state} state={state} count={lessonStateCounts[state]} />
              ))}
            </ul>
          </section>

          <section className="rounded-card border border-border bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
                <Icon icon={Target} size="sm" className="text-fg-brand" />
                {t("goalsTitle")}
              </h2>
              <button type="button" aria-label={t("editGoals")} className="text-fg-subtle hover:text-fg">
                <Icon icon={Pencil} size="sm" />
              </button>
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {course.goals.map((goal) => (
                <li key={goal.key} className="flex items-center gap-2 text-sm">
                  <span
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded-control border",
                      goal.isDone ? "border-brand bg-brand text-on-brand" : "border-border-strong",
                    )}
                  >
                    {goal.isDone ? <Icon icon={Check} size="xsm" /> : null}
                  </span>
                  <span className={cn(goal.isDone ? "text-fg" : "text-fg-muted")}>
                    {t(`goals.${goal.key}`)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-card border border-border bg-surface p-4">
            <h2 className="mb-3 text-sm font-semibold text-fg">{t("resourcesTitle")}</h2>
            <ResourceList />
          </section>
        </aside>
      </div>
    </div>
  );
}

function useLevelLabel(level: string) {
  return useTranslations("learning.levels")(level as never);
}

function LessonRow({
  lesson,
  isCurrent,
  isDone,
  onSelect,
}: {
  lesson: Lesson;
  isCurrent: boolean;
  isDone: boolean;
  onSelect: () => void;
}) {
  const state = isDone ? LESSON_STATES.COMPLETED : lesson.state;
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={isCurrent ? "step" : undefined}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-control px-2 py-2 text-left hover:bg-surface-hover",
          isCurrent && "bg-info-subtle",
        )}
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-control bg-surface text-fg-brand">
          <Icon icon={lesson.state === LESSON_STATES.LOCKED ? Lock : Play} size="sm" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-fg">{lesson.title}</span>
          <span className="block text-xs text-fg-subtle">{formatClock(lesson.durationSeconds)}</span>
        </span>
        <Icon icon={LESSON_STATE_ICONS[state]} size="sm" className={LESSON_STATE_TONES[state]} />
      </button>
    </li>
  );
}

function LessonStatusRow({ state, count }: { state: LessonState; count: number }) {
  const t = useTranslations("learning.lessonStates");
  return (
    <li className="flex items-center gap-2.5 text-sm">
      <Icon icon={LESSON_STATE_ICONS[state]} size="md" className={LESSON_STATE_TONES[state]} />
      <span className="flex-1 text-fg-muted">{t(state)}</span>
      <span className="font-medium text-fg">{count}</span>
    </li>
  );
}

function VideoStage({ title, durationSeconds }: { title: string; durationSeconds: number }) {
  const t = useTranslations("learning.player");
  const percent = durationSeconds > 0 ? (PLAYHEAD_SECONDS / durationSeconds) * 100 : 0;
  return (
    <section className="overflow-hidden rounded-card border border-border bg-surface">
      <div className="relative grid aspect-video place-items-center bg-surface-sunken">
        <p className="max-w-xs px-6 text-center text-sm text-fg-subtle">{t("videoPlaceholder")}</p>
        <button
          type="button"
          aria-label={t("playLesson")}
          className="absolute grid size-16 place-items-center rounded-dialog bg-surface/90 text-fg shadow-raised"
        >
          <Icon icon={Play} size="lg" />
        </button>
      </div>
      <div className="flex flex-col gap-2 border-t border-border p-3">
        <div className="flex items-center gap-3">
          <span className="text-xs text-fg-muted">
            {`${formatClock(PLAYHEAD_SECONDS)} / ${formatClock(durationSeconds)}`}
          </span>
          <ProgressBar isLabelHidden value={percent} label={title} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-fg-muted">
            <PlayerButton icon={SkipBack} label={t("previousLesson")} />
            <PlayerButton icon={Play} label={t("playLesson")} />
            <PlayerButton icon={SkipForward} label={t("nextLesson")} />
          </div>
          <div className="flex items-center gap-1 text-fg-muted">
            <PlayerButton icon={Settings} label={t("tabs.overview")} />
            <PlayerButton icon={Maximize} label={t("playLesson")} />
          </div>
        </div>
      </div>
    </section>
  );
}

function PlayerButton({ icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid size-8 place-items-center rounded-control hover:bg-surface-hover hover:text-fg"
    >
      <Icon icon={icon} size="sm" />
    </button>
  );
}

function NotesPanel({ notes }: { notes: readonly string[] }) {
  const t = useTranslations("learning.player");
  return (
    <div className="rounded-card border border-border">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <h3 className="text-sm font-semibold text-fg">{t("notesTitle")}</h3>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-success">
            <Icon icon={CircleCheck} size="sm" />
            {t("notesSaved")}
          </span>
          <button type="button" aria-label={t("notesMenu")} className="text-fg-subtle hover:text-fg">
            <Icon icon={MoreHorizontal} size="sm" />
          </button>
        </div>
      </div>
      <div
        role="toolbar"
        aria-label={t("notesToolbarLabel")}
        className="flex items-center gap-1 border-b border-border px-3 py-1.5 text-fg-muted"
      >
        {FORMAT_BUTTONS.map((button) => (
          <button
            key={button.key}
            type="button"
            aria-label={t(`format.${button.key}`)}
            className="grid size-7 place-items-center rounded-control hover:bg-surface-hover hover:text-fg"
          >
            <Icon icon={button.icon} size="sm" />
          </button>
        ))}
      </div>
      <ul className="flex list-disc flex-col gap-2 px-8 py-4 text-sm text-fg">
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </div>
  );
}

function ResourceList() {
  const t = useTranslations("learning.player");
  const tUnits = useTranslations("learning.units");
  return (
    <ul className="flex flex-col gap-2">
      {COURSE_DETAIL.resources.map((resource) => (
        <li key={resource.id}>
          <button
            type="button"
            aria-label={t("openResource", { title: resource.title })}
            className="flex w-full items-center gap-3 rounded-control border border-border px-3 py-2 text-left hover:bg-surface-hover"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-control bg-danger-subtle text-danger">
              <Icon icon={FileText} size="sm" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-fg">{resource.title}</span>
              <span className="block text-xs text-fg-subtle">
                {tUnits("fileSize", { size: toMegabytes(resource.sizeBytes) })}
              </span>
            </span>
            <Icon icon={Download} size="sm" className="text-fg-subtle" />
          </button>
        </li>
      ))}
    </ul>
  );
}

/** M5: the only control that records progress, so it states where completion actually lives. */
function CompleteLessonButton({ isDone, onComplete }: { isDone: boolean; onComplete: () => void }) {
  const t = useTranslations("learning.complete");
  if (isDone) {
    return (
      <span className="flex items-center gap-1.5 rounded-control bg-success-subtle px-3 py-2 text-sm text-success">
        <Icon icon={CircleCheck} size="sm" />
        {t("done")}
      </span>
    );
  }
  return (
    <Button
      variant="primary"
      onClick={onComplete}
      icon={<Icon icon={Check} size="sm" />}
      label={t("action")}
    />
  );
}

/** M5: a reading lesson has no player, so the stage is the text itself. */
function ReadingStage({ body }: { body: readonly string[] }) {
  return (
    <section className="rounded-card border border-border bg-surface p-6">
      <Prose>
        {body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </Prose>
    </section>
  );
}

/** M6: a padlock on its own tells the learner nothing; the reason and the way out are the point. */
function LockedStage({ lesson }: { lesson: Lesson }) {
  const t = useTranslations("learning.lock");
  const lock = lesson.lock;
  if (!lock) return null;
  return (
    <section className="grid aspect-video place-items-center rounded-card border border-border bg-surface-sunken p-6">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <span className="grid size-12 place-items-center rounded-card bg-surface text-fg-subtle">
          <Icon icon={Lock} size="lg" />
        </span>
        <h3 className="text-base font-semibold text-fg">{t("title")}</h3>
        <p className="text-sm text-fg-muted">
          {lock.reason === LESSON_LOCK_REASONS.PASS_SCORE
            ? t("passScore", { lesson: lock.requiredLessonTitle, score: lock.requiredScore ?? 0 })
            : t("prerequisite", { lesson: lock.requiredLessonTitle })}
        </p>
      </div>
    </section>
  );
}
