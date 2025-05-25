/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export function useStomp(onMessage: (message: any) => void) {
  const clientRef = useRef<Client | undefined>(undefined);

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws"); // endpoint WebSocket
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("Connected");
        client.subscribe("/chatroom/room1", (msg) => {
          const body = JSON.parse(msg.body);
          onMessage(body);
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [onMessage]);

  const sendMessage = (msg: any) => {
    clientRef.current?.publish({
      destination: "/app/send",
      body: JSON.stringify(msg),
    });
  };

  return { sendMessage };
}
