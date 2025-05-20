import { ReactNode } from "react";
import { NotificationType } from "./types"; // Giả sử types.ts nằm cùng thư mục

export type AnnouncementFilter = "all" | "unread" | "important";

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: NotificationType["type"];
  is_urgent: boolean;
  is_read: boolean;
  created_at: string;
  sender: {
    initials: ReactNode;
    id: string;
    first_name: string;
    last_name: string;
    role: string;
    image_url?: string | null;
  };
  hasAttachments?: boolean;
  allowComments?: boolean;
  comments?: number;
}
