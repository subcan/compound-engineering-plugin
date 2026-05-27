import { describe, expect, test } from "bun:test"
import { convertClaudeToDcode } from "../src/converters/claude-to-dcode"
import type { ClaudePlugin } from "../src/types/claude"

describe("convertClaudeToDcode", () => {
  test("produces thin DcodeBundle with skillDirs and agents (minimal transformation)", () => {
    const fakePlugin: ClaudePlugin = {
      manifest: { name: "compound-engineering", description: "Test" },
      skills: [
        { name: "ce-brainstorm", sourceDir: "/fake/skills/ce-brainstorm", content: "", frontmatter: {} as any },
      ],
      agents: [
        {
          name: "ce-correctness-reviewer",
          body: "Body here",
          sourcePath: "/fake/agents/ce-correctness-reviewer.md",
          content: "---\nname: ce-correctness-reviewer\n---\nBody here",
        },
      ],
      commands: [],
      mcpServers: {},
      hooks: undefined,
    } as any

    const bundle = convertClaudeToDcode(fakePlugin, {} as any)

    expect(bundle.pluginName).toBe("compound-engineering")
    expect(bundle.skillDirs?.length).toBe(1)
    expect(bundle.skillDirs?.[0].name).toBe("ce-brainstorm")
    expect(bundle.agents?.length).toBe(1)
    expect(bundle.agents?.[0].name).toBe("ce-correctness-reviewer")
    expect(bundle.agents?.[0].content).toContain("Body here")
  })
})