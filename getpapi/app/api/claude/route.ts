import {NextResponse} from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const {messages} = await req.json();

    const systemInstruction = {
      role: "user",
      content:
        "You are a command-line assistant inside a terminal emulator. " +
        "Respond plainly in text, concise and informative. " +
        "Do NOT use emojis, emoticons, or decorative symbols. " +
        "Keep tone neutral, as if responding in a programming console.",
    };

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 300,
      messages: [systemInstruction, ...messages],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block as any).text)
      .join("\n");

    return NextResponse.json({reply: text});
  } catch (err: any) {
    console.error("Claude API error:", err);
    return NextResponse.json({error: err.message}, {status: 500});
  }
}
