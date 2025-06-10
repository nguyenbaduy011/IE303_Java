"use client";

import { ChatMessages } from "@/components/chatbot/chat-messages";
import { MessageList } from "@/components/chatbot/message-list";
import { ChatContainer, ChatForm } from "@/components/chatbot/chat";
import { MessageInput } from "@/components/message-input";
import { PromptSuggestions } from "@/components/chatbot/prompt-suggestion";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useChat } from "@ai-sdk/react";
import { cn } from "@/lib/utils";

export function Chatbot() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    append,
  } = useChat();

  const lastMessage = messages.at(-1);
  const isEmpty = messages.length === 0;
  const isTyping = (() => {
    if (lastMessage?.role === "user") {
      return true;
    }
    if (lastMessage?.role === "assistant") {
      if (!lastMessage.toolInvocations) {
        return !lastMessage.content;
      }
      const anyToolRunning = lastMessage.toolInvocations.some(
        (ti) => ti.state !== "result"
      );
      return anyToolRunning;
    }
    return false;
  })();

  return (
    <SheetContent
      className={cn(
        "flex h-full w-full flex-col bg-sidebar text-sidebar-foreground sm:max-w-[1000px]",
        "border-sidebar-border rounded-l-xl shadow-xl z-[100] pointer-events-auto dark:bg-sidebar dark:border-sidebar-border"
      )}
    >
      <SheetHeader className="flex-none px-4 pt-4">
        <SheetTitle className="text-xl font-semibold text-sidebar-foreground">
          Secretary Assistant
        </SheetTitle>
        <SheetDescription className="text-sm text-muted-foreground">
          Your personal assistant is here to help!
        </SheetDescription>
      </SheetHeader>
      <ChatContainer className="flex-1 overflow-y-auto px-4 py-2">
        {isEmpty && (
          <PromptSuggestions
            label="Bắt đầu với các câu hỏi"
            append={append}
            suggestions={[
              "Cho tôi xem thông tin cá nhân của tôi",
              "Cho tôi xem task của tôi",
            ]}
          />
        )}
        <ChatMessages messages={messages}>
          {!isEmpty && (
            <MessageList
              messages={messages}
              isTyping={isTyping}
              append={append}
            />
          )}
        </ChatMessages>
      </ChatContainer>
      <ChatForm
        isPending={isLoading || isTyping}
        handleSubmit={handleSubmit}
        className="flex-none border-t border-sidebar-border bg-sidebar px-4 py-3"
      >
        {() => (
          <MessageInput
            value={input}
            onChange={handleInputChange}
            isGenerating={isLoading || isTyping}
            stop={stop}
            className="rounded-lg border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            placeholder="Type your message..."
          />
        )}
      </ChatForm>
    </SheetContent>
  );
}