/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Skeleton } from "@/components/ui/skeleton";
import { ToolInvocation } from "ai";
import { ChatMessage } from "@/components/chat-message";
import { TypingIndicator } from "@/components/typing-indicator";

export function MessageList({
  messages,
  isTyping,
  append,
}: {
  messages: any;
  isTyping: boolean;
  append: any;
}) {
  return (
    <div className="space-y-4 overflow-hidden">
      {messages.map((message: any, index: any) => (
        <div key={index}>
          {message.content && message.appear !== false && (
            <ChatMessage
              id={message.id}
              role={message.role}
              content={message.content}
              createdAt={new Date()}
              showTimeStamp
              animation="none"
            />
          )}
          {message.toolInvocations && (
            <div className="space-y-4">
              {message.toolInvocations.map((toolInvocation: ToolInvocation) => {
                const { toolName, toolCallId, state } = toolInvocation;

                if (state === "result") {
                  const { result } = toolInvocation;

                  return (
                    <div key={toolCallId}>
                      {toolName === "getInformation" ? (
                        <div>
                          <p>{result}</p>
                        </div>
                      ) : null}
                    </div>
                  );
                } else {
                  return (
                    <div key={toolCallId}>
                      {toolName === "displayProductsByCategory" ? (
                        <Skeleton className="h-[10px] w-full max-w-md" />
                      ) : null}
                      {toolName === "displayProductByCategory" ? (
                        <Skeleton className="h-[100px] w-full max-w-md" />
                      ) : null}
                      {toolName === "displayCart" ? (
                        <Skeleton className="h-[100px] w-full max-w-md" />
                      ) : null}
                      {toolName === "getInvoices" ? (
                        <Skeleton className="h-[100px] w-full max-w-md" />
                      ) : null}
                      {toolName === "trackingInvoice" ? (
                        <Skeleton className="h-[100px] w-full max-w-2xl" />
                      ) : null}
                      {toolName === "checkingInformation" ? (
                        <Skeleton className="h-[200px] w-full max-w-xl" />
                      ) : null}
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>
      ))}
      {isTyping && <TypingIndicator />}
    </div>
  );
}
