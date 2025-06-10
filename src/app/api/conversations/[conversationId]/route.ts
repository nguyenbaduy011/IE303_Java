// app/api/messages/[conversationId]/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { MessageResponseDto, SpringPage } from "@/types/message-types"; // Adjust path

const SPRING_API_URL = process.env.SPRING_API_URL || "http://localhost:8080";

/**
 * Handles GET requests to fetch messages for a specific conversation with pagination.
 * @param request - The incoming NextRequest object.
 * @param params - Object containing route parameters, e.g., { conversationId: string }.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const conversationId = url.pathname.split("/").pop();

  const searchParams = url.searchParams;

  if (!conversationId || conversationId === "messages") {
    return NextResponse.json(
      { error: "Missing or invalid conversationId path parameter" },
      { status: 400 }
    );
  }

  // Extract pagination parameters (e.g., page, size, sort)
  const page = searchParams.get("page") || "0"; // Default to page 0
  const size = searchParams.get("size") || "20"; // Default to size 20 (matches Spring @PageableDefault)
  const sort = searchParams.get("sort"); // e.g., "timestamp,desc"

  const queryParameters = new URLSearchParams({ page, size });
  if (sort) {
    queryParameters.append("sort", sort);
  }

  try {
    const springResponse = await fetch(
      `${SPRING_API_URL}/api/conversations/${conversationId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("Cookie") || "",
        },
      }
    );

    const data = await springResponse.json();

    if (!springResponse.ok) {
      return NextResponse.json(data, { status: springResponse.status });
    }

    return NextResponse.json(data as SpringPage<MessageResponseDto>, {
      status: 200,
    });
  } catch (error) {
    console.error(
      `Error fetching messages for conversation ${conversationId} from Spring API:`,
      error
    );
    return NextResponse.json(
      { error: "Internal Server Error when contacting Spring API" },
      { status: 500 }
    );
  }
}
