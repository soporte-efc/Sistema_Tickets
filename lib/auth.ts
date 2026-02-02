import { prisma } from "@/lib/prisma";

export const ROLES = ["super_admin", "admin", "soporte", "invitado"] as const;
export const PERMISSION_SECTIONS = ["tickets", "usuarios", "reportes"] as const;

export type Role = (typeof ROLES)[number];
export type PermissionSection = (typeof PERMISSION_SECTIONS)[number];

export interface UserProfileRow {
  id: number;
  user_id: string;
  email: string;
  role: string;
  permissions: string[];
  created_at: Date;
  updated_at: Date;
}

export async function getProfileByUserId(userId: string): Promise<UserProfileRow | null> {
  return prisma.userProfile.findUnique({
    where: { user_id: userId },
  });
}

const SUPER_ADMIN_EMAIL = "jcontreras@efc.com.pe";

export async function getOrCreateProfile(
  userId: string,
  email: string
): Promise<UserProfileRow> {
  const isSuperAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL;
  const profile = await prisma.userProfile.upsert({
    where: { user_id: userId },
    create: {
      user_id: userId,
      email,
      role: isSuperAdmin ? "super_admin" : "soporte",
      permissions: isSuperAdmin
        ? ["tickets", "usuarios", "reportes"]
        : ["tickets"],
    },
    update: {},
  });
  return profile;
}

export function canAccessSection(
  permissions: string[],
  role: string,
  section: string
): boolean {
  if (role === "super_admin") return true;
  return permissions.includes(section);
}
