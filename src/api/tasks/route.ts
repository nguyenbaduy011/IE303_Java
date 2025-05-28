import { NextResponse } from "next/server";

export async function getUserTasks(request: Request) {
  const { searchParams } = new URL(request.url);
  const userID = searchParams.get("userID");

  if (!userID) {
    return NextResponse.json({ error: "Missing userID" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `http://localhost:8080/api/tasks?userID=${userID}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch tasks" },
        { status: res.status }
      );
    }

    const data = await res.json();

    // ✅ Trả về toàn bộ response (gồm content + metadata)
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
