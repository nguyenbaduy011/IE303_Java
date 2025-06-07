// app/api/conversations/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ConversationResponseDto, SpringPage } from "@/types/conversation-types"; // Adjust path

const SPRING_API_URL = process.env.SPRING_API_URL || "http://localhost:8080";

/**
 * Handles GET requests to fetch user's conversations with pagination.
 * It extracts pagination parameters from the query string and forwards them to Spring Boot.
 * @param request - The incoming NextRequest object.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Extract pagination parameters from the query string
  // Provide default values if not present
  const page = searchParams.get("page") || "0";
  const size = searchParams.get("size") || "10";
  const sort = searchParams.get("sort") || ""; // e.g., "createdAt,desc" or "name,asc"

  // Construct the query string for the Spring Boot API
  const queryParameters = new URLSearchParams({ page, size });
  if (sort) {
    queryParameters.append("sort", sort);
  }

  try {
    const springResponse = await fetch(
      `${SPRING_API_URL}/api/conversations?${queryParameters.toString()}`,
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

    // Return the paginated list of conversations
    return NextResponse.json(data as SpringPage<ConversationResponseDto>, {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching user conversations from Spring API:", error);
    return NextResponse.json(
      { error: "Internal Server Error when contacting Spring API" },
      { status: 500 }
    );
  }
}
