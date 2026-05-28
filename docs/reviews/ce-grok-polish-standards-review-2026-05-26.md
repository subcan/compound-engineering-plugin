# CE Project Standards Review: Grok Target Post-Dogfood Polish (2026-05-26)

**Reviewer:** ce-project-standards-reviewer (Grok Build subagent)  
**Date:** 2026-05-25 (PT)  
**Scope:** Focused incremental polish since commit `9a7901e` ("feat(grok): add first-class --to grok support...") on the Grok converter target.  
**Origin Plan:** `docs/plans/2026-05-26-001-fix-grok-plugin-install-executable-message-plan.md` (R1–R6)  
**Change Surface:**  
- Incremental (committed since 9a7901e, observed in mirror): `src/types/grok.ts`, `src/converters/claude-to-grok.ts`, `src/targets/grok.ts`, `tests/grok-writer.test.ts`, `docs/specs/grok.md`  
- New untracked deliverables: the plan + `docs/solutions/integrations/grok-plugin-install-executable-noise-2026-05.md` (U1 findings)  
- Primary tree observation: landing staged in `compound-engineering-plugin/`; full polish + new docs executed exclusively in `test-compound-engineering-plugin/compound-engineering-plugin/` mirror tree.  
**Audit Basis:** AGENTS.md (esp. "Adding a New Target Provider", Repository Docs Convention, solution categories, repo surfaces, commit conventions, output paths, "update tests alongside"), `docs/solutions/adding-converter-target-providers.md` (6-phase pattern, dedicated files, tests required, docs/specs updates, no canonical pollution), the polish plan's own R1–R6 + scope boundaries, `docs/reviews/grok-target-testing-review.md` (Medium risk traceability), prior 2026-05-20 Grok plan (precise fields deferral), directory conventions, repo-relative paths only, "changes stay strictly within the Grok target".

---

## Compact JSON Summary

