# CLAUDE.md

This file provides orchestration guidance to Claude Code when working in this repository.

---

## ULTRA IMPORTANT

**Core Constraints** (NEVER violate):

1. **Event Logging**: Log all tool calls, agent invocations, skill activations, decisions, and observations in `event-stream.md` chronologically
2. **Planning**: Maintain `planning.md` for high-level strategy; generate detailed tasks in `todo.md` organized by session-id
3. **State Management**: Keep `todo.md` (≤150 lines), `event-stream.md` (≤25 lines), `workbook.md` (≤300 lines) up-to-date; prune aggressively
4. **Context Engineering**: Use `workbook.md` for critical context, insights, anti-patterns, and short-term planning
5. **Documentation Lifecycle**: Write session artifacts to `docs-to-process/{timestamp}-{session-id}-{type}.md`, consolidate to `docs/{domain}/` via `/streamline-docs`, update CLAUDE.md for high-impact rules
6. **No Over-Engineering**: Implement ONLY what user requested; no invented features
7. **No Hallucination**: Research via MCP tools (Ref, Firecrawl) when uncertain; never guess
8. **MCP Constraint Enforcement**:
   - Use `rg` (ripgrep) instead of `grep`
   - Use `fd` instead of `find`
   - Use `jq` for JSON parsing
   - Limit output to prevent context overflow

---

## Repository Hygiene - CRITICAL RULES

**NEVER violate these rules:**

1. **No Empty Directories**: Create directories ONLY when you have actual content
2. **No Useless Files**: No placeholder files, empty READMEs, or "coming soon" docs
3. **Quality Over Quantity**: Archive superior content, delete inferior duplicates
4. **No Random Floating Files**: No `temp.md`, `notes.md`, `scratch.md` littering the repo
5. **Clean Up After Yourself**: Delete temporary files/directories at session end if no permanent purpose
6. **Respect Existing Quality**: Check for better documentation before recreating

---

## State File Size Limits - CRITICAL RULES

**Purpose**: Prevent context pollution from bloated state files

**MANDATORY LIMITS**:

| File | Max Lines | Purpose | Maintenance |
|------|-----------|---------|-------------|
| `todo.md` | 150 | Current tasks only | Keep 5-10 active, archive completed |
| `event-stream.md` | 25 | Last 20 events | Auto-trim at session start |
| `workbook.md` | 300 | Active context | Extract to docs/ or delete old context |
| `planning.md` | 600 | Master plan | Link to detailed specs in docs/ |

---

## Documentation Rules - CRITICAL

### Directory Structure

**Root files** (only these allowed at project root):
- `CLAUDE.md` - Orchestration rules (≤600 lines)
- `README.md` - Setup, features (≤300 lines)
- `workbook.md` - Session context (≤300 lines, ephemeral)
- `PROJECT_INDEX.json` - Codebase intelligence (optional)

