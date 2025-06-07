import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ConversationResponseDto } from "@/types/conversation-types";

const SPRING_API_URL = process.env.SPRING_API_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const parts = pathname.split("/");
  const otherUserId = parts[parts.length - 1];

  if (!otherUserId || typeof otherUserId !== "string") {
    return NextResponse.json(
      { error: "ID người dùng không hợp lệ" },
      { status: 400 }
    );
  }

  try {
    // Lấy CSRF token từ cookie
    const getCookie = (name: string): string | null => {
      const value = `; ${request.headers.get("Cookie") || ""}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
      return null;
    };
    const csrfToken = getCookie("XSRF-TOKEN");
    if (!csrfToken) {
      console.error("No CSRF token found in cookies");
      return NextResponse.json({ error: "Thiếu CSRF token" }, { status: 403 });
    }

    const springResponse = await fetch(
      `${SPRING_API_URL}/api/conversations/direct/${otherUserId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("Cookie") || "",
          "X-CSRF-TOKEN": csrfToken, // Thêm CSRF token
        },
        credentials: "include",
      }
    );

    const data = await springResponse.json();

    if (!springResponse.ok) {
      console.error("Spring API error:", data);
      return NextResponse.json(data, { status: springResponse.status });
    }

    return NextResponse.json(data as ConversationResponseDto, {
      status: springResponse.status,
    });
  } catch (error) {
    console.error(`Lỗi khi tạo/lấy cuộc trò chuyện với ${otherUserId}:`, error);
    return NextResponse.json(
      { error: "Lỗi server khi liên hệ với Spring API" },
      { status: 500 }
    );
  }
}