// app/api/messages/sync/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type {
  SyncMessagesRequestDto,
  MessageResponseDto,
} from "@/types/message-types"; // Adjust path

const SPRING_API_URL = process.env.SPRING_API_URL || "http://localhost:8080";

/**
 * Handles POST requests to synchronize messages.
 * @param request - The incoming NextRequest object, expecting a JSON body with SyncMessagesRequestDto.
 */
export async function POST(request: NextRequest) {
  let requestBody;
  try {
    requestBody = (await request.json()) as SyncMessagesRequestDto;
  } catch (error) {
    console.error("Error parsing JSON body for sync messages:", error);
    return NextResponse.json(
      { error: "Invalid request body. Expected JSON." },
      { status: 400 }
    );
  }

  // Add validation for requestBody based on SyncMessagesRequestDto structure
  // e.g., if ( !requestBody.lastSyncTimestampsByConversation ) { ... }

  try {
    const springResponse = await fetch(`${SPRING_API_URL}/api/messages/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("Cookie") || "",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await springResponse.json();

    if (!springResponse.ok) {
      return NextResponse.json(data, { status: springResponse.status });
    }

    // Spring returns Map<UUID, List<MessageResponseDto>>
    // This should be correctly typed if your DTO matches.
    return NextResponse.json(data as Record<string, MessageResponseDto[]>, {
      status: 200,
    });
  } catch (error) {
    console.error("Error syncing messages via Spring API:", error);
    return NextResponse.json(
      { error: "Internal Server Error when contacting Spring API" },
      { status: 500 }
    );
  }
}
