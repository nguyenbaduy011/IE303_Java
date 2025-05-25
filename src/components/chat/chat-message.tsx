import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  content: string;
  timestamp: string;
  sender: "user" | "contact";
  read: boolean;
  senderName?: string;
}

interface ChatMessageProps {
  message: Message;
  isGroup?: boolean;
}

export function ChatMessage({ message, isGroup = false }: ChatMessageProps) {
  const isUserMessage = message.sender === "user";

  return (
    <div
      className={cn(
        "flex gap-2 max-w-[80%]",
        isUserMessage ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      {!isUserMessage && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback>
            {message.senderName
              ?.split(" ")
              .map((n) => n[0])
              .join("") || "U"}
          </AvatarFallback>
        </Avatar>
      )}
      <div className="flex flex-col">
        {isGroup && !isUserMessage && message.senderName && (
          <span className="text-xs font-medium text-muted-foreground mb-1">
            {message.senderName}
          </span>
        )}
        <div
          className={cn(
            "rounded-lg p-3 text-sm",
            isUserMessage ? "bg-primary text-primary-foreground" : "bg-muted"
          )}
        >
          {message.content}
        </div>
        <div
          className={cn(
            "flex items-center gap-1 mt-1 text-xs",
            isUserMessage ? "justify-end" : "justify-start"
          )}
        >
          <span className="text-muted-foreground">{message.timestamp}</span>
          {isUserMessage && (
            <span className="text-xs text-primary">
              {message.read ? "Read" : "Sent"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
