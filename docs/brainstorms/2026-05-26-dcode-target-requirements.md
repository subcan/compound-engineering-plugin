---
date: 2026-05-26
topic: dcode-target
---

# Add dcode (LangChain Deep Agents Code) Target

## Summary

Add first-class `--to dcode` support to the compound-engineering-plugin's Bun/TypeScript converter + install CLI. The implementation produces output in the exact directory layouts that Deep Agents Code (dcode) discovers for skills (`SKILL.md` trees) and custom subagents (per-subagent folders containing `AGENTS.md`), targeting the primary user-level (`~/.deepagents/<agent>/...`) and project-level (`.deepagents/...` and `.agents/...` tool-agnostic) paths documented at https://docs.langchain.com/oss/python/deepagents/code/memory-and-skills and the data-locations page. This follows the repo's established 6-phase target addition pattern with minimal content transformation.

---

## Problem Frame

Users of LangChain's Deep Agents Code (the terminal coding agent `dcode`) who want access to the rich Compound Engineering skill catalog (ce-brainstorm, ce-plan, ce-code-review with its many specialized reviewers, ce-debug, ce-work, etc.) and the corresponding subagent definitions currently have no automated path. They must manually copy skill directories, restructure the flat `agents/*.md` files into the required `<name>/AGENTS.md` folder layout, and place everything under one or more of the supported discovery roots. This is error-prone, produces version drift on updates, and provides no integration with the existing `ce install` / `ce convert` workflow or the project's release and legacy-cleanup machinery.

The CE plugin source (`plugins/compound-engineering/skills/*/SKILL.md` and `agents/*.md`) is already structurally close to what dcode expects (YAML frontmatter + markdown body for both skills and subagents), but without an official target the friction remains high and the repository cannot compound knowledge about dcode support.

---

## Actors

- A1. Developer using dcode who wants native access to CE skills via `/skill:ce-*` and delegation to CE reviewer subagents inside their dcode sessions.
- A2. Maintainer/contributor to this repository who must keep the multi-target system, release validation, and legacy hygiene consistent when adding platforms.
- A3. Power user or team that runs the converter in CI or locally to produce portable dcode-compatible layouts for project `.deepagents/` trees.

---

## Requirements

**CLI Surface & Target Registration**

- R1. The `install` and `convert` commands must accept `--to dcode` (and `--also dcode`) exactly like other targets (grok, gemini, etc.).
- R2. A new target handler must be registered in `src/targets/index.ts` with `implemented: true` once complete, following the `TargetHandler` pattern (convert + write).
- R3. The target must support a `--dcode-agent <name>` argument (defaulting to "agent") to control the user-level subdirectory under `~/.deepagents/`.
- R4. Basic user vs. project scope awareness: when run inside a git repo and no explicit output is given, the writer should be capable of populating both the user-level home and the project `.deepagents/` (and `.agents/`) trees, or at minimum document the portable output layout clearly.

**Correct dcode Discovery Layout (Primary Fidelity Requirement)**

- R5. Skills must be emitted as `<sanitized-name>/SKILL.md` (preserving frontmatter and body) under the documented discovery directories, with correct precedence paths supported for v1: `~/.deepagents/<agent>/skills/`, `.deepagents/skills/`, and the tool-agnostic `.agents/skills/` siblings.
- R6. Subagents (sourced from `plugins/compound-engineering/agents/*.md`) must be restructured into the exact dcode format: one folder per subagent containing an `AGENTS.md` file whose YAML frontmatter includes at minimum `name` and `description` (with optional `model`), followed by the markdown body as the system prompt.
- R7. The writer must sanitize names for safe directory usage and avoid collisions, matching the discipline used by the Grok writer and `copySkillDir` / `sanitizePathName` utilities.
- R8. Generated output under an explicit `--output` directory must be directly usable by copying or symlinking the resulting `skills/` and `agents/` trees (or the whole tree) into the appropriate discovery roots. Direct writes to resolved `~/.deepagents/...` homes (when no `--output` is given and the target is invoked for install) must be supported safely.

**Minimal Transformation & Portability**

- R9. Content transformation must be minimal/light. The source CE skills and agent definitions are already designed to be relatively portable; any dcode-specific adjustments (tool name comments, environment variable fallbacks, etc.) should follow the same defensive patterns already used for other targets rather than invasive rewrites.
- R10. Scripts and references directories inside skills must be preserved where present (many CE skills already contain portable `.py` and `.sh` helpers).

**Documentation, Testing & Release Hygiene**

