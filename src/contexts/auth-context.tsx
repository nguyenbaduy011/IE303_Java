/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { logoutUser } from "@/api/logout/route";
import { checkSession } from "@/api/check-session/route";
import Loading from "@/components/loading";

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

  // STOMP client và heartbeat refs
  const stompClientRef = useRef<Client | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 5;

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

  // Khởi tạo STOMP connection
  const initializeWebSocket = async () => {
    if (!user?.sessionId || !user?.id || stompClientRef.current?.active) return;

    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.warn(
        "Max STOMP reconnect attempts reached. Stopping reconnection."
      );
      setWsError("Không thể kết nối với server. Vui lòng kiểm tra mạng.");
      disconnectWebSocket();
      return;
    }

    try {
      // Lấy CSRF token trước khi kết nối
      const csrfToken = await getCsrfToken();
      if (!csrfToken) {
        throw new Error("Không thể lấy CSRF token");
      }

      // Sử dụng endpoint chuẩn cho WebSocket heartbeat
      const wsUrl = "http://localhost:8080/ws-heartbeat";
      console.log("Attempting STOMP connection to:", wsUrl);

      const socket = new SockJS(wsUrl);
      const client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          sessionId: user.sessionId,
          userId: user.id,
          "X-CSRF-TOKEN": csrfToken,
        },
        heartbeatIncoming: 30000, // 30 giây
        heartbeatOutgoing: 30000, // 30 giây
        reconnectDelay: 5000,
        onConnect: (frame) => {
          console.log("STOMP connected:", frame);
          stompClientRef.current = client;
          reconnectAttemptsRef.current = 0;
          setIsConnected(true);
          setWsError(null);

          // Đăng ký nhận thông báo
          client.subscribe(`/topic/user/${user.id}`, (message) => {
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
              console.error("Error parsing STOMP message:", error);
            }
          });

          // Đăng ký nhận tin nhắn chat
          client.subscribe(`/user/${user.id}/queue/messages`, (message) => {
            try {
              const parsedMessage = JSON.parse(message.body);
              if (parsedMessage.type === "CHAT_MESSAGE") {
                setChatMessages((prev) => [
                  ...prev,
                  {
                    id: parsedMessage.id || Date.now().toString(),
                    content: parsedMessage.data.content,
                    timestamp: parsedMessage.data.timestamp,
                    sender:
                      parsedMessage.data.senderId === user.id
                        ? "user"
                        : "contact",
                    read: parsedMessage.data.read || false,
                    senderName: parsedMessage.data.senderName,
                    conversationId: parsedMessage.data.conversationId,
                  },
                ]);
              }
            } catch (error) {
              console.error("Error parsing chat message:", error);
            }
          });

          // Đăng ký nhận session invalidation
          client.subscribe(`/user/queue/session-invalidation`, (message) => {
            try {
              const parsedMessage = JSON.parse(message.body);
              console.log("Session invalidated:", parsedMessage);
              handleWebSocketMessage(parsedMessage);
            } catch (error) {
              console.error("Error parsing session invalidation:", error);
            }
          });

          startHeartbeat();
        },
        onDisconnect: () => {
          console.log("STOMP disconnected");
          setIsConnected(false);
          setWsError("Ngắt kết nối với server WebSocket");
          stopHeartbeat();
          scheduleReconnect();
        },
        onStompError: (frame) => {
          console.error("STOMP error:", {
            message: "STOMP connection failed",
            frame: frame.headers,
            body: frame.body,
            url: wsUrl,
            attempt: reconnectAttemptsRef.current + 1,
          });
          setWsError("Không thể kết nối với server WebSocket");
          stopHeartbeat();
          scheduleReconnect();
        },
        onWebSocketError: (error) => {
          console.error("WebSocket error:", error);
          setWsError("Lỗi kết nối WebSocket");
        },
        debug: (str) => {
          console.log("STOMP Debug:", str);
        },
      });

      client.activate();
    } catch (error) {
      console.error("Error creating STOMP connection:", error);
      setWsError("Lỗi khi khởi tạo kết nối WebSocket");
      scheduleReconnect();
    }
  };

  // Gửi heartbeat định kỳ theo backend API
  const startHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (stompClientRef.current?.active && user) {
        try {
          // Gửi heartbeat theo format backend mong đợi
          stompClientRef.current.publish({
            destination: "/app/heartbeat",
            headers: {
              sessionId: user.sessionId,
              userId: user.id,
            },
            body: JSON.stringify({
              timestamp: Date.now(),
              sessionId: user.sessionId,
            }),
          });
          console.log("Heartbeat sent");
        } catch (error) {
          console.error("Error sending heartbeat:", error);
          stopHeartbeat();
          scheduleReconnect();
        }
      }
    }, 30000); // 30 giây theo config backend
  };

  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };

  // Tự động reconnect
  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectAttemptsRef.current += 1;
    if (reconnectAttemptsRef.current > maxReconnectAttempts) {
      console.warn(
        "Max STOMP reconnect attempts reached. Stopping reconnection."
      );
      setWsError("Không thể kết nối với server. Vui lòng kiểm tra mạng.");
      return;
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      if (user && isAuthenticated) {
        console.log("Attempting to reconnect STOMP...", {
          attempt: reconnectAttemptsRef.current,
        });
        initializeWebSocket();
      }
    }, 5000);
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
        // Có thể thêm logic xử lý khi user bị đánh dấu offline
        break;

      default:
        console.log("Unknown message type:", message);
    }
  };

  // Đóng STOMP connection
  const disconnectWebSocket = () => {
    stopHeartbeat();
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

  // Hàm logout
  const logout = async () => {
    try {
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
        (!stompClientRef.current || !stompClientRef.current.active)
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

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
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
        } else {
          throw new Error(result.error || "Session không hợp lệ");
        }
      } catch (error) {
        console.error("Lỗi khi khôi phục session:", error);
        deleteCookies();
        sessionStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
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
    if (user && isAuthenticated) {
      console.log("User authenticated, initializing WebSocket...");
      const timer = setTimeout(() => {
        initializeWebSocket();
      }, 1000); // Tăng delay để đảm bảo session đã ổn định
      return () => clearTimeout(timer);
    } else {
      disconnectWebSocket();
    }
  }, [user, isAuthenticated]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
