/* eslint-disable @typescript-eslint/no-explicit-any */
import { Skeleton } from "@/components/ui/skeleton";
import { ToolInvocation } from "ai";
import { ChatMessage } from "@/components/chat-message";
import { TypingIndicator } from "@/components/typing-indicator";
import EmployeeInfoCard from "@/components/chatbot/profile-card";
import EmployeeListCard from "@/components/chatbot/profile-list";

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
      {messages.map((message: any) => (
        <div key={message.id}>
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
                        <EmployeeInfoCard {...result} append={append} />
                      ) : null}
                      {toolName === "getEmployeeList" ? (
                        Array.isArray(result.employees) ? (
                          <EmployeeListCard employees={result.employees} />
                        ) : null
                      ) : null}
                    </div>
                  );
                } else {
                  return (
                    <div key={toolCallId}>
                      {toolName === "getInformation" ? (
                        <Skeleton className="h-[100px] w-full max-w-md" />
                      ) : null}
                      {toolName === "getEmployeeList" ? (
                        <Skeleton className="h-[100px] w-full max-w-md" />
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
