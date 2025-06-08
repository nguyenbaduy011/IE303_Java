/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export interface PositionType {
  id: string;
  name: string;
  description: string;
}

export async function fetchPositions() {
  try {
    const response = await fetch("http://localhost:8080/api/position", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Session expired. Please log in again.");
      }
      if (response.status === 403) {
        throw new Error("You do not have permission to view this information.");
      }
      if (response.status === 404) {
        throw new Error("Positions not found.");
      }
      throw new Error(`HTTP ${response.status}: Failed to fetch positions`);
    }

    const data = await response.json();
    const positionsArray = Array.isArray(data) ? data : [];

    const result: PositionType[] = positionsArray.map(
      (position: any): PositionType => ({
        id: position.id,
        name: position.name,
        description: position.description,
      })
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to fetch positions",
      },
      { status: 500 }
    );
  }
}
