import { authRoutes } from "./auth.handlers";
import { configRoutes } from "./config.handlers";
import { MOCK_DOMAIN, type MockDomain } from "./domains";
import { notificationRoutes } from "./notification.handlers";
import type { MockRoute } from "./router";

/** Mock routes per domain; `NEXT_PUBLIC_MOCK_DOMAINS` picks which groups are installed. */
export const routeGroups: Record<MockDomain, MockRoute[]> = {
  [MOCK_DOMAIN.AUTH]: authRoutes,
  [MOCK_DOMAIN.NOTIFICATION]: notificationRoutes,
  [MOCK_DOMAIN.CONFIG]: configRoutes,
};
