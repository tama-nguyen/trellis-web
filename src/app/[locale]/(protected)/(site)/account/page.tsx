import { createLocalizedMetadata } from "@/i18n/metadata";
import { AccountPanel } from "@/features/auth/forms/AccountPanel";

export const generateMetadata = createLocalizedMetadata("account.title");

export default function AccountPage() {
  return <AccountPanel />;
}
