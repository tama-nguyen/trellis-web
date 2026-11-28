"use client";

import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  ClipboardCheck,
  Clock,
  Eye,
  FileText,
  Folder,
  GripVertical,
  Globe,
  Link2,
  MoreHorizontal,
  Play,
  Plus,
  Settings,
  Trash2,
  Upload,
  X,
} from "@/ui/icons/lucide";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LESSON_KINDS, type LessonKind } from "@/entities/learning/learning.constants";
import {
  LESSON_EDITOR_TABS,
  type LessonEditorTab,
  STUDIO_TABS,
  type StudioTab,
} from "@/entities/learning/studio.constants";
import { STUDIO_COURSE, STUDIO_MODULE_LESSON_COUNTS } from "@/entities/learning/studio.fixtures";
import { type StudioLesson, type StudioModule } from "@/entities/learning/studio.types";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { cn } from "@/ui/lib/cn";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { Selector } from "@astryxdesign/core/Selector";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { STUDIO_ROUTES } from "@/shared/constants/routes/studio.routes";
import { CourseArtwork } from "../shared/CourseArtwork";
import { StudioDetailsTab } from "./StudioDetailsTab";
import { StudioSettingsTab } from "./StudioSettingsTab";
import { formatClock, toMegabytes } from "../shared/learning.format";
import { PUBLISH_TONES, TAG_TONE } from "../shared/learning.tones";

const LESSON_KIND_ICONS: Record<LessonKind, LucideIcon> = {
  [LESSON_KINDS.VIDEO]: Play,
  [LESSON_KINDS.READING]: FileText,
  [LESSON_KINDS.PRACTICE]: ClipboardCheck,
};

const STUDIO_TAB_ICONS: Record<StudioTab, LucideIcon> = {
  [STUDIO_TABS.CONTENT]: Folder,
  [STUDIO_TABS.DETAILS]: FileText,
  [STUDIO_TABS.SETTINGS]: Settings,
  [STUDIO_TABS.ANALYTICS]: BarChart3,
};

const EDITOR_TAB_ICONS: Record<LessonEditorTab, LucideIcon> = {
  [LESSON_EDITOR_TABS.DETAILS]: FileText,
  [LESSON_EDITOR_TABS.CONTENT]: Play,
  [LESSON_EDITOR_TABS.RESOURCES]: Link2,
  [LESSON_EDITOR_TABS.ASSESSMENT]: ClipboardCheck,
};

export function CourseStudioPage() {
  const t = useTranslations("learning.studio");
  const tUnits = useTranslations("learning.units");
  const course = STUDIO_COURSE;
  const [tab, setTab] = useState<StudioTab>(STUDIO_TABS.CONTENT);
  const [openModuleId, setOpenModuleId] = useState<string | null>(course.modules[0]?.id ?? null);
  const [selectedLessonId, setSelectedLessonId] = useState(course.openLesson.id);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-4 rounded-card border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center gap-4">
          <CourseArtwork art={course.art} title={course.title} className="size-16 shrink-0 rounded-control" />
          <div className="min-w-0 flex-1 basis-64">
            <h1 className="text-2xl font-semibold text-fg">{course.title}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <Badge
                variant={PUBLISH_TONES[course.publishState]}
                label={usePublishLabel(course.publishState)}
              />
              <span className="flex items-center gap-1.5 text-sm text-fg-muted">
                {tUnits("savedAgo", { count: course.savedMinutesAgo })}
                <Icon icon={CircleCheck} size="sm" className="text-success" />
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={<Icon icon={Eye} size="sm" />} label={t("preview")} />
            <Button variant="secondary" label={t("saveDraft")} />
            <Button
              variant="primary"
              icon={<Icon icon={Upload} size="sm" />}
              href={STUDIO_ROUTES.studioPublish(course.slug)}
              label={t("publish")}
            />
          </div>
        </div>

        <div
          role="tablist"
          aria-label={t("outlineTitle")}
          className="-mb-5 flex gap-1 border-b border-border"
        >
          {Object.values(STUDIO_TABS).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={cn(
                "-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm",
                tab === value
                  ? "border-brand font-medium text-fg-brand"
                  : "border-transparent text-fg-muted hover:text-fg",
              )}
            >
              <Icon icon={STUDIO_TAB_ICONS[value]} size="sm" />
              {t(`tabs.${value}`)}
            </button>
          ))}
        </div>
      </header>

      {tab === STUDIO_TABS.DETAILS ? <StudioDetailsTab /> : null}
      {tab === STUDIO_TABS.SETTINGS ? <StudioSettingsTab /> : null}
      {tab === STUDIO_TABS.CONTENT ? (
        <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
          <Outline
            modules={course.modules}
            openModuleId={openModuleId}
            selectedLessonId={selectedLessonId}
            onToggleModule={(id) => setOpenModuleId(openModuleId === id ? null : id)}
            onSelectLesson={setSelectedLessonId}
          />
          <LessonEditor />
        </div>
      ) : null}
      {tab === STUDIO_TABS.ANALYTICS ? (
        <EmptyState
          icon={<Icon icon={STUDIO_TAB_ICONS[tab]} size="lg" />}
          title={t("comingSoonTitle")}
          description={t("comingSoonDescription")}
        />
      ) : null}
    </div>
  );
}