```json
{
  "review_id": "ce-grok-polish-standards-2026-05-26",
  "overall_verdict": "PARTIAL PASS with CRITICAL PROCESS VIOLATIONS",
  "compliance": {
    "R1_investigation_steps": "PASS (plan + findings note document explicit U1 repros, binary strings, cross-target, citations)",
    "R2_solution_evaluation": "PASS (KTD + findings evaluate enrichment vs logging/docs; chose hybrid with writer note + docs primary)",
    "R3_clean_output_definition": "PASS (verification section + spec 'Install UX' section precisely define success vs noisy forms)",
    "R4_minimal_Grok_only_no_canonical_pollution": "PASS on content (no touch to plugins/compound-engineering/ or shared non-wiring code); FAIL on tree (all polish + docs live only in mirror, not primary `compound-engineering-plugin/`)",
    "R5_concrete_outcome_verification": "PASS in plan (manual grok install/validate in mirror + bun test assertions); observed tests cover note + rich pluginJson",
    "R6_traceability": "PASS (multiple explicit citations to grok-target-testing-review.md Medium risk, 2026-05-20 deferral, spec 'additional fields safe', ce-compound learnings)",
    "AGENTS.md_target_pattern": "PARTIAL (dedicated files, explicit mappings, writer logging, spec update, test assertions follow; however tests/grok-*.test.ts and full polish absent from primary tree at landing time; shared wiring in index/resolve/detect/legacy is appropriate and minimal)",
    "adding-converter-target-providers.md": "PASS for polish scope (U1–U5 map to phases 1-3/6 + docs; enrichment is 'additional fields safe' per spec)",
    "docs_placement_structure": "FAIL (plan and findings note follow naming/frontmatter/category conventions but reside exclusively in mirror's docs/ not primary compound-engineering-plugin/docs/; solutions/integrations/ and plans/ categories correct)",
    "repo_relative_paths": "PASS (all citations, logs, examples, plan refs use repo-relative forms like docs/reviews/grok-target-testing-review.md)",
    "no_drift_canonical_plugin": "PASS (zero Grok mentions or conditionals in plugins/compound-engineering/ content)",
    "docs_clarity_non_alarmist_useful": "PASS (spec 'Install UX' section is clear, uses 'benign'/'normal'/'safely ignore', shows concrete before/after, cites risk/plan)",
    "commit_conventions": "N/A for this review (polish not yet proposed as PR from primary)",
    "test_alongside": "PARTIAL (polish adds assertions to grok-writer.test.ts per requirement; however no such dedicated test file existed in primary landing per AGENTS.md checklist)"
  },
  "key_findings": [
    "Primary source tree (`compound-engineering-plugin/src/`, `docs/`) contains only pre-polish landing (staged); polish implementation + new durable artifacts (plan, U1 findings) exist solely in `test-compound-engineering-plugin/...` mirror git and filesystem.",
    "Mirror development model for Grok feature (including post-landing polish) creates dual-source-of-truth risk and violates 'durable outputs belong in docs/' + primary repo surfaces rules in AGENTS.md.",
    "All substantive polish (enrichment of GrokPluginJson with safe manifest fields + declarative skills/agents/executables:[]; converter population; writer fallback + 2-line expectation note; test assertions; spec 'Install UX & known messages' + updated plugin.json desc) is strictly Grok-target scoped, follows pattern, cites risk, non-alarmist.",
    "U1 findings note correctly concludes noise is env/version-dependent (not always reproducible); recommends writer note + docs + light enrichment as highest-leverage; matches observed code.",
    "Spec update provides excellent UX guidance with concrete examples and direct traceability to originating Medium risk.",
    "Plan itself is well-structured, explicitly maps to R1–R6, U1–U5, includes verification criteria using repo-relative paths and manual mirror commands.",
    "No pollution of canonical plugin content; shared files touched only for wiring (targets/index.ts, commands/*, utils/detect/resolve, data/legacy) — appropriate and minimal.",
    "Writer now prefers writeJson (improvement over landing's writeText+JSON.stringify); converter has some duplicated helpers (per documented pattern).",
    "Missing in primary at review time: dedicated grok-*-test.ts (per AGENTS.md and pattern doc 'Tests (required)'); the polish test file lives only in mirror.",
    "Untracked deliverables in mirror match expected structure for their categories but must be promoted/copied to primary before any upstreaming."
  ],
  "blockers": [
    "CRITICAL: All polish source changes and new docs/plan must be ported to (or performed in) the primary `compound-engineering-plugin/` tree. Mirror must remain a test artifact/copy only.",
    "HIGH: Ensure dedicated grok-writer.test.ts / grok-converter.test.ts (and any CLI) live in primary tests/ alongside implementation (AGENTS.md + pattern doc requirement).",
    "MEDIUM: Sync the originating 2026-05-20 Grok plan, brainstorms, and best-practices grok fidelity doc from mirror to primary docs/ for full traceability.",
    "MEDIUM: If mirror git is used for dogfood iteration, establish explicit 'promote from mirror' workflow step in future target plans (or deprecate the pattern)."
  ],
  "recommendations": [
    "Immediately stage the polish diff (from mirror's 9a7901e..HEAD) into primary tree under the Grok branch; add the two new docs to primary docs/plans/ and docs/solutions/integrations/ (with any mirror-specific notes removed or made conditional).",
    "Run `bun test` + `bun run release:validate` in primary after port.",
    "Update primary README Grok section (per plan U5) to point at the new spec Install UX section.",
    "For future target work: perform all implementation, tests, and durable docs exclusively in primary checkout; use mirror only for runtime dogfood of the *installed* converted plugin (not as dev source tree).",
    "Consider adding a 'grok-target' component label or similar for future related changes."
  ],
  "citations": {
    "origin_risk": "docs/reviews/grok-target-testing-review.md (Medium: 'Grok plugin manifest expectations'; Recommendation #2)",
    "deferral": "mirror docs/plans/2026-05-20-001-feat-add-grok-converter-target-plan.md (Deferred: 'Precise `plugin.json` fields beyond the minimum')",
    "spec_guidance": "docs/specs/grok.md ('Additional fields from the Claude manifest ... are safe to include')",
    "process": "AGENTS.md:184-199 (docs conventions), 112-137 (target checklist), 198 (integrations/ for target output issues)"
  },
  "change_surface_included": ["src/types/grok.ts (enrichment)", "src/converters/claude-to-grok.ts (population)", "src/targets/grok.ts (note + writeJson + bundle support)", "tests/grok-writer.test.ts (assertions)", "docs/specs/grok.md (new section + desc)", "new: docs/plans/2026-05-26-001-...-plan.md", "new: docs/solutions/integrations/grok-plugin-install-executable-noise-2026-05.md"]
}
```