**docs-to-process/** (staging area):
- **Purpose**: Raw session artifacts before consolidation
- **Naming**: `{YYYYMMDD-HHMM}-{full-session-uuid}-{type}.md`
- **Types**: `research`, `analysis`, `decisions`, `patterns`, `bugs`, `integration`
- **Max size**: 300 lines per file
- **Lifecycle**: Created → processed by `/streamline-docs` → DELETED

**docs/** (curated knowledge):
- **Structure**: Domain-based (architecture/, backend/, frontend/, testing/, deployment/, features/)
- **Principle**: ONE authoritative file per topic (replace entirely, never duplicate)
- **Max size**: 500 lines per file
- **Index**: `docs/README.md` provides navigation (≤200 lines)
- **Tracking**: `docs/CHANGELOG.md` logs all changes

**specs/** (future state):
- **Purpose**: Implementation specifications (NOT current state)
- **Lifecycle**: Created → implemented → archived or deleted

### Creating Session Artifacts

**When to create**:
- External research performed (MCP tools: Ref, Firecrawl)
- Internal analysis completed (code-analyzer agent)
- Architecture decisions made
- Patterns discovered during implementation

**Naming convention**:
```
{YYYYMMDD-HHMM}-{full-session-uuid}-{type}.md
Example: 20250117-1430-1bb0f41b-9115-4fa9-a327-dcc83fbd2948-research.md
```

### Consolidation Process (via /streamline-docs)

1. **Scan** `docs-to-process/` for unprocessed artifacts
2. **Analyze** each artifact for valuable insights
3. **Update** `docs/{domain}/` files (REPLACE entirely, not append)
4. **Log** changes in `docs/CHANGELOG.md`
5. **Extract** high-impact rules → add to CLAUDE.md
6. **Delete** processed files from `docs-to-process/`
7. **Verify** no random docs in root (cleanup floating files)
8. **Enforce** size limits (prune aggressively if exceeded)

### Size Enforcement

**Before session end**, verify:
```bash
wc -l CLAUDE.md README.md workbook.md docs/README.md docs/**/*.md
# CLAUDE.md ≤ 600, README.md ≤ 300, workbook.md ≤ 300
# docs/README.md ≤ 200, docs/{domain}/*.md ≤ 500
```

### Prohibited Practices

- **No root docs**: Only CLAUDE.md, README.md, workbook.md at root
- **No duplication**: One source per topic (replace, don't append)
- **No exceeding limits**: Prune or extract before committing
- **No stale artifacts**: Process docs-to-process/ regularly
- **No placeholders**: Empty "coming soon" files forbidden

---

## Start: Orchestration-Aware React Loop

**Main execution loop integrating agents, skills, and state management.**

### Flow

```
1. STATE ANALYSIS → Read event-stream.md, todo.md, workbook.md
2. COMPLEXITY ASSESSMENT → Simple/Moderate/Complex
3. SYSTEM UNDERSTANDING → Use agents (code-analyzer, prompt-researcher)
4. PLANNING → Use skills (brainstorming, writing-plans)
5. EXECUTION → Tool calls + Agent invocations
6. STATE UPDATE → Log events, update tasks, prune if needed
7. ITERATE → Return to Step 1
```

### Decision Matrix

| Scenario | Action | Tools |
|----------|--------|-------|
| Need architecture analysis | code-analyzer agent | Analyze patterns, dependencies |
| Need external research | prompt-researcher agent | Gather authoritative sources via MCP |
| Complex multi-domain task | knowledge-graph-builder agent | Synthesize understanding |
| Simple task | Direct execution | Read, Write, Bash, Edit |

---

## Agent Directory

**Quick reference to specialized agents for complex tasks.**

| Agent | Use When | Output |
|-------|----------|--------|
| `code-analyzer` | Analyzing codebase patterns, architecture | Analysis in docs-to-process/ |
| `prompt-researcher` | Need best practices, external research | Research in docs-to-process/ |
| `knowledge-graph-builder` | Synthesizing multi-domain understanding | Knowledge graph in docs-to-process/ |

**Invocation Pattern**:
```javascript
Task(
  subagent_type="code-analyzer",
  description="Analyze {specific aspect}",
  prompt="Use project-intel.mjs to understand..."
)
```

---

## Project Overview

{CUSTOMIZE: Add project-specific information here}

**{Project Name}** - {Brief description}

**Current State**: {Current architecture/stage}
**Target**: {Where the project is heading}

**Key Technologies**:
- {Technology 1} - Purpose
- {Technology 2} - Purpose
- {Technology 3} - Purpose

**Key Constraints**:
- {Constraint 1}
- {Constraint 2}
- {Constraint 3}

---

## Quick Reference

{CUSTOMIZE: Add project-specific commands and file structure}

### Essential Commands
```bash
# Add your common commands here
```

### Files Structure
```
# Add your project structure here
```

---

## Documentation Navigation

**Domain-Based Structure** (see `docs/README.md` for index):
- `docs/architecture/` - System design, state management patterns
- `docs/backend/` - Cloud integration (if applicable)
- `docs/frontend/` - Widgets, UI patterns, development commands
- `docs/testing/` - Test strategies, coverage
- `docs/deployment/` - Build, release, CI/CD
- `docs/features/` - Feature-specific implementation details

**Workflow**:
1. Generate artifacts → `docs-to-process/{timestamp}-{session-id}-{type}.md`
2. Consolidate → Run `/streamline-docs`
3. Curated docs → `docs/{domain}/{topic}.md`
4. High-impact rules → Update this file (CLAUDE.md)

---

## Self-Improvement

**After each session**, consider:
1. What development patterns emerged?
2. What debugging steps worked best?
3. Did architecture assumptions hold?
4. Update CLAUDE.md with new learnings

**This file should evolve as the codebase grows.**
