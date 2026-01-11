# CLAUDE.md

This file provides orchestration guidance to Claude Code when working in this repository.

---

## Core Constraints

1. **Event Logging**: Log all tool calls, agent invocations, skill activations, decisions, and observations in `event-stream.md` chronologically
2. **Planning**: Maintain `plans/master-plan.md` for high-level strategy; track tasks in `todos/master-todo.md`
3. **State Management**: Keep `todos/master-todo.md` (≤400 lines), `event-stream.md` (≤40 lines), `workbook.md` (≤300 lines) up-to-date; prune aggressively
4. **Context Engineering**: Use `workbook.md` for critical context, insights, anti-patterns, and short-term planning
5. **Documentation Lifecycle**: Write session artifacts to `docs-to-process/{timestamp}-{session-id}-{type}.md`, consolidate to `docs/{domain}/` via `/streamline-docs`, update CLAUDE.md for high-impact rules
6. **No Over-Engineering**: Implement ONLY what user requested; no invented features
7. **No Hallucination**: Research via MCP tools (Ref, Firecrawl) when uncertain; never guess
8. **Documentation-First Integration (STRICTLY ENFORCED)**:
   - **CRITICAL**: Training data is outdated - libraries change constantly
   - **BEFORE** implementing ANY external library/API integration: ALWAYS use MCP Ref tool to fetch latest official documentation
   - **NEVER** implement based on assumptions, training data, or what "seems to make sense"
   - **VERIFY** API signatures, parameters, patterns, and behavior against current docs
   - **RATIONALE**: Arrogant implementation without verification is the WORST failure mode - it creates technical debt, bugs, and wasted time
   - **Example**: Supabase Python client → `mcp__Ref__ref_search_documentation` query "Supabase Python sign_in_with_otp" → read official docs → THEN implement
   - **Zero tolerance** for hallucinations and unverified implementations
9. **rg, fd, jq**:
   - Use `rg` (ripgrep) instead of `grep`
   - Use `fd` instead of `find`
   - Use `jq` for JSON parsing
   - Limit output to prevent context overflow
10. **DRY Principle & Clean Code (STRICTLY ENFORCED)**:
    - **Single Source of Truth**: ONE implementation for each API client, utility, or pattern
    - **No Duplicate Code**: If functionality exists, USE IT. Never rewrite httpx calls, API clients, or utilities
    - **Less Code = Better Code**: Fewer lines means fewer bugs, easier maintenance, less cognitive load
    - **Professional Standards**: Code should be clean, readable, and follow established patterns in the codebase
    - **Before Writing**: Search codebase for existing implementations (`rg "class.*Client" --type py`)
    - **Refactor Aggressively**: If you find duplicates, consolidate them. Don't add more.
    - **Example**: `ElevenLabsConversationsClient` is THE source for ElevenLabs API calls. Don't add httpx calls elsewhere.
    - **Rationale**: Duplicate code creates maintenance nightmares, inconsistent behavior, and technical debt
11. **Firecrawl MCP Usage (CRITICAL - Prevents Token Overflow)**:
    - **NEVER use `scrapeOptions` with `firecrawl_search`** - this scrapes ALL results and causes 200K+ character responses
    - **Two-Step Workflow (MANDATORY)**:
      1. **Search**: `firecrawl_search(query="...", limit=3-5)` → Get URLs only
      2. **Scrape**: `firecrawl_scrape(url="specific_url", formats=["markdown"], onlyMainContent=true)` → Get content from ONE page
    - **Required Parameters for Scrape**:
      - `formats: ["markdown"]` - Request markdown only (not HTML, rawHtml, etc.)
      - `onlyMainContent: true` - Strip navigation, sidebars, footers
    - **Search Limits**: Always use `limit` parameter (3-5 for most searches, max 10)
    - **Error Pattern to Avoid**:
      ```
      # WRONG - causes token overflow
      firecrawl_search(query="...", scrapeOptions={formats: ["markdown"]})

      # CORRECT - two-step approach
      firecrawl_search(query="...", limit=5)  # Step 1: Get URLs
      firecrawl_scrape(url="https://...", formats=["markdown"], onlyMainContent=true)  # Step 2: Get content
      ```
    - **Rationale**: `scrapeOptions` in search concatenates ALL result pages (5+ pages × 30K chars = 150K+ chars overflow)

---


