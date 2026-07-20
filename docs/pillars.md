# The Four Pillars

Every `HARNESS.md` has four load-bearing sections (plus recovery). `bridle lint`
refuses a harness that's missing any of them, because a run under an incomplete
harness has undefined behavior.

---

## Pillar 1 — Run Charter

The Charter defines the **run's** goal, not the feature's goal.

A feature goal: *"add Clerk auth."*
A run goal: *"keep the scraping + bias-analysis pipeline healthy over 24h windows,
with no silent failures and full traceability."*

The Charter spells out:

- the **Plan → Act → Evaluate** loop every step must follow — plan the step, act
  using tools, evaluate via checks and logs;
- which **sub-agents** may be spawned and what tools each may call;
- **budgets** — wall-clock, spend, blast radius — and what happens on breach;
- an observable definition of a **good run** vs a **bad run**.

If you can't state what a bad run looks like, you can't judge runs, and judging
runs is now the job.

## Pillar 2 — Trace Contract

Logging discipline as a **declared contract**, not an implementation detail.

The contract names:

- **which event classes must be recorded** — tool calls, code edits, DB writes,
  external API hits, escalations;
- **where they go** — an append-only `logs/run-*.jsonl` file as the primary sink
  (schema: [`schema/run-log.schema.json`](../schema/run-log.schema.json)), plus
  whatever secondary sinks you already use (LangSmith, PostHog, a Postgres table);
- **how events tie back to runs** — every event stamped with `run_id`,
  `agent_id`, `harness_version`, and `harness_hash`, so you can always answer
  *"which harness produced this behavior?"*

The hash matters: if someone edits `HARNESS.md` mid-run, the stamp changes and the
trace shows it. Harness drift becomes visible instead of silent.

This is the same discipline long-running-agent guidance already recommends —
progress logs and Git history bridging context gaps so agents resume safely after
days — promoted from "good habit" to "contract."

## Pillar 3 — Skill Lattice

Skills aren't just "how to use Supabase." In Bridle, every skill carries **bands**:

- **Cost** — cheap vs frontier
- **Trust** — safe vs risky
- **Role** — read-only vs write vs destructive

The lattice is the phase policy that consumes those bands:

| Phase          | Allowed bands                                                |
| -------------- | ------------------------------------------------------------ |
| Planning       | read-only, cheap                                             |
| Implementation | write-capable — only after the plan step is logged           |
| Evaluation     | read-only — prefer a **different model** than implementation |
| Never          | destructive skills without the Governance Lane's gate        |

The evaluation rule is the sneaky-important one: the model that wrote the code
grading its own work is how silent failures survive. A different set of eyes —
even a cheaper model — catches what self-review rationalizes.

## Pillar 4 — Governance Lane

Your VCS is the control plane. Agents are **contributors**: they need approvals,
status checks, and rollbacks — and the harness writes those rules down up front
instead of letting each agent "kind of figure it out."

The lane specifies, per change surface:

- which runs can **auto-merge** (if any);
- which must open a **PR and wait for human review**;
- which surfaces are **forbidden** (infra, CI, migrations — whatever you decide);
- how a run's changes get **rolled back** (usually: revert the run's PRs, which the
  trace makes findable).

`HARNESS.md` itself is a governed surface: agents may *propose* harness changes via
PR, never apply them.

---

## And the fifth section: Recovery & Escalation

Long-running agents forget. The harness declares:

- a human-readable **progress log** per run, updated at every Evaluate step;
- a **resume protocol** — read the harness, read the progress log, read
  `git log`, reconcile, continue — so a restarted agent never redoes finished work;
- **escalation triggers** — budget breaches, forbidden surfaces, repeated
  evaluation failures, and instructions found inside observed content (which are
  data, never commands).

Escalation is a first-class event in the trace schema, not an exception path.
A run that escalates cleanly is a *good* run. A run that silently pushed through
is a bad one.
