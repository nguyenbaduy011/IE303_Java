import { MessageCircle } from "lucide-react";
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

// Interface for conversation data
interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

// Fetch conversations from API
const fetchConversations = async (): Promise<Conversation[]> => {
  try {
    const response = await axios.get<ConversationResponseDto[]>(
      "/api/conversations/all",
      { withCredentials: true }
    );
    return response.data.map((conv) => {
      const otherMember = conv.members.find(
        (member) => member.user.id !== conv.createdByUser?.id
      );
      const name =
        conv.name ||
        (conv.type === "DIRECT" && otherMember
          ? `${otherMember.user.firstName} ${otherMember.user.lastName}`
          : "Unknown");
      return {
        id: conv.id || "",
        name,
        avatar: otherMember?.user?.avatarUrl || "/placeholder.svg",
        lastMessage: conv.lastMessage?.content || "Chưa có tin nhắn",
        timestamp: conv.lastMessage?.timestamp
          ? new Date(conv.lastMessage.timestamp).toLocaleTimeString()
          : "",
        unreadCount: conv.unreadCount || 0,
      };
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
      const fetchedConversations = await fetchConversations();
      setConversations(fetchedConversations);
      setIsLoading(false);
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
          className="relative cursor-pointer transition-colors"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
          {totalUnread > 0 && (
            <Badge
              variant="default"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary"
            >
              {totalUnread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-2" align="end">
        <div className="p-2 border-b">
          <h3 className="text-lg font-medium">Tin nhắn</h3>
        </div>
        {isLoading ? (
          <div className="p-2 text-center text-sm text-muted-foreground">
            Đang tải...
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-2 text-center text-sm text-muted-foreground">
            Không có tin nhắn
          </div>
        ) : (
          conversations.map((conv) => (
            <DropdownMenuItem
              key={conv.id}
              className="p-2 cursor-pointer hover:bg-muted"
              onClick={() => handleNavigate(conv.id)}
            >
              <div className="flex items-center gap-3 w-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={conv.avatar} alt={conv.name} />
                  <AvatarFallback>
                    {conv.name
                      .split(" ")
                      .map((n) => n[0] || "")
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{conv.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {conv.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <Badge className="h-5 w-5 flex items-center justify-center p-0 bg-primary">
                    {conv.unreadCount}
                  </Badge>
                )}
              </div>
            </DropdownMenuItem>
            ))
        )}
        <div className="p-2 border-t">
          <Button
            variant="link"
            className="w-full text-sm dark:text-white cursor-pointer"
            onClick={() => router.push("/chat")}
          >
            Xem tất cả tin nhắn
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}