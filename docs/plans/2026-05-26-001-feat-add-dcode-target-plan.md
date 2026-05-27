---
title: feat: Add dcode converter target
type: feat
status: completed
date: 2026-05-26
origin: docs/brainstorms/2026-05-26-dcode-target-requirements.md
---

# feat: Add dcode converter target

## Summary

Complete first-class `--to dcode` (and `--also dcode`) support for LangChain Deep Agents Code in the compound-engineering-plugin CLI. The implementation follows the established 6-phase target provider pattern, the high-fidelity lessons from the recent Grok target, and the minimal file-layout bridge approach defined in the origin requirements. The writer emits the exact inner discovery trees dcode expects (`skills/<name>/SKILL.md` + supporting files and `agents/<name>/AGENTS.md` folders) with high source fidelity. Remaining work focuses on parity in `convert.ts`, mandatory shared + dedicated test coverage, documentation (`docs/specs/dcode.md`), and full release/validation hygiene so the change is PR-ready and maintainable.

---

## Problem Frame

Users of dcode currently have no automated way to obtain the rich CE skill and subagent catalog. Manual copies are error-prone, produce version drift, and bypass the project's release, legacy-cleanup, and fidelity guarantees. The origin requirements document and research establish that a minimal, high-fidelity bridge (following the exact 6-phase pattern and Grok lessons) is the right first increment. Partial skeleton code already exists from exploratory work; this plan brings it to production standard without expanding scope into Python profiles or heavy behavioral ports.

---

## Requirements

All requirements are carried from the origin document (`docs/brainstorms/2026-05-26-dcode-target-requirements.md`). This plan satisfies R1–R15 and AE1–AE2 with the following explicit traceability.

**Origin actors:** A1 (dcode developer), A2 (plugin maintainer), A3 (power user / team)

**Origin acceptance examples:** AE1 (end-to-end install + activation in dcode), AE2 (source fidelity of emitted SKILL.md / AGENTS.md)

**Key origin requirements this plan must satisfy:**
- R1–R4 (CLI surface, registration, `--dcode-agent`, basic scope awareness)
- R5–R8 (correct dcode discovery layout for primary paths) — covered by existing writer (U2 dedicated tests + U5 real-skill exercising)
- R9–R10 (minimal transformation + preservation of references/scripts) — covered by existing writer (U2 dedicated tests + U5 real-skill exercising)
- R11–R15 (documentation, testing, release:validate, legacy hygiene, PR-ready structure)

---

## Scope Boundaries

- File-based skills + subagents only (no Python HarnessProfile / provider profile work — explicit non-goal per origin).
- Primary documented dcode paths in v1 (`~/.deepagents/<agent>/...`, `.deepagents/...`, `.agents/...` tool-agnostic mirrors). Exhaustive experimental `.claude/skills/` paths deferred.
- No automatic detection in `detectInstalledTools` or `dcode skills` integration in this increment.
- No heavy per-skill behavioral ports or changes to dcode's upstream behavior.
- The existing partial dcode skeleton (types, thin converter, writer, partial install wiring, README mention) is accepted as starting state; this plan completes it to full 6-phase + research-recommended quality.

### Deferred to Follow-Up Work
- Full U3-style dogfood inside a real dcode session with complex CE skills (separate verification PR or report, following Grok precedent).
- Any future Python adapter layer for higher integration (explicitly staged in origin).
- Extension of `resolveTargetOutputRoot` / home helpers for dcode (writer remains intentionally flexible for portable + direct-home use in v1).

---

## Context & Research

