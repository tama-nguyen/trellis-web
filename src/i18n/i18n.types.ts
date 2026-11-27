import type { MessageKeys, NestedKeyOf } from "next-intl";
import type account from "./messages/en/account.json";
import type admin from "./messages/en/admin.json";
import type auth from "./messages/en/auth.json";
import type learning from "./messages/en/learning.json";
import type marketing from "./messages/en/marketing.json";
import type common from "./messages/en/common.json";
import type home from "./messages/en/home.json";
import type errors from "./messages/en/errors.json";
import type notification from "./messages/en/notification.json";
import type { Locale } from "./routing";

/** English is the reference shape; the parity script holds vi and zh to it. */
export type AppMessages = {
  common: typeof common;
  errors: typeof errors;
  auth: typeof auth;
  account: typeof account;
  admin: typeof admin;
  notification: typeof notification;
  learning: typeof learning;
  home: typeof home;
  marketing: typeof marketing;
};

/** Any full message key, `namespace.path.to.key`. Used where a key is chosen as data (error maps). */
export type MessageKey = MessageKeys<AppMessages, NestedKeyOf<AppMessages>>;

declare module "next-intl" {
  // Module augmentation needs an interface; this is what makes `t("...")` keys type-checked.
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface AppConfig {
    Locale: Locale;
    Messages: AppMessages;
  }
}
