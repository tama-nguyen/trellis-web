import { ArrowRight } from "@/ui/icons/lucide";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MARKETING_ROUTES } from "@/shared/constants/routes/marketing.routes";
import { Icon } from "@astryxdesign/core/Icon";
import { Section } from "@/ui/layout/Section";
import { HomeHero } from "../sections/HomeHero";
import { HomeClosing } from "../sections/HomeClosing";
import { FeatureCards } from "../sections/FeatureCards";
import { CourseShelf } from "../sections/CourseShelf";
// import { TopicMarquee } from "../sections/TopicMarquee";

/** The arrow nudges forward when its button is hovered; the button carries `group`. */
const ARROW_CLASSES = "transition-transform duration-normal ease-emphasized group-hover:translate-x-0.5";

/** Hero (tint) → topic strip (surface) → feature cards (canvas) → course shelf (surface) → closing banner. */
export function HomePage() {
  return (
    <main>
      <HomeHero />
      {/*<TopicMarquee />*/}
      <FeatureCards />
      <Featured />
      <HomeClosing />
    </main>
  );
}

function Featured() {
  const t = useTranslations("home.featured");
  return (
    <Section
      variant="surface"
      title={t("title")}
      description={t("subtitle")}
      action={
        <Link
          href={MARKETING_ROUTES.courses}
          className="group flex items-center gap-1.5 text-sm font-semibold text-fg-brand hover:text-brand-hover"
        >
          {t("viewAll")}
          <Icon icon={ArrowRight} size="sm" className={ARROW_CLASSES} />
        </Link>
      }
    >
      <CourseShelf />
    </Section>
  );
}
