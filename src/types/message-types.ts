/**
 * Enum for MessageType, matching your Spring enum.
 */
export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  FILE = "FILE",
}

/**
 * Represents the request DTO for sending a message.
 * Adjusted to match Spring MessageRequestDto and API route requirements.
 */
export interface MessageRequestDto {
  conversationId: string; // UUID string
  content?: string; // Required for TEXT, optional for IMAGE/VIDEO/AUDIO/FILE
  messageType?: MessageType; // Required
  replyToMessageId?: string; // UUID string, optional
  fileUrl?: string; // For messages with pre-uploaded files
  fileOriginalName?: string;
  fileContentType?: string;
  fileSize?: number;
}

/**
 * Represents the response DTO for a message.
 * Adjusted to match Spring MessageResponseDto and frontend usage.
 */
export interface MessageResponseDto {
  id: string; // Message UUID string
  createdAt: string; // ISO date string
  updatedAt: string;
  conversationId: string; // Conversation UUID string
  sender: {
    id: string; // Sender's UUID string
    email: string; // Sender's email
    firstName: string; // Sender's first name
    lastName: string; // Sender's last name
    username: string; // For display
    avatarUrl?: string; // Optional
  };
  content?: string; // Message content
  messageType: MessageType;
  fileUrl?: string;
  fileOriginalName?: string;
  fileContentType?: string;
  fileSize?: number;
  timestamp: string; // ISO date string, e.g., "2023-10-27T10:30:00Z"
  isEdited?: boolean;
  isDeleted?: boolean;
  readBy: Array<{
    userId: string; // UUID string
    readAt: string; // ISO date string
  }>;
  reactions?: Array<{
    userId: string; // UUID string
    reactionType: string; // e.g., '👍', '❤️'
  }>;
  replyToMessageId?: string; // UUID of the message being replied to
  replyToMessageContent?: string; // Snippet of the replied message
  replyToMessageSender?: string; // Username of the replied message's sender
}

/**
 * Represents the DTO for marking messages as read.
 * Adjusted to match Spring ReadReceiptDto.
 */
export interface ReadReceiptDto {
  conversationId: string; // UUID string
  lastReadMessageId: string; // UUID string of the last message read
  readAt?: string; // ISO string, set by backend
}

/**
 * Represents the DTO for synchronizing messages.
 * Adjusted to match Spring SyncMessagesRequestDto.
 */
export interface SyncMessagesRequestDto {
  lastSyncTimestampsByConversation: Record<string, string>; // Record<conversationId: UUID, lastMessageTimestamp: ISOString>
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
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
