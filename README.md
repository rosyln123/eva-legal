# EVA — Global Legal Intelligence System

A Next.js chatbot that structures legal reasoning using the **EVA** system prompt.
EVA identifies jurisdiction first, spots issues, runs a risk engine, scores its own
confidence, and always returns a consistent structured response.

> **Not legal advice.** EVA is an educational / research tool and is not a
> substitute for a licensed legal professional. It is instructed never to
> fabricate laws, cases, deadlines, or citations, and to state uncertainty
> explicitly.

## How it works

- The full EVA behavioral contract lives in [`src/lib/evaPrompt.ts`](src/lib/evaPrompt.ts),
  kept verbatim, plus an appended **output contract** forcing a single JSON object.
- The API route [`src/app/api/chat/route.ts`](src/app/api/chat/route.ts) calls an
  OpenAI-compatible chat-completions endpoint with `response_format: json_object`,
  then validates the reply against a Zod schema ([`src/lib/schema.ts`](src/lib/schema.ts)).
- The UI ([`src/app/page.tsx`](src/app/page.tsx)) renders each section: jurisdiction,
  summary, legal context, domains, analysis, risks (severity-badged), uncertainties,
  options, next steps, confidence, and disclaimer. When jurisdiction/facts are
  missing, EVA returns clarifying questions instead of conclusions.

## Setup

```bash
npm install
cp .env.example .env.local   # then add your key
npm run dev                  # http://localhost:3000
```

### Environment variables

| Variable          | Required | Default       | Notes                                                        |
| ----------------- | -------- | ------------- | ------------------------------------------------------------ |
| `OPENAI_API_KEY`  | yes      | —             | Key for OpenAI or any OpenAI-compatible provider.            |
| `OPENAI_BASE_URL` | no       | OpenAI        | e.g. OpenRouter, Azure, or a local server like Ollama (`/v1`). |
| `EVA_MODEL`       | no       | `gpt-4o-mini` | Any chat model your provider exposes.                        |

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript, no emit

## Structure

```
src/
  app/
    api/chat/route.ts   # LLM call + JSON validation
    page.tsx            # chat UI
    layout.tsx
    globals.css
  components/
    StructuredResponse.tsx
  lib/
    evaPrompt.ts        # EVA system prompt + output contract
    schema.ts           # Zod schema + types
```
