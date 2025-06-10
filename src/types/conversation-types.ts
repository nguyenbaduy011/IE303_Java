/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/conversation.d.ts

/**
 * Represents a member of a conversation.
 * Adjust fields to match your Spring ConversationMemberDto.
 */
export interface ConversationMemberDto {
  user: any;
  id: string; // Or number, depending on your entity ID type
  userId: string; // UUID string
  username: string;
  avatarUrl?: string;
  joinedAt: string; // ISO date string, e.g., "2023-10-27T10:30:00Z"
  role?: string; // Example roles
  // Add any other relevant fields from your Spring DTO
}

/**
 * Represents a conversation response.
 * Adjust fields to match your Spring ConversationResponseDto.
 */
export interface ConversationResponseDto {
  id: string;
  name?: string;
  type: "DIRECT" | "GROUP";
  members: Array<{
    conversationId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      birthDate: string;
      gender: string;
      avatarUrl: string;
      nationality: string;
      phoneNumber: string;
      hireDate: string;
      address: string;
    };
    joinedAt: string;
    role: string;
  }>;
  lastMessage?: {
    messageType: any;
    createdAt: any;
    id: string;
    content: string;
    timestamp: string;
  };
  unreadCount?: number;
  createdByUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    birthDate: string;
  };
}

/**
 * Represents the structure of a paginated response from Spring Data Pageable.
 */
export interface SpringPage<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // Current page number (0-indexed)
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number; // Number of elements in the current page
  empty: boolean;
}
