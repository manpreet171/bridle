# AGENTS.md — <project name>

> The project OS: per-project rules every agent must load before doing anything.
> This file answers "what is this project and what are the rules of the house."
> Run-level behavior (loops, logging, governance) does NOT live here — that's
> `HARNESS.md`.

## What this project is

<2–4 sentences: what the product does, who it's for, what "done" looks like.>

## Stack

| Layer      | Choice                | Notes                          |
| ---------- | --------------------- | ------------------------------ |
| Frontend   | `<e.g. Next.js>`      |                                |
| Backend    | `<e.g. Supabase>`     |                                |
| Auth       | `<e.g. Clerk>`        | use the installed skill        |
| AI         | `<e.g. Vercel AI SDK>`| use the installed skill        |

## Data model

<Tables/collections and their relationships, or a pointer to the schema file.>

## Security requirements

- <e.g. all user data behind RLS; never expose service keys client-side>
- <e.g. no secrets in code — env vars only, named here>

## Skills installed

Agents must use these instead of half-remembered docs:

- `skills/<name>.md` — <what it covers>

## Out of scope

Agents must NOT, under any prompt:

- <e.g. add payment processing>
- <e.g. change the database provider>
- <e.g. edit CI/CD config>

## Run-level rules

See [`HARNESS.md`](HARNESS.md). If a HARNESS file exists for the workflow you're
running, it governs your loop, logging, and permissions — load it before acting.
