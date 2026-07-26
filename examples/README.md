# Examples

Real harnesses, not fixtures. Every one of these passes `bridle lint` at its stated
tier — CI checks that on every PR.

| Example | Tier | Shape |
| ------- | ---- | ----- |
| [minimal-tier1](minimal-tier1/HARNESS.md) | 1 | Weekly dep bumps. A Run Charter and nothing else — the honest starting point. |
| [scraping-pipeline](scraping-pipeline/HARNESS.md) | 3 | 24h data pipeline. Writes to a database, never edits code. |
| [nightly-coding-agent](nightly-coding-agent/HARNESS.md) | 3 | Overnight maintenance bot. PR-only, reviewed by a different model than the one that wrote the code. |

## Before / after: the line that does all the work

Most harnesses fail at the same place — the definition of a good run. Compare:

**Before** (feels responsible, proves nothing):

```markdown
**Definition of a good run:**
- The agent behaves safely and follows best practices
- Errors are handled appropriately
- Changes are reviewed
```

Nothing there is checkable. Six weeks later, nobody can say whether last night's run
was good, because "appropriately" has no failure condition.

**After** (each line is a test someone can run):

```markdown
**Definition of a good run:**
- [ ] Every change is on a `nightly/*` branch behind a PR
- [ ] Test suite green on every PR branch
- [ ] Reviewer sub-agent approved every diff before the PR was opened

**Definition of a bad run** (any one fails the run):
- Any commit landed on `main` directly
- A PR exists with no corresponding `code_edit` events in the trace
- The implementation model approved its own diff
```

The rule of thumb: **if you can't write the query or the command that proves a line
true, rewrite the line.** "Handles errors appropriately" becomes "error rate < 5% of
fetch attempts, and every failure has a `check_fail` event."

## Which one to copy

- Never written a harness before → **minimal-tier1**, and stay there until it's boring.
- Long-running data or automation job → **scraping-pipeline**.
- Agent that edits code while you sleep → **nightly-coding-agent**.
