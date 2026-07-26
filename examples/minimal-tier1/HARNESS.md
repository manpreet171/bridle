# HARNESS — weekly dependency updates (tier 1)

> This is what an honest **tier 1** harness looks like: a Run Charter and nothing
> else. It passes `bridle lint --tier 1` and fails the default tier 3 — on purpose.
> Start here, then add the Trace Contract when you actually start logging.

| Field           | Value                                       |
| --------------- | ------------------------------------------- |
| Harness version | `0.1.0`                                     |
| Owner           | `you@example.com`                           |
| Applies to      | the agent running the `deps` workflow        |
| Tier            | 1 (Run Charter only)                        |

---

## 1. Run Charter

**Run goal:**
Keep dependencies current without breaking the build, one PR per week that a human
can review in five minutes.

**Loop:** every step follows **Plan → Act → Evaluate**:

1. **Plan** — list the outdated packages; pick only patch and minor bumps.
2. **Act** — bump them on a branch, one commit per package.
3. **Evaluate** — install and run the test suite.

**Budgets:**

- Max wall-clock time per run: 30 min
- Max packages per run: 10
- On budget breach: stop and open the PR with whatever passed.

**Definition of a good run:**

- [ ] Test suite green
- [ ] One PR, no direct pushes to `main`
- [ ] Every bump is patch or minor

**Definition of a bad run** (any one fails the run):

- A major-version bump slipped in
- Tests were skipped to make the PR green
- Anything landed on `main` without review

---

## What's deliberately missing

No Trace Contract, no Skill Lattice, no Governance Lane, no Recovery section — so
this file makes exactly one promise and keeps it. Adding empty headings to satisfy
tier 3 would be worse than admitting the tier.

Grow it when the need is real:

- Losing track of what a run touched? → add **Trace Contract** (tier 2)
- Agent reaching for tools it shouldn't in planning? → add **Skill Lattice**
- Changes landing where they shouldn't? → add **Governance Lane**
- Runs long enough to crash and resume? → add **Recovery & Escalation**
