import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { EVA_FULL_PROMPT } from "@/lib/evaPrompt";
import { EvaResponseSchema } from "@/lib/schema";

export const runtime = "nodejs";

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY is not set. Copy .env.example to .env.local and add your key.",
      },
      { status: 500 },
    );
  }

  let body: { messages?: IncomingMessage[]; expertise?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messages = body.messages ?? [];
  if (messages.length === 0) {
    return NextResponse.json(
      { error: "At least one message is required." },
      { status: 400 },
    );
  }

  const expertise = body.expertise ?? "beginner";

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });

  const model = process.env.EVA_MODEL || "gpt-4o-mini";

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: EVA_FULL_PROMPT },
        {
          role: "system",
          content: `User expertise level: ${expertise}. Adapt depth and terminology accordingly.`,
        },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    if (!raw) {
      return NextResponse.json(
        { error: "Empty response from model." },
        { status: 502 },
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(stripCodeFences(raw));
    } catch {
      return NextResponse.json(
        { error: "Model did not return valid JSON.", raw },
        { status: 502 },
      );
    }

    const result = EvaResponseSchema.safeParse(parsed);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Model output did not match the expected schema.",
          issues: result.error.issues,
          raw,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ structured: result.data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `LLM request failed: ${message}` },
      { status: 502 },
    );
  }
}
