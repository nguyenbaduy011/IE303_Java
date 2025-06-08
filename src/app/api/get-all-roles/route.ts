/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export interface PermissionType {
  id: string;
  name: string;
  description: string;
}

export interface RoleWithPermissionsType {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  permissions: PermissionType[];
}

export async function fetchRoles() {
  try {
    const response = await fetch("http://localhost:8080/api/role/all", {
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
        throw new Error("Roles not found.");
      }
      throw new Error(`HTTP ${response.status}: Failed to fetch roles`);
    }

    const data = await response.json();
    const rolesArray = Array.isArray(data) ? data : [];

    const result: RoleWithPermissionsType[] = rolesArray.map(
      (role: any): RoleWithPermissionsType => ({
        id: role.id,
        created_at: role.createdAt,
        updated_at: role.updatedAt,
        name: role.name,
        description: role.description,
        permissions: Array.isArray(role.permissions)
          ? role.permissions.map(
              (p: any): PermissionType => ({
                id: p.id,
                name: p.name,
                description: p.description,
              })
            )
          : [],
      })
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to fetch roles",
      },
      { status: 500 }
    );
  }
}
