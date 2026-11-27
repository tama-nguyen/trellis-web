/**
 * Typed product analytics. Every event is a member of the `AnalyticsEvent` union, so a
 * misspelt event or a missing property is a compile error, and changing provider never touches
 * a call site: `track({ type: EventType.NotificationOpened, notificationCode })`.
 *
 * Never put personal data (emails, names, free text) in an event.
 */

export const EventType = {
  PageViewed: "PageViewed",
  LoginSucceeded: "LoginSucceeded",
  LoggedOut: "LoggedOut",
  LocaleChanged: "LocaleChanged",
  NotificationOpened: "NotificationOpened",
  NotificationSearched: "NotificationSearched",
} as const;
export type EventType = (typeof EventType)[keyof typeof EventType];

type PageViewedEvent = { type: typeof EventType.PageViewed; path: string };
type LoginSucceededEvent = { type: typeof EventType.LoginSucceeded };
type LoggedOutEvent = { type: typeof EventType.LoggedOut };
type LocaleChangedEvent = { type: typeof EventType.LocaleChanged; from: string; to: string };
type NotificationOpenedEvent = { type: typeof EventType.NotificationOpened; notificationCode: string };
type NotificationSearchedEvent = { type: typeof EventType.NotificationSearched; queryLength: number };

export type AnalyticsEvent =
  | PageViewedEvent
  | LoginSucceededEvent
  | LoggedOutEvent
  | LocaleChangedEvent
  | NotificationOpenedEvent
  | NotificationSearchedEvent;

/** Context attached to every event by `track`, so call sites do not repeat it. */
export type EventContext = {
  timestamp: string;
  path: string;
  locale: string;
};

export type AnalyticsProvider = {
  send: (event: AnalyticsEvent, context: EventContext) => void;
};

export const ANALYTICS_PROVIDERS = {
  NONE: "none",
  CONSOLE: "console",
} as const;
export type AnalyticsProviderName = (typeof ANALYTICS_PROVIDERS)[keyof typeof ANALYTICS_PROVIDERS];

const PROVIDERS: Record<AnalyticsProviderName, AnalyticsProvider> = {
  none: { send: () => {} },
  console: {
    send: (event, context) => {
      console.info("[analytics]", event.type, { ...event, ...context });
    },
  },
};

function providerFromEnv(raw: string | undefined): AnalyticsProvider {
  const name = Object.values(ANALYTICS_PROVIDERS).find((value) => value === raw?.trim());
  return PROVIDERS[name ?? ANALYTICS_PROVIDERS.NONE];
}

// Literal env name required: Next inlines NEXT_PUBLIC_ values only where written out in full.
const provider = providerFromEnv(process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER);

/** Fire-and-forget. A failing provider must never break the page, so errors are swallowed. */
export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  try {
    provider.send(event, {
      timestamp: new Date().toISOString(),
      path: window.location.pathname,
      locale: document.documentElement.lang,
    });
  } catch {
    // Analytics is best effort.
  }
}
