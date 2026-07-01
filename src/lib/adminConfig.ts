export const SUPER_ADMIN_EMAIL = "mentormedia4sure@gmail.com";
export const ADMIN_COOKIE     = "deelai_admin_session";
export const USER_COOKIE      = "deelai_user_session";

export const ALL_PERMISSIONS = [
  "manage_users",
  "manage_jobs",
  "manage_payments",
  "manage_referrals",
  "view_reports",
  "manage_announcements",
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<Permission, string> = {
  manage_users:        "Manage Users",
  manage_jobs:         "Manage Jobs / Tasks",
  manage_payments:     "Manage Payments",
  manage_referrals:    "Manage Referrals",
  view_reports:        "View Reports",
  manage_announcements:"Manage Announcements",
};

export const ADMIN_REGIONS = [
  "North Africa",
  "West Africa",
  "East Africa",
  "Southern Africa",
  "North America",
  "Latin America",
  "Europe",
  "Asia Pacific",
  "Middle East",
  "Global",
];
