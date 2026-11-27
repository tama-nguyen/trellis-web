import Image from "next/image";
import { ArrowRight } from "@/ui/icons/lucide";
import { useTranslations } from "next-intl";
import { MARKETING_FEATURES } from "@/entities/marketing/marketing.fixtures";
import type { MarketingFeature } from "@/entities/marketing/marketing.types";
import { Link } from "@/i18n/navigation";
import { MARKETING_ROUTES } from "@/shared/constants/routes/marketing.routes";
import { LEARNING_ROUTES } from "@/shared/constants/routes/learning.routes";
import { cn } from "@/ui/lib/cn";
import { Icon } from "@astryxdesign/core/Icon";
import { Section } from "@/ui/layout/Section";
import { TintCardContent, tintCardVariants, type TintCardPropsDefaults } from "@/ui/card/TintCard";

type FeatureLook = {
  image: string;
  variant: TintCardPropsDefaults["variant"];
  href: string;
};

/** Each feature: its photograph, its colour, and the screen it leads to. */
const FEATURE_LOOKS: Record<MarketingFeature["key"], FeatureLook> = {
  structured: { image: "/images/courses/blossom.jpg", variant: "amber", href: MARKETING_ROUTES.courses },
  aiPractice: { image: "/images/hero-learner.jpg", variant: "mint", href: LEARNING_ROUTES.learn },
  progress: { image: "/images/courses/lantern.jpg", variant: "rose", href: LEARNING_ROUTES.learnProgress },
  teach: { image: "/images/courses/landmark.jpg", variant: "sky", href: MARKETING_ROUTES.educators },
};

/** A four-up row at desktop, two-up at tablet, full width on a phone. */
const IMAGE_SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw";
const ARROW_CLASSES = "transition-transform duration-normal ease-emphasized group-hover:translate-x-1";

/** The product's four promises as photo cards on pastel blocks. */
export function FeatureCards() {
  const t = useTranslations("home.features");
  return (
    <Section title={t("title")} description={t("subtitle")}>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {MARKETING_FEATURES.map((feature) => {
          const look = FEATURE_LOOKS[feature.key];
          return (
            <li key={feature.key} className="reveal">
              <Link
                href={look.href}
                className={cn(tintCardVariants({ variant: look.variant, isInteractive: true }))}
              >
                <TintCardContent
                  media={
                    <div className="relative aspect-4/3 overflow-hidden">
                      <Image
                        src={look.image}
                        alt=""
                        fill
                        sizes={IMAGE_SIZES}
                        className="object-cover transition-transform duration-slow ease-standard group-hover:scale-105"
                      />
                    </div>
                  }
                  title={t(`${feature.key}Title`)}
                  body={t(`${feature.key}Body`)}
                  action={
                    <span className="flex items-center gap-2">
                      {t("explore")}
                      <Icon icon={ArrowRight} size="sm" className={ARROW_CLASSES} />
                    </span>
                  }
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
