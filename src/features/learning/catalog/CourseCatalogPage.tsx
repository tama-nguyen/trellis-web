"use client";

import {
  ArrowRight,
  BookOpen,
  Clock,
  Heart,
  Layers,
  LayoutGrid,
  List,
  Search,
  Signal,
} from "@/ui/icons/lucide";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  CATALOG_COURSES,
  CATALOG_FILTERS,
  CATALOG_TOTAL_COURSES,
  INITIAL_CATALOG_QUERY,
} from "@/entities/learning/course.fixtures";
import { type CourseSummary } from "@/entities/learning/course.types";
import {
  CATALOG_LANGUAGE_FILTER_ALL,
  CATALOG_SORTS,
  CATALOG_VIEWS,
  type CatalogSort,
  type CatalogView,
  type CourseLanguage,
  ENROLMENT_STATES,
} from "@/entities/learning/learning.constants";
import { LEARNING_ROUTES } from "@/shared/constants/routes/learning.routes";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { cn } from "@/ui/lib/cn";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { Selector } from "@astryxdesign/core/Selector";
import { TextInput } from "@astryxdesign/core/TextInput";
import { CourseArtwork } from "../shared/CourseArtwork";
import { ENROLLED_TONE, LANGUAGE_TONES } from "../shared/learning.tones";
import { useDurationLabel } from "@/features/learning/hooks/useDurationLabel";

type LanguageChip = CourseLanguage | typeof CATALOG_LANGUAGE_FILTER_ALL;

/** Facet groups other than language; the value is also the message namespace segment. */
const FACET_GROUPS = { LEVELS: "levels", SKILLS: "skills", FORMATS: "formats" } as const;
type FacetGroup = (typeof FACET_GROUPS)[keyof typeof FACET_GROUPS];

