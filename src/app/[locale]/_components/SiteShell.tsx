import type { ReactNode } from "react";
import { AppFooter } from "./AppFooter";
import { AppHeader } from "./AppHeader";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader />
      <div className="flex flex-1 flex-col bg-canvas">{children}</div>
      <AppFooter />
    </>
  );
}
