import { PageShell, SCREEN_STATES } from "@/ui/layout/PageShell";
import { Skeleton } from "@astryxdesign/core/Skeleton";

/**
 * Route-level loading UI for the signed-in area. Deliberately not at `[locale]/`: a loading
 * boundary there wraps every page in Suspense, so the response starts streaming with status 200
 * before a page can call `notFound()`, and unknown URLs would never answer 404.
 */
export default function Loading() {
  return (
    <PageShell
      state={SCREEN_STATES.LOADING}
      loading={
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full rounded-card" />
        </div>
      }
    />
  );
}
