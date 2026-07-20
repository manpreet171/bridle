# Adopting Bridle in 30 minutes

You don't need new infrastructure. You need five files and one habit.

## Minute 0–5: scaffold

```bash
npx github:YOURNAME/bridle init
# or, with the repo cloned:
node bin/bridle.mjs init
```

You now have:

```
your-project/
├── AGENTS.md      # project OS (skip if you already have one — init won't overwrite)
├── HARNESS.md     # run OS — the new artifact
├── prompts/       # AI-written implementation plans, human-approved
├── skills/        # tool know-how with cost/trust/role bands
└── logs/          # append-only run traces
```

## Minute 5–20: write the harness

Open `HARNESS.md` and fill in the five sections for **one** workflow — your most
painful long-running one. Don't boil the ocean; one workflow, honestly described,
beats four aspirational ones.

Hard questions the template forces you to answer:

1. What does a *good run* observably look like? (Charter)
2. Which events, if unlogged, make the run invalid? (Trace Contract)
3. Which skills may the planning phase touch? (Skill Lattice — hint: read-only)
4. What may auto-merge? (Governance Lane — hint: probably nothing, at first)
5. How does a restarted agent figure out where it left off? (Recovery)

Then:

```bash
node bin/bridle.mjs lint
```

Fix until it passes. The linter checks all four pillars, the loop, the good/bad
run definitions, and leftover template placeholders.

## Minute 20–25: wire the agent

Add one line to your `AGENTS.md` (the template already has it):

> Run-level rules: see `HARNESS.md`. If a HARNESS file exists for the workflow
> you're running, it governs your loop, logging, and permissions — load it before
> acting.

Every serious agent tool loads `AGENTS.md`; this line makes it load the harness
too. If your orchestrator supports hooks/middleware (Claude Code hooks, LangGraph
nodes, your own scripts), have it call `bridle run log` at the events your Trace
Contract names. If it doesn't, instruct the agent in `HARNESS.md` to call the CLI
itself — the trace is still real, just self-reported.

## Minute 25–30: first traced run

```bash
node bin/bridle.mjs run start scrape --agent claude-sonnet-5
node bin/bridle.mjs run log tool_call --detail '{"tool":"oxylabs","status":"ok"}'
node bin/bridle.mjs run log code_edit --prompt prompts/01-fix-parser.md --detail '{"file":"src/parse.ts"}'
node bin/bridle.mjs run log check_pass --phase evaluate --detail '{"check":"pipeline green"}'
node bin/bridle.mjs run end good
node bin/bridle.mjs status
```

You now have `logs/run-<id>.jsonl`: every event stamped with the run ID, the agent,
and the exact harness version + hash that governed it.

## The habit

- New long-running workflow → new HARNESS file (`harness/<name>.HARNESS.md`).
- Harness change → version bump, PR, human review (the harness is a governed
  surface of itself).
- Bad run → read the trace, fix the *harness*, not just the code. If the harness
  allowed the bad run, the harness was the bug.
- CI → run `bridle lint` on every PR (see `.github/workflows/harness-lint.yml`).

That's the whole discipline. Runs are artifacts now.
