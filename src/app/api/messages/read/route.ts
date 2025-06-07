import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ReadReceiptDto } from "@/types/message-types";

const SPRING_API_URL = process.env.SPRING_API_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  let requestBody: ReadReceiptDto;

  try {
    requestBody = await request.json();
  } catch (error) {
    console.error("❌ Failed to parse JSON body:", error);
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { conversationId, lastReadMessageId } = requestBody;

  if (!conversationId || !lastReadMessageId) {
    return NextResponse.json(
      { error: "Missing required fields: conversationId, lastReadMessageId" },
      { status: 400 }
    );
  }

  try {
    // 👇 Lấy CSRF token từ cookie
    const csrfToken = request.cookies.get("XSRF-TOKEN")?.value;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Cookie: request.headers.get("Cookie") || "",
    };

    // 👇 Gửi kèm CSRF token nếu có
    if (csrfToken) {
      headers["X-CSRF-TOKEN"] = csrfToken;
    }

    console.log("📤 Sending request to Spring /api/messages/read", {
      headers,
      body: requestBody,
    });

    const springResponse = await fetch(`${SPRING_API_URL}/api/messages/read`, {
      method: "POST",
      headers,
      body: JSON.stringify({ conversationId, lastReadMessageId }),
      credentials: "include", // 👈 Phải có nếu bạn cần gửi cookie
    });

    const contentType = springResponse.headers.get("content-type");
    let count: number;

    if (!springResponse.ok) {
      const errorData = await springResponse
        .json()
        .catch(() => ({ error: "Failed to parse error from Spring" }));
      return NextResponse.json(errorData, {
        status: springResponse.status,
      });
    }

    if (contentType?.includes("application/json")) {
      const json = await springResponse.json();
      count = json.count ?? json.value ?? json;
    } else {
      const text = await springResponse.text();
      count = parseInt(text, 10);
      if (isNaN(count)) {
        return NextResponse.json(
          { error: "Invalid response from Spring", details: text },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error("❌ Error contacting Spring API:", {
      requestBody,
      error,
    });
    return NextResponse.json(
      { error: "Failed to contact backend service." },
      { status: 500 }
    );
  }
}
