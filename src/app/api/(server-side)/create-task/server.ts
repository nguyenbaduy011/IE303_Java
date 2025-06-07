/* eslint-disable @typescript-eslint/no-explicit-any */
import {  headers } from "next/headers";
import { TaskType } from "@/app/api/get-user-task/route";

export async function createTaskServer({
  name,
  description,
  deadline,
  status,
  assignedToId,
}: {
  name: string;
  description: string;
  deadline: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  assignedToId: string;
}): Promise<TaskType> {
  try {
    const cookieHeader = (await headers()).get("cookie") ?? "";

    const res = await fetch("http://localhost:8080/api/task/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader, // gửi cookie gốc nguyên vẹn\
      },
      body: JSON.stringify({
        name,
        description,
        deadline,
        status,
        assignedToId,
      }),
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error || `Create task failed with status ${res.status}`
      );
    }

    const data = await res.json();

    return {
      id: data.id ?? "",
      created_at: data.createdAt ?? "",
      updated_at: data.updatedAt ?? "",
      name: data.name ?? "",
      description: data.description ?? "",
      deadline: data.deadline ?? "",
      status: data.status ?? "",
      assigned_to: {
        id: data.assignedTo?.id ?? "",
        first_name: data.assignedTo?.firstName ?? "",
        last_name: data.assignedTo?.lastName ?? "",
      },
    };
  } catch (error: any) {
    console.error("Create task error:", error);
    throw new Error(
      error.message || "Something went wrong while creating task"
    );
  }
}
