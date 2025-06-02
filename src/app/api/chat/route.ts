import { tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import z from "zod";
import { fetchUserById } from "../get-user-information/route";
import { getCookie } from "@/utils/cookie";
import { getOnlineUsers } from "../online-users/route";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  console.log(messages);

  const result = streamText({
    model: openai("gpt-4.1-mini"),
    messages,
    maxSteps: 3,
    tools: {
      getInformation: tool({
        description: "người dùng online",
        parameters: z.object({}),
        execute: async () => {
          return await getOnlineUsers();
        },
      }),
    },
  });
  return result.toDataStreamResponse();
}