---

## Full Detailed Artifact

### 1. Executive Summary
The polish successfully addresses the Medium risk ("Grok plugin manifest expectations") flagged in the original ce-code-review by:
- Performing explicit U1 investigation (repros, binary analysis, cross-target comparison, findings note).
- Light, safe enrichment of `GrokPluginJson` and emitted manifest (Claude manifest fields + declarative `skills`/`agents` arrays + `executables: []`).
- Adding a concise, non-alarmist expectation note to the writer success output.
- Strong, traceable documentation in the spec.

**The implementation (observed in mirror post-9a7901e) is high-quality, minimal, scoped correctly, and follows the spirit of the 6-phase pattern and AGENTS.md.**

**However, a critical process/standards violation undermines the delivery:** The entire Grok target landing (9a7901e) and this post-dogfood polish were developed and committed inside the `test-compound-engineering-plugin/compound-engineering-plugin/` mirror tree (including the durable plan and solution artifacts). The primary `compound-engineering-plugin/` tree only contains a partial snapshot of the *pre-polish* landing (staged files). This violates core AGENTS.md rules on repo surfaces, durable output placement (`docs/` in primary), single source of truth for `src/` and docs, and the requirement that "changes in this repo may affect one or more of these surfaces" with the primary as canonical.

The review **cannot fully close** until the polish (and all prior Grok artifacts) are correctly landed in the primary tree.

### 2. Detailed Compliance Matrix vs. Requirements (R1–R6)
- **R1 (explicit investigation steps):** PASS. The plan's U1 section + the findings note (`grok-plugin-install-executable-noise-2026-05.md`) document concrete repro commands, `strings` on the grok binary (manifest.rs), clean vs. noisy outputs in current env, cross-target context, and prior artifact review. The note concludes env-dependency, enabling the rest of the plan.
- **R2 (evaluate solutions):** PASS. Key Technical Decisions + findings evaluate enrichment vs. pure logging/docs. Chose hybrid (light enrichment for future-proofing + writer note + docs as primary UX lever). Matches "additional fields safe" in spec.
- **R3 (define "clean"):** PASS. Plan verification + spec "Install UX & known messages" precisely define:
  - Noisy form (parent/child + "Error: no suitable executable found" + success).
  - Clean form ("Installed 1 plugin(s)...", "Plugin manifest is valid.").
  - Authoritative signals vs. ignorable noise.
- **R4 (minimal, AGENTS.md patterns, repo-relative, no canonical pollution):** 
  - Content: PASS (strictly Grok files + appropriate shared wiring; zero changes to `plugins/compound-engineering/` — confirmed via grep).
  - Process/tree: FAIL (see Executive + §5).
  - Paths: PASS (every citation, example, log, plan ref is repo-relative, e.g. `docs/reviews/grok-target-testing-review.md`).
