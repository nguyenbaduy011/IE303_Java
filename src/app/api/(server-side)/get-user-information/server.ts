import { headers } from "next/headers";
import { UserType } from "@/app/api/get-user-information/route";

export const fetchUserByIdServer = async (
  userId: string
): Promise<UserType | null> => {
  try {
    const cookieHeader = (await headers()).get("cookie") ?? "";
    const res = await fetch(`http://localhost:8080/api/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader, // gửi cookie gốc nguyên vẹn\
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} - Failed to fetch user`);
    }

    const data = await res.json();

    const user: UserType = {
      id: data.id ?? "",
      createdAt: data.createdAt ?? "",
      updatedAt: data.updatedAt ?? "",
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      email: data.email ?? "",
      birthDate: data.birthDate ?? "",
      image_url: data.image_url ?? "",
      gender: data.gender ?? "",
      nationality: data.nationality ?? "",
      phoneNumber: data.phoneNumber ?? "",
      hireDate: data.hireDate ?? "",
      address: data.address ?? "",
    };

    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};
