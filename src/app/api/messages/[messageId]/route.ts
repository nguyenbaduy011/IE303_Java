import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SPRING_API_URL = process.env.SPRING_API_URL || "http://localhost:8080";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  const { messageId } = params;

  if (!messageId) {
    return NextResponse.json(
      { error: "Missing messageId parameter" },
      { status: 400 }
    );
  }

  try {
    // Lấy CSRF token từ cookie
    const csrfToken = request.cookies.get("XSRF-TOKEN")?.value;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Cookie: request.headers.get("Cookie") || "",
    };

    if (csrfToken) {
      headers["X-CSRF-TOKEN"] = csrfToken;
    }

    console.log("Deleting message:", { messageId, headers });

    const springResponse = await fetch(
      `${SPRING_API_URL}/api/messages/${messageId}`,
      {
        method: "DELETE",
        headers,
        credentials: "include",
      }
    );

    console.log("Spring Response Status:", springResponse.status);

    if (!springResponse.ok) {
      const errorData = await springResponse.json().catch(() => ({
        error: "Failed to delete message",
      }));
      return NextResponse.json(errorData, { status: springResponse.status });
    }

    // Spring trả về 204 No Content cho delete thành công
    return NextResponse.json(
      { success: true, message: "Message deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Internal server error when deleting message" },
      { status: 500 }
    );
  }
}
