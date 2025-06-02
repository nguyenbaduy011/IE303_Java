export interface UserType {
  id: string;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  image_url: string;
  gender: "male" | "female" | string;
  nationality: string;
  phoneNumber: string;
  hireDate: string;
  address: string;
}

export const fetchUserById = async (
  userId: string
): Promise<UserType | null> => {
  try {
    const response = await fetch(`http://localhost:8080/api/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - Failed to fetch user`);
    }

    const data = await response.json();

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
