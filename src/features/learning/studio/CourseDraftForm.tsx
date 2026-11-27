"use client";

import { fieldError } from "@/shared/lib/formStatus";
import { ArrowLeft, Info } from "@/ui/icons/lucide";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { COURSE_LANGUAGES, type CourseLanguage } from "@/entities/learning/learning.constants";
import { LEVEL_FRAMEWORKS, type LevelFramework } from "@/entities/learning/learning.constants";
import { FRAMEWORK_LEVELS } from "@/entities/learning/studio.fixtures";
import { Link } from "@/i18n/navigation";
import { STUDIO_ROUTES } from "@/shared/constants/routes/studio.routes";
import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
import { Selector } from "@astryxdesign/core/Selector";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";

/**
 * M11 — creating a draft. The framework choice comes first and changes the level list outright:
 * CEFR and the Chinese curriculum are separate scales and never convert into each other (BR-12),
 * so offering one merged list would teach the wrong model from the first screen.
 */
export function CourseDraftForm() {
  const t = useTranslations("learning.studio.draft");
  const tLanguages = useTranslations("learning.languages");
  const tFrameworks = useTranslations("learning.levelFrameworks");

  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState<CourseLanguage>(COURSE_LANGUAGES.CHINESE);
  const [framework, setFramework] = useState<LevelFramework>(LEVEL_FRAMEWORKS.CHINESE_CURRICULUM);
  const [level, setLevel] = useState("");
  const [summary, setSummary] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const levels = FRAMEWORK_LEVELS[framework];
  const titleError = isSubmitted && title.trim() === "" ? t("titleRequired") : undefined;
  const levelError = isSubmitted && level === "" ? t("levelRequired") : undefined;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 md:px-6">
      <Link
        href={STUDIO_ROUTES.studio}
        className="flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
      >
        <Icon icon={ArrowLeft} size="sm" />
        {t("cancel")}
      </Link>

      <h1 className="mt-6 text-2xl font-semibold text-fg">{t("title")}</h1>
      <p className="mt-2 text-sm text-fg-muted">{t("description")}</p>

      <form
        className="mt-6 flex flex-col gap-5 rounded-card border border-border bg-surface p-5"
        onSubmit={(event) => {
          event.preventDefault();
          setIsSubmitted(true);
        }}
      >
        <TextInput
          label={t("titleLabel")}
          value={title}
          onChange={setTitle}
          placeholder={t("titlePlaceholder")}
          status={fieldError(titleError)}
          statusVariant="detached"
          width="100%"
        />

        <Selector
          label={t("languageLabel")}
          value={language}
          onChange={(next) => setLanguage(next as CourseLanguage)}
          width="100%"
          options={Object.values(COURSE_LANGUAGES).map((value) => ({
            value,
            label: tLanguages(value),
          }))}
        />

        <Selector
          label={t("frameworkLabel")}
          description={t("frameworkNote")}
          value={framework}
          onChange={(next) => {
            setFramework(next as LevelFramework);
            // Levels belong to one scale, so switching scales cannot keep the old choice.
            setLevel("");
          }}
          width="100%"
          options={Object.values(LEVEL_FRAMEWORKS).map((value) => ({
            value,
            label: tFrameworks(value),
          }))}
        />

        <Selector
          label={t("levelLabel")}
          value={level}
          onChange={setLevel}
          status={fieldError(levelError)}
          statusVariant="detached"
          width="100%"
          options={levels.map((value) => ({ value, label: value }))}
        />

        <TextArea
          label={t("summaryLabel")}
          rows={3}
          value={summary}
          onChange={setSummary}
          placeholder={t("summaryPlaceholder")}
          width="100%"
        />

        <p className="flex items-start gap-2 rounded-control bg-info-subtle p-3 text-xs text-fg-muted">
          <Icon icon={Info} size="sm" className="mt-0.5 text-fg-brand" />
          {t("description")}
        </p>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" href={STUDIO_ROUTES.studio} label={t("cancel")} />
          <Button variant="primary" type="submit" label={t("create")} />
        </div>
      </form>
    </main>
  );
}
