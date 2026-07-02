import type { UserRole } from "@prisma/client";

export const SECRETARIAT_ROLES: UserRole[] = [
  "admin",
  "superadmin",
  "secretaria",
  "reviewer",
  "finance",
];

export const EDITORIAL_ROLES: UserRole[] = ["admin", "superadmin", "editor"];

export const STAFF_ROLES: UserRole[] = [
  ...SECRETARIAT_ROLES,
  "editor",
];

export function isStaffRole(role: UserRole) {
  return STAFF_ROLES.includes(role);
}

export function canAccessSecretariat(role: UserRole) {
  return SECRETARIAT_ROLES.includes(role);
}

export function canAccessEditorial(role: UserRole, staffEditor = false) {
  return EDITORIAL_ROLES.includes(role) || (role === "secretaria" && staffEditor);
}

export function canManageStaff(role: UserRole) {
  return role === "admin" || role === "superadmin";
}

export function staffRoleLabel(role: UserRole, staffEditor = false) {
  if (role === "admin" || role === "superadmin") return "Administrador";
  if (role === "secretaria") {
    return staffEditor ? "Secretaria + Editor" : "Secretaria";
  }
  if (role === "editor") return "Editor";
  if (role === "reviewer" || role === "finance") return "Secretaria";
  return role;
}
