/* eslint-disable @typescript-eslint/no-explicit-any */
export interface MemberType {
  id: string;
  firstName: string;
  lastName: string;
}

export interface TeamType {
  id: string;
  name: string;
  leader: MemberType;
  members: MemberType[];
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export async function getTeamMembers(teamId: string): Promise<MemberType[]> {
  try {
    const res = await fetch(
      `http://localhost:8080/api/team/${teamId}/members`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!res.ok) {
      if (res.status === 401)
        throw new Error("Session expired. Please log in again.");
      if (res.status === 403)
        throw new Error("You do not have permission to view this team.");
      if (res.status === 404) throw new Error("Team not found.");
      throw new Error(`HTTP ${res.status}: Failed to fetch team members`);
    }

    const data = await res.json();

    const membersArray: any[] = Array.isArray(data.members) ? data.members : [];

    // Ánh xạ và kiểm tra dữ liệu
    return membersArray.map((member: any) => ({
      id: member.id || "",
      firstName: member.firstName || "Unknown",
      lastName: member.lastName || "Unknown",
    }));
  } catch (error) {
    console.error("Error when fetch team's members:", error);
    return [];
  }
}
