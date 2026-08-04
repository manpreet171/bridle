# Working rules for this repo

`bridle` — one file, zero dependencies, Node 18+. Nothing to build.

## Always log what you did

**Every session that changes anything appends to [`LOG.md`](LOG.md) before it
finishes. Nobody should have to ask.** Newest date first, one line per change,
what changed and *why*. **Log decisions and rejected ideas too** — "skipped X
because Y" is worth more in six months than any diff. Get the date from the
system, never guess it.

## What this tool is, and is not

- It **records**. It does not enforce. The harness declares the policy, the trace
  proves what happened, and branch protection is what physically stops a bad
  merge. Never write a sentence that blurs those three.
- **Never claim a mechanism the code does not perform.** This repo shipped
  "if someone edits the harness mid-run, the trace shows it" over code that
  stamped a cached hash and could not see the edit. If the README asserts a
  behaviour, there must be a command that demonstrates it.

## The linters

- **False positives are the fatal bug.** A linter that flags documentation as
  danger, or argument syntax as an unfilled field, gets ignored — and then the
  real finding is ignored with it. When a rule is ambiguous, warn instead of fail.
- `bridle agents` reads other people's files. It must be conservative in a way
  `bridle lint` need not be: this repo's own template has a stated convention,
  a stranger's file has none.
- **Test against repos you did not write.** Every rule in the danger list came
  from a real public file. Fixtures written here can only ever prove the happy
  path.

## Content rules

- Every command and every block of output in the README was produced by running
  it. Never remembered, never plausible-looking.
- README ≤ 800 words. `docs/` holds only facts that live nowhere else — it was
  deleted once for restating the README as essays.
- No "the industry is converging on" paragraphs. Cut, don't clarify.
