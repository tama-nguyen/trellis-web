import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { MessageKey } from "./i18n.types";
import type { Locale } from "./routing";

type MetadataProps = { params: Promise<{ locale: Locale }> };

/** Creates page metadata while preserving the locale layout's title template. */
export function createLocalizedMetadata(title: MessageKey, metadata: Omit<Metadata, "title"> = {}) {
  return async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale });
    return { ...metadata, title: t(title) };
  };
}
