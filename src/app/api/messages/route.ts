import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type {
  MessageRequestDto,
  MessageResponseDto,
} from "@/types/message-types";

const SPRING_API_URL = process.env.SPRING_API_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  let requestBody;
  try {
    requestBody = (await request.json()) as MessageRequestDto;
  } catch (error) {
    console.error("Error parsing JSON body:", error);
    return NextResponse.json(
      { error: "Invalid request body. Expected JSON." },
      { status: 400 }
    );
  }

  if (!requestBody.conversationId || !requestBody.content) {
    return NextResponse.json(
      {
        error: "Missing required fields: conversationId, content, messageType",
      },
      { status: 400 }
    );
  }

  try {
    const csrfToken = request.cookies.get("XSRF-TOKEN")?.value;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Cookie: request.headers.get("Cookie") || "",
    };
    if (csrfToken) {
      headers["X-CSRF-TOKEN"] = csrfToken;
    }

    console.log("Sending request to Spring:", { headers, body: requestBody }); // Log để debug

    const springResponse = await fetch(`${SPRING_API_URL}/api/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
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
    console.error("Error sending message via Spring API:", error);
    return NextResponse.json(
      { error: "Lỗi server khi gửi tin nhắn đến Spring API" },
      { status: 500 }
    );
  }
}
