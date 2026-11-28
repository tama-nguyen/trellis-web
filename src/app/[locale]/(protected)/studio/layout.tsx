import type { ReactNode } from "react";
import { SHELL_ROLES } from "@/entities/learning/learning.constants";
import { LearningShell } from "@/features/learning/shell/LearningShell";

/** Every instructor screen shares one frame. */
export default function StudioLayout({ children }: { children: ReactNode }) {
  return <LearningShell role={SHELL_ROLES.INSTRUCTOR}>{children}</LearningShell>;
}
