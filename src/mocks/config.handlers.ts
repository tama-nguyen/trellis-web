import { HTTP_METHODS } from "@/shared/constants/http";
import { APP_CONFIG_PATH, type AppConfig } from "@/shared/lib/featureFlags";
import { json, type MockRoute } from "./router";

/** Flip these to try both branches of a flag locally. */
const MOCK_APP_CONFIG: AppConfig = {
  featureFlags: {
    notificationSearch: true,
  },
};

export const configRoutes: MockRoute[] = [
  { method: HTTP_METHODS.GET, pattern: APP_CONFIG_PATH, handler: () => json(MOCK_APP_CONFIG) },
];
