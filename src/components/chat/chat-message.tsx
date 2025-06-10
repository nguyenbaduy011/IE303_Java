import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Check, CheckCheck, Clock } from "lucide-react";

export type Message = {
  id: string;
  content: string;
  timestamp: string;
  createdAt: string;
  sender: "user" | "contact";
  read: boolean;
  senderName?: string;
  conversationId: string;
  isTemp?: boolean;
};

interface ChatMessageProps {
  message: Message;
  isGroup?: boolean;
  isLatest?: boolean;
}

export function ChatMessage({
  message,
  isGroup = false,
  isLatest = false,
}: ChatMessageProps) {
  const isUserMessage = message.sender === "user";

  // Hàm tính thời gian tương đối
  const formatRelativeTime = (createdAt: string): string => {
    const now = new Date();
    const sentTime = new Date(createdAt);
    const diffMs = now.getTime() - sentTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return "vừa xong";
    } else if (diffMinutes < 60) {
      return `${diffMinutes} phút`;
    } else if (diffHours < 24) {
      return `${diffHours} giờ`;
    } else if (diffDays < 7) {
      return `${diffDays} ngày`;
    } else {
      return sentTime.toLocaleDateString("vi-VN");
    }
  };

  // Hàm định dạng thời gian chính xác khi hover
  const formatExactTime = (createdAt: string): string => {
    const date = new Date(createdAt);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render status icon
  const renderStatusIcon = () => {
    if (!isUserMessage) return null;

    if (message.isTemp) {
      // Hiển thị icon Clock cho tin nhắn tạm thời (đang gửi)
      return <Clock className="h-3 w-3 text-muted-foreground" />;
    }

    if (isGroup) {
      // Trong nhóm, hiển thị CheckCheck nếu tin nhắn đã được đọc bởi ít nhất một người
      return message.read ? (
        <CheckCheck className="h-3 w-3 text-primary-300" />
      ) : (
        <Check className="h-3 w-3 text-muted-foreground" />
      );
    }

    // Trong chat 1-1, hiển thị CheckCheck nếu đã đọc, Check nếu chưa đọc
    return message.read ? (
      <CheckCheck className="h-3 w-3 text-primary-300" />
    ) : (
      <Check className="h-3 w-3 text-muted-foreground" />
    );
  };

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[85%] group relative animate-fade-in",
        isUserMessage ? "ml-auto flex-row-reverse" : "mr-auto",
        isLatest && "animate-pulse-once"
      )}
    >
      {/* Avatar for non-user messages */}
      {!isUserMessage && (
        <div className="flex-shrink-0">
          <Avatar className="h-8 w-8 border-2 border-primary/10 shadow-sm">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {message.senderName
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Message content */}
      <div className="flex flex-col min-w-0 flex-1">
        {/* Sender name for group chats */}
        {isGroup && !isUserMessage && message.senderName && (
          <span className="text-xs font-medium text-primary mb-1 px-1">
            {message.senderName}
          </span>
        )}

        {/* Message bubble */}
        <div className="relative group/message">
          <div
            className={cn(
              "rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm transition-all duration-200",
              "hover:shadow-md",
              isUserMessage
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-card border border-border rounded-bl-md hover:bg-accent/50"
            )}
          >
            <p className="break-words">{message.content}</p>
          </div>

          {/* Tooltip with exact time */}
          <div
            className={cn(
              "absolute top-1/2 transform -translate-y-1/2 bg-foreground text-background text-xs rounded-lg py-1.5 px-3 opacity-0 group-hover/message:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap shadow-lg",
              isUserMessage
                ? "right-full mr-2" // Tooltip bên trái cho tin nhắn của người dùng
                : "left-full ml-2" // Tooltip bên phải cho tin nhắn của contact
            )}
          >
            {formatExactTime(message.createdAt)}
          </div>
        </div>

        {/* Message metadata */}
        <div
          className={cn(
            "flex items-center gap-1.5 mt-1 px-1",
            isUserMessage ? "justify-end" : "justify-start"
          )}
        >
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(message.createdAt)}
          </span>
          {renderStatusIcon()}
        </div>
      </div>
    </div>
  );
}
