/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Search, Paperclip, Send, Smile } from "lucide-react";
import { ChatMessage, Message } from "@/components/chat/chat-message";
import { Contact, ContactCard } from "@/components/chat/contact-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from "axios";
import { useAuth } from "@/contexts/auth-context";
import type { ConversationResponseDto } from "@/types/conversation-types";
import type {
  MessageRequestDto,
  MessageResponseDto,
  ReadReceiptDto,
  SpringPage,
} from "@/types/message-types";
import { MessageType } from "@/types/message-types";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { useRouter, useSearchParams } from "next/navigation";
import debounce from "lodash/debounce";
import { checkOnline, CheckOnlineResponse } from "@/app/api/check-online/route"; // Giả định đường dẫn import

// Hàm tính thời gian tương đối
const formatRelativeTime = (createdAt: string): string => {
  const now = new Date();
  const sentTime = new Date(createdAt);
  const diffMs = now.getTime() - sentTime.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "gửi vừa xong";
  } else if (diffMinutes < 60) {
    return `gửi ${diffMinutes} phút trước`;
  } else if (diffHours < 24) {
    return `gửi ${diffHours} giờ trước`;
  } else {
    return "sent";
  }
};

// Hàm định dạng thời gian chính xác khi hover
const formatExactTime = (createdAt: string): string => {
  const date = new Date(createdAt);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export default function ChatPage() {
  const {
    user,
    isAuthenticated,
    logout,
    chatMessages,
    sendChatMessage,
    isConnected,
    wsError,
  } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messagesByConversation, setMessagesByConversation] = useState<{
    [conversationId: string]: Message[];
  }>({});
  const [newMessage, setNewMessage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pageByConversation, setPageByConversation] = useState<{
    [conversationId: string]: number;
  }>({});
  const [hasMoreByConversation, setHasMoreByConversation] = useState<{
    [conversationId: string]: boolean;
  }>({});
  const markedAsReadRef = useRef<string | null>(null);
  const [tempMessages, setTempMessages] = useState<{
    [tempId: string]: { content: string; conversationId: string };
  }>({});
  const username = user?.email;
  const router = useRouter();
  const searchParams = useSearchParams();

  const { containerRef, handleScroll, handleTouchStart } = useAutoScroll([
    messagesByConversation[selectedContact?.id || ""] || [],
    chatMessages,
  ]);

  // Debounce hàm markMessagesAsRead
  const debouncedMarkMessagesAsRead = useCallback(
    debounce((conversationId: string, lastMessageId: string) => {
      markMessagesAsRead(conversationId, lastMessageId);
    }, 2000),
    []
  );

  // Setup axios interceptor for 401 errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log("401 Error detected, logging out:", error.response);
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [logout]);

  // Load all conversations (contacts) and check online status
  const loadContacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<ConversationResponseDto[]>(
        "/api/conversations/all",
        { withCredentials: true }
      );
      const fetchedContacts: Contact[] = await Promise.all(
        response.data.map(async (conv) => {
          const otherMember = conv.members.find(
            (member) => member.user.id !== conv.createdByUser?.id
          );
          const name =
            conv.name ||
            (conv.type === "DIRECT" && otherMember
              ? `${otherMember.user.firstName} ${otherMember.user.lastName}`
              : "Unknown");
          let onlineStatus = false;
          if (conv.type === "DIRECT" && otherMember) {
            const onlineResponse: CheckOnlineResponse = await checkOnline({
              id: otherMember.user.id,
            });
            onlineStatus = onlineResponse.isValid;
            if (onlineResponse.error) {
              console.error(
                `Error checking online status for ${otherMember.user.id}:`,
                onlineResponse.error
              );
            }
          }
          return {
            id: conv.id || "",
            name,
            role: conv.type === "GROUP" ? "GROUP" : "DIRECT",
            avatar: otherMember?.user?.avatarUrl || "/placeholder.svg",
            initials: name
              .split(" ")
              .map((n) => n[0] || "")
              .join("")
              .toUpperCase()
              .slice(0, 2),
            online: onlineStatus,
            lastSeen: conv.lastMessage?.timestamp
              ? new Date(conv.lastMessage.timestamp).toLocaleTimeString()
              : "Chưa có tin nhắn",
            unreadCount: conv.unreadCount || 0,
            isGroup: conv.type === "GROUP",
          };
        })
      );
      setContacts(fetchedContacts);
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Không thể tải danh sách cuộc trò chuyện"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load messages for a conversation
  const loadMessages = useCallback(
    async (conversationId: string, pageNum: number) => {
      if (!user) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<SpringPage<MessageResponseDto>>(
          `/api/conversations/${conversationId}`,
          {
            params: { page: pageNum, size: 20, sort: "timestamp,asc" },
            withCredentials: true,
          }
        );

        const newMessages: Message[] = response.data.content.map((msg) => ({
          id: msg.id,
          content:
            msg.messageType === MessageType.TEXT
              ? msg.content || ""
              : msg.fileUrl || "File",
          timestamp: msg.timestamp,
          createdAt: msg.createdAt,
          sender: msg.sender.email === user.email ? "user" : "contact",
          read: Array.isArray(msg.readBy)
            ? msg.readBy.some((r) => r.userId === user.id)
            : false,
          senderName: `${msg.sender.firstName} ${msg.sender.lastName}`,
          conversationId: msg.conversationId,
        }));

        setMessagesByConversation((prev) => ({
          ...prev,
          [conversationId]:
            pageNum === 0
              ? newMessages
              : [...newMessages, ...(prev[conversationId] || [])],
        }));
        setHasMoreByConversation((prev) => ({
          ...prev,
          [conversationId]: !response.data.last,
        }));
        setPageByConversation((prev) => ({
          ...prev,
          [conversationId]: pageNum,
        }));
      } catch (err: any) {
        setError(err.response?.data?.error || "Không thể tải tin nhắn");
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  // Mark messages as read
  const markMessagesAsRead = useCallback(
    async (conversationId: string, lastMessageId: string) => {
      if (!user) return;

      console.log("Calling markMessagesAsRead for:", {
        conversationId,
        lastMessageId,
        timestamp: new Date().toISOString(),
      });

      try {
        const response = await axios.post<{ count: number }>(
          "/api/messages/read",
          {
            conversationId,
            lastReadMessageId: lastMessageId,
          } as ReadReceiptDto,
          { withCredentials: true }
        );

        console.log("Mark as read successful:", response.data);

        setMessagesByConversation((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] || []).map((msg) =>
            msg.sender === "contact" && !msg.read ? { ...msg, read: true } : msg
          ),
        }));

        setContacts((prev) =>
          prev.map((contact) =>
            contact.id === conversationId
              ? {
                  ...contact,
                  unreadCount: Math.max(
                    0,
                    (contact.unreadCount || 0) - response.data.count
                  ),
                }
              : contact
          )
        );
      } catch (err: any) {
        console.error("Error marking messages as read:", err);
        setError(
          err.response?.data?.error || "Không thể đánh dấu tin nhắn đã đọc"
        );
      }
    },
    [user]
  );

  // Gửi trạng thái "đã đọc" khi người dùng mở đoạn chat
  useEffect(() => {
    if (!selectedContact || !user) return;

    const conversationId = selectedContact.id;
    if (markedAsReadRef.current === conversationId) return;

    const messages = messagesByConversation[conversationId] || [];
    const unreadMessages = messages.filter(
      (msg) => msg.sender === "contact" && !msg.read
    );

    if (unreadMessages.length === 0) return;

    const lastUnreadMessage = unreadMessages[unreadMessages.length - 1];
    debouncedMarkMessagesAsRead(conversationId, lastUnreadMessage.id);
    markedAsReadRef.current = conversationId;
  }, [
    selectedContact,
    user,
    messagesByConversation,
    debouncedMarkMessagesAsRead,
  ]);

  // Reset markedAsReadRef khi thay đổi selectedContact
  useEffect(() => {
    markedAsReadRef.current = null;
  }, [selectedContact]);

  // Load contacts on mount
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;

    const tryLoadContacts = async () => {
      if (!isAuthenticated) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(tryLoadContacts, 1000); // Thử lại sau 1 giây
          return;
        }
        setError("Không thể tải danh sách contact: Vui lòng đăng nhập lại");
        return;
      }

      setIsLoading(true);
      try {
        await loadContacts();
      } catch (err) {
        setError("Không thể tải danh sách contact");
      }
    };

    tryLoadContacts();
  }, [isAuthenticated, loadContacts]);

  // Load selected contact from URL, preload messages, and check online status
  useEffect(() => {
    const contactId = searchParams.get("contactId");
    if (contactId && contacts.length > 0) {
      const contact = contacts.find((c) => c.id === contactId);
      if (contact) {
        const updateSelectedContactStatus = async () => {
          let onlineStatus = contact.online;
          if (!contact.isGroup) {
            const convResponse = await axios.get<ConversationResponseDto>(
              `/api/conversations/${contact.id}`,
              { withCredentials: true }
            );
            const otherMember = convResponse.data.members.find(
              (member) => member.user.id !== user?.id
            );
            if (otherMember) {
              const onlineResponse: CheckOnlineResponse = await checkOnline({
                id: otherMember.user.id,
              });
              onlineStatus = onlineResponse.isValid;
              if (onlineResponse.error) {
                console.error(
                  `Error checking online status for ${otherMember.user.id}:`,
                  onlineResponse.error
                );
              }
            }
          }
          setSelectedContact({ ...contact, online: onlineStatus });
        };
        updateSelectedContactStatus();
        if (!messagesByConversation[contact.id]) {
          loadMessages(contact.id, 0); // Tải tin nhắn nếu chưa có
        }
      } else {
        setSelectedContact(null);
        router.push("/chat", { scroll: false });
      }
    } else {
      setSelectedContact(null);
    }
  }, [
    searchParams,
    contacts,
    router,
    messagesByConversation,
    loadMessages,
    user,
  ]);

  // Đồng bộ chatMessages từ WebSocket và xử lý tin nhắn chưa đọc
  useEffect(() => {
    if (!selectedContact) return;

    const conversationId = selectedContact.id;
    const newMessagesFromWS = chatMessages
      .filter((msg) => msg.conversationId === conversationId)
      .map((msg) => ({
        id: msg.id,
        content: msg.content,
        timestamp: msg.timestamp,
        createdAt: msg.timestamp,
        sender: msg.sender,
        read: msg.read,
        senderName: msg.senderName,
        conversationId: msg.conversationId,
      }));

    setMessagesByConversation((prev) => {
      const existingIds = new Set(
        (prev[conversationId] || []).map((msg) => msg.id)
      );
      // Kiểm tra tin nhắn trùng dựa trên nội dung và conversationId
      const uniqueNewMessages = newMessagesFromWS.filter((msg) => {
        if (existingIds.has(msg.id)) return false;
        // Kiểm tra xem tin nhắn có trùng với tin nhắn tạm thời không
        const isDuplicateTemp = Object.entries(tempMessages).some(
          ([tempId, tempMsg]) =>
            tempMsg.content === msg.content &&
            tempMsg.conversationId === msg.conversationId &&
            msg.sender === "user"
        );
        return !isDuplicateTemp;
      });

      if (uniqueNewMessages.length === 0) return prev;

      const combined = [
        ...(prev[conversationId] || []).filter((msg) => !msg.isTemp), // Loại bỏ tin nhắn tạm thời
        ...uniqueNewMessages,
      ].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      const unreadMessages = uniqueNewMessages.filter(
        (msg) => msg.sender === "contact" && !msg.read
      );
      if (
        unreadMessages.length > 0 &&
        markedAsReadRef.current !== conversationId
      ) {
        const lastUnreadMessage = unreadMessages[unreadMessages.length - 1];
        debouncedMarkMessagesAsRead(conversationId, lastUnreadMessage.id);
        markedAsReadRef.current = conversationId;
      }

      return {
        ...prev,
        [conversationId]: combined,
      };
    });
  }, [
    chatMessages,
    selectedContact,
    debouncedMarkMessagesAsRead,
    tempMessages,
  ]);

  // Search messages
  const handleSearch = useCallback(async () => {
    if (!selectedContact || !searchTerm) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<SpringPage<MessageResponseDto>>(
        `/api/messages/conversations/${selectedContact.id}/search`,
        {
          params: {
            keyword: searchTerm,
            page: 0,
            size: 20,
            sort: "timestamp,asc",
          },
          withCredentials: true,
        }
      );
      const results: Message[] = response.data.content.map((msg) => ({
        id: msg.id,
        content:
          msg.messageType === MessageType.TEXT
            ? msg.content || ""
            : msg.fileUrl || "File",
        timestamp: msg.timestamp,
        createdAt: msg.createdAt,
        displayTimestamp: new Date(msg.timestamp).toLocaleTimeString(),
        sender: msg.sender.id === user?.id ? "user" : "contact",
        read: Array.isArray(msg.readBy)
          ? msg.readBy.some((r) => r.userId === user?.id)
          : false,
        senderName: `${msg.sender.firstName} ${msg.sender.lastName}`,
        conversationId: msg.conversationId,
      }));
      setSearchResults(results);
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể tìm kiếm tin nhắn");
    } finally {
      setIsLoading(false);
    }
  }, [selectedContact, searchTerm, user]);

  // Handle send message
  const handleSend = useCallback(async () => {
    if (
      !selectedContact ||
      (!newMessage.trim() && !file) ||
      !isConnected ||
      !user
    ) {
      return;
    }

    const conversationId = selectedContact.id;
    setError(null);

    // Tạo ID tạm thời cho tin nhắn
    const tempMessageId = crypto.randomUUID();

    try {
      if (file) {
        const formData = new FormData();
        formData.append("conversationId", conversationId);
        formData.append(
          "type",
          file.type.startsWith("image/") ? "IMAGE" : "FILE"
        );
        formData.append("file", file);

        // Thêm tin nhắn file tạm thời vào UI
        const tempFileMessage: Message = {
          id: tempMessageId,
          content: URL.createObjectURL(file),
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          sender: "user",
          read: false,
          senderName: `${user.first_name} ${user.last_name}`,
          conversationId,
          isTemp: true,
        };
        setMessagesByConversation((prev) => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), tempFileMessage],
        }));
        setTempMessages((prev) => ({
          ...prev,
          [tempMessageId]: { content: file.name, conversationId },
        }));

        const response = await axios.post<MessageResponseDto>(
          "/api/messages/file",
          formData,
          {
            withCredentials: true,
          }
        );

        // Cập nhật tin nhắn tạm thời với dữ liệu từ server
        const newFileMessage: Message = {
          id: response.data.id,
          content: response.data.fileUrl || "File",
          timestamp: response.data.timestamp,
          createdAt: response.data.createdAt,
          sender: "user",
          read: false,
          senderName: `${user.first_name} ${user.last_name}`,
          conversationId,
        };
        setMessagesByConversation((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] || [])
            .filter((msg) => msg.id !== tempMessageId)
            .concat(newFileMessage),
        }));
        setTempMessages((prev) => {
          const { [tempMessageId]: _, ...rest } = prev;
          return rest;
        });
        setFile(null);
      } else {
        // Thêm tin nhắn text tạm thời vào UI
        const tempTextMessage: Message = {
          id: tempMessageId,
          content: newMessage.trim(),
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          sender: "user",
          read: false,
          senderName: `${user.first_name} ${user.last_name}`,
          conversationId,
          isTemp: true,
        };
        setMessagesByConversation((prev) => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), tempTextMessage],
        }));
        setTempMessages((prev) => ({
          ...prev,
          [tempMessageId]: { content: newMessage.trim(), conversationId },
        }));

        const messageRequest: MessageRequestDto = {
          conversationId,
          content: newMessage.trim(),
        };
        const response = await axios.post<MessageResponseDto>(
          "/api/messages",
          messageRequest,
          {
            withCredentials: true,
          }
        );

        // Cập nhật tin nhắn tạm thời với dữ liệu từ server
        const newTextMessage: Message = {
          id: response.data.id,
          content: response.data.content || "",
          timestamp: response.data.timestamp,
          createdAt: response.data.createdAt,
          sender: "user",
          read: false,
          senderName: `${user.first_name} ${user.last_name}`,
          conversationId,
        };
        setMessagesByConversation((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] || [])
            .filter((msg) => msg.id !== tempMessageId)
            .concat(newTextMessage),
        }));
        setTempMessages((prev) => {
          const { [tempMessageId]: _, ...rest } = prev;
          return rest;
        });
        setNewMessage("");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể gửi tin nhắn");
      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).filter(
          (msg) => msg.id !== tempMessageId
        ),
      }));
      setTempMessages((prev) => {
        const { [tempMessageId]: _, ...rest } = prev;
        return rest;
      });
    }
  }, [selectedContact, newMessage, file, isConnected, user]);

  // Handle file upload
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        if (selectedFile.size > 10 * 1024 * 1024) {
          setError("Kích thước file vượt quá 10MB");
          return;
        }
        setFile(selectedFile);
        setError(null);
      }
    },
    []
  );

  // Delete message
  const handleDelete = useCallback(
    async (messageId: string) => {
      setError(null);
      try {
        await axios.delete(`/api/messages/${messageId}`);
        if (selectedContact) {
          const conversationId = selectedContact.id;
          setMessagesByConversation((prev) => ({
            ...prev,
            [conversationId]: (prev[conversationId] || []).filter(
              (msg) => msg.id !== messageId
            ),
          }));
        }
        setSearchResults((prev) => prev.filter((msg) => msg.id !== messageId));
      } catch (err: any) {
        setError(err.response?.data?.error || "Không thể xóa tin nhắn");
      }
    },
    [selectedContact]
  );

  // Handle contact selection and update URL
  const handleSelectContact = useCallback(
    (contact: Contact) => {
      setSelectedContact(contact);
      router.push(`/chat?contactId=${contact.id}`, { scroll: false });
      if (!messagesByConversation[contact.id]) {
        loadMessages(contact.id, 0); // Tải tin nhắn nếu chưa có
      }
    },
    [router, messagesByConversation, loadMessages]
  );

  // Memoize contacts and current messages
  const memoizedContacts = useMemo(() => contacts, [contacts]);
  const memoizedMessages = useMemo(
    () => messagesByConversation[selectedContact?.id || ""] || [],
    [messagesByConversation, selectedContact]
  );

  return (
    <div className="flex h-[calc(100vh-66px)] bg-muted/20">
      <aside className="w-1/3 border-r bg-background">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold mb-4">Tin nhắn</h1>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm cuộc trò chuyện..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-60px-8rem)]">
          {isLoading ? (
            <div className="p-4 text-center">Đang tải danh sách contact...</div>
          ) : error ? (
            <div className="p-4 text-red-500">{error}</div>
          ) : memoizedContacts.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Không có cuộc trò chuyện nào
            </div>
          ) : (
            memoizedContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                isActive={selectedContact?.id === contact.id}
                onClick={() => handleSelectContact(contact)}
              />
            ))
          )}
        </ScrollArea>
      </aside>

      <main className="flex flex-col flex-1 h-[calc(100vh-66px)]">
        {selectedContact ? (
          <>
            <div className="border-b p-4 flex items-center justify-between bg-background">
              <div className="flex items-center gap-3">
                <h2 className="font-medium">{selectedContact.name}</h2>
                {selectedContact.online && (
                  <span className="h-3 w-3 rounded-full bg-green-500"></span>
                )}
              </div>
            </div>
            <ScrollArea
              className="flex-1 p-4 overflow-y-auto"
              ref={containerRef}
              onScroll={handleScroll}
              onTouchStart={handleTouchStart}
            >
              {isLoading && !memoizedMessages.length ? (
                <div>Đang tải tin nhắn...</div>
              ) : error || wsError ? (
                <div className="text-red-500">{error || wsError}</div>
              ) : (
                <div className="space-y-4 flex flex-col">
                  {memoizedMessages.map((msg, index) => (
                    <div key={msg.id} className="relative group">
                      <ChatMessage
                        message={msg}
                        isGroup={selectedContact.isGroup || false}
                        isLatest={index === memoizedMessages.length - 1}
                      />
                      {msg.sender === "user" && (
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 text-xs text-red-500"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="p-4 border-t">
                  <h3 className="text-sm font-medium mb-2">Kết quả tìm kiếm</h3>
                  <div className="space-y-4 flex flex-col">
                    {searchResults.map((msg) => (
                      <ChatMessage
                        key={msg.id}
                        message={msg}
                        isGroup={selectedContact.isGroup || false}
                        isLatest={false}
                      />
                    ))}
                  </div>
                  <Button
                    variant="link"
                    onClick={() => setSearchResults([])}
                    className="mt-2"
                  >
                    Xóa kết quả
                  </Button>
                </div>
              )}
            </ScrollArea>
            <div className="border-t p-4 bg-background">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Paperclip className="h-4 w-4" />
                  </label>
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button variant="ghost" size="icon" title="Chèn emoji">
                  <Smile className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1"
                  disabled={!isConnected}
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={(!newMessage.trim() && !file) || !isConnected}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {file && (
                <div className="text-sm text-muted-foreground mt-2">
                  Đã đính kèm: {file.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                    className="ml-2"
                  >
                    Xóa
                  </Button>
                </div>
              )}
              {file && file.type.startsWith("image/") && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="mt-2 max-w-xs rounded"
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-medium">Chọn một cuộc trò chuyện</h2>
              <p className="text-muted-foreground">
                Chọn một liên hệ để bắt đầu trò chuyện
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
