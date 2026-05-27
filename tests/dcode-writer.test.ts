import { describe, expect, test } from "bun:test"
import { promises as fs } from "fs"
import path from "path"
import os from "os"
import { writeDcodeBundle } from "../src/targets/dcode"
import type { DcodeBundle } from "../src/types/dcode"

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

describe("writeDcodeBundle", () => {
  test("writes correct dcode discovery layout (skills/ + agents/ inner trees, no plugin wrapper)", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "dcode-writer-test-"))

    const bundle: DcodeBundle = {
      pluginName: "compound-engineering",
      generatedSkills: [],
      skillDirs: [],
      agents: [
        {
          name: "ce-correctness-reviewer",
          content: "---\nname: ce-correctness-reviewer\ndescription: Review for logic errors.\nmodel: inherit\n---\n\nYou are a correctness reviewer.",
        },
        {
          name: "ce-adversarial-reviewer",
          content: "---\nname: ce-adversarial-reviewer\ndescription: Adversarial review.\n---\n\nYou are an adversarial reviewer.",
        },
      ],
    }

    await writeDcodeBundle(tempRoot, bundle, { agentName: "mybot" })

    // Inner layout at outputRoot (portable for user to place into ~/.deepagents/mybot/ or .deepagents/)
    expect(await exists(path.join(tempRoot, "skills"))).toBe(true)
    expect(await exists(path.join(tempRoot, "agents"))).toBe(true)

    // Agents restructured to per-name/AGENTS.md
    expect(await exists(path.join(tempRoot, "agents", "ce-correctness-reviewer", "AGENTS.md"))).toBe(true)
    expect(await exists(path.join(tempRoot, "agents", "ce-adversarial-reviewer", "AGENTS.md"))).toBe(true)

    // Basic content sanity
    const reviewerContent = await fs.readFile(
      path.join(tempRoot, "agents", "ce-correctness-reviewer", "AGENTS.md"),
      "utf8"
    )
    expect(reviewerContent).toContain("ce-correctness-reviewer")
    expect(reviewerContent).toContain("You are a correctness reviewer.")
  })

  test("respects --dcode-agent name in guidance logs (no hard-coded 'agent')", async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "dcode-writer-agent-test-"))

    const bundle: DcodeBundle = {
      generatedSkills: [],
      skillDirs: [],
      agents: [],
    }

    // Capture console output
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: any[]) => logs.push(args.join(" "))

    try {
      await writeDcodeBundle(tempRoot, bundle, { agentName: "team-reviewer" })
    } finally {
      console.log = originalLog
    }

    const guidance = logs.find((l) => l.includes("To activate in dcode"))
    expect(guidance).toBeDefined()
    expect(guidance).toContain("--dcode-agent team-reviewer")
    expect(guidance).not.toContain("~/.deepagents/agent/")
  })
})