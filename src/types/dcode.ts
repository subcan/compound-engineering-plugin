export type DcodeSkill = {
  name: string
  content: string // Full SKILL.md with YAML frontmatter
}

export type DcodeSkillDir = {
  name: string
  sourceDir: string
}

export type DcodeAgent = {
  name: string
  content: string // Full agent Markdown (frontmatter + body). Writer will place it as <name>/AGENTS.md
}

export type DcodeBundle = {
  pluginName?: string
  generatedSkills?: DcodeSkill[] // Rare for dcode target
  skillDirs: DcodeSkillDir[] // Primary source of skills (pass-through)
  agents?: DcodeAgent[] // Subagent definitions from the plugin's agents/ dir
  // dcode does not use a plugin.json wrapper for skills/subagents in the same way Grok does.
  // MCP and commands are left for potential future expansion.
}