import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { MessageResponseDto } from "@/types/message-types";

const SPRING_API_URL = process.env.SPRING_API_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  let formData;
  try {
    formData = await request.formData();
  } catch (error) {
    console.error("Error parsing FormData:", error);
    return NextResponse.json(
      { error: "Invalid request body. Expected multipart/form-data." },
      { status: 400 }
    );
  }

  const conversationId = formData.get("conversationId") as string;
  const typeString = formData.get("type") as string;
  const file = formData.get("file") as File | null;

  if (!conversationId || !typeString || !file) {
    return NextResponse.json(
      { error: "Missing required fields: conversationId, type, file" },
      { status: 400 }
    );
  }

  try {
    const csrfToken = request.cookies.get("XSRF-TOKEN")?.value;
    const headers: Record<string, string> = {
      Cookie: request.headers.get("Cookie") || "",
    };
    if (csrfToken) {
      headers["X-CSRF-TOKEN"] = csrfToken;
    }

    console.log("Sending file request to Spring:", { headers, formData }); // Log để debug

    const springResponse = await fetch(`${SPRING_API_URL}/api/messages/file`, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });

    const data = await springResponse.json();

    console.log("Spring Response:", { status: springResponse.status, data }); // Log để debug

    if (!springResponse.ok) {
      return NextResponse.json(data, { status: springResponse.status });
    }

    return NextResponse.json(data as MessageResponseDto, {
      status: springResponse.status,
    });
  } catch (error) {
    console.error("Error sending file message:", error);
    return NextResponse.json(
      { error: "Lỗi server khi gửi tin nhắn kèm file đến Spring API" },
      { status: 500 }
    );
  }
}
