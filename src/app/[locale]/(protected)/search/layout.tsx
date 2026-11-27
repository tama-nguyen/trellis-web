import type { ReactNode } from "react";
import { LearningShell } from "@/features/learning/shell/LearningShell";

/** Search spans the product, so it keeps the learner frame rather than living under /learn. */
export default function SearchLayout({ children }: { children: ReactNode }) {
  return <LearningShell>{children}</LearningShell>;
}
