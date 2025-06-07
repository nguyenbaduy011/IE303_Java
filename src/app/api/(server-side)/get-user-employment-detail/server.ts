import { headers } from "next/headers";
import { EmploymentDetailType } from "@/app/api/employment-detail/route";

export const fetchEmploymentDetailServer = async (
  userId: string
): Promise<EmploymentDetailType | null> => {
  try {
    const cookieHeader = (await headers()).get("cookie") ?? "";
    const response = await fetch(
      `http://localhost:8080/api/user/${userId}/employment-detail`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader, // gửi cookie gốc nguyên vẹn
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status} - Failed to fetch employment detail`
      );
    }

    const data = await response.json();

    if (!data.employmentDetail) {
      return null;
    }

    const detail: EmploymentDetailType = {
      id: data.employmentDetail.id ?? "",
      start_date: data.employmentDetail.startDate ?? "",
      working_status: data.employmentDetail.workingStatus ?? "",
      user: {
        id: data.employmentDetail.user?.id ?? "",
        first_name: data.employmentDetail.user?.firstName ?? "",
        last_name: data.employmentDetail.user?.lastName ?? "",
      },
      position: {
        id: data.employmentDetail.position?.id ?? "",
        name: data.employmentDetail.position?.name ?? "",
        description: data.employmentDetail.position?.description ?? "",
      },
      department: {
        id: data.employmentDetail.department?.id ?? "",
        name: data.employmentDetail.department?.name ?? "",
        description: data.employmentDetail.department?.description ?? "",
      },
      team: {
        id: data.employmentDetail.team?.id ?? "",
        name: data.employmentDetail.team?.name ?? "",
      },
    };

    return detail;
  } catch (error) {
    console.error("Error fetching employment detail:", error);
    return null;
  }
};
