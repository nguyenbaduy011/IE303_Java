"use client";

import { Chatbot } from "@/components/chatbot/chat-bot";

export default function Chat() {
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <Chatbot />
    </div>
  );
}
