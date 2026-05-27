import path from "path"

import { copySkillDir, ensureDir, sanitizePathName, writeText } from "../utils/files"
import type { DcodeBundle } from "../types/dcode"

/**
 * Write a dcode-compatible layout for the Compound Engineering skills and subagents.
 *
 * dcode discovers skills and custom subagents from several directories (see
 * https://docs.langchain.com/oss/python/deepagents/code/memory-and-skills and
 * the data-locations page). This writer produces the inner tree that can be
 * placed (copied or symlinked) into any of the supported locations.
 *
 * Produced layout under outputRoot:
 *   skills/
 *     <ce-skill-name>/
 *       SKILL.md
 *       references/...
 *       scripts/...
 *   agents/
 *     <subagent-name>/
 *       AGENTS.md
 *
 * The caller is responsible for deciding the final destination(s):
 *   - User level:   ~/.deepagents/<agent>/          (copy skills/ and agents/ under it)
 *   - Project level: .deepagents/                    (same)
 *   - Tool-agnostic: .agents/ or ~/.agents/          (skills/ only)
 *
 * For direct "install to home" flows the install command can resolve the
 * appropriate root(s) and pass them (or post-process the portable tree).
 *
 * Minimal transformation: skills are copied with their existing content
 * (references and scripts preserved). Agent definitions are taken as-is
 * and placed into the per-subagent AGENTS.md folder structure dcode expects.
 */
export async function writeDcodeBundle(
  outputRoot: string,
  bundle: DcodeBundle,
  options: { agentName?: string } = {},
): Promise<void> {
  const agentName = options.agentName || "agent"
  await ensureDir(outputRoot)

  // Skills tree (portable inner layout)
  const skillsDir = path.join(outputRoot, "skills")
  await ensureDir(skillsDir)

  // Pass-through skills (the main source of CE value)
  for (const skill of bundle.skillDirs ?? []) {
    const name = sanitizePathName(skill.name)
    const targetDir = path.join(skillsDir, name)
    // Identity transform for v1 — dcode loads SKILL.md + supporting files directly.
    // Later we can add a light dcode-specific transform if real usage reveals issues.
    await copySkillDir(skill.sourceDir, targetDir, (content) => content, true)
  }

  // Generated skills (rare for this target; kept for symmetry with other writers)
  for (const skill of bundle.generatedSkills ?? []) {
    const name = sanitizePathName(skill.name)
    const dir = path.join(skillsDir, name)
    await ensureDir(dir)
    await writeText(path.join(dir, "SKILL.md"), skill.content + "\n")
  }

  // Subagents → per-folder AGENTS.md layout that dcode requires
  if (bundle.agents && bundle.agents.length > 0) {
    const agentsDir = path.join(outputRoot, "agents")
    await ensureDir(agentsDir)

    const seen = new Set<string>()
    for (const agent of bundle.agents) {
      const safeName = sanitizePathName(agent.name)
      if (seen.has(safeName)) {
        console.warn(`Skipping duplicate agent after sanitization: ${agent.name} -> ${safeName}`)
        continue
      }
      seen.add(safeName)

      const subagentDir = path.join(agentsDir, safeName)
      await ensureDir(subagentDir)

      // Write the full source content (frontmatter + body) as AGENTS.md.
      // dcode only special-cases a few frontmatter keys (name, description, optional model).
      // Extra keys that exist in the CE source (tools, color, etc.) are harmless.
      await writeText(path.join(subagentDir, "AGENTS.md"), agent.content + "\n")
    }
  }

  console.log(`\n✅ dcode layout written to: ${outputRoot}`)
  console.log(`   Skills: ${path.join(outputRoot, "skills")}`)
  console.log(`   Agents (subagents): ${path.join(outputRoot, "agents")}`)
  console.log("")
  console.log(`   To activate in dcode (user level, --dcode-agent ${agentName}):`)
  console.log(`     mkdir -p ~/.deepagents/${agentName}/skills ~/.deepagents/${agentName}/agents`)
  console.log(`     cp -r ${path.join(outputRoot, "skills")}/* ~/.deepagents/${agentName}/skills/`)
  console.log(`     cp -r ${path.join(outputRoot, "agents")}/* ~/.deepagents/${agentName}/agents/`)
  console.log("")
  console.log("   For a named agent or project-level .deepagents/ tree, copy into the corresponding locations.")
  console.log("   See https://docs.langchain.com/oss/python/deepagents/code/memory-and-skills for full discovery rules.")
}