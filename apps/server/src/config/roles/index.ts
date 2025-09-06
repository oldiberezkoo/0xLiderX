import rolesData from "./roles.json";

export type Permission =
  | "create_record"
  | "read_record"
  | "update_record"
  | "delete_record";

export interface RoleType {
  name: string;
  permissions: Permission[];
}

export class RoleManager {
  private roles: RoleType[];

  constructor() {
    this.roles = rolesData.roles as RoleType[];
  }

  getRoleByName(name: string): RoleType | undefined {
    return this.roles.find((role) => role.name === name);
  }

  getRoles(): RoleType[] {
    return this.roles;
  }

  getPermissionsByRoleName(roleName: string): Permission[] {
    const role = this.getRoleByName(roleName);
    if (!role) {
      throw new Error(`Role "${roleName}" not found`);
    }
    return role.permissions;
  }

  hasPermission(roleName: string, permission: Permission): boolean {
    const role = this.getRoleByName(roleName);
    return role ? role.permissions.includes(permission) : false;
  }
}
