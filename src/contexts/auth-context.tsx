/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { logoutUser } from "@/app/api/logout/route";
import { checkSession } from "@/app/api/check-session/route";
import Loading from "@/components/loading";
import { toast } from "sonner";

export type UserType = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  sessionId: string;
  passwordChangeRequired: boolean;
  hire_date: string;
  birth_date: string;
  gender: string;
  nationality: string;
  image_url: string | null;
  phone_number: string;
  address: string;
  role: {
    id: string;
    name: string;
    description?: string;
    permissions: Array<{
      id: string;
      name: string;
      description?: string;
    }>;
  };
  department?: {
    id: string;
    name: string;
  };
  position?: {
    id: string;
    name: string;
  };
  team?: {
    id: string;
    name: string;
  };
  working_status: string;
  salary: number;
};

export type Notification = {
  id: string;
  message: string;
  timestamp: string;
};

export type ChatMessage = {
  id: string;
  content: string;
  timestamp: string;
  sender: "user" | "contact";
  read: boolean;
  senderName?: string;
  conversationId: string;
};

type AuthContextType = {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  notifications: Notification[];
  chatMessages: ChatMessage[];
  sendChatMessage: (conversationId: string, content: string) => void;
  isConnected: boolean;
  wsError: string | null;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setWsError: React.Dispatch<React.SetStateAction<string | null>>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: async () => {},
  isAuthenticated: false,
  notifications: [],
  chatMessages: [],
  sendChatMessage: () => {},
  isConnected: false,
  wsError: null,
  setNotifications: () => {},
  setChatMessages: () => {},
  setWsError: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [wsError, setWsError] = useState<string | null>(null);
  const router = useRouter();

  // STOMP client refs - Bỏ heartbeatIntervalRef vì dùng STOMP built-in heartbeat
  const stompClientRef = useRef<Client | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 3; // Giảm số lần thử reconnect
  const isConnectingRef = useRef<boolean>(false);

  // Hàm lấy giá trị cookie
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  // Hàm set cookie
  const setCookie = (name: string, value: string, options: string = "") => {
    document.cookie = `${name}=${value}; path=/; SameSite=Strict; ${options}`;
  };

  // Hàm xóa cookie
  const deleteCookies = () => {
    const expireDate = "Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = `user=; path=/; expires=${expireDate}; SameSite=Strict`;
    document.cookie = `session=; path=/; expires=${expireDate}; SameSite=Strict`;
    document.cookie = `SOCIUS_SESSION=; path=/; expires=${expireDate}; SameSite=Strict`;
    document.cookie = `XSRF-TOKEN=; path=/; expires=${expireDate}; SameSite=Strict`;
  };

  // Hàm lấy CSRF token
  const getCsrfToken = async (): Promise<string | null> => {
    try {
      let token = getCookie("XSRF-TOKEN");

      if (!token) {
        console.log("Fetching CSRF token...");
        const response = await fetch("http://localhost:8080/api/csrf/token", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          token = data.token;
          if (token) {
            setCookie("XSRF-TOKEN", token);
            console.log("CSRF token retrieved and stored");
          }
        } else {
          console.error("Failed to get CSRF token:", response.status);
          return null;
        }
      }

      return token;
    } catch (error) {
      console.error("Error getting CSRF token:", error);
      return null;
    }
  };

  // Hàm refresh trạng thái online
  const refreshOnlineStatus = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/user-online/refresh/${user.id}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        console.log("Online status refreshed successfully");
      } else {
        console.warn("Failed to refresh online status:", response.status);
      }
    } catch (error) {
      console.error("Error refreshing online status:", error);
    }
  };

  // API để mark user offline
  const markUserOfflineAPI = async () => {
    if (!user?.id) return;

    try {
      await fetch(`http://localhost:8080/api/user-online/offline/${user.id}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("User marked offline via API");
    } catch (error) {
      console.error("Error marking user offline:", error);
    }
  };

  // Tách riêng việc đăng ký subscribers
  const subscribeToChannels = (client: Client) => {
    if (!user) return;

    console.log("Subscribing to channels for user:", user.id);

    // 1. Subscribe nhận tin nhắn cá nhân
    const privateSubscription = client.subscribe(
      `/user/${user.id}/queue/messages`,
      (message) => {
        try {
          const messageData = JSON.parse(message.body);
          console.log("Received message from WebSocket:", messageData);

          if (messageData.type === "CHAT_MESSAGE") {
            handleChatMessage(messageData.data);
          } else if (messageData.type === "TEST_MESSAGE") {
            console.log("Test message received:", messageData);
            toast.success("WebSocket kết nối thành công!");
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      }
    );

    // 2. Subscribe conversation updates
    const conversationSubscription = client.subscribe(
      `/topic/conversations/+`, // Không dùng wildcard, sẽ subscribe cụ thể sau
      (message) => {
        try {
          const messageData = JSON.parse(message.body);
          console.log("Received conversation update:", messageData);

          if (messageData.type === "CONVERSATION_UPDATE") {
            handleConversationUpdate(messageData);
          }
        } catch (error) {
          console.error("Error parsing conversation update:", error);
        }
      }
    );

    // 3. Subscribe read receipts
    const receiptSubscription = client.subscribe(
      `/user/${user.id}/queue/receipts`,
      (message) => {
        try {
          const receiptData = JSON.parse(message.body);
          console.log("Received read receipt:", receiptData);
          handleReadReceipt(receiptData);
        } catch (error) {
          console.error("Error parsing read receipt:", error);
        }
      }
    );

    // 4. Subscribe offline messages
    const offlineSubscription = client.subscribe(
      `/user/${user.id}/queue/offline-messages`,
      (message) => {
        try {
          const messagesArray = JSON.parse(message.body);
          console.log("Received offline messages:", messagesArray);

          if (Array.isArray(messagesArray) && messagesArray.length > 0) {
            messagesArray.forEach((messageData) => {
              handleChatMessage(messageData);
            });

            toast.info(`📬 Bạn có ${messagesArray.length} tin nhắn chưa đọc`);
          }
        } catch (error) {
          console.error("Error parsing offline messages:", error);
        }
      }
    );

    // 5. Subscribe notifications
    const notificationSubscription = client.subscribe(
      `/topic/user/${user.id}`,
      (message) => {
        try {
          const parsedMessage = JSON.parse(message.body);

          if (parsedMessage.type === "NOTIFICATION") {
            setNotifications((prev) => [
              ...prev,
              {
                id: parsedMessage.id || Date.now().toString(),
                message: parsedMessage.data.message,
                timestamp: parsedMessage.data.timestamp,
              },
            ]);
          } else {
            handleWebSocketMessage(parsedMessage);
          }
        } catch (error) {
          console.error("Error parsing notification:", error);
        }
      }
    );

    console.log("All subscriptions created successfully");
  };

  // Thêm các helper functions
  const handleChatMessage = (messageData: any) => {
    // Chỉ xử lý nếu không phải tin nhắn của chính mình
    if (messageData.senderId && messageData.senderId !== user?.id) {
      setChatMessages((prev) => {
        // Kiểm tra trùng lặp
        const exists = prev.some((msg) => msg.id === messageData.id);
        if (exists) {
          console.log("Message already exists, skipping:", messageData.id);
          return prev;
        }

        const newMessage: ChatMessage = {
          id: messageData.id,
          content: messageData.content,
          timestamp: messageData.timestamp,
          sender: "contact",
          read: messageData.isRead || false,
          senderName: messageData.senderName,
          conversationId: messageData.conversationId,
        };

        console.log("Adding new message to state:", newMessage);

        // Hiển thị notification
        // toast.info(`💬 ${messageData.senderName}: ${messageData.content}`);

        return [...prev, newMessage];
      });
    }
  };

  const handleConversationUpdate = (updateData: any) => {
    console.log("Handling conversation update:", updateData);
    // Có thể trigger re-fetch conversation list hoặc update UI
  };

  const handleReadReceipt = (receiptData: any) => {
    console.log("Handling read receipt:", receiptData);
    // Update UI để hiển thị tin nhắn đã được đọc
    setChatMessages((prev) =>
      prev.map((msg) =>
        msg.conversationId === receiptData.conversationId &&
        msg.id === receiptData.lastReadMessageId
          ? { ...msg, read: true }
          : msg
      )
    );
  };

  // Khởi tạo STOMP connection với heartbeat tự động
  const initializeWebSocket = async () => {
    if (
      !user?.sessionId ||
      !user?.id ||
      stompClientRef.current?.active ||
      isConnectingRef.current
    ) {
      return;
    }

    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.warn(
        "Max STOMP reconnect attempts reached. Stopping reconnection."
      );
      setWsError("Không thể kết nối với server. Vui lòng kiểm tra mạng.");
      disconnectWebSocket();
      return;
    }

    isConnectingRef.current = true;

    try {
      const csrfToken = await getCsrfToken();
      if (!csrfToken) {
        throw new Error("Không thể lấy CSRF token");
      }

      const wsUrl = `http://localhost:8080/ws-heartbeat?X-CSRF-TOKEN=${encodeURIComponent(
        csrfToken
      )}`;
      console.log("Attempting STOMP connection to:", wsUrl);

      const socket = new SockJS(wsUrl);
      const client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          sessionId: user.sessionId,
          userId: user.id,
          "X-CSRF-TOKEN": csrfToken,
        },
        // Sử dụng STOMP built-in heartbeat - đơn giản và hiệu quả
        heartbeatIncoming: 25000, // Expect heartbeat từ server mỗi 30s
        heartbeatOutgoing: 25000, // Gửi heartbeat đến server mỗi 30s
        reconnectDelay: 0, // Tắt auto-reconnect của STOMP, tự quản lý
        onConnect: (frame) => {
          console.log("STOMP connected:", frame);
          stompClientRef.current = client;
          reconnectAttemptsRef.current = 0;
          isConnectingRef.current = false;
          setIsConnected(true);
          setWsError(null);

          // Đăng ký subscribers
          subscribeToChannels(client);

          // Refresh trạng thái online ngay sau khi connect
          refreshOnlineStatus();
        },
        onDisconnect: () => {
          console.log("STOMP disconnected");
          isConnectingRef.current = false;
          setIsConnected(false);

          // Không reconnect nữa, chuyển user sang offline luôn
          if (user?.id) {
            // Call API để mark user offline
            markUserOfflineAPI();
          }

          setWsError("Mất kết nối với server");
        },
        onStompError: (frame) => {
          console.error("STOMP error:", {
            message: "STOMP connection failed",
            frame: frame.headers,
            body: frame.body,
            url: wsUrl,
            attempt: reconnectAttemptsRef.current + 1,
          });
          isConnectingRef.current = false;
          setWsError("Không thể kết nối với server WebSocket");

          // Mark user offline khi có lỗi
          if (user?.id) {
            markUserOfflineAPI();
          }
        },
        onWebSocketError: (error) => {
          console.error("WebSocket error:", error);
          isConnectingRef.current = false;
          setWsError("Lỗi kết nối WebSocket");
        },
        debug: (str) => {
          console.log("STOMP Debug:", str);
        },
      });

      client.activate();
    } catch (error) {
      console.error("Error creating STOMP connection:", error);
      isConnectingRef.current = false;
      setWsError("Lỗi khi khởi tạo kết nối WebSocket");
    }
  };

  // Xử lý tin nhắn từ WebSocket
  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case "SESSION_EXPIRED":
      case "SESSION_INVALIDATION":
        console.warn("Session expired:", message.message || message.reason);
        alert(message.message || message.reason || "Phiên làm việc đã hết hạn");
        logout();
        break;

      case "FORCE_LOGOUT":
        console.warn("Force logout:", message.reason);
        alert(message.reason || "Bạn đã bị đăng xuất khỏi hệ thống");
        logout();
        break;

      case "USER_OFFLINE":
        console.log("User marked offline:", message);
        break;

      default:
        console.log("Unknown message type:", message);
    }
  };

  // Đóng STOMP connection
  const disconnectWebSocket = () => {
    isConnectingRef.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (stompClientRef.current) {
      try {
        stompClientRef.current.deactivate();
      } catch (error) {
        console.error("Error deactivating STOMP client:", error);
      }
      stompClientRef.current = null;
    }

    reconnectAttemptsRef.current = 0;
    setIsConnected(false);
  };

  // Gửi tin nhắn chat
  const sendChatMessage = (conversationId: string, content: string) => {
    if (stompClientRef.current?.active && user) {
      const message = {
        type: "CHAT_MESSAGE",
        data: {
          senderId: user.id,
          conversationId,
          content,
          timestamp: new Date().toISOString(),
          read: false,
        },
      };
      try {
        stompClientRef.current.publish({
          destination: `/app/chat/${conversationId}`,
          headers: {
            sessionId: user.sessionId,
            userId: user.id,
          },
          body: JSON.stringify(message),
        });
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content,
            timestamp: message.data.timestamp,
            sender: "user",
            read: false,
            conversationId,
            senderName: `${user.first_name} ${user.last_name}`,
          },
        ]);
      } catch (error) {
        console.error("Error sending chat message:", error);
        setWsError("Không thể gửi tin nhắn");
      }
    }
  };

  const testWebSocketConnection = async () => {
    if (!user?.id) {
      console.log("No user ID for testing");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/test/websocket/${user.id}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const message = await response.text();
        console.log("Test WebSocket response:", message);
      } else {
        console.error("Test WebSocket failed:", response.status);
      }
    } catch (error) {
      console.error("Error testing WebSocket:", error);
    }
  };

  // Thêm test khi WebSocket connect thành công
  (frame: import("@stomp/stompjs").IFrame, client: Client) => {
    console.log("STOMP connected:", frame);
    stompClientRef.current = client;
    reconnectAttemptsRef.current = 0;
    isConnectingRef.current = false;
    setIsConnected(true);
    setWsError(null);

    // Đăng ký subscribers
    subscribeToChannels(client);

    // Refresh trạng thái online ngay sau khi connect
    refreshOnlineStatus();

    // Test WebSocket sau 2 giây
    setTimeout(() => {
      testWebSocketConnection();
    }, 2000);
  };

  // Hàm logout
  const logout = async () => {
    try {
      // Mark user offline trước khi disconnect
      if (user?.id) {
        await markUserOfflineAPI();
      }

      disconnectWebSocket();
      const result = await logoutUser();
      if (!result.success) {
        console.warn("Logout thất bại:", result.error);
      }
    } catch (error) {
      console.error("Lỗi khi logout:", error);
    } finally {
      sessionStorage.removeItem("user");
      deleteCookies();
      setUser(null);
      setIsAuthenticated(false);
      setNotifications([]);
      setChatMessages([]);
      setWsError(null);
      router.push("/login");
    }
  };

  // Monitor browser online/offline
  useEffect(() => {
    const handleOnline = () => {
      console.log("Browser came online");
      if (
        user &&
        isAuthenticated &&
        (!stompClientRef.current || !stompClientRef.current.active) &&
        !isConnectingRef.current
      ) {
        reconnectAttemptsRef.current = 0;
        setWsError(null);
        initializeWebSocket();
      }
    };

    const handleOffline = () => {
      console.log("Browser went offline");
      disconnectWebSocket();
      setWsError("Không có kết nối mạng");
    };

    // Xử lý khi user đóng tab/browser
    const handleBeforeUnload = () => {
      if (user?.id) {
        // Sử dụng sendBeacon để đảm bảo request được gửi ngay cả khi browser đóng
        navigator.sendBeacon(
          `http://localhost:8080/api/user-online/offline/${user.id}`,
          JSON.stringify({ sessionId: user.sessionId })
        );
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user, isAuthenticated]);

  // Khôi phục session khi load trang
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const userCookie = getCookie("user");
        if (!userCookie) {
          throw new Error("Không tìm thấy cookie user");
        }

        const parsedUser: UserType = JSON.parse(decodeURIComponent(userCookie));
        if (!parsedUser.id || !parsedUser.email || !parsedUser.sessionId) {
          throw new Error("Dữ liệu user trong cookie không hợp lệ");
        }

        const result = await checkSession({ id: parsedUser.id });
        if (result.isValid) {
          setUser(parsedUser);
          setIsAuthenticated(true);
          console.log("Session restored successfully");

          // Refresh trạng thái online ngay sau khi restore session
          setTimeout(() => {
            refreshOnlineStatus();
          }, 500);
        } else {
          throw new Error(result.error || "Session không hợp lệ");
        }
      } catch (error) {
        console.error("Lỗi khi khôi phục session:", error);
        deleteCookies();
        sessionStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
        toast.info("Session expired");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    restoreSession();

    return () => {
      disconnectWebSocket();
    };
  }, [router]);

  // Khởi tạo WebSocket khi user được authenticate
  useEffect(() => {
    if (user && isAuthenticated && !isConnectingRef.current) {
      console.log("User authenticated, initializing WebSocket...");
      const timer = setTimeout(() => {
        initializeWebSocket();
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!user || !isAuthenticated) {
      disconnectWebSocket();
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (user && isAuthenticated && isConnected) {
      // Refresh online status mỗi 2 phút
      const refreshInterval = setInterval(
        () => {
          refreshOnlineStatus();
        },
        2 * 60 * 1000
      );

      return () => clearInterval(refreshInterval);
    }
  }, [user, isAuthenticated, isConnected]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (user?.id) {
        markUserOfflineAPI();
      }
      disconnectWebSocket();
    };
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        isAuthenticated,
        notifications,
        chatMessages,
        sendChatMessage,
        isConnected,
        wsError,
        setNotifications,
        setChatMessages,
        setWsError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