export function CourseCatalogPage() {
  const t = useTranslations("learning.catalog");
  const [languages, setLanguages] = useState<readonly CourseLanguage[]>(INITIAL_CATALOG_QUERY.languages);
  const [sort, setSort] = useState<CatalogSort>(INITIAL_CATALOG_QUERY.sort);
  const [searchText, setSearchText] = useState("");
  const [view, setView] = useState<CatalogView>(CATALOG_VIEWS.GRID);
  const [chip, setChip] = useState<LanguageChip>(CATALOG_LANGUAGE_FILTER_ALL);

  const courses = CATALOG_COURSES.filter(
    (course) =>
      languages.includes(course.language) &&
      (chip === CATALOG_LANGUAGE_FILTER_ALL || course.language === chip),
  );

  function toggleLanguage(language: CourseLanguage) {
    setLanguages((current) =>
      current.includes(language) ? current.filter((item) => item !== language) : [...current, language],
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="flex items-center justify-between gap-6 rounded-card bg-info-subtle p-6 md:p-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold text-fg">{t("title")}</h1>
          <p className="mt-2 text-sm text-fg-muted">{t("description")}</p>
        </div>
        <Icon icon={BookOpen} size="lg" className="hidden size-20 text-fg-brand opacity-40 md:block" />
      </section>

      <div className="grid gap-4 lg:grid-cols-[14rem_1fr]">
        <aside className="flex flex-col gap-5 rounded-card border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-fg">{t("filtersTitle")}</h2>
            <button
              type="button"
              onClick={() => {
                setLanguages(INITIAL_CATALOG_QUERY.languages);
                setChip(CATALOG_LANGUAGE_FILTER_ALL);
              }}
              className="text-xs text-fg-brand underline underline-offset-2 hover:text-brand-hover"
            >
              {t("clearFilters")}
            </button>
          </div>

          <FilterGroup title={t("filterLanguage")}>
            {CATALOG_FILTERS.languages.map((facet) => (
              <FilterCheckbox
                key={facet.value}
                checked={languages.includes(facet.value)}
                onChange={() => toggleLanguage(facet.value)}
                label={t("facet", { label: facet.value, count: facet.count })}
                labelNode={<LanguageLabel language={facet.value} count={facet.count} />}
              />
            ))}
          </FilterGroup>

          <FilterGroup title={t("filterLevel")}>
            {CATALOG_FILTERS.levels.map((facet) => (
              <FacetCheckbox
                key={facet.value}
                group={FACET_GROUPS.LEVELS}
                value={facet.value}
                count={facet.count}
              />
            ))}
          </FilterGroup>

          <FilterGroup title={t("filterSkills")}>
            {CATALOG_FILTERS.skills.map((facet) => (
              <FacetCheckbox
                key={facet.value}
                group={FACET_GROUPS.SKILLS}
                value={facet.value}
                count={facet.count}
              />
            ))}
          </FilterGroup>

          <FilterGroup title={t("filterFormat")}>
            {CATALOG_FILTERS.formats.map((facet) => (
              <FacetCheckbox
                key={facet.value}
                group={FACET_GROUPS.FORMATS}
                value={facet.value}
                count={facet.count}
              />
            ))}
          </FilterGroup>
        </aside>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 rounded-card border border-border bg-surface p-3">
            <div className="min-w-60 flex-1">
              <TextInput
                label={t("searchLabel")}
                isLabelHidden
                type="search"
                startIcon={Search}
                value={searchText}
                onChange={setSearchText}
                placeholder={t("searchPlaceholder")}
                width="100%"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-fg-muted">{t("sortLabel")}</span>
              <Selector
                label={t("sortLabel")}
                isLabelHidden
                width={176}
                value={sort}
                onChange={(next) => setSort(next as CatalogSort)}
                options={[
                  { value: CATALOG_SORTS.POPULAR, label: t("sortPopular") },
                  { value: CATALOG_SORTS.NEWEST, label: t("sortNewest") },
                  { value: CATALOG_SORTS.SHORTEST, label: t("sortShortest") },
                ]}
              />
            </div>
            <div className="flex rounded-control border border-border p-0.5">
              <ViewButton
                isActive={view === CATALOG_VIEWS.GRID}
                onClick={() => setView(CATALOG_VIEWS.GRID)}
                label={t("viewGrid")}
                icon={LayoutGrid}
              />
              <ViewButton
                isActive={view === CATALOG_VIEWS.LIST}
                onClick={() => setView(CATALOG_VIEWS.LIST)}
                label={t("viewList")}
                icon={List}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-fg">
              {t("resultCount", { count: CATALOG_TOTAL_COURSES })}
            </h2>
            <div className="flex gap-2">
              <LanguageChipButton
                isActive={chip === CATALOG_LANGUAGE_FILTER_ALL}
                onClick={() => setChip(CATALOG_LANGUAGE_FILTER_ALL)}
              >
                {t("languageAll")}
              </LanguageChipButton>
              {CATALOG_FILTERS.languages.map((facet) => (
                <LanguageChipButton
                  key={facet.value}
                  isActive={chip === facet.value}
                  onClick={() => setChip(facet.value)}
                >
                  <LanguageChipLabel language={facet.value} count={facet.count} />
                </LanguageChipButton>
              ))}
            </div>
          </div>

          {courses.length === 0 ? (
            <EmptyState
              title={t("emptyTitle")}
              description={t("emptyDescription")}
              icon={<Icon icon={Search} size="lg" />}
            />
          ) : (
            <ul
              className={cn(
                "grid gap-4",
                view === CATALOG_VIEWS.GRID ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1",
              )}
            >
              {courses.map((course) => (
                <li key={course.slug}>
                  <CourseCard course={course} isRow={view === CATALOG_VIEWS.LIST} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-t border-border pt-4 first:border-t-0 first:pt-0">
      <h3 className="text-sm font-semibold text-fg">{title}</h3>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function FilterCheckbox({
  checked,
  onChange,
  label,
  labelNode,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  labelNode: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-fg-muted">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={label}
        className="size-4 shrink-0 text-brand accent-[currentColor]"
      />
      {labelNode}
    </label>
  );
}

/** Facets other than language are inert in the mock: the fixture has one page of courses. */
function FacetCheckbox({ group, value, count }: { group: FacetGroup; value: string; count: number }) {
  const tLevels = useTranslations("learning.levels");
  const tSkills = useTranslations("learning.skills");
  const tFormats = useTranslations("learning.formats");
  const label =
    group === FACET_GROUPS.LEVELS
      ? tLevels(value as never)
      : group === FACET_GROUPS.SKILLS
        ? tSkills(value as never)
        : tFormats(value as never);
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-fg-muted">
      <input type="checkbox" aria-label={label} className="size-4 shrink-0 text-brand" />
      <span>{label}</span>
      <span className="text-fg-subtle">{`(${count})`}</span>
    </label>
  );
}

function LanguageLabel({ language, count }: { language: CourseLanguage; count: number }) {
  const t = useTranslations("learning.languages");
  return (
    <span className="flex items-center gap-1">
      <span className="text-fg">{t(language)}</span>
      <span className="text-fg-subtle">{`(${count})`}</span>
    </span>
  );
}

function LanguageChipLabel({ language, count }: { language: CourseLanguage; count: number }) {
  const t = useTranslations("learning.languages");
  return <span>{`${t(language)} (${count})`}</span>;
}

function LanguageChipButton({
  isActive,
  onClick,
  children,
}: {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        "rounded-control px-3 py-1 text-sm",
        isActive ? "bg-info-subtle font-medium text-fg-brand" : "text-fg-muted hover:bg-surface-hover",
      )}
    >
      {children}
    </button>
  );
}

function ViewButton({
  isActive,
  onClick,
  label,
  icon,
}: {
  isActive: boolean;
  onClick: () => void;
  label: string;
  icon: typeof LayoutGrid;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
      className={cn(
        "grid size-8 place-items-center rounded-control",
        isActive ? "bg-brand text-on-brand" : "text-fg-muted hover:bg-surface-hover",
      )}
    >
      <Icon icon={icon} size="sm" />
    </button>
  );
}

function CourseCard({ course, isRow }: { course: CourseSummary; isRow: boolean }) {
  const t = useTranslations("learning.catalog");
  const tLanguages = useTranslations("learning.languages");
  const tLevels = useTranslations("learning.levels");
  const tUnits = useTranslations("learning.units");
  const durationLabel = useDurationLabel();
  const [isSaved, setIsSaved] = useState(course.isSaved);
  const isEnrolled = course.enrolment === ENROLMENT_STATES.ENROLLED;

  return (
    <article
      className={cn(
        "flex h-full overflow-hidden rounded-card border border-border bg-surface",
        isRow ? "flex-row" : "flex-col",
      )}
    >
      <div className={cn("relative shrink-0", isRow ? "w-48" : "")}>
        <CourseArtwork
          art={course.art}
          title={course.title}
          className={isRow ? "h-full w-48" : "h-36 w-full"}
        />
        <Badge
          variant={LANGUAGE_TONES[course.language]}
          className="absolute top-3 left-3 bg-surface"
          label={tLanguages(course.language)}
        />
        <button
          type="button"
          onClick={() => setIsSaved((current) => !current)}
          aria-label={isSaved ? t("unsave") : t("save")}
          aria-pressed={isSaved}
          className="absolute top-3 right-3 grid size-8 place-items-center rounded-control bg-surface text-fg-muted hover:text-danger"
        >
          <Icon icon={Heart} size="sm" className={cn(isSaved && "fill-current text-danger")} />
        </button>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
        <h3 className="text-base font-semibold text-fg">{course.title}</h3>
        <p className="line-clamp-2 text-sm text-fg-muted">{course.description}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
          <span className="flex items-center gap-1 rounded-control bg-surface-sunken px-2 py-1">
            <Icon icon={Signal} size="sm" />
            {tLevels(course.level)}
          </span>
          <span className="flex items-center gap-1 rounded-control bg-surface-sunken px-2 py-1">
            <Icon icon={Layers} size="sm" />
            {tUnits("lessonCount", { count: course.lessonCount })}
          </span>
          <span className="flex items-center gap-1 rounded-control bg-surface-sunken px-2 py-1">
            <Icon icon={Clock} size="sm" />
            {durationLabel(course.durationMinutes)}
          </span>
        </div>
        <HStack
          gap={3}
          wrap="wrap"
          vAlign="center"
          className={cn("mt-auto w-full", isRow ? "justify-between" : null)}
        >
          {isRow && isEnrolled ? <Badge variant={ENROLLED_TONE} label={t("enrolledStatus")} /> : null}
          <Button
            variant={isEnrolled ? "secondary" : "primary"}
            size="md"
            className={cn("group", isRow ? "ml-auto w-fit min-w-40" : "w-full")}
            href={
              isEnrolled
                ? LEARNING_ROUTES.learnCourse(course.slug)
                : LEARNING_ROUTES.catalogCourse(course.slug)
            }
            label={isEnrolled ? t("viewCourse") : t("enrol")}
            endContent={isEnrolled ? undefined : <Icon icon={ArrowRight} size="sm" />}
          />
        </HStack>
      </div>
    </article>
  );
}
