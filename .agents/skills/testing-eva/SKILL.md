---
name: testing-eva
description: Test the EVA legal-intelligence chatbot end-to-end. Use when verifying EVA UI, the /api/chat route, or the structured-response rendering.
---

# Testing EVA (Global Legal Intelligence System)

Next.js 14 (App Router) + TypeScript chat app. UI in `src/app/page.tsx`, structured
rendering in `src/components/StructuredResponse.tsx`, LLM call + Zod validation in
`src/app/api/chat/route.ts`, prompt in `src/lib/evaPrompt.ts`, schema in `src/lib/schema.ts`.

## Run locally
```
npm install
npm run dev   # http://localhost:3000
```
Verify commands before finishing: `npm run typecheck`, `npm run lint`, `npm run build`.

## Devin Secrets Needed
- `OPENAI_API_KEY` — required for the live LLM path. Optional: `OPENAI_BASE_URL`
  (OpenRouter/Azure/Ollama `/v1`), `EVA_MODEL` (default `gpt-4o-mini`).
- Without a key, `/api/chat` returns HTTP 500 with body
  `"OPENAI_API_KEY is not set. Copy .env.example to .env.local and add your key."`
  and the UI shows a red error banner. This is the expected no-key behavior — good
  for testing the error path.

## Testing without a live LLM key
The structured render + clarification branches can be exercised without a real model
by temporarily stubbing the POST handler in `route.ts` behind an env flag, e.g.:
```ts
if (process.env.EVA_TEST_STUB === "1") { /* return NextResponse.json({ structured: <canned EvaResponse> }) */ }
```
Place the stub at the TOP of `POST` (before the `OPENAI_API_KEY` check) or it won't run
when no key is set. The flag is read at process start, so restart `npm run dev` with
`EVA_TEST_STUB=1` (env changes don't hot-reload). Branch on the last user message:
include a jurisdiction keyword (e.g. "California") → full analysis; omit it →
`needsClarification: true`. Canned objects must satisfy `EvaResponseSchema`
(all fields present; `confidence` and risk `severity` must be valid enum values).
**Revert the stub before committing** (`git checkout -- src/app/api/chat/route.ts`).

## Primary flows to verify
1. Empty state + expertise selector (beginner/intermediate/advanced/professional).
2. No-key error banner (real route, no key).
3. Full structured render: jurisdiction chip, summary, legal context, domains,
   analysis, risks with color-coded severity badges (`badge ${severity}`),
   uncertainties, options, next steps, confidence, disclaimer.
4. Clarification-first: a jurisdiction-less question → "More information needed" +
   clarifying questions, and NO summary/risks sections.

## Gotchas
- Dev server started via `(cmd &)` in a one-shot shell can get killed when the call
  returns; run it in a persistent `tty` shell (or `nohup … & disown`) and confirm with
  `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`.
- When typing into the composer, click the textarea first and confirm the DOM shows the
  text before clicking Send (Send is disabled while the input is empty).
