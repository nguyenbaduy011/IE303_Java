import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";

import { headers } from "next/headers";
import { GetUserRole } from "@/utils/getUserRole";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const role = GetUserRole();

const systemPrompt = `
Bạn là chatbot của phần mềm quản lý nhân sự kiêm mạng xã hội nội bộ Socius.
Nhiệm vụ của bạn phụ thuộc vào vai trò người dùng hiện tại: ${role}.
${
  role === "admin"
    ? `Bạn đang nói chuyện với admin. Hãy hỗ trợ quản lý nhân viên, vai trò, team, phân quyền và các chức năng điều phối nội bộ.`
    : `Bạn đang nói chuyện với người dùng thông thường. Hãy hỗ trợ họ xem thông tin nhân viên, quản lý task cá nhân, và tương tác nội bộ đơn giản.`
}
`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini-2024-07-18"),
    system: systemPrompt,

    temperature: 0.4,
    maxTokens: 100,
    presencePenalty: 0.6,
    maxRetries: 3,

    messages,
    maxSteps: 30,
    tools: {},
  });

  return result.toDataStreamResponse();
}
