/* eslint-disable @typescript-eslint/no-explicit-any */
import { headers } from "next/headers";

export interface UserType {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  gender: "male" | "female" | string;
  nationality: string;
  phoneNumber: string;
  hireDate: string;
  address: string;
  image_url?: string; // optional nếu API không trả
}

export interface PositionType {
  id: string;
  name: string;
  description: string;
}

export interface DepartmentType {
  id: string;
  name: string;
  description: string;
}

export interface PermissionType {
  id: string;
  name: string;
  description: string;
}

export interface RoleType {
  id: string;
  name: string;
  description: string;
  permissions: PermissionType[];
}

export type TeamLeaderType = UserType;

export interface TeamType {
  id: string;
  name: string;
  leader: TeamLeaderType;
}

export interface FullUserData {
  user: UserType;
  position: PositionType;
  department: DepartmentType;
  team: TeamType;
  role: RoleType;
  startDate: string;
  workingStatus: "active" | "inactive" | string;
}

export const fetchCurrentUserServer =
  async (): Promise<FullUserData | null> => {
    try {
      const cookieHeader = (await headers()).get("cookie") ?? "";

      const res = await fetch("http://localhost:8080/api/user/current-user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} - Failed to fetch user`);
      }

      const data = await res.json();

      // Validate hoặc gán giá trị fallback nếu cần thiết
      const fullUserData: FullUserData = {
        user: {
          id: data.user.id ?? "",
          firstName: data.user.firstName ?? "",
          lastName: data.user.lastName ?? "",
          email: data.user.email ?? "",
          birthDate: data.user.birthDate ?? "",
          gender: data.user.gender ?? "",
          nationality: data.user.nationality ?? "",
          phoneNumber: data.user.phoneNumber ?? "",
          hireDate: data.user.hireDate ?? "",
          address: data.user.address ?? "",
          image_url: data.user.image_url ?? "",
        },
        position: {
          id: data.position.id ?? "",
          name: data.position.name ?? "",
          description: data.position.description ?? "",
        },
        department: {
          id: data.department.id ?? "",
          name: data.department.name ?? "",
          description: data.department.description ?? "",
        },
        team: {
          id: data.team?.id ?? "",
          name: data.team?.name ?? "",
          leader: {
            id: data.team?.leader?.id ?? "",
            firstName: data.team?.leader?.firstName ?? "",
            lastName: data.team?.leader?.lastName ?? "",
            email: data.team?.leader?.email ?? "",
            birthDate: data.team?.leader?.birthDate ?? "",
            gender: data.team?.leader?.gender ?? "",
            nationality: data.team?.leader?.nationality ?? "",
            phoneNumber: data.team?.leader?.phoneNumber ?? "",
            hireDate: data.team?.leader?.hireDate ?? "",
            address: data.team?.leader?.address ?? "",
            image_url: data.team?.leader?.image_url ?? "",
          },
        },
        role: {
          id: data.role.id ?? "",
          name: data.role.name ?? "",
          description: data.role.description ?? "",
          permissions: Array.isArray(data.role.permissions)
            ? data.role.permissions.map((p: any) => ({
                id: p.id ?? "",
                name: p.name ?? "",
                description: p.description ?? "",
              }))
            : [],
        },
        startDate: data.startDate ?? "",
        workingStatus: data.workingStatus ?? "",
      };

      return fullUserData;
    } catch (error) {
      console.error("Error fetching full user data:", error);
      return null;
    }
  };
