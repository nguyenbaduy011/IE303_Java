import { NextResponse } from "next/server";

export async function getOnlineUsers() {

  try {
    const res = await fetch(`http://localhost:8080/api/session/online-users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch online users" },
        { status: res.status }
      );
    }

    const data = await res.json();

    // ✅ Trả về toàn bộ response (gồm content + metadata)
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching online users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
