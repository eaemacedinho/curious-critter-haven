import { useTenant, type UserRole } from "./useTenant";

export interface Permissions {
  role: UserRole | null;
  canEdit: boolean;      // editor, admin, owner
  canDelete: boolean;    // admin, owner only
  canManageAgency: boolean; // admin, owner only
  isOwner: boolean;
  isViewer: boolean;
}

const EDIT_ROLES: UserRole[] = ["owner", "admin", "editor"];
const ADMIN_ROLES: UserRole[] = ["owner", "admin"];

export function usePermissions(): Permissions {
  const { userRole } = useTenant();

  return {
    role: userRole,
    canEdit: !!userRole && EDIT_ROLES.includes(userRole),
    canDelete: !!userRole && ADMIN_ROLES.includes(userRole),
    canManageAgency: !!userRole && ADMIN_ROLES.includes(userRole),
    isOwner: userRole === "owner",
    isViewer: userRole === "viewer",
  };
}
