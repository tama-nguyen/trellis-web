/**
 * Which backend domains the in-browser mock fakes, so each can go live on its own while the
 * rest stay mocked. Kept free of imports: the server side reads it without pulling in handlers.
 */
export const MOCK_DOMAIN = {
  AUTH: "auth",
  NOTIFICATION: "notification",
  CONFIG: "config",
} as const;
export type MockDomain = (typeof MOCK_DOMAIN)[keyof typeof MOCK_DOMAIN];
export const MOCK_DOMAINS: readonly MockDomain[] = Object.values(MOCK_DOMAIN);

const MOCK_ALL = "true";
const MOCK_NONE = "false";
const LIST_SEPARATOR = ",";

/**
 * Parses `NEXT_PUBLIC_MOCK_DOMAINS`:
 *
 *   true                 every domain
 *   false, empty, unset  none; everything goes to the backend
 *   auth,notification          only the listed domains; unknown names are ignored
 *
 * The literal `process.env.NEXT_PUBLIC_MOCK_DOMAINS` is required: Next inlines a `NEXT_PUBLIC_`
 * value only where it is written out in full. This is the only place that reads it.
 */
export function mockedDomains(raw = process.env.NEXT_PUBLIC_MOCK_DOMAINS): ReadonlySet<MockDomain> {
  const value = raw?.trim();
  if (value === MOCK_ALL) return new Set(MOCK_DOMAINS);
  if (!value || value === MOCK_NONE) return new Set();
  const known = new Set<string>(MOCK_DOMAINS);
  return new Set(
    value
      .split(LIST_SEPARATOR)
      .map((entry) => entry.trim())
      .filter((entry): entry is MockDomain => known.has(entry)),
  );
}
