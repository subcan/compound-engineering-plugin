import type { ClaudePlugin } from "../types/claude"
import type { DcodeAgent, DcodeBundle, DcodeSkillDir } from "../types/dcode"
import type { ClaudeToOpenCodeOptions } from "./claude-to-opencode"

/**
 * Convert a Claude-authored plugin (the source format for compound-engineering)
 * into the bundle shape expected by the dcode writer.
 *
 * For dcode we intentionally keep transformation minimal:
 * - Skills are passed through by directory reference (the writer uses copySkillDir with identity transform).
 * - Agents are passed through with their existing frontmatter + body. The writer places each one
 *   into the <name>/AGENTS.md folder structure that dcode requires for custom subagents.
 *
 * This gives the highest source fidelity for the rich CE catalog on day one.
 */
export function convertClaudeToDcode(
  plugin: ClaudePlugin,
  _options: ClaudeToOpenCodeOptions,
): DcodeBundle {
  const skillDirs: DcodeSkillDir[] = plugin.skills.map((skill) => ({
    name: skill.name,
    sourceDir: skill.sourceDir,
  }))

  const agents: DcodeAgent[] = plugin.agents.map((agent) => ({
    name: agent.name,
    // Prefer the original raw file content (highest fidelity for dcode).
    // Fall back to a minimal reconstruction only if the agent was created without going through the parser.
    content:
      agent.content ??
      `---\nname: ${agent.name}\n${agent.description ? `description: ${agent.description}\n` : ""}---\n\n${agent.body}`,
  }))

  return {
    pluginName: plugin.manifest.name,
    generatedSkills: [],
    skillDirs,
    agents,
  }
}