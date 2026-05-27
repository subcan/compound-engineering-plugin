# dcode (LangChain Deep Agents Code) Target Spec

Last verified: 2026-05-26 (initial implementation per plan 2026-05-26-001)

## Overview

The `compound-engineering-plugin` converter supports `--to dcode` (and `--also dcode`) to produce output compatible with **LangChain Deep Agents Code** (`dcode`).

dcode discovers skills and custom subagents from well-known directories (see official docs below). This target is intentionally a **minimal file-layout bridge** — it emits the exact inner directory trees users can copy or symlink into their dcode discovery paths (`~/.deepagents/<agent>/`, `.deepagents/`, `.agents/`, etc.). It does **not** produce a wrapped "plugin" bundle like Grok or OpenCode.

## Primary sources

- Official dcode documentation:
  - https://docs.langchain.com/oss/python/deepagents/code/memory-and-skills
  - https://docs.langchain.com/oss/python/deepagents/code/data-locations (skills and subagents discovery paths + precedence)
- Origin requirements: `docs/brainstorms/2026-05-26-dcode-target-requirements.md`
- Implementation in this repository:
  - `src/types/dcode.ts`
  - `src/converters/claude-to-dcode.ts` (thin structural mapping)
  - `src/targets/dcode.ts` (writer — identity transform + agent folder restructuring)
  - CLI support in `src/commands/{convert,install}.ts`

## Output layout (portable inner trees)

When you run:

```bash
ce convert plugins/compound-engineering --to dcode --dcode-agent mybot --output /tmp/dcode-ce
# or
ce install compound-engineering --to dcode --dcode-agent mybot
```

You get this shape at the output root (or resolved location):

```
<output>/
├── skills/
│   └── <sanitized-skill-name>/
│       ├── SKILL.md
│       ├── references/
│       └── scripts/...
└── agents/
    └── <sanitized-subagent-name>/
        └── AGENTS.md
```

- **No** top-level `plugin.json`, `.mcp.json`, or extra wrapper directory.
- Skills are copied with full subtree preservation (`copySkillDir(..., true)` — references and scripts intact).
- Agents are restructured from flat `*.md` files into the per-subagent `AGENTS.md` folders that dcode requires.
- All names are sanitized via `sanitizePathName` (colons → hyphens for cross-platform safety).

Users then place the `skills/` and `agents/` contents into the appropriate dcode discovery root(s) for their agent.

## CLI surface

- `--to dcode` (convert + install)
- `--also dcode`
- `--dcode-agent <name>` (defaults to "agent")
  - Controls the example paths printed in writer guidance.
  - Does **not** change the emitted tree structure itself (the tree is always the portable inner form).

Example:

```bash
ce install compound-engineering --to dcode --dcode-agent team-reviewer
```

The writer will print activation instructions using `~/.deepagents/team-reviewer/...`.

## Frontmatter expectations (dcode side)

dcode loads:

- **Skills**: `SKILL.md` with standard `name` + `description` YAML frontmatter (plus body). Extra frontmatter is tolerated.
- **Subagents**: `AGENTS.md` files inside `agents/<name>/` with at minimum `name` and `description` (optional `model`). Extra keys (tools, color, etc.) from CE source are harmless.

The converter/writer performs **minimal transformation** — the rich CE frontmatter and bodies are passed through largely as-is. This matches the "high source fidelity" goal in the origin requirements.

## Known limitations / future work (per plan scope)

- No automatic registration into `detectInstalledTools` or `dcode skills` commands in v1 (deferred).
- No Python HarnessProfile / provider profile packaging (explicit non-goal).
- No heavy content transforms (e.g. tool name rewriting) unless real usage reveals breakage.
- Writer guidance is the primary UX for activation; more sophisticated "dcode native" install helpers can be added later.

## Related

- Plan: `docs/plans/2026-05-26-001-feat-add-dcode-target-plan.md`
- Requirements: `docs/brainstorms/2026-05-26-dcode-target-requirements.md`
- Implementation Units reference the 6-phase target pattern + Grok high-fidelity lessons (U3 shared tests + real-skill exercising before claiming readiness).

## Verification

After changes to dcode support, run:

```bash
bun test tests/dcode-*.test.ts tests/converter.test.ts tests/cli.test.ts
bun run release:validate
```

Manual smoke:

```bash
bun run src/index.ts convert plugins/compound-engineering --to dcode --dcode-agent test-bot --output /tmp/dcode-smoke
# Inspect /tmp/dcode-smoke/skills and /tmp/dcode-smoke/agents
```

The emitted layout must be directly usable by copying into a dcode agent's discovery directories.