/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Check,
  CheckCheck,
  Clock,
  MoreVertical,
  Trash2,
  Copy,
  AlertTriangle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import MessageContent from "./message-content";
import { useState } from "react";
import { toast } from "sonner";

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
  messageType?: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE";
  fileUrl?: string;
  fileOriginalName?: string;
  fileContentType?: string;
  fileSize?: number;
  displayUrl?: string;
  isDeleted?: boolean; // Thêm field để hiển thị tin nhắn đã xóa
};

interface ChatMessageProps {
  message: Message;
  isGroup?: boolean;
  isLatest?: boolean;
  onDelete?: (messageId: string) => void;
  onCopy?: (content: string) => void;
}

export function ChatMessage({
  message,
  isGroup = false,
  isLatest = false,
  onDelete,
  onCopy,
}: ChatMessageProps) {
  const isUserMessage = message.sender === "user";
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      return <Clock className="h-3 w-3 text-muted-foreground opacity-70" />;
    }

    if (isGroup) {
      return message.read ? (
        <CheckCheck className="h-3 w-3 text-primary" />
      ) : (
        <Check className="h-3 w-3 text-muted-foreground" />
      );
    }

    return message.read ? (
      <CheckCheck className="h-3 w-3 text-primary" />
    ) : (
      <Check className="h-3 w-3 text-muted-foreground" />
    );
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    if (onCopy && message.content) {
      onCopy(message.content);
      toast.success("Đã sao chép tin nhắn");
    }
  };

  // Handle delete message with confirmation
  const handleDeleteConfirm = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(message.id);
      setIsDeleteDialogOpen(false);
      toast.success("Đã xóa tin nhắn");
    } catch (error) {
      toast.error("Không thể xóa tin nhắn");
      console.error("Error deleting message:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Convert Message to MessageResponseDto format
  const messageDto = {
    id: message.id,
    content: message.content,
    messageType: message.messageType || "TEXT",
    fileUrl: message.fileUrl,
    fileOriginalName: message.fileOriginalName,
    fileContentType: message.fileContentType,
    fileSize: message.fileSize,
    displayUrl: message.displayUrl,
    isDeleted: message.isDeleted,
  } as any;

  // Render tin nhắn đã bị xóa
  if (message.isDeleted) {
    return (
      <div
        className={cn(
          "flex gap-3 group relative animate-fade-in mb-4",
          isUserMessage ? "justify-end" : "justify-start"
        )}
      >
        {/* Avatar for non-user messages */}
        {!isUserMessage && (
          <div className="flex-shrink-0 self-end">
            <Avatar className="h-8 w-8 border-2 border-primary/10 shadow-sm ring-1 ring-primary/5 opacity-50">
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

        {/* Message content wrapper */}
        <div
          className={cn(
            "flex flex-col max-w-[80%] sm:max-w-[70%] lg:max-w-[60%]",
            isUserMessage ? "items-end" : "items-start"
          )}
        >
          {/* Deleted message bubble */}
          <div className="relative">
            <div
              className={cn(
                "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm border-2 border-dashed opacity-60",
                isUserMessage
                  ? "bg-muted text-muted-foreground border-muted-foreground/30"
                  : "bg-muted text-muted-foreground border-muted-foreground/30"
              )}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="italic">Tin nhắn đã bị xóa</span>
              </div>
            </div>
          </div>

          {/* Message metadata */}
          <div
            className={cn(
              "flex items-center gap-2 mt-1.5 px-1",
              isUserMessage ? "flex-row-reverse" : "flex-row"
            )}
          >
            <span className="text-xs text-muted-foreground font-medium">
              {formatRelativeTime(message.createdAt)}
            </span>
          </div>
        </div>

        {/* Spacer for user messages */}
        {isUserMessage && <div className="flex-shrink-0 w-8" />}
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "flex gap-3 group relative animate-fade-in mb-4",
          isUserMessage ? "justify-end" : "justify-start",
          isLatest && "animate-pulse-once"
        )}
      >
        {/* Avatar for non-user messages */}
        {!isUserMessage && (
          <div className="flex-shrink-0 self-end">
            <Avatar className="h-8 w-8 border-2 border-primary/10 shadow-sm ring-1 ring-primary/5">
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

        {/* Message content wrapper */}
        <div
          className={cn(
            "flex flex-col max-w-[80%] sm:max-w-[70%] lg:max-w-[60%]",
            isUserMessage ? "items-end" : "items-start"
          )}
        >
          {/* Sender name for group chats */}
          {isGroup && !isUserMessage && message.senderName && (
            <div className="mb-1 px-3">
              <span className="text-xs font-semibold text-primary">
                {message.senderName}
              </span>
            </div>
          )}

          {/* Message bubble */}
          <div className="relative group/message">
            <div
              className={cn(
                "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-all duration-200 break-words",
                "hover:shadow-md relative backdrop-blur-sm",
                isUserMessage
                  ? cn(
                      "bg-primary text-primary-foreground",
                      "rounded-br-md shadow-primary/20",
                      message.isTemp && "opacity-70"
                    )
                  : "bg-card text-card-foreground border border-border rounded-bl-md hover:bg-accent/30"
              )}
            >
              <MessageContent message={messageDto} isOwn={isUserMessage} />
            </div>

            {/* Action buttons - appear on hover */}
            <div
              className={cn(
                "absolute top-1 opacity-0 group-hover/message:opacity-100 transition-all duration-200 z-10",
                isUserMessage ? "-left-10" : "-right-10"
              )}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0 rounded-full shadow-lg border",
                      "hover:bg-accent hover:text-accent-foreground",
                      "bg-background/80 backdrop-blur-sm text-muted-foreground"
                    )}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align={isUserMessage ? "end" : "start"}
                  className="min-w-[160px]"
                >
                  {/* Copy option - available for all text messages */}
                  {message.content && (
                    <DropdownMenuItem
                      onClick={handleCopy}
                      className="cursor-pointer"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Sao chép
                    </DropdownMenuItem>
                  )}

                  {/* Delete option - only for user's own messages */}
                  {isUserMessage && !message.isTemp && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa tin nhắn
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Tooltip with exact time */}
            <div
              className={cn(
                "absolute top-1/2 transform -translate-y-1/2 bg-popover text-popover-foreground text-xs rounded-lg py-2 px-3 opacity-0 group-hover/message:opacity-100 transition-all duration-200 pointer-events-none z-20 whitespace-nowrap shadow-lg border border-border",
                isUserMessage ? "right-full mr-3" : "left-full ml-3"
              )}
            >
              <div className="font-medium">
                {formatExactTime(message.createdAt)}
              </div>
              {message.isTemp && (
                <div className="text-xs text-muted-foreground mt-1">
                  Đang gửi...
                </div>
              )}
            </div>
          </div>

          {/* Message metadata - compact layout */}
          <div
            className={cn(
              "flex items-center gap-2 mt-1.5 px-1",
              isUserMessage ? "flex-row-reverse" : "flex-row"
            )}
          >
            {renderStatusIcon()}
            <span className="text-xs text-muted-foreground font-medium">
              {formatRelativeTime(message.createdAt)}
            </span>
          </div>
        </div>

        {/* Spacer for user messages to maintain alignment */}
        {isUserMessage && <div className="flex-shrink-0 w-8" />}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tin nhắn</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tin nhắn này không? Hành động này không
              thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Đang xóa..." : "Xóa tin nhắn"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
