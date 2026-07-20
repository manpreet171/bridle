# Prompt — <feature or task name>

> AI-written implementation plan, human-approved before execution.
> Save as `prompts/<nn>-<slug>.md`. The run that executes this prompt must
> reference this file in its trace (see HARNESS §2).

| Field           | Value                                  |
| --------------- | -------------------------------------- |
| Status          | draft / approved / executed            |
| Approved by     | `<human>`                              |
| Executed in run | `<run_id, filled after execution>`     |

## Goal

<What this change accomplishes, in one paragraph.>

## Files to change

- `<path>` — <what changes>

## Decisions & assumptions

- <Each decision the agent made while planning, so the human can veto it here
  instead of in review.>

## Security requirements

- <Constraints from AGENTS.md that this change touches.>

## Verification steps

- [ ] <How the Evaluate phase will prove this worked — commands, tests, checks.>
