# Change log

What changed here and why. Appended every session — see [`CLAUDE.md`](CLAUDE.md).
Newest first.

---

## 2026-08-04 — the agents linter learns to spot danger

- **`bridle agents` now flags dangerous instructions in the file itself.** Other
  AGENTS.md linters check freshness. None check whether the file *tells the agent
  to do something*. A `sudo`, a `curl | sh`, a write outside the checkout — those
  are not suggestions, they are steps an agent follows literally.
- **Every pattern came from a real company's file, not from imagination.** Tested
  against eight public repos (Buildkite, Testkube, E2B, Vellum, Altimate,
  MadAppGang and two others). Buildkite's `AGENTS.md` carries both a `curl | sh`
  and `sudo cp .buildkite/build/ssh.conf /etc/ssh/ssh_config.d/`, with zero
  prohibition statements anywhere in the file. Three of the eight had no
  "never / do not" line at all.
- **It also reports whether the file says what to NEVER touch.** A file of only
  permissions leaves every boundary to be inferred, and agents do not infer
  boundaries.
- **Two false positives were found and killed before shipping.** A path outside
  the repo now only counts when the line actually *writes* there — Testkube
  merely documented where its CLI stores config. And angle-bracket fields are a
  warning, not a failure, unless the placeholder itself looks unfilled: a file
  that mentioned "todo" once in prose was failing.
- **Rejected: shipping this as a fifth product.** Phase −1 found `agents-lint`
  already on npm with roughly 1,110 weekly downloads, five months of head start,
  and a tagline already claiming the cost angle. Entering that as a zero-star
  newcomer is the same mistake as chasing loop engineering. This is a feature,
  not a product.

## 2026-08-03 — honest about what it records

- **Mid-run harness edits are now actually detectable.** The trace stamped a
  *cached* hash, so editing `HARNESS.md` mid-run left no trace — while the README
  sold exactly that as proof. The harness is re-hashed on every event; drift
  prints a warning and records a `harness_drift` event.
- **`docs/adoption.md` told readers to run `npx github:YOURNAME/bridle init`** —
  exit 128, no output, nothing created, on the page the README links as the
  onboarding path.
- **The placeholder linter could not see its own template's `<N>`** (lowercase-only
  regex, 3-char minimum) and false-alarmed on `<info@singhlabs.dev>`.
- **Added `bridle agents`** — lints the `AGENTS.md` that 60,000+ repos commit,
  including what the file costs per turn. Nothing else reports that number.
- **Deleted `docs/`** — manifesto, pillars and adoption restated the README as
  essays, ~1,750 words. The product page sells, the README documents, and a docs
  file has to hold a fact that lives nowhere else.
