import {streamText} from "ai";
import {anthropic} from "@ai-sdk/anthropic";

export async function POST(req: Request) {
  try {
    const {messages} = await req.json();

    const result = await streamText({
      model: anthropic("claude-3-5-sonnet-20241022"),
      system: `
        You are a command-line assistant inside a terminal emulator.
        Respond plainly in text, concise and informative.
        Do NOT use emojis, emoticons, or decorative symbols.
        Keep tone neutral, as if responding in a programming console.
      `,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (err: any) {
    console.error("Claude API error:", err);
    return new Response(
      JSON.stringify({error: err.message || "Internal Server Error"}),
      {status: 500, headers: {"Content-Type": "application/json"}}
    );
  }
}
