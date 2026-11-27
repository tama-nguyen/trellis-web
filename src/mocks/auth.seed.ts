import { PERMISSIONS, type Permission } from "@/entities/auth/auth.constants";

/**
 * Sample accounts for the mock backend and e2e tests. Test values only: `.test` addresses
 * and throwaway passwords that exist nowhere but this file.
 */
export type SeedUser = {
  id: string;
  email: string;
  password: string;
  displayName: string;
  permissions: Permission[];
};

export const SEED_USERS: readonly SeedUser[] = [
  {
    id: "u-member",
    email: "member@example.test",
    password: "member-pass",
    displayName: "Minh Anh",
    permissions: [PERMISSIONS.NOTIFICATION_READ],
  },
  {
    id: "u-admin",
    email: "admin@example.test",
    password: "admin-pass",
    displayName: "Lan Chi",
    permissions: [
      PERMISSIONS.NOTIFICATION_READ,
      PERMISSIONS.NOTIFICATION_READ_STAFF,
      PERMISSIONS.NOTIFICATION_MANAGE,
    ],
  },
];
