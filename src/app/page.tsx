"use client";

import { useRef, useState } from "react";
import type { ChatMessage, EvaResponse } from "@/lib/schema";
import StructuredResponse from "@/components/StructuredResponse";

const EXPERTISE_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
  "professional",
] as const;

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [expertise, setExpertise] = useState<string>("beginner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesRef.current?.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setError(null);
    const userMsg: ChatMessage = { role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);
    scrollToBottom();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expertise,
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Request failed.");
        return;
      }

      const structured = data.structured as EvaResponse;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", structured },
      ]);
      scrollToBottom();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error.");
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>EVA — Global Legal Intelligence System</h1>
        <p>
          Structured legal analysis for education and research. Not legal advice
          and not a substitute for a licensed professional.
        </p>
        <div className="controls">
          <label htmlFor="expertise">Expertise level:</label>
          <select
            id="expertise"
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
          >
            {EXPERTISE_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="messages" ref={messagesRef}>
        {messages.length === 0 && (
          <div className="empty">
            Describe a legal situation or question. EVA will identify the
            jurisdiction, spot issues, assess risks, and outline options — asking
            for clarification when key facts are missing.
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            <div className="role">{m.role === "user" ? "You" : "EVA"}</div>
            {m.structured ? (
              <StructuredResponse data={m.structured} />
            ) : (
              m.content
            )}
          </div>
        ))}

        {loading && (
          <div className="msg assistant">
            <div className="role">EVA</div>
            <div className="rjust">Analyzing…</div>
          </div>
        )}

        {error && <div className="error">{error}</div>}
      </div>

      <div className="composer">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Describe your legal question or paste a clause… (Enter to send, Shift+Enter for newline)"
          disabled={loading}
        />
        <button onClick={send} disabled={loading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
