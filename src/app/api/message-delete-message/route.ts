// app/api/messages/[messageId]/route.ts

// IMPORTANT: This file handles GET for fetching specific messages in a conversation (as defined previously)
// AND it will now also handle DELETE for deleting a specific message.
// Ensure the path for GET (e.g., app/api/messages/[conversationId]/route.ts) is distinct
// from the path for DELETE (this file, app/api/messages/[messageId]/route.ts).
//
// If you intend for app/api/messages/[id] to handle fetching a SINGLE message by its ID (not a conversation),
// then this file structure is correct.
// If [messageId] here is meant to be within a conversation context for DELETE,
// then the Spring endpoint /api/messages/{messageId} is a bit ambiguous without conversation context.
//
// Assuming /api/messages/{messageId} is for deleting a message directly by its ID globally by an authorized user.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { MessageResponseDto, SpringPage } from "@/types/message-types"; // For GET

const SPRING_API_URL = process.env.SPRING_API_URL || "http://localhost:8080";

// GET handler (if you want to fetch a single message by ID, otherwise remove if not needed at this path)
// Your Spring controller currently has GET /api/messages/{conversationId}, not GET /api/messages/{messageId}
// So, this GET handler might be for a different purpose or should be removed if this path is only for DELETE.
// For now, I'll comment it out as your Spring controller doesn't have a direct GET /api/messages/{messageId}
/*
    export async function GET(
      request: NextRequest,
      { params }: { params: { messageId: string } }
    ) {
      const { messageId } = params;
      if (!messageId) {
        return NextResponse.json({ error: 'Missing messageId path parameter' }, { status: 400 });
      }
      // ... implementation to fetch single message if Spring API supports it ...
      return NextResponse.json({ error: 'GET /api/messages/{messageId} not implemented in provided Spring controller' }, { status: 404 });
    }
    */

/**
 * Handles DELETE requests to delete a specific message by its ID.
 * @param request - The incoming NextRequest object.
 * @param params - Object containing route parameters, e.g., { messageId: string }.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  const { messageId } = params;

  if (!messageId) {
    return NextResponse.json(
      { error: "Missing messageId path parameter for delete" },
      { status: 400 }
    );
  }

  try {
    const springResponse = await fetch(
      `${SPRING_API_URL}/api/messages/${messageId}`,
      {
        method: "DELETE",
        headers: {
          // No 'Content-Type' needed for typical DELETE requests without a body
          Cookie: request.headers.get("Cookie") || "",
        },
      }
    );

    // Spring returns ResponseEntity<Map<String, Boolean>> which is {"success": true/false}
    if (!springResponse.ok) {
      // Try to parse error from Spring if any
      const errorData = await springResponse
        .json()
        .catch(() => ({ error: "Failed to parse error from Spring API" }));
      return NextResponse.json(errorData, { status: springResponse.status });
    }

    // If successful, Spring returns a JSON object like { "success": true }
    const data = await springResponse.json();
    return NextResponse.json(data as { success: boolean }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting message ${messageId} via Spring API:`, error);
    return NextResponse.json(
      { error: "Internal Server Error when contacting Spring API for delete" },
      { status: 500 }
    );
  }
}

// Note: If you also have GET /api/messages/{conversationId} in a file named `app/api/messages/[conversationId]/route.ts`,
// that's correct for fetching messages of a conversation.
// This file `app/api/messages/[messageId]/route.ts` then correctly handles operations on a single message by its ID, like DELETE.
// Make sure your file naming and folder structure in Next.js align with whether the dynamic part is `conversationId` or `messageId`.
// Based on your Spring controller's DELETE method, `[messageId]` is the correct dynamic segment name for this file.