function usePublishLabel(state: string) {
  return useTranslations("learning.studio")(`publishStates.${state}` as never);
}

function Outline({
  modules,
  openModuleId,
  selectedLessonId,
  onToggleModule,
  onSelectLesson,
}: {
  modules: readonly StudioModule[];
  openModuleId: string | null;
  selectedLessonId: string;
  onToggleModule: (id: string) => void;
  onSelectLesson: (id: string) => void;
}) {
  const t = useTranslations("learning.studio");
  return (
    <section className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-fg">{t("outlineTitle")}</h2>
        <button
          type="button"
          aria-label={t("addToOutline")}
          className="grid size-8 place-items-center rounded-control border border-border text-fg-muted hover:bg-surface-hover hover:text-fg"
        >
          <Icon icon={Plus} size="sm" />
        </button>
      </div>

      <ul className="flex flex-col">
        {modules.map((module) => {
          const isOpen = openModuleId === module.id;
          const lessonCount = STUDIO_MODULE_LESSON_COUNTS[module.id] ?? module.lessons.length;
          return (
            <li key={module.id} className="border-b border-border py-1 last:border-b-0">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onToggleModule(module.id)}
                  aria-expanded={isOpen}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-control px-1.5 py-2 text-left hover:bg-surface-hover"
                >
                  <Icon icon={isOpen ? ChevronDown : ChevronRight} size="sm" className="text-fg-subtle" />
                  <Icon icon={Folder} size="sm" className="text-fg-subtle" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-fg">
                      {t("moduleTitle", { number: module.number, title: module.title })}
                    </span>
                    <span className="block text-xs text-fg-subtle">
                      {t("moduleMeta", { lessons: lessonCount, minutes: module.durationMinutes })}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={t("moduleMenu")}
                  className="grid size-7 shrink-0 place-items-center rounded-control text-fg-subtle hover:bg-surface-hover hover:text-fg"
                >
                  <Icon icon={MoreHorizontal} size="sm" />
                </button>
              </div>

              {isOpen && module.lessons.length > 0 ? (
                <ul className="flex flex-col gap-0.5 pl-6">
                  {module.lessons.map((lesson) => (
                    <OutlineLesson
                      key={lesson.id}
                      lesson={lesson}
                      isSelected={lesson.id === selectedLessonId}
                      onSelect={() => onSelectLesson(lesson.id)}
                    />
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>

      <Button
        variant="secondary"
        className="w-full border-dashed"
        icon={<Icon icon={Plus} size="sm" />}
        label={t("addModule")}
      />
    </section>
  );
}

function OutlineLesson({
  lesson,
  isSelected,
  onSelect,
}: {
  lesson: StudioLesson;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const t = useTranslations("learning.studio");
  const tUnits = useTranslations("learning.units");
  return (
    <li className="flex items-center gap-1">
      <button
        type="button"
        onClick={onSelect}
        aria-current={isSelected ? "true" : undefined}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2 rounded-control px-2 py-1.5 text-left hover:bg-surface-hover",
          isSelected && "bg-info-subtle",
        )}
      >
        <span
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-control",
            isSelected ? "bg-brand text-on-brand" : "bg-surface-sunken text-fg-muted",
          )}
        >
          <Icon icon={LESSON_KIND_ICONS[lesson.kind]} size="sm" />
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate text-sm", isSelected ? "font-medium text-fg" : "text-fg")}>
            {`${lesson.number} ${lesson.title}`}
          </span>
          <span className="block text-xs text-fg-subtle">
            {tUnits("minutes", { count: lesson.durationMinutes })}
          </span>
        </span>
      </button>
      <button
        type="button"
        aria-label={t("lessonMenu")}
        className="grid size-7 shrink-0 place-items-center rounded-control text-fg-subtle hover:bg-surface-hover hover:text-fg"
      >
        <Icon icon={MoreHorizontal} size="sm" />
      </button>
    </li>
  );
}

function LessonEditor() {
  const t = useTranslations("learning.studio");
  const tKinds = useTranslations("learning.lessonKinds");
  const tUnits = useTranslations("learning.units");
  const lesson = STUDIO_COURSE.openLesson;
  const [tab, setTab] = useState<LessonEditorTab>(LESSON_EDITOR_TABS.DETAILS);
  const [title, setTitle] = useState<string>(lesson.title);
  const [kind, setKind] = useState<string>(lesson.kind);
  const [duration, setDuration] = useState(String(lesson.durationMinutes));
  const [description, setDescription] = useState<string>(lesson.description);
  const [newTag, setNewTag] = useState("");

  return (
    <section className="flex flex-col gap-5 rounded-card border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-control bg-info-subtle text-fg-brand">
            <Icon icon={LESSON_KIND_ICONS[lesson.kind]} size="md" />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-fg-subtle">{t("lessonEyebrow")}</p>
            <h2 className="truncate text-lg font-semibold text-fg">{`${lesson.number} ${lesson.title}`}</h2>
          </div>
        </div>
        <div className="flex gap-1">
          <IconButton icon={ChevronLeft} label={t("previousLesson")} />
          <IconButton icon={ChevronRight} label={t("nextLesson")} />
          <IconButton icon={MoreHorizontal} label={t("lessonMenu")} />
        </div>
      </div>

      <div role="tablist" aria-label={t("lessonEyebrow")} className="flex gap-1 border-b border-border">
        {Object.values(LESSON_EDITOR_TABS).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm",
              tab === value
                ? "border-brand font-medium text-fg-brand"
                : "border-transparent text-fg-muted hover:text-fg",
            )}
          >
            <Icon icon={EDITOR_TAB_ICONS[value]} size="sm" />
            {t(`lessonTabs.${value}`)}
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_17rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <TextInput
            label={t("lessonTitleLabel")}
            isRequired
            value={title}
            onChange={setTitle}
            width="100%"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Selector
              label={t("contentTypeLabel")}
              isRequired
              value={kind}
              onChange={setKind}
              width="100%"
              options={Object.values(LESSON_KINDS).map((value) => ({
                value,
                label: tKinds(value),
                icon: LESSON_KIND_ICONS[value],
              }))}
            />
            <TextInput
              label={`${t("durationLabel")} (${t("durationUnit")})`}
              isRequired
              inputMode="numeric"
              startIcon={Clock}
              value={duration}
              onChange={setDuration}
              width="100%"
            />
          </div>

          <TextArea
            label={t("descriptionLabel")}
            rows={4}
            value={description}
            onChange={setDescription}
            width="100%"
          />

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-fg">{t("objectivesLabel")}</span>
            <ul className="flex flex-col gap-2">
              {lesson.objectives.map((objective) => (
                <li
                  key={objective}
                  className="flex items-center gap-2 rounded-control border border-border px-3 py-2"
                >
                  <button
                    type="button"
                    aria-label={t("reorderObjective")}
                    className="cursor-grab text-fg-subtle hover:text-fg"
                  >
                    <Icon icon={GripVertical} size="sm" />
                  </button>
                  <span className="min-w-0 flex-1 truncate text-sm text-fg">{objective}</span>
                  <button
                    type="button"
                    aria-label={t("removeObjective")}
                    className="text-fg-subtle hover:text-danger"
                  >
                    <Icon icon={X} size="sm" />
                  </button>
                </li>
              ))}
            </ul>
            <Button
              variant="ghost"
              size="sm"
              className="self-start"
              icon={<Icon icon={Plus} size="sm" />}
              label={t("addObjective")}
            />
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <section className="flex flex-col gap-2 rounded-card border border-border p-3">
            <h3 className="text-sm font-semibold text-fg">{t("mediaTitle")}</h3>
            <div className="relative">
              <CourseArtwork
                art={STUDIO_COURSE.art}
                title={STUDIO_COURSE.title}
                className="h-28 w-full rounded-control"
              />
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid size-9 place-items-center rounded-control bg-surface/90 text-fg">
                  <Icon icon={Play} size="sm" />
                </span>
              </span>
              <span className="absolute right-2 bottom-2 rounded-control bg-overlay px-1.5 py-0.5 text-xs text-on-brand">
                {formatClock(lesson.mediaDurationSeconds)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="min-w-0">
                <span className="block truncate text-sm text-fg">{lesson.mediaFileName}</span>
                <span className="block text-xs text-fg-subtle">
                  {tUnits("fileSize", { size: toMegabytes(lesson.mediaSizeBytes) })}
                </span>
              </span>
              <button
                type="button"
                aria-label={t("removeMedia")}
                className="grid size-8 shrink-0 place-items-center rounded-control border border-border text-fg-subtle hover:text-danger"
              >
                <Icon icon={Trash2} size="sm" />
              </button>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              icon={<Icon icon={Upload} size="sm" />}
              label={t("changeMedia")}
            />
          </section>

          <section className="flex flex-col gap-2 rounded-card border border-border p-3">
            <h3 className="text-sm font-semibold text-fg">{t("visibilityTitle")}</h3>
            <span className="flex items-center gap-2 rounded-control border border-border px-3 py-2 text-sm text-fg">
              <Icon icon={Globe} size="sm" className="text-fg-subtle" />
              {t("visibility.visible")}
            </span>
          </section>

          <section className="flex flex-col gap-2 rounded-card border border-border p-3">
            <h3 className="text-sm font-semibold text-fg">{t("prerequisitesTitle")}</h3>
            <span className="rounded-control border border-border px-3 py-2 text-sm text-fg-muted">
              {t("prerequisitesNone")}
            </span>
          </section>

          <section className="flex flex-col gap-2 rounded-card border border-border p-3">
            <h3 className="text-sm font-semibold text-fg">{t("tagsTitle")}</h3>
            <ul className="flex flex-wrap gap-1.5">
              {lesson.tags.map((tag) => (
                <li key={tag}>
                  <Badge
                    variant={TAG_TONE}
                    className="gap-1.5"
                    label={
                      <>
                        {tag}
                        <button type="button" aria-label={t("removeTag")} className="hover:text-danger">
                          <Icon icon={X} size="xsm" />
                        </button>
                      </>
                    }
                  />
                </li>
              ))}
            </ul>
            <TextInput
              label={t("addTag")}
              isLabelHidden
              value={newTag}
              onChange={setNewTag}
              placeholder={t("addTag")}
              width="100%"
            />
          </section>
        </aside>
      </div>
    </section>
  );
}

function IconButton({ icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid size-8 place-items-center rounded-control border border-border text-fg-muted hover:bg-surface-hover hover:text-fg"
    >
      <Icon icon={icon} size="sm" />
    </button>
  );
}