## Start
Before performing any action first:
1. **Analyze Events:** Review @event-stream.md, @todos/master-todo.md to understand the user's request and the current state. Focus especially on the latest user instructions and any recent results or errors. If they are not up to date, update them.
2. **System Understanding:** If the task is complex or involves system design and/or system architecture, invoke the System Understanding Module to deeply analyze the problem. Identify key entities and their relationships, and construct a high-level outline or diagram of the solution approach. Use this understanding to inform subsequent planning.
3. **Research External Libraries (MANDATORY):** If implementing integration with external libraries/APIs (Telegram Bot API, Supabase, ElevenLabs, etc.), **STOP** and use MCP Ref tool to fetch official documentation BEFORE writing ANY code. **DO NOT TRUST TRAINING DATA** - it's outdated. Examples:
   - Telegram: `mcp__Ref__ref_search_documentation` → "Telegram Bot API sendMessage"
   - Supabase: `mcp__Ref__ref_search_documentation` → "Supabase Python sign_in_with_otp options"
   - Read returned docs fully, verify parameter names/types match current API
4. **Determine the next action to take.** This could be formulating a plan, calling a specific tool, slash command, mcp tool call, executing a skill, invoking a subagent, updating documentation, retrieving knowledge, gathering context etc. Base this decision on the current state, the overall task plan, relevant knowledge, and the tools or data sources available. Execute the chosen action. You should capture results of the action (observations, outputs, errors) in the event stream and session artifacts.
5. **Execute**
6. **Log & Maintain:**
   - Log the action in @event-stream.md
   - If a task is completed, mark it as done in @todos/master-todo.md
   - If you learned critical context, log it in @workbook.md
   - **CHECK FILE SIZES** after every significant update (see Session File Maintenance below)
   - Update Document Index when creating new research outputs
7. **Iterate**

## Repository Hygiene

1. **No Empty Directories**: Create directories ONLY when you have actual content
2. **No Useless Files**: No placeholder files, empty READMEs, or "coming soon" docs
3. **Quality Over Quantity**: Archive superior content, delete inferior duplicates
4. **No Random Floating Files**: No `temp.md`, `notes.md`, `scratch.md` littering the repo
5. **Clean Up After Yourself**: Delete temporary files/directories at session end if no permanent purpose
6. **Respect Existing Quality**: Check for better documentation before recreating

---

## State File Size Limits

**Purpose**: Prevent context pollution from bloated state files

**Limits**:

| File | Max Lines | Purpose | Maintenance |
|------|-----------|---------|-------------|
| `todos/master-todo.md` | 400 | Project task tracking | Reference spec tasks, prune completed |
| `plans/master-plan.md` | 1500 | Technical architecture | Link to spec plans, prune completed phases |
| `event-stream.md` | 40 | Last 35 events | Auto-trim at session start |
| `workbook.md` | 300 | Active context | Extract to docs/ or delete old context |

---

## Documentation Rules

### Directory Structure

**Root files** (allowed at project root):

| File | Max Lines | Required | Purpose |
|------|-----------|----------|---------|
| `CLAUDE.md` | 600 | Yes | Orchestration rules |
| `README.md` | 300 | Yes | Project overview |
| `workbook.md` | 300 | Optional | Session context |
| `event-stream.md` | 40 | Optional | Session log |
| `PROJECT_INDEX.json` | - | Optional | Codebase intelligence |

**Planning files** (in `plans/` and `todos/`):

| File | Max Lines | Purpose |
|------|-----------|---------|
| `plans/master-plan.md` | 1500 | Technical architecture, references spec plans |
| `todos/master-todo.md` | 400 | Project task tracking, references spec tasks |
| `specs/NNN-feature/plan.md` | 500 | Feature-specific implementation plan |
| `specs/NNN-feature/tasks.md` | 300 | Feature-specific tasks with ACs |