### Relevant Code and Patterns
- Canonical 6-phase target provider pattern: `docs/solutions/adding-converter-target-providers.md` (Grok as high-fidelity exemplar #11).
- Grok writer as reference for layout emission, `copySkillDir(..., true)`, logging, and version handling (adapted for dcode's "inner trees only, no plugin.json wrapper").
- Current dcode implementation state (as of research):
  - `src/types/dcode.ts`, `src/converters/claude-to-dcode.ts`, `src/targets/dcode.ts` (good minimal writer using `sanitizePathName` + identity `copySkillDir` + agent folder restructuring).
  - Partial wiring in `src/commands/install.ts` ( `--dcode-agent` arg + special-case handling).
  - `src/commands/convert.ts` and `src/targets/index.ts` have registration but incomplete parity for `--to dcode` / `--also`.
  - `src/utils/resolve-output.ts` and home helpers fall through for dcode (acceptable for v1 portable layout).
  - README has a dcode section; `docs/specs/dcode.md` does not exist.
- Shared utilities: `src/utils/files.ts` (`copySkillDir`, `sanitizePathName`, `ensureDir`, `writeText`).
- Centralized legacy + release hygiene (`src/utils/legacy-cleanup.ts`, `src/data/plugin-legacy-artifacts.ts`, `scripts/release/validate.ts`).

### Institutional Learnings
- **Critical**: Follow the 6-phase pattern + AGENTS.md "Adding a New Target Provider" checklist. Study Grok fidelity doc to avoid "functional skeleton" anti-pattern (core wiring without hardened transforms + real-skill exercising).
- Mandatory shared test coverage in `converter.test.ts` + `cli.test.ts` (not just dedicated tests).
- Always use `sanitizePathName` at FS boundaries (already correctly applied in current dcode writer).
- Transform-layer-only discipline even for minimal targets; source must remain portable.
- Run `release:validate` on any inventory or README table changes.
- Writer should be flexible for dcode's multi-root discovery model (portable inner `skills/` + `agents/` trees that callers place).

### External References
- dcode discovery rules: https://docs.langchain.com/oss/python/deepagents/code/memory-and-skills and data-locations page (primary paths confirmed in origin requirements).

---

## Key Technical Decisions

- **Follow 6-phase pattern exactly, with Grok as reference but dcode-specific minimal adaptations.** Converter remains thin (structural mapping only). Writer focuses on correct layout emission using existing `copySkillDir` + `sanitizePathName` (identity transform for v1). No heavy `transformContentForDcode` layer unless real usage proves it necessary.
- **Writer remains flexible on destination roots.** Do not force early extension of `resolveTargetOutputRoot` for dcode. The writer accepts an options bag and emits clean inner trees; callers (install/convert or manual) decide final placement into `~/.deepagents/...` or project trees. This matches dcode's multi-path discovery model.
- **Mandatory U3-style exercising before claiming readiness.** Even for a "minimal" target, exercise at least one complex real CE skill (e.g. `ce-code-review` with multiple reviewers) through the full convert → writer → layout roundtrip before finalizing tests/docs.
- **Shared test coverage is non-negotiable.** Dedicated `dcode-*.test.ts` files are useful but insufficient. Must add explicit blocks to `tests/converter.test.ts` and `tests/cli.test.ts` (following Grok pattern).
- **Documentation must include `docs/specs/dcode.md`.** Mirror structure and depth of `docs/specs/grok.md` (layout, frontmatter expectations, install UX, known limitations).

---

## Open Questions

### Resolved During Planning
- Exact scope of v1 resolve helper changes: none required (writer flexibility accepted per research and current prototype).
- Test strategy: dedicated writer test + strong shared coverage in converter/cli tests + at least one real-skill roundtrip exercising a complex CE skill (U3-lite).

### Deferred to Implementation
- Final wording of dcode-specific console guidance and README examples (minor UX polish during dogfood).
- Whether any light dcode-specific content transform becomes necessary after real usage (explicitly deferred per R9 and origin scope).

---

## Implementation Units

### U1. Complete CLI parity for `convert` and `--also` flows

**Goal:** Make `--to dcode` and `--also dcode` work fully and consistently in both `install` and `convert` commands, matching the quality bar of the Grok target.

**Requirements:** R1, R2, R3, R4

**Dependencies:** None (builds on existing partial wiring)

**Files:**
- Modify: `src/commands/convert.ts`
- Modify: `src/commands/install.ts` (review and harden existing dcode branches)
- Test: `tests/cli.test.ts`

**Approach:**
- Add `dcodeAgent` arg handling and special-case writer invocation in `convert.ts` (mirror the pattern already present in `install.ts`).
- Ensure `--also dcode` works in both commands.
- Update `--to` help text in convert.ts to include `dcode` (the current description string is missing it: "opencode | codex | pi | gemini | kiro | grok | all", unlike the install.ts equivalent which already lists dcode).
- Follow existing multi-target loop patterns exactly.

**Patterns to follow:**
- Current dcode handling in `install.ts`
- Grok handling in both convert and install (from research)

**Test scenarios:**
- Happy path: `convert ... --to dcode --dcode-agent mybot` produces correct tree and logs.
- Happy path: `install ... --to dcode --also grok` succeeds for both.
- Error path: unknown agent name or conflicting flags surface clear errors.
- Integration: output layout matches writer contract.

**Verification:** Manual runs of both commands + updated CLI tests pass.

---

### U2. Add dedicated dcode writer + converter tests

**Goal:** Ship the minimum dedicated test surface required by the 6-phase pattern and AGENTS.md checklist.

**Requirements:** R12 (also exercises R5–R10 layout fidelity via writer tests)

**Dependencies:** U1 (stable CLI surface)

**Files:**
- Create: `tests/dcode-writer.test.ts`
- Create: `tests/dcode-converter.test.ts`
- Modify: `tests/fixtures/sample-plugin/` (if needed for dcode-specific fixtures)

**Approach:**
- Writer test: assert correct `skills/<name>/SKILL.md` + full subtree and `agents/<name>/AGENTS.md` structure, sanitization, no double-nesting, preservation of references/scripts.
- Converter test: assert thin mapping produces expected `DcodeBundle` shape.
- Use real CE skills/agents from `plugins/compound-engineering/` where possible.

**Patterns to follow:**
- `tests/grok-writer.test.ts` and `tests/grok-converter.test.ts` structure and assertions (adapted for dcode's simpler layout).

**Test scenarios:**
- Happy path: roundtrip of `ce-brainstorm` skill + one reviewer agent produces correct dcode tree.
- Edge case: duplicate names after sanitization are handled with warnings.
- Edge case: empty agents or skills lists.

**Verification:** All new tests green.

---

### U3. Add mandatory shared test coverage

**Goal:** Satisfy the "U3a/U3b" requirement emphasized in the 6-phase pattern doc and Grok fidelity learnings.

**Requirements:** R12 (also exercises R5–R10 layout fidelity via writer tests)

**Dependencies:** U1, U2

**Files:**
- Modify: `tests/converter.test.ts`
- Modify: `tests/cli.test.ts`

**Approach:**
- Add dcode describe blocks in converter.test.ts exercising the bundle shape and thin mapping.
- Add CLI tests for `--to dcode`, `--also dcode`, and `--dcode-agent` flows with output tree assertions.
- Include at least one roundtrip using a complex real skill (e.g. excerpt from `ce-code-review`).

**Patterns to follow:**
- Grok blocks in the same shared test files (research explicitly calls this out as mandatory).

**Test scenarios:**
- Happy path + `--also` combinations in shared CLI tests.
- Converter contract tests for dcode bundle shape.
- One integration-style test using real CE content through the full pipeline.

**Verification:** Shared tests pass and provide meaningful coverage for dcode.

---

### U4. Create `docs/specs/dcode.md` and update documentation

**Goal:** Provide the same quality of target-specific documentation as Grok and other first-class targets.

**Requirements:** R11

**Dependencies:** U1 (stable behavior)

**Files:**
- Create: `docs/specs/dcode.md`
- Modify: `README.md` (ensure examples and supported-targets list are complete and accurate)
- Modify: `plugins/compound-engineering/README.md` (if it lists targets)

**Approach:**
- `docs/specs/dcode.md` must cover: exact emitted layout, frontmatter expectations for SKILL.md and AGENTS.md, install UX (portable vs direct home, `--dcode-agent`), known limitations, and links to official dcode discovery docs.
- Keep examples minimal and accurate per origin AE1.
- Run `release:validate` after any inventory/description changes.

**Patterns to follow:**
- `docs/specs/grok.md` structure and depth (research reference).

**Test scenarios:**
- Documentation review: examples in README and specs are executable and match actual output.

**Verification:** `bun run release:validate` passes; documentation reviewers can follow the examples.

---

### U5. Real-skill exercising (U3-style per Grok fidelity learnings) + release hygiene

**Goal:** Exercise at least one complex real CE skill through the full pipeline before claiming readiness (U3-style per Grok fidelity learnings) and ensure all release/legacy rules are satisfied.

**Requirements:** R12, R13, R14, R15

**Dependencies:** U2, U3, U4

**Files:**
- (No new permanent files; uses existing test fixtures and real plugin content)

**Approach:**
- Manually (or via test) run convert/install of the full `compound-engineering` plugin with `--to dcode`.
- Spot-check a complex skill (e.g. `ce-code-review` or `ce-plan`) and at least two reviewer agents in the emitted layout.
- Verify `release:validate` is clean.
- Confirm no new legacy artifacts were introduced that would require immediate STALE_ entries (per R14).
- Record any minor fidelity observations as notes in the writer or specs (do not mutate universal source).

**Patterns to follow:**
- Grok U3 / 002 readiness process described in the fidelity best-practice doc.

**Test scenarios:**
- End-to-end roundtrip of real CE content produces usable dcode layout (manual verification + summary in plan or a lightweight test comment).

**Verification:** `release:validate` green; manual layout inspection passes; no source pollution.

---

### U6. Final validation and PR readiness

**Goal:** Ensure the change is in a state a contributor can confidently submit as a clean PR.

**Requirements:** R15 and all prior R's

**Dependencies:** U1–U5

**Files:**
- (Review and minor polish across the above files)

**Approach:**
- Full `bun test` run focused on converter/cli paths.
- Final `bun run release:validate`.
- Review all new/modified files against AGENTS.md rules (no manual version bumps, conventional commits, etc.).
- Ensure the plan's test scenarios are actually present and passing.

**Verification:** All tests green, validate green, documentation consistent, no obvious AGENTS.md violations.

---

## Risks & Mitigations

- Risk: Incomplete parity between `install` and `convert` leads to confusing UX. Mitigation: U1 explicitly addresses this with shared patterns.
- Risk: Missing shared tests allows future regressions (the exact anti-pattern called out in research). Mitigation: U3 makes this non-negotiable.
- Risk: dcode's multi-root discovery model tempts over-engineering of resolve helpers. Mitigation: explicit decision to keep writer flexible in v1 (documented in Key Technical Decisions and Scope).

---

## Success Criteria

- `ce ... --to dcode --dcode-agent mybot` (and equivalent convert flows) produce correct, high-fidelity dcode discovery trees.
- All R1–R15 and AE1–AE2 from origin are demonstrably satisfied.
- Research-recommended quality bars are met (6-phase pattern followed, shared tests present, U3-lite exercising done, `release:validate` clean).
- A contributor following the plan can land a clean PR without inventing additional steps.

---

## Sources & References

- Origin: `docs/brainstorms/2026-05-26-dcode-target-requirements.md`
- Primary pattern: `docs/solutions/adding-converter-target-providers.md`
- High-fidelity precedent: `docs/solutions/best-practices/full-ce-process-grok-converter-target-fidelity.md`
- Current dcode implementation state and research findings from `ce-repo-research-analyst` and `ce-learnings-researcher` subagents (2026-05-26/27 runs).
- AGENTS.md (target addition checklist and contribution rules).