- **R5 (concrete outcome-based verification):** PASS (plan). Requires `bun test`, `release:validate`, manual `bun run ... --to grok` + `grok plugin install/validate` in mirror showing improved UX. Observed: writer test asserts note text + rich pluginJson shape; findings note records clean runs in current env.
- **R6 (traceability):** PASS. Plan "Sources & References", "Origin artifacts", and "Verification" explicitly link to:
  - `docs/reviews/grok-target-testing-review.md` (Medium risk + Rec #2).
  - 2026-05-20 plan (precise fields deferral).
  - `docs/specs/grok.md` ("additional fields are safe").
  - ce-compound Grok fidelity best-practices.
  Code comments and spec section echo the citations.

### 3. Adherence to AGENTS.md and Pattern Document
- **Target Provider Checklist (AGENTS.md 112-137 + pattern doc 6 phases):** The polish is post-add maintenance. It touches Phase 1 (types enrichment), Phase 2 (converter population), Phase 3 (writer logging + bundle use), Phase 6 (test assertions), and docs (spec). Appropriate for incremental polish. Missing dedicated tests at initial landing time is a pre-existing gap now partially addressed in polish.
- **"Keep target-specific behavior in dedicated converters/writers"**: PASS (all Grok logic in grok.* files).
- **"When adding or changing a target, update fixtures/tests alongside"**: PARTIAL (polish does update test; landing snapshot in primary lacked the grok-*.test.ts files entirely).
- **Docs Convention:** Plans in `docs/plans/`, solutions categorized (integrations/ is correct for "target writer output problems" per AGENTS.md 196). Naming and solution frontmatter (module, problem_type, tags, severity, component) match observed patterns in the category.
- **Repo Surfaces / No Pollution:** PASS on content. The primary tree's `src/data/plugin-legacy-artifacts.ts`, `utils/detect-tools.ts`, `resolve-output.ts`, `targets/index.ts`, `commands/{convert,install}.ts` contain appropriate minimal Grok wiring (expected and scoped).
- **Commit / Output Paths:** N/A (polish not yet PR'd from primary).
- **Scratch vs. Durable:** The plan/findings correctly placed in `docs/` (even if wrong tree).

### 4. Analysis of the Incremental Diff (since 9a7901e)
(Full diff captured via `git diff 9a7901e -- <files>` in mirror; key excerpts below. All changes Grok-scoped.)

**src/types/grok.ts (enrichment):**
- Added `GrokPluginJson` with safe fields (author/homepage/keywords/license) + declarative hints (`skills?`, `agents?`, `executables?: any[]` with comment explaining validator signal).
- Added `pluginJson?: GrokPluginJson` to `GrokBundle`.

**src/converters/claude-to-grok.ts (population):**
- Always constructs and attaches rich `pluginJson` from `plugin.manifest.*` + derived skill/agent name lists + `executables: []`.
- Comment explicitly ties to "2026-05-26 plan U1 findings" and the noise reduction goal.
- (Some helper duplication — documented acceptable pattern.)

**src/targets/grok.ts (logging + usage):**
- Now consumes `bundle.pluginJson ?? {minimal fallback}` (preserves backward).
- Uses `writeJson` (better than landing's `writeText(JSON.stringify...)`).
- Adds exactly the two-line expectation note at end of success block:
  ```
  Note: On some Grok versions you may see a benign "no suitable executable found" line during install/validate.
        This is normal for pure skills+agents plugins (no native executables) and does not affect success.
  ```
- Matches "expectation note in success logging".

**tests/grok-writer.test.ts (assertions):**
- Existing test for logging now asserts the two note strings (with comment referencing the 2026-05-26 plan).
- One test supplies explicit `pluginJson` in bundle.
- Covers the new behavior.

**docs/specs/grok.md (UX + description):**
- Updated "plugin.json" section to show enriched shape + note on declarative hints.
- Added substantial new "## Install UX & known messages" section (and subsection on "Benign validator noise").
  - Describes the emitted shape.
  - Shows noisy example (with PID + Error).
  - States "**This is normal and benign**", explains origin (manifest.rs child), env-dependency.
  - Shows clean success examples.
  - "safely ignore the 'Error' line — the 'Installed 1 plugin(s)' message is the authoritative success signal."
  - Direct citation: "explicitly called out as a Medium risk during the original Grok target implementation (see `docs/reviews/grok-target-testing-review.md`) and addressed as a post-dogfood polish in the 2026-05-26 plan."
- "Port notes reconciliation" section reinforces "Official source tree is clean" (no Grok conditionals in canonical plugin).

**New untracked (in mirror only):**
- Plan: Excellent structure, explicit U1–U5, risks table, verification criteria, full R1–R6 mapping, sources section. Follows plan naming/frontmatter style.
- Findings: Proper solutions/integrations/ frontmatter, records U1 execution results, clear recommendation for the design lock used in code. Non-alarmist.

### 5. Placement and Process Issues (Critical)
- **Primary violation:** Durable artifacts (plans, solutions, specs) and `src/` changes must live in `compound-engineering-plugin/`. The mirror (`test-compound-engineering-plugin/...`) is for testing *installed* plugins and dogfood runs of the *converted* CE plugin (see AGENTS.md scratch/durable rules and "repo surfaces").
- Evidence: `git diff 9a7901e --name-only` (mirror) lists exactly the polish surface; `find` + `git status` in primary show only landing snapshot + review.md. Plan and findings note absent from primary `docs/`.
- Consequence: Review, release validation, PR process, and future maintenance see the "wrong" tree as truth. Risks version drift, missed release:validate, etc.
- Secondary: The 2026-05-20 Grok plan, brainstorms, and `full-ce-process-grok-converter-target-fidelity.md` also live only in mirror.
- The plan itself notes "All file references above are repo-relative to the target mirror checkout" — this acknowledges but does not excuse the placement.

### 6. Other Observations
- **No alarmism in docs:** Language is exemplary ("benign", "normal and benign", "environment/version dependent", "safely ignore", "does not affect success", concrete examples). Useful for users.
- **Traceability excellent** in all new surfaces.
- **Fidelity to "clean provider root" design** preserved (enrichment is additive and optional via fallback).
- **Tests:** The writer test is solid (temp dirs, console capture, shape + logging assertions). Recommend adding converter test coverage for pluginJson population if not present.
- **Commands touched in landing (not polish):** Appropriate shared wiring only.

### 7. Recommendations (Actionable)
1. **Immediate (blocker):** Port the exact post-9a7901e diff + the two new docs files into the primary `compound-engineering-plugin/` tree on the appropriate branch. Treat the mirror versions as the source of truth for the port.
2. After port: `cd compound-engineering-plugin && bun test --grep grok && bun run release:validate`.
3. Update primary `README.md` Grok section (per plan U5) to reference the new spec Install UX guidance.
4. For future: Add explicit "mirror is for runtime dogfood only; all source/docs changes in primary" rule to Grok-related plans or a new developer-experience solution note.
5. Consider a lightweight "promote-mirror-changes" helper or CI check if mirror dev pattern continues for any feature.
6. Close the loop on the originating Medium risk by updating the `grok-target-testing-review.md` with "Addressed in 2026-05-26 polish (see new plan and spec section)".

### 8. Conclusion
The **technical substance** of the polish is a model example of post-dogfood, risk-driven, minimal, well-documented target maintenance that directly honors the ce-code-review finding, the prior plan's deferral, the spec's own language, and AGENTS.md patterns.

The **process execution** has a critical flaw in source-of-truth placement that must be corrected before this work can be considered landed under the project's standards.

Once the port to primary is complete and verified, this review can be marked fully passed with only the "partial test coverage at landing" note as a minor historical item.

**Artifact location (this file):** `compound-engineering-plugin/docs/reviews/ce-grok-polish-standards-review-2026-05-26.md` (written as deliverable of this standards review subagent task).

All analysis used repo-relative paths and respected workspace boundaries (primary + mirror for comparison only).

---
*End of review artifact. Subagent task complete.*