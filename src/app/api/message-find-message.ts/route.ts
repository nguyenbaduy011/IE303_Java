// app/api/messages/conversations/[conversationId]/search/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { MessageResponseDto, SpringPage } from "@/types/message-types"; // Adjust path

const SPRING_API_URL = process.env.SPRING_API_URL || "http://localhost:8080";

/**
 * Handles GET requests to search messages within a specific conversation with pagination.
 * @param request - The incoming NextRequest object.
 * @param params - Object containing route parameters, e.g., { conversationId: string }.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const { conversationId } = params;
  const { searchParams } = new URL(request.url);

  if (!conversationId) {
    return NextResponse.json(
      { error: "Missing conversationId path parameter" },
      { status: 400 }
    );
  }

  const keyword = searchParams.get("keyword");
  if (!keyword) {
    return NextResponse.json(
      { error: "Missing required query parameter: keyword" },
      { status: 400 }
    );
  }

  // Extract pagination parameters
  const page = searchParams.get("page") || "0";
  const size = searchParams.get("size") || "20"; // Matches Spring @PageableDefault
  const sort = searchParams.get("sort");

  const queryParameters = new URLSearchParams({ keyword, page, size });
  if (sort) {
    queryParameters.append("sort", sort);
  }

  try {
    const springResponse = await fetch(
      `${SPRING_API_URL}/api/messages/conversations/${conversationId}/search?${queryParameters.toString()}`,
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
      `Error searching messages in conversation ${conversationId} from Spring API:`,
      error
    );
    return NextResponse.json(
      { error: "Internal Server Error when contacting Spring API" },
      { status: 500 }
    );
  }
}
