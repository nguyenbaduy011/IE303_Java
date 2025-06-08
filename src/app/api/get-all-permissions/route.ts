/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PermissionType {
  id: string;
  name: string;
  description: string;
}

export const fetchRolePermissions = async (): Promise<PermissionType[]> => {
  try {
    const response = await fetch(`http://localhost:8080/api/role/permissions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Session expired. Please log in again.");
      }
      if (response.status === 403) {
        throw new Error("You do not have permission to view this information.");
      }
      if (response.status === 404) {
        throw new Error("Permissions not found.");
      }
      throw new Error(`HTTP ${response.status}: Failed to fetch permissions`);
    }

    const data = await response.json();
    const permissionsArray = Array.isArray(data) ? data : [];

    return permissionsArray.map(
      (perm: any): PermissionType => ({
        id: perm.id,
        name: perm.name,
        description: perm.description,
      })
    );
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch permissions"
    );
  }
};
