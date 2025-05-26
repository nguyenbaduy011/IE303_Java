/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, useRef } from "react";
import { Search, Paperclip, Send, Smile } from "lucide-react";
import { ChatMessage, Message } from "@/components/chat/chat-message";
import { Contact, ContactCard } from "@/components/chat/contact-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStomp } from "@/hooks/use-stomp";
import axios from "axios";
import { useAuth } from "@/contexts/auth-context";

export default function ChatPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const username = user?.email;

  const { sendMessage, isConnected } = useStomp(
    (msg: Message) => {
      setMessages((prev) => {
        if (!prev.some((m) => m.id === msg.id)) {
          return [...prev, msg];
        }
        return prev;
      });
      if (
        msg.sender === "contact" &&
        selectedContact?.id === msg.conversationId
      ) {
        axios
          .post(
            "http://localhost:8080/api/messages/read",
            { conversationId: msg.conversationId, messageIds: [msg.id] },
            { headers: { Authorization: `Bearer ${user?.sessionId}` } }
          )
          .catch((err) => console.error("Failed to mark as read:", err));
      }
    },
    user?.sessionId,
    username
  );

  // // Redirect to login if not authenticated
  // useEffect(() => {
  //   if (!isAuthenticated || !username) {
  //     window.location.href = "/login";
  //   }
  // }, [isAuthenticated, username]);

  // Setup axios interceptor for 401 errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [logout]);

  // Load messages
  const loadMessages = async (pageNum: number) => {
    if (!selectedContact || !user) return;
    setIsLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8080/api/messages/${selectedContact.id}`,
        {
          headers: { Authorization: `Bearer ${user.sessionId}` },
          params: { page: pageNum, size: 20 },
        }
      );
      setMessages((prev) =>
        pageNum === 0 ? res.data.content : [...res.data.content, ...prev]
      );
      setHasMore(!res.data.last);
      if (res.data.content.length > 0 && pageNum === 0) {
        const unreadMessageIds = res.data.content
          .filter((msg: Message) => !msg.read && msg.sender === "contact")
          .map((msg: Message) => msg.id);
        if (unreadMessageIds.length > 0) {
          await axios.post(
            "http://localhost:8080/api/messages/read",
            {
              conversationId: selectedContact.id,
              messageIds: unreadMessageIds,
            },
            { headers: { Authorization: `Bearer ${user.sessionId}` } }
          );
        }
      }
    } catch (err) {
      setError("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch contacts
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    setIsLoading(true);
    axios
      .get("http://localhost:8080/api/contacts", {
        headers: { Authorization: `Bearer ${user.sessionId}` },
      })
      .then((res) => {
        setContacts(res.data);
        if (res.data.length > 0) {
          setSelectedContact(res.data[0]);
        }
      })
      .catch((err) => setError("Failed to load contacts"))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, user]);

  // Fetch messages for selected contact
  useEffect(() => {
    setPage(0);
    loadMessages(0);
    setSearchResults([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContact]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a message
  const handleSend = async () => {
    if (!newMessage.trim() && !file) return;
    if (!selectedContact || !isConnected || !user) return;

    const tempId = crypto.randomUUID();
    const newMsg: Message = {
      id: tempId,
      content: newMessage,
      timestamp: new Date().toISOString(),
      sender: "user",
      read: false,
      conversationId: selectedContact.id,
    };

    setMessages((prev) => [...prev, newMsg]);
    setNewMessage("");
    setFile(null);

    try {
      if (file) {
        const formData = new FormData();
        formData.append("conversationId", selectedContact.id);
        formData.append("content", newMessage || "");
        formData.append("type", getMessageType(file));
        formData.append("file", file);

        const res = await axios.post("/api/messages/file", formData, {
          headers: { Authorization: `Bearer ${user.sessionId}` },
        });
        sendMessage(res.data);
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? res.data : m))
        );
      } else {
        sendMessage({
          destination: `http://localhost:8080/app/chat/${selectedContact.id}`,
          body: JSON.stringify({
            content: newMessage,
            sender: username,
            conversationId: selectedContact.id,
            tempId,
          }),
        });
        const res = await axios.post(
          "http://localhost:8080/api/messages",
          {
            conversationId: selectedContact.id,
            content: newMessage,
            messageType: "TEXT",
          },
          { headers: { Authorization: `Bearer ${user.sessionId}` } }
        );
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? res.data : m))
        );
      }
    } catch (err) {
      setError("Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedContact || !user) return;

    setFile(file);
  };

  // Helper function to determine message type
  const getMessageType = (file: File): string => {
    const contentType = file.type;
    if (contentType.startsWith("image/")) return "IMAGE";
    if (contentType.startsWith("video/")) return "VIDEO";
    if (contentType.startsWith("audio/")) return "AUDIO";
    return "FILE";
  };

  // Handle deleting a message
  const handleDelete = async (id: string) => {
    if (!user) return;

    try {
      await axios.delete(`http://localhost:8080/api/messages/${id}`, {
        headers: { Authorization: `Bearer ${user.sessionId}` },
      });
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError("Failed to delete message");
      loadMessages(0);
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!selectedContact || !searchTerm.trim() || !user) return;
    try {
      const res = await axios.get(
        `http://localhost:8080/api/messages/conversations/${selectedContact.id}/search`,
        {
          params: { keyword: searchTerm, page: 0, size: 20 },
          headers: { Authorization: `Bearer ${user.sessionId}` },
        }
      );
      setSearchResults(res.data.content);
    } catch (err) {
      setError("Failed to search messages");
    }
  };

  return (
    <div className="flex h-screen bg-muted/20">
      <aside className="w-1/3 border-r bg-background">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          {isLoading ? (
            <div className="p-4">Loading contacts...</div>
          ) : error ? (
            <div className="p-4 text-red-500">{error}</div>
          ) : (
            contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                isActive={selectedContact?.id === contact.id}
                onClick={() => setSelectedContact(contact)}
              />
            ))
          )}
        </ScrollArea>
      </aside>

      <main className="flex flex-col flex-1">
        {selectedContact ? (
          <>
            <div className="border-b p-4 flex items-center justify-between bg-background">
              <div className="flex items-center gap-3">
                <h2 className="font-medium">{selectedContact.name}</h2>
                {selectedContact.online && (
                  <span className="h-3 w-3 rounded-full bg-green-500"></span>
                )}
              </div>
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </div>
            <ScrollArea
              className="flex-1 p-4"
              onScroll={(e) => {
                const target = e.target as HTMLDivElement;
                if (target.scrollTop === 0 && hasMore && !isLoading) {
                  setPage((prev) => prev + 1);
                  loadMessages(page + 1);
                }
              }}
            >
              {isLoading && page === 0 ? (
                <div>Loading messages...</div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="relative group">
                      <ChatMessage
                        message={msg}
                        isGroup={selectedContact.isGroup}
                      />
                      {msg.sender === "user" && (
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 text-xs text-red-500"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                  <div ref={messageEndRef} />
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="p-4 border-t">
                  <h3 className="text-sm font-medium mb-2">Search Results</h3>
                  {searchResults.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      isGroup={selectedContact.isGroup}
                    />
                  ))}
                  <Button
                    variant="link"
                    onClick={() => setSearchResults([])}
                    className="mt-2"
                  >
                    Clear Results
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
                <Button variant="ghost" size="icon" title="Insert emoji">
                  <Smile className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
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
                  Attached: {file.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                    className="ml-2"
                  >
                    Remove
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
              {!isConnected && (
                <div className="text-sm text-red-500 mt-2">
                  Connecting to WebSocket...
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-medium">Select a conversation</h2>
              <p className="text-muted-foreground">
                Choose a contact to start chatting
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