**docs-to-process/** (staging area):
- **Purpose**: Raw session artifacts before consolidation
- **Naming**: `{YYYYMMDD}-{type}-{4char-id}.md`
- **Types**: `research`, `analysis`, `decision`, `pattern`, `bug`, `integration`
- **Max size**: 300 lines per file
- **Lifecycle**: Created → processed by `/streamline-docs` → DELETED
- **Example**: `20251126-research-a3f2.md`, `20251126-decision-b8c1.md`

**docs/** (curated knowledge - 5 domains):
- **Structure**: `architecture/`, `patterns/`, `decisions/`, `guides/`, `reference/`
- **Principle**: ONE authoritative file per topic (REPLACE entirely, never append)
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

**Naming convention**: `{YYYYMMDD}-{type}-{4char-id}.md`
- Types: `research`, `analysis`, `decision`, `pattern`, `bug`, `integration`
- Example: `20251126-research-a3f2.md`, `20251126-decision-b8c1.md`

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
wc -l CLAUDE.md README.md workbook.md event-stream.md plans/master-plan.md todos/master-todo.md
```

**Limits**:
- CLAUDE.md ≤ 600, README.md ≤ 300, workbook.md ≤ 300, event-stream.md ≤ 40
- plans/master-plan.md ≤ 1500, todos/master-todo.md ≤ 400
- specs/NNN/plan.md ≤ 500, specs/NNN/tasks.md ≤ 300

### Prohibited Practices

- **No floating docs**: Only allowed root files: CLAUDE.md, README.md, workbook.md, event-stream.md
- **No duplication**: One source per topic (REPLACE, don't append)
- **No exceeding limits**: Prune or extract before committing
- **No stale artifacts**: Process docs-to-process/ regularly via `/streamline-docs`
- **No placeholders**: Empty "coming soon" files forbidden

---

## Start: Orchestration-Aware React Loop

**Main execution loop integrating agents, skills, and state management.**

### Flow

```
1. STATE ANALYSIS → Read event-stream.md, todos/master-todo.md, workbook.md
2. COMPLEXITY ASSESSMENT → Simple/Moderate/Complex
3. SYSTEM UNDERSTANDING → Use agents (code-analyzer, prompt-researcher)
4. PLANNING → Use skills (brainstorming, writing-plans)
5. EXECUTION → Tool calls + Agent invocations
6. STATE UPDATE → Log events, update tasks, prune if needed
7. ITERATE → Return to Step 1
```

## Session File Maintenance Protocol

Check and maintain file sizes after every major task completion.

### Automatic Maintenance Triggers

Run `wc -l event-stream.md workbook.md plans/master-plan.md todos/master-todo.md` when:
1. Creating new research documents
2. Completing any Phase/task
3. Before ending session
4. Every 5-10 tool calls

### Pruning Rules by File

**todos/master-todo.md** (400 line limit):
- Mark completed phases with ✅ and collapse to summaries
- Keep only current phase tasks in detail
- Reference spec tasks with links: `See specs/NNN-feature/tasks.md`
- Remove completed maintenance tasks

**plans/master-plan.md** (1500 line limit):
- Keep current architecture and active phases
- Reference spec plans: `See specs/NNN-feature/plan.md`
- Move completed phase details to `memory/` docs
- Prune superseded architecture decisions

**event-stream.md** (40 line limit):
- Keep header (3 lines) + last 35 events ONLY
- Delete oldest events when exceeding 38 events
- Priority: Keep errors, decisions, phase completions

**workbook.md** (300 line limit):
- Extract permanent insights to research documents
- Delete superseded context (old numbers, outdated priorities)
- Keep only current phase context
- Remove resolved anti-patterns

### When Files Exceed Limits

**IMMEDIATE ACTION REQUIRED**:
```bash
# 1. Check sizes
wc -l event-stream.md workbook.md plans/master-plan.md todos/master-todo.md

# 2. If todos/master-todo.md > 400: Collapse completed phases, reference specs
# 3. If plans/master-plan.md > 1500: Extract to memory/, reference specs
# 4. If event-stream.md > 40: Keep last 35 events only
# 5. If workbook.md > 300: Extract to docs/, delete outdated context
```

---

## CLAUDE.md Self-Improvement Protocol

**Continuous Refinement**: This file should evolve based on learnings.

### When to Update Project Description

Update **## Project Overview** section when:
1. **Strategic pivot identified** (e.g., ESG-first positioning discovery)
2. **New critical data discovered** (e.g., analyzed CSV reveals unexpected patterns)
3. **Key assumptions validated/invalidated** (e.g., competitor landscape different than expected)
4. **Major milestone reached** (e.g., Phase 1 complete, moving to implementation)
5. **User provides new context** that changes project understanding

### How to Self-Improve CLAUDE.md

**ADD** new sections when:
- Discovering repeating patterns requiring standard protocol
- Finding gaps in current instructions causing errors
- User feedback indicates confusion or misalignment

**UPDATE** existing sections when:
- Instructions proven incomplete through execution
- Better practices discovered during work
- Context has evolved (e.g., from research → implementation phase)

**REMOVE** sections when:
- No longer applicable (phase-specific instructions after phase ends)
- Superseded by better approach
- Redundant with other sections


---

## Project Overview
