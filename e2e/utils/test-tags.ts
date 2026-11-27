/**
 * Test tags, used in titles and filtered with `--grep`:
 *   npm run test:e2e -- --grep @p0          the must-pass set run on every change
 *   npm run test:e2e -- --grep @area:auth   one area
 */
export const TestTag = {
  /** Critical path: runs on every merge request. Keep the set small and fast. */
  P0: "@p0",
} as const;

export const AreaTag = {
  SHELL: "@area:shell",
  AUTH: "@area:auth",
  NOTIFICATION: "@area:notification",
} as const;
