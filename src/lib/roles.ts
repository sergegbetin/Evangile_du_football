import type { UserRole } from "@/types/database"

export function isCommitteeRole(role: UserRole): boolean {
  return role === "committee" || role === "super_admin"
}

export function isStaffRole(role: UserRole): boolean {
  return ["committee", "referee", "discipline", "super_admin"].includes(role)
}
