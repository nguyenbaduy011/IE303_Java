"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Contact = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  initials: string;
  online: boolean;
  lastSeen: string;
  unreadCount: number;
  isGroup?: boolean;
};

interface ContactCardProps {
  contact: Contact;
  isActive: boolean;
  onClick: () => void;
}

export function ContactCard({ contact, isActive, onClick }: ContactCardProps) {
  return (
    <button
      className={cn(
        "flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors",
        isActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
      )}
      onClick={onClick}
    >
      <div className="relative">
        <Avatar>
          <AvatarImage
            src={contact.avatar || "/placeholder.svg"}
            alt={contact.name}
          />
          <AvatarFallback>{contact.initials}</AvatarFallback>
        </Avatar>
        {/* Hiển thị trạng thái online/offline */}
        {!contact.isGroup && (
          <div
            className={cn(
              "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background transition-colors",
              contact.online
                ? "bg-green-500 shadow-green-500/50 shadow-sm"
                : "bg-gray-400 dark:bg-gray-600"
            )}
            title={contact.online ? "Đang online" : "Đã offline"}
          >
            {/* Thêm hiệu ứng nhấp nháy cho online */}
            {contact.online && (
              <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
            )}
          </div>
        )}
        {/* Hiển thị icon nhóm nếu là group chat */}
        {contact.isGroup && (
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary border-2 border-background">
            <div className="flex items-center justify-center h-full w-full">
              <span className="text-[6px] text-primary-foreground font-bold">
                G
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium truncate">{contact.name}</h3>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {contact.lastSeen}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground truncate">
              {contact.role}
            </p>
            {/* Hiển thị text trạng thái */}
            {!contact.isGroup && (
              <span
                className={cn(
                  "text-xs font-medium",
                  contact.online
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-500 dark:text-gray-400"
                )}
              >
                {contact.online ? "• Online" : "• Offline"}
              </span>
            )}
          </div>
          {contact.unreadCount > 0 && (
            <Badge className="ml-auto bg-primary">{contact.unreadCount}</Badge>
          )}
        </div>
      </div>
    </button>
  );
}