- R11. The root `README.md` (and `plugins/compound-engineering/README.md` if it lists targets) must document the new `--to dcode` option, example commands, and the expected layout / usage inside dcode (`/skill:ce-brainstorm`, task delegation to `ce-adversarial-reviewer`, etc.).
- R12. At least one writer or integration test must exercise the dcode target against real CE skill and agent content and assert the expected directory structure and key file contents.
- R13. `bun run release:validate` must continue to pass with no drift.
- R14. When skills or agents are later removed from the compound-engineering plugin, their names must be added to the existing `STALE_SKILL_DIRS` / `STALE_AGENT_NAMES` + legacy artifact registries (the dcode target must not create a new parallel cleanup system in v1).
- R15. The entire change must be structured as a clean, reviewable PR to the parent repository following all AGENTS.md rules (no manual version bumps, proper pre-commit checklist, etc.).

---

## Acceptance Examples

- AE1. **Covers R1–R8.** A user runs `ce install compound-engineering --to dcode --dcode-agent mybot` from inside a git project. The command writes (or instructs how to place) the full set of ce-* skills under both `~/.deepagents/mybot/skills/ce-brainstorm/SKILL.md` (and siblings) and `.deepagents/skills/ce-brainstorm/SKILL.md`, plus subagents under `~/.deepagents/mybot/agents/ce-adversarial-reviewer/AGENTS.md` (and the project `.deepagents/agents/...` equivalent). Running dcode with `--agent mybot` then sees the skills via `/skill:ce-brainstorm` and can delegate to the reviewer subagents.
- AE2. **Covers R5, R9.** The emitted `SKILL.md` and `AGENTS.md` files are byte-for-byte or near-identical to the source (modulo only necessary light normalization), so that existing CE reference material and scripts continue to function under dcode's tool set.

---

## Success Criteria

- A dcode user who has never manually copied CE content can obtain a working, up-to-date set of CE skills and subagents with a single familiar `ce install ... --to dcode` command (or equivalent convert + copy).
- The implementation adds no new carrying cost to the release or legacy-cleanup processes beyond what the 6-phase target pattern already requires.
- The change is small enough and well-documented enough that a contributor can land it as a single focused PR.

---

## Scope Boundaries

- **File-based skills + subagents only.** This effort delivers the CE catalog via dcode's documented markdown discovery mechanism (SKILL.md + AGENTS.md folders). It does **not** create a Python `deepagents` package, HarnessProfile, or provider profile entry point.
- **Primary paths in v1.** Support for the core documented locations (`~/.deepagents/<agent>/...`, `.deepagents/...`, and the `.agents/` tool-agnostic mirrors). Exhaustive coverage of every experimental `~/.claude/skills/` path or advanced multi-agent configuration is deferred.
- **No automatic detection or "dcode skills list" integration** in the first slice (the `detectInstalledTools` list and any dcode-specific `dcode skills create` awareness can be added in a follow-up if usage data justifies it).
- **No heavy per-skill behavioral ports.** If a CE workflow relies on Claude/Grok-specific tool names or middleware that dcode does not expose, the skill will surface the limitation via its own documentation rather than the converter trying to paper over it in v1.
- **No changes to the Python-based Deep Agents SDK itself** or to dcode's upstream behavior.

---

## Key Decisions

- **Follow the Grok target precedent for a clean, self-contained writer.** The dcode writer will be a new `src/targets/dcode.ts` (plus `src/types/dcode.ts`) rather than forcing all layout logic into an existing file. This keeps each target maintainable.
- **Treat dcode primarily as a "skills + subagents" consumer, not a traditional plugin bundle target.** Unlike Grok or OpenCode, dcode has no `plugin.json` wrapper for this use case; the writer therefore focuses on emitting the raw discovery trees (with optional portable output root).
- **Minimal transformation by default.** Source fidelity is high enough that we start with pass-through + light normalization and only add transforms when real usage reveals breakage.
- **Staged "highest function" path.** The requirements explicitly record that a future Python adapter layer (Approach 2 in the brainstorm) is a deliberate non-goal for this increment and will only be considered after the file bridge has real users and feedback.

---

## Dependencies / Assumptions

- The existing `copySkillDir`, `sanitizePathName`, `ensureDir`, and `writeText` utilities (and any shared content transform helpers) are sufficient or easily extended for dcode's needs.
- dcode will continue to load `SKILL.md` files with the same frontmatter contract (`name`, `description`) and `AGENTS.md` subagent files with the documented minimal frontmatter.
- Users (or a thin future wrapper) are comfortable either letting the CLI write directly into `~/.deepagents/...` or using `--output` + manual/symlink placement for project trees.

---

## Outstanding Questions

### Resolve Before Planning

- None — the brainstorm produced a clear, bounded minimal scope with an explicit chosen approach.

### Deferred to Planning

- Exact flag naming and help text for `--dcode-agent` and any scope/project flags (minor UX polish).
- Whether the writer should emit a small README or manifest inside the generated tree explaining how to activate it inside dcode (nice-to-have documentation, not required for R5–R8).
- Precise test strategy for the writer (pure unit on the tree shape vs. a fixture-based round-trip that also exercises a couple of real CE skills with references/scripts).