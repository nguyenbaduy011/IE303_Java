"use client";
import { useChat } from "@ai-sdk/react";
import { PromptSuggestions } from "@/components/chatbot/prompt-suggestion";
import {
  ChatContainer,
  ChatForm,
  ChatMessages,
} from "@/components/chatbot/chat";
import { MessageInput } from "@/components/message-input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BotMessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { MessageList } from "@/components/chatbot/message-list";

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
      // User vừa gửi, bot đang chuẩn bị phản hồi
      return true;
    }
    if (lastMessage?.role === "assistant") {
      // Nếu bot có toolInvocations
      if (!lastMessage.toolInvocations) {
        // Bot không dùng tool, dựa vào content
        return !lastMessage.content;
      }

      // Nếu có toolInvocations, xem trạng thái
      // Nếu còn tool nào chưa trả kết quả thì vẫn typing
      const anyToolRunning = lastMessage.toolInvocations.some(
        (ti) => ti.state !== "result"
      );
      return anyToolRunning;
    }
    return false;
  })();
  

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className={cn(
            "fixed bottom-12 right-12 z-50 h-14 w-14 rounded-full bg-primary p-0 shadow-lg transition-all duration-300 hover:bg-primary-600 focus:ring-4 focus:ring-primary-400/50",
            "animate-fade-in dark:bg-primary dark:hover:bg-primary-600 dark:focus:ring-primary-400/50"
          )}
          aria-label="Open chatbot"
        >
          <BotMessageSquare className="h-8 w-8 stroke-primary-foreground" />
        </Button>
      </SheetTrigger>
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
        </ChatContainer>
      </SheetContent>
    </Sheet>
  );
}
