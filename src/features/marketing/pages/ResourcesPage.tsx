import {
  ArrowRight,
  BookOpen,
  Clock3,
  FileText,
  LayoutTemplate,
  PlayCircle,
  Search,
  Sparkles,
} from "@/ui/icons/lucide";
import { cn } from "@/ui/lib/cn";
import { useTranslations } from "next-intl";
import { RESOURCE_ITEMS } from "@/entities/marketing/marketing.fixtures";
import type { ResourceItem, ResourceKind } from "@/entities/marketing/marketing.types";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/shared/constants/routes";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { CallToAction } from "@/ui/layout/CallToAction";
import { Icon } from "@astryxdesign/core/Icon";
import { PageHero } from "@/ui/layout/PageHero";
import { Section } from "@/ui/layout/Section";
import { TintCardContent, tintCardVariants, type TintCardPropsDefaults } from "@/ui/card/TintCard";
import { RESOURCE_KIND_TONE } from "../shared/marketing.tones";

const KIND_ICONS: Record<ResourceKind, typeof FileText> = {
  guide: FileText,
  article: FileText,
  webinar: PlayCircle,
  template: LayoutTemplate,
};

const SAMPLE_COURSE_SLUG = "english-everyday-communication";

/**
 * Each card links to the screen it talks about. Nothing here opens an article that does not exist:
 * the mock has no CMS, so a guide points at the part of the product it describes.
 */
const KIND_TARGETS: Record<ResourceItem["key"], string> = {
  gettingStarted: ROUTES.studioNewCourse,
  courseDesign: ROUTES.studio,
  assessmentDesign: ROUTES.studioQuestionBank,
  aiTutor: ROUTES.learn,
  analytics: ROUTES.studioAnalytics,
  accessibility: ROUTES.studioResources,
};

const ARROW_CLASSES = "transition-transform duration-normal ease-emphasized group-hover:translate-x-1";

const RESOURCE_HERO_STICKERS = [
  {
    icon: BookOpen,
    tile: "bg-tint-amber",
    position: "top-4 left-4 size-16 rounded-dialog rotate-6",
    motion: "animate-drift-right-down",
    delay: "stagger-1",
  },
  {
    icon: Sparkles,
    tile: "bg-tint-mint",
    position: "top-1 right-10 size-12 rounded-full -rotate-6",
    motion: "animate-drift-left-down",
    delay: "stagger-3",
  },
  {
    icon: FileText,
    tile: "bg-surface",
    position: "inset-0 m-auto size-20 rounded-dialog -rotate-3",
    motion: "animate-drift-center",
    delay: "stagger-5",
  },
  {
    icon: PlayCircle,
    tile: "bg-tint-rose",
    position: "right-4 bottom-4 size-16 rounded-dialog rotate-6",
    motion: "animate-drift-left-up",
    delay: "stagger-7",
  },
  {
    icon: LayoutTemplate,
    tile: "bg-info-subtle",
    position: "bottom-2 left-14 size-14 rounded-full -rotate-6",
    motion: "animate-drift-right-up",
    delay: "stagger-2",
  },
] as const;

/** Hero (warm neutral) → guides (canvas) → closing band (brand). */
export function ResourcesPage() {
  const t = useTranslations("marketing.resources");

  return (
    <main>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("subtitle")}
        className="bg-surface-warm"
        aside={<ResourcesHeroStickers />}
      />

      <Section>
        <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {RESOURCE_ITEMS.map((item) => (
            <li key={item.key} className="reveal">
              <ResourceCard item={item} />
            </li>
          ))}
        </ul>
      </Section>

      <CallToAction
        title={t("helpTitle")}
        description={t("helpBody")}
        actions={
          <>
            <Button
              size="lg"
              variant="secondary"
              className="border-transparent"
              icon={<Icon icon={Search} size="sm" />}
              href={ROUTES.search}
              label={t("helpSearch")}
            />
            <Button
              size="lg"
              variant="ghost"
              className="text-on-brand hover:bg-surface/15"
              href={ROUTES.catalogCourse(SAMPLE_COURSE_SLUG)}
              label={t("helpSample")}
            />
          </>
        }
      />
    </main>
  );
}

function ResourcesHeroStickers() {
  return (
    <ul aria-hidden className="pointer-events-none relative mx-auto h-44 w-full max-w-sm md:h-56 lg:h-72">
      {RESOURCE_HERO_STICKERS.map(({ icon, tile, position, motion, delay }) => (
        <li
          key={position}
          className={cn(
            "absolute grid place-items-center border border-border text-fg-brand",
            tile,
            position,
            motion,
            delay,
          )}
        >
          <Icon icon={icon} size="md" />
        </li>
      ))}
    </ul>
  );
}

const KIND_VARIANTS: Record<ResourceKind, TintCardPropsDefaults["variant"]> = {
  guide: "amber",
  article: "sky",
  webinar: "rose",
  template: "mint",
};

function ResourceCard({ item }: { item: ResourceItem }) {
  const t = useTranslations("marketing.resources");

  return (
    <Link
      href={KIND_TARGETS[item.key]}
      className={tintCardVariants({ variant: KIND_VARIANTS[item.kind], isInteractive: true })}
    >
      <TintCardContent
        media={
          <div className="flex items-center justify-between gap-3 p-6 pb-0 md:p-7 md:pb-0">
            <Badge
              variant={RESOURCE_KIND_TONE}
              icon={<Icon icon={KIND_ICONS[item.kind]} size="sm" />}
              label={t(`kinds.${item.kind}`)}
            />
            <span className="flex items-center gap-1.5 text-xs">
              <Icon icon={Clock3} size="sm" />
              {t("readTime", { minutes: item.readMinutes })}
            </span>
          </div>
        }
        title={t(`items.${item.key}Title`)}
        body={t(`items.${item.key}Body`)}
        action={
          <span className="flex items-center gap-2">
            {t(`kinds.${item.kind}`)}
            <Icon icon={ArrowRight} size="sm" className={ARROW_CLASSES} />
          </span>
        }
      />
    </Link>
  );
}
