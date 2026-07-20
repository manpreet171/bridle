# The Bridle Manifesto — Harness Script Engineering

## The problem underneath the problem

Vibe Engineering solved circular prompting. You define your product in `AGENTS.md`,
install tool skills, give short prompts, and the AI writes its own implementation
plan into `prompts/` for you to approve. Prompts became artifacts. Good.

But zoom out and there's another problem sitting underneath:

**Per-project rules live in markdown. Run-level behavior doesn't live anywhere.**

How an agent acts over hours or days — how it's traced, evaluated, governed,
recovered — is still hidden inside whatever tool you happen to be using. The
harness *is* the agent's real behavior, and today the harness is an accident.

The industry has been circling this from every direction:

- LangChain describes the harness as *everything around the LLM that turns it into
  a working agent* — system prompts, tools, filesystems, sandboxes, memory,
  middleware, orchestration.
- Anthropic's guidance on long-running agents adds progress logs, Git history, and
  recovery patterns so agents don't forget what they did yesterday.
- Research on natural-language agent harnesses goes further: treat the harness
  itself as a first-class, editable, *executable* document, interpreted by a runtime
  into calls, handoffs, state updates, and validation gates.
- GitHub's and Microsoft's agentic-SDLC training both land on the same shape:
  agents are contributors in your SDLC, and runs are traceable events.

Different vendors, one boring truth:

> **Your job is shifting from "write code" to "design the harness and judge the runs."**

## The move

Stop thinking only in prompt files. Start thinking in **Harness Scripts** —
documents that define how an agent should run, log, and be judged over time.

A Harness Script (`HARNESS.md`) is the missing sibling of `AGENTS.md`:

| File        | Governs                | Answers                                         |
| ----------- | ---------------------- | ----------------------------------------------- |
| `AGENTS.md` | the **project**        | what are we building, with what, what's banned  |
| `HARNESS.md`| the **run**            | how a run behaves, what it logs, how it's judged, how it recovers |

`AGENTS.md` is the OS for a project.
`HARNESS.md` is the OS for every long-running agent run.

## Runs as artifacts

Vibe Engineering's core insight was *prompts as artifacts*: reviewable, versioned,
diffable. Harness Script Engineering applies the same discipline one layer up:

- **Runs as artifacts** — every run has an ID, a trace, a verdict, and a link to
  the exact harness version that governed it.
- **Logging as a contract** — if it isn't in the trace, it didn't happen; if it
  happened and isn't in the trace, the run failed.
- **Governance as spec** — which runs auto-merge, which need PRs, which surfaces
  are forbidden: written down *before* the run, not argued about after.

## What this is not

- Not a framework. Bridle is markdown templates, a JSON schema, and a ~300-line
  zero-dependency CLI. Your orchestrator (Claude Code, Copilot, LangGraph,
  DeepAgents, your own scripts) reads `HARNESS.md` and enforces it.
- Not a replacement for Vibe Engineering. Keep `AGENTS.md`, keep skills, keep
  AI-written prompts. Bridle adds the layer above them.
- Not hype. Every pillar maps to something teams already do ad hoc — Bridle just
  makes you write it down and stamp it into the trace.

Vibe is how you stop fighting prompts on day 1.
Harness Scripts are how you stop fighting your entire agent architecture on day 30.
