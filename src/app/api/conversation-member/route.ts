// app/api/conversations/[conversationId]/members/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ConversationMemberDto } from "@/types/conversation-types"; // Adjust path if your types are elsewhere

// Retrieve Spring Boot API URL from environment variables
// Default to localhost:8080 if not set, for local development
const SPRING_API_URL = process.env.SPRING_API_URL || "http://localhost:8080";

/**
 * Handles GET requests to fetch members of a specific conversation.
 * It forwards the request to the Spring Boot backend.
 * @param request - The incoming NextRequest object.
 * @param params - Object containing route parameters, e.g., { conversationId: string }.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const { conversationId } = params;

  // Input validation for conversationId (optional but recommended)
  if (!conversationId || typeof conversationId !== "string") {
    return NextResponse.json(
      { error: "Invalid conversation ID format" },
      { status: 400 }
    );
  }

  try {
    // Make a GET request to the Spring Boot endpoint
    const springResponse = await fetch(
      `${SPRING_API_URL}/api/conversations/${conversationId}/members`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Crucial: Forward client's cookies to Spring backend for session handling.
          // This allows Spring's HttpSession to identify the user.
          Cookie: request.headers.get("Cookie") || "",
        },
      }
    );

    // Parse the JSON response from Spring
    const data = await springResponse.json();

    // If Spring backend returns an error, forward that error to the client
    if (!springResponse.ok) {
      return NextResponse.json(data, { status: springResponse.status });
    }

    // If successful, return the list of conversation members
    return NextResponse.json(data as ConversationMemberDto[], { status: 200 });
  } catch (error) {
    // Log the error for debugging purposes
    console.error(
      `Error fetching conversation members for ${conversationId} from Spring API:`,
      error
    );
    // Return a generic server error response
    return NextResponse.json(
      { error: "Internal Server Error when contacting Spring API" },
      { status: 500 }
    );
  }
}
