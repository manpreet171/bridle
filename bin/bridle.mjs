#!/usr/bin/env node
/**
 * bridle — the Harness Script Engineering CLI.
 * Zero dependencies. Node 18+.
 *
 *   bridle init            scaffold HARNESS.md, AGENTS.md, prompts/, logs/, skills/
 *   bridle lint [file]     verify a HARNESS file honors the four pillars
 *   bridle run start       open a run: mints run_id, stamps harness version + hash
 *   bridle run log ...     append a trace event to the open run
 *   bridle run end ...     close the run with a good/bad verdict
 *   bridle status          summarize recent runs from logs/
 */

import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = process.cwd();
const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOGS = join(ROOT, "logs");
const OPEN_RUN = join(LOGS, ".open-run.json");

// tier: the lowest adoption tier that requires this section (see README "three tiers")
const REQUIRED_SECTIONS = [
  { re: /^##\s*1\.\s*Run Charter/m, name: "1. Run Charter", tier: 1 },
  { re: /^##\s*2\.\s*Trace Contract/m, name: "2. Trace Contract", tier: 2 },
  { re: /^##\s*3\.\s*Skill Lattice/m, name: "3. Skill Lattice", tier: 3 },
  { re: /^##\s*4\.\s*Governance Lane/m, name: "4. Governance Lane", tier: 3 },
  { re: /^##\s*5\.\s*Recovery/m, name: "5. Recovery & Escalation", tier: 3 },
];

const REQUIRED_FIELDS = [
  { re: /Harness version/i, name: "Harness version" },
  { re: /Owner/i, name: "Owner" },
];

const CHARTER_CHECKS = [
  { re: /Plan\s*(→|->)\s*Act\s*(→|->)\s*Evaluate/i, name: "Plan → Act → Evaluate loop" },
  { re: /good run/i, name: "definition of a good run" },
  { re: /bad run/i, name: "definition of a bad run" },
];

function die(msg) { console.error(`bridle: ${msg}`); process.exit(1); }
function ok(msg) { console.log(`  ✔ ${msg}`); }
function bad(msg) { console.log(`  ✘ ${msg}`); }

function findHarness(explicit) {
  if (explicit) {
    if (!existsSync(explicit)) die(`no such file: ${explicit}`);
    return explicit;
  }
  const candidates = ["HARNESS.md"];
  if (existsSync(join(ROOT, "harness"))) {
    for (const f of readdirSync(join(ROOT, "harness"))) {
      if (f.endsWith(".HARNESS.md") || f === "HARNESS.md") candidates.push(join("harness", f));
    }
  }
  const found = candidates.filter((c) => existsSync(join(ROOT, c)));
  if (found.length === 0) die("no HARNESS.md found. Run `bridle init` first.");
  return join(ROOT, found[0]);
}

function harnessMeta(file) {
  const text = readFileSync(file, "utf8");
  const version = (text.match(/Harness version[^`|]*[`|]\s*`?([^`|\n]+?)`?\s*[`|]/i) ||
    text.match(/Harness version\s*\|\s*`?([^`|\n]+?)`?\s*\|/i) || [null, "unversioned"])[1].trim();
  const hash = createHash("sha256").update(text).digest("hex").slice(0, 12);
  return { text, version, hash };
}

/* ------------------------------------------------------------------ init */

function init() {
  const copies = [
    ["templates/HARNESS.template.md", "HARNESS.md"],
    ["templates/AGENTS.template.md", "AGENTS.md"],
  ];
  for (const [src, dst] of copies) {
    const target = join(ROOT, dst);
    if (existsSync(target)) { console.log(`  · ${dst} already exists, skipping`); continue; }
    writeFileSync(target, readFileSync(join(PKG_ROOT, src), "utf8"));
    ok(`created ${dst}`);
  }
  for (const dir of ["prompts", "skills", "logs"]) {
    const target = join(ROOT, dir);
    if (!existsSync(target)) { mkdirSync(target, { recursive: true }); ok(`created ${dir}/`); }
  }
  const keep = join(LOGS, ".gitkeep");
  if (!existsSync(keep)) writeFileSync(keep, "");
  console.log("\nNext: fill in HARNESS.md, then `bridle lint` until it passes.");
}

/* ------------------------------------------------------------------ lint */

function lint(fileArg, tier) {
  const file = findHarness(fileArg);
  const { text, version } = harnessMeta(file);
  console.log(`Linting ${file} (version ${version}, tier ${tier})\n`);
  let failures = 0;

  console.log("Pillar sections:");
  for (const s of REQUIRED_SECTIONS) {
    if (s.tier > tier) { console.log(`  · ${s.name} (not required at tier ${tier})`); continue; }
    if (s.re.test(text)) ok(s.name); else { bad(`missing section: ${s.name}`); failures++; }
  }

  console.log("\nHeader fields:");
  for (const f of REQUIRED_FIELDS) {
    if (f.re.test(text)) ok(f.name); else { bad(`missing field: ${f.name}`); failures++; }
  }

  console.log("\nCharter contents:");
  for (const c of CHARTER_CHECKS) {
    if (c.re.test(text)) ok(c.name); else { bad(`charter lacks ${c.name}`); failures++; }
  }

  console.log("\nUnfilled placeholders:");
  const placeholders = text.match(/<[a-z][^>\n]{2,60}>/g) || [];
  const real = placeholders.filter((p) => !/^<(https?|\/|!--)/.test(p));
  if (real.length === 0) ok("none");
  else { bad(`${real.length} template placeholder(s) still unfilled, e.g. ${real[0]}`); failures++; }

  console.log(failures === 0
    ? `\nPASS — this harness holds at tier ${tier}.${tier < 3 ? ` Move to tier ${tier + 1} when it stops being a lie.` : ""}`
    : `\nFAIL — ${failures} problem(s). A run under this script has undefined behavior.`);
  process.exit(failures === 0 ? 0 : 1);
}

/* ------------------------------------------------------------------ runs */

function appendEvent(runFile, event) {
  appendFileSync(runFile, JSON.stringify(event) + "\n");
}

function runStart(args) {
  const workflow = args[0] || "run";
  const agent = valueOf(args, "--agent") || "unknown-agent";
  const file = findHarness(valueOf(args, "--harness"));
  const { version, hash } = harnessMeta(file);
  if (!existsSync(LOGS)) mkdirSync(LOGS, { recursive: true });
  const ts = new Date().toISOString();
  const runId = `${workflow}-${ts.replace(/[-:]/g, "").slice(0, 15)}Z-${randomBytes(3).toString("hex")}`;
  const runFile = join(LOGS, `run-${runId}.jsonl`);
  const base = { ts, run_id: runId, harness_version: version, harness_hash: hash, agent_id: agent };
  appendEvent(runFile, { ...base, phase: "plan", event: "run_start", detail: { harness_file: file } });
  writeFileSync(OPEN_RUN, JSON.stringify({ runId, runFile, version, hash, agent }, null, 2));
  console.log(runId);
}

function openRun() {
  if (!existsSync(OPEN_RUN)) die("no open run. Start one with `bridle run start <workflow>`.");
  return JSON.parse(readFileSync(OPEN_RUN, "utf8"));
}

function runLog(args) {
  const [event, ...rest] = args;
  const allowed = ["tool_call", "code_edit", "db_write", "api_hit", "check_pass", "check_fail", "escalation", "note"];
  if (!allowed.includes(event)) die(`event must be one of: ${allowed.join(", ")}`);
  const r = openRun();
  const phase = valueOf(rest, "--phase") || (event.startsWith("check") ? "evaluate" : "act");
  const promptFile = valueOf(rest, "--prompt");
  const detailArg = valueOf(rest, "--detail");
  let detail = {};
  if (detailArg) {
    try { detail = JSON.parse(detailArg); } catch { detail = { note: detailArg }; }
  }
  const e = {
    ts: new Date().toISOString(), run_id: r.runId, harness_version: r.version,
    harness_hash: r.hash, agent_id: r.agent, phase, event, detail,
  };
  if (promptFile) e.prompt_file = promptFile;
  appendEvent(r.runFile, e);
  console.log(`logged ${event} → ${r.runFile}`);
}

function runEnd(args) {
  const verdict = args[0];
  if (!["good", "bad"].includes(verdict)) die("usage: bridle run end <good|bad> [--detail '...']");
  const r = openRun();
  appendEvent(r.runFile, {
    ts: new Date().toISOString(), run_id: r.runId, harness_version: r.version,
    harness_hash: r.hash, agent_id: r.agent, phase: "evaluate", event: "run_end",
    verdict, detail: { note: valueOf(args, "--detail") || "" },
  });
  writeFileSync(OPEN_RUN, "{}");
  console.log(`run ${r.runId} closed: ${verdict.toUpperCase()}`);
}

function status() {
  if (!existsSync(LOGS)) die("no logs/ directory yet.");
  const files = readdirSync(LOGS).filter((f) => f.startsWith("run-") && f.endsWith(".jsonl")).sort().slice(-10);
  if (files.length === 0) { console.log("no runs recorded yet."); return; }
  console.log("Recent runs:\n");
  for (const f of files) {
    const lines = readFileSync(join(LOGS, f), "utf8").trim().split("\n").map((l) => JSON.parse(l));
    const start = lines[0], end = lines.find((l) => l.event === "run_end");
    const verdict = end ? end.verdict.toUpperCase() : "OPEN";
    const escalations = lines.filter((l) => l.event === "escalation").length;
    console.log(`  ${verdict.padEnd(5)} ${start.run_id}`);
    console.log(`        harness v${start.harness_version} (${start.harness_hash}) · agent ${start.agent_id} · ${lines.length} events · ${escalations} escalation(s)`);
  }
}

/* ------------------------------------------------------------------ main */

function valueOf(args, flag) {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : null;
}

const [cmd, sub, ...rest] = process.argv.slice(2);
switch (cmd) {
  case "init": init(); break;
  case "lint": {
    const all = [sub, ...rest].filter(Boolean);
    const tierArg = valueOf(all, "--tier");
    const tier = tierArg ? Number(tierArg) : 3;
    if (![1, 2, 3].includes(tier)) die("--tier must be 1, 2, or 3");
    const fileArg = all.find((a) => !a.startsWith("--") && a !== tierArg);
    lint(fileArg, tier);
    break;
  }
  case "status": status(); break;
  case "run":
    if (sub === "start") runStart(rest);
    else if (sub === "log") runLog(rest);
    else if (sub === "end") runEnd(rest);
    else die("usage: bridle run <start|log|end>");
    break;
  default:
    console.log(`bridle — Harness Script Engineering CLI

  bridle init                          scaffold HARNESS.md, AGENTS.md, prompts/, skills/, logs/
  bridle lint [file] [--tier 1|2|3]    verify a HARNESS file honors the pillars (default tier 3)
  bridle run start <workflow> [--agent <id>] [--harness <file>]
  bridle run log <event> [--phase p] [--prompt file] [--detail '{...}']
  bridle run end <good|bad> [--detail '...']
  bridle status                        summarize recent runs

Events: tool_call code_edit db_write api_hit check_pass check_fail escalation note`);
}
