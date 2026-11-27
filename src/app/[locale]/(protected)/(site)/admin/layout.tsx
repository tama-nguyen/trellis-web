import type { ReactNode } from "react";
import { PERMISSIONS } from "@/entities/auth/auth.constants";
import { RequirePermission } from "@/features/auth/guards/RequirePermission";
import { AdminShell } from "./_components/AdminShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequirePermission permission={PERMISSIONS.NOTICE_MANAGE}>
      <AdminShell>{children}</AdminShell>
    </RequirePermission>
  );
}
