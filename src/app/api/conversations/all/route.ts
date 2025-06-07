// app/api/conversations/all/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ConversationResponseDto } from "@/types/conversation-types"; // Adjust path

const SPRING_API_URL = process.env.SPRING_API_URL || "http://localhost:8080";

/**
 * Handles GET requests to fetch all conversations for the current user.
 * @param request - The incoming NextRequest object.
 */
export async function GET(request: NextRequest) {
  try {
    const springResponse = await fetch(
      `${SPRING_API_URL}/api/conversations/all`,
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

    // Return the list of all conversations
    return NextResponse.json(data as ConversationResponseDto[], {
      status: 200,
    });
  } catch (error) {
    console.error(
      "Error fetching all user conversations from Spring API:",
      error
    );
    return NextResponse.json(
      { error: "Internal Server Error when contacting Spring API" },
      { status: 500 }
    );
  }
}
