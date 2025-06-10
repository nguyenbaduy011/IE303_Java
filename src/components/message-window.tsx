/* eslint-disable @typescript-eslint/no-unused-vars */
import { MessageCircle, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import type { ConversationResponseDto } from "@/types/conversation-types";
import { cn } from "@/lib/utils";

// Interface for conversation data
interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isGroup: boolean;
}

// Format time helper
const formatTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `${diffDays} ngày`;
    } else if (diffHours > 0) {
      return `${diffHours} giờ`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes > 0 ? `${diffMinutes} phút` : "Vừa xong";
    }
  } catch (error) {
    return "";
  }
};

// Fetch conversations from API
const fetchConversations = async (): Promise<Conversation[]> => {
  try {
    const response = await axios.get<ConversationResponseDto[]>(
      "/api/conversations/all",
      { withCredentials: true }
    );

    console.log("Raw conversations data:", response.data); // Debug log

    return response.data.map((conv) => {
      const currentUserId = conv.createdByUser?.id;
      const otherMember = conv.members.find(
        (member) => member.user.id !== currentUserId
      );

      let name = "";
      let avatar = "/placeholder.svg";

      if (conv.type === "DIRECT" && otherMember) {
        name = `${otherMember.user.firstName} ${otherMember.user.lastName}`;
        avatar = otherMember.user.avatarUrl || "/placeholder.svg";
      } else {
        name = conv.name || "Nhóm chat";
      }

      // Xử lý lastMessage an toàn hơn
      let lastMessage = "Chưa có tin nhắn";
      let timestamp = "";

      if (conv.lastMessage) {
        // Kiểm tra content có tồn tại không
        if (conv.lastMessage.content && conv.lastMessage.content.trim()) {
          lastMessage = conv.lastMessage.content;
        } else if (conv.lastMessage.messageType) {
          // Xử lý các loại message khác ngoài text
          switch (conv.lastMessage.messageType) {
            case "IMAGE":
              lastMessage = "📷 Hình ảnh";
              break;
            case "VIDEO":
              lastMessage = "🎥 Video";
              break;
            case "AUDIO":
              lastMessage = "🎵 Audio";
              break;
            case "FILE":
              lastMessage = "📎 File";
              break;
            default:
              lastMessage = "Tin nhắn";
          }
        }

        // Xử lý timestamp
        if (conv.lastMessage.createdAt) {
          timestamp = formatTime(conv.lastMessage.createdAt);
        }
      }

      const result = {
        id: conv.id || "",
        name,
        avatar,
        lastMessage,
        timestamp,
        unreadCount: conv.unreadCount || 0,
        isGroup: conv.type === "GROUP",
      };

      console.log("Mapped conversation:", result); // Debug log
      return result;
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
};

export function MessageWindow() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const totalUnread = conversations.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0
  );

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true);
      try {
        const fetchedConversations = await fetchConversations();
        console.log("Fetched conversations:", fetchedConversations); // Debug log
        setConversations(fetchedConversations);
      } catch (error) {
        console.error("Error loading conversations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadConversations();
  }, []);

  // Handle navigation to chat page
  const handleNavigate = (conversationId: string) => {
    router.push(`/chat?contactId=${conversationId}`);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          aria-label="Messages"
          className="relative cursor-pointer transition-all duration-200 hover:bg-primary/10 hover:border-primary/30"
          size="icon"
        >
          <MessageCircle className="h-5 w-5" />
          {totalUnread > 0 && (
            <Badge
              variant="default"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground font-semibold text-xs shadow-lg animate-pulse"
            >
              {totalUnread > 99 ? "99+" : totalUnread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-96 p-0 shadow-xl border-border"
        align="end"
      >
        {/* Header */}
        <div className="p-4 border-b bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Tin nhắn</h3>
            {totalUnread > 0 && (
              <Badge className="bg-primary/10 text-primary border border-primary/20">
                {totalUnread} chưa đọc
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">
                  Đang tải tin nhắn...
                </p>
              </div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <MessageCircle className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  Không có tin nhắn nào
                </p>
              </div>
            </div>
          ) : (
            <div className="p-2">
              {conversations.map((conv, index) => (
                <DropdownMenuItem
                  key={conv.id}
                  className={cn(
                    "p-3 cursor-pointer rounded-lg mb-1 transition-all duration-200",
                    "hover:bg-accent/50 focus:bg-accent/50",
                    "border border-transparent hover:border-primary/20"
                  )}
                  onClick={() => handleNavigate(conv.id)}
                >
                  <div className="flex items-center gap-3 w-full">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-12 w-12 border-2 border-border shadow-sm">
                        <AvatarImage src={conv.avatar} alt={conv.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {conv.name
                            .split(" ")
                            .map((n) => n[0] || "")
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {conv.isGroup && (
                        <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                          <div className="h-2 w-2 bg-primary-foreground rounded-full"></div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-foreground truncate text-sm">
                          {conv.name}
                        </span>
                        {conv.timestamp && (
                          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                            {conv.timestamp}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate flex-1">
                          {conv.lastMessage}
                        </p>
                        {conv.unreadCount > 0 && (
                          <Badge className="ml-2 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs font-semibold shadow-sm">
                            {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-card/30">
          <Button
            variant="ghost"
            className="w-full text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            onClick={() => router.push("/chat")}
          >
            Xem tất cả tin nhắn
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
