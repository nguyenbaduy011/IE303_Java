/* eslint-disable @typescript-eslint/no-explicit-any */
import { Skeleton } from "@/components/ui/skeleton";
import { ToolInvocation } from "ai";
import { ChatMessage } from "@/components/chat-message";
import { TypingIndicator } from "@/components/typing-indicator";
import EmployeeInfoCard from "@/components/chatbot/profile-card";
import EmployeeListCard from "@/components/chatbot/profile-list";
import TeamInfoCard from "@/components/chatbot/team-info-card";
import { ErrorCard } from "@/components/chatbot/error-card";
import { TaskListCard } from "@/components/chatbot/task-list-card";
import { TaskCard } from "@/components/chatbot/task-card";
import { DepartmentListCard } from "@/components/chatbot/department-list-card";
import { PositionListCard } from "@/components/chatbot/position-list-card";
import { RoleListCard } from "@/components/chatbot/role-list-card";

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
                      {toolName === "getInformation" ||
                      toolName === "createEmployee" ? (
                        <EmployeeInfoCard {...result} append={append} />
                      ) : null}
                      {toolName === "getEmployeeList" ? (
                        Array.isArray(result.employees) ? (
                          <EmployeeListCard employees={result.employees} />
                        ) : null
                      ) : null}
                      {toolName === "getTeam" ? (
                        <TeamInfoCard {...result} append={append} />
                      ) : null}
                      {toolName === "addTask" ||
                      toolName === "createTask" ||
                      toolName === "submitTaskForReview" ||
                      toolName === "markTaskAsCompleted" ? (
                        <TaskCard {...result} append={append} />
                      ) : null}
                      {toolName === "getTaskList" ? (
                        Array.isArray(result.tasks) ? (
                          <TaskListCard tasks={result.tasks} />
                        ) : (
                          <ErrorCard message="Dữ liệu nhiệm vụ không hợp lệ." />
                        )
                      ) : null}
                      {toolName === "getDepartments" ? (
                        Array.isArray(result.departments) ? (
                          <DepartmentListCard
                            departments={result.departments}
                          />
                        ) : (
                          <ErrorCard message="Dữ liệu phòng ban không hợp lệ." />
                        )
                      ) : null}
                      {toolName === "getPositions" ? (
                        Array.isArray(result.positions) ? (
                          <PositionListCard positions={result.positions} />
                        ) : (
                          <ErrorCard message="Dữ liệu vị trí không hợp lệ." />
                        )
                      ) : null}
                      {toolName === "getRoles" ? (
                        Array.isArray(result.roles) ? (
                          <RoleListCard roles={result.roles} />
                        ) : (
                          <ErrorCard message="Dữ liệu vai trò không hợp lệ." />
                        )
                      ) : null}
                      {[
                        "getInformation",
                        "getEmployeeList",
                        "getTaskList",
                        "addTask",
                        "createTask",
                        "submitTaskForReview",
                        "markTaskAsCompleted",
                        "getTeam",
                        "createEmployee",
                        "getDepartments",
                        "getPositions",
                        "getRoles",
                      ].includes(toolName) &&
                      result.type === "component" &&
                      result.component === "ErrorCard" ? (
                        <ErrorCard {...result} />
                      ) : null}
                    </div>
                  );
                } else {
                  return (
                    <div key={toolCallId}>
                      {toolName === "getInformation" ||
                      toolName === "createEmployee" ? (
                        <Skeleton className="h-[100px] w-full max-w-md" />
                      ) : null}
                      {toolName === "getEmployeeList" ? (
                        <Skeleton className="h-[100px] w-full max-w-md" />
                      ) : null}
                      {toolName === "getTeam" ? (
                        <Skeleton className="h-[200px] w-full max-w-md" />
                      ) : null}
                      {toolName === "addTask" ||
                      toolName === "createTask" ||
                      toolName === "submitTaskForReview" ||
                      toolName === "markTaskAsCompleted" ? (
                        <Skeleton className="h-[150px] w-full max-w-md" />
                      ) : null}
                      {toolName === "getTaskList" ? (
                        <Skeleton className="h-[200px] w-full max-w-md" />
                      ) : null}
                      {toolName === "getDepartments" ||
                      toolName === "getPositions" ||
                      toolName === "getRoles" ? (
                        <Skeleton className="h-[200px] w-full max-w-md" />
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
