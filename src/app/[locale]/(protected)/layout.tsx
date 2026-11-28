import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { RequireAuth } from "@/features/auth/guards/RequireAuth";

/** Everything behind sign-in stays out of search results. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <RequireAuth>{children}</RequireAuth>
    </Suspense>
  );
}
