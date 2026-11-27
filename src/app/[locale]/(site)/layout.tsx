import type { ReactNode } from "react";
import { SiteShell } from "../_components/SiteShell";

/**
 * Public pages carry the global header. Protected account/admin pages share the visual shell
 * through their own site layout, below the authentication boundary.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
