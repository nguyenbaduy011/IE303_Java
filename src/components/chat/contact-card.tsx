"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Contact {
  id: number;
  name: string;
  role: string;
  avatar: string;
  initials: string;
  online: boolean;
  lastSeen: string;
  unreadCount: number;
  isGroup?: boolean;
}

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
        {contact.online && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
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
          <p className="text-xs text-muted-foreground truncate">
            {contact.role}
          </p>
          {contact.unreadCount > 0 && (
            <Badge className="ml-auto bg-primary">{contact.unreadCount}</Badge>
          )}
        </div>
      </div>
    </button>
  );
}
