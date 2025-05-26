import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: "user" | "contact";
  read: boolean;
  senderName?: string;
  conversationId: string;
}

export function useStomp(
  onMessage: (msg: Message) => void,
  token?: string,
  username?: string
) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!token || !username) return;

    const socket = new SockJS(`/ws?token=${token}`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true);
        setError(null);
        client.subscribe(`/user/${username}/queue/messages`, (message) => {
          const newMessage: Message = JSON.parse(message.body);
          onMessage(newMessage);
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
        setError("Disconnected from WebSocket");
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
        setError("Failed to connect to WebSocket");
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [onMessage, token, username]);

  const sendMessage = (payload: { destination: string; body: string }) => {
    if (stompClientRef.current && isConnected) {
      stompClientRef.current.publish(payload);
    }
  };

  return { sendMessage, isConnected, error };
}
