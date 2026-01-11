---
name: implement-and-verify
description: Implement tasks from plans with test-first approach, user-story-centric execution, and AC verification. Use proactively when executing implementation plans. Enforces quality gates, MVP-first delivery, and Article VII story-by-story implementation.
degree-of-freedom: low
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

@.claude/shared-imports/constitution.md
@.claude/templates/verification-report.md
@.claude/templates/quality-checklist.md

# Implementation & Verification Skill

## Overview

This skill executes implementation plans following Specification-Driven Development (SDD) principles: quality gates, test-driven development (TDD), user-story-centric execution, and progressive delivery.

**Constitutional Authority**: Article III (Test-First), Article V (Template-Driven Quality), Article VII (User-Story-Centric Organization)

**Core Principles**:
1. **Quality Gates First**: Validate readiness before implementation (Article V)
2. **Story-by-Story**: Implement user stories in priority order (Article VII)
3. **Test-First**: Tests BEFORE implementation, ALL ACs verified (Article III)
4. **Progressive Delivery**: Each story is shippable when complete (Article VII)

**Announce at start:** "I'm using the implement-and-verify skill to execute this plan with SDD quality gates."

## Quick Reference

| Phase | Key Activities | Output | Article |
|-------|---------------|--------|---------|
| **0. Quality Gates** | Validate spec readiness, check constitution | Gate pass/fail | Article V |
| **1. Story Selection** | Load tasks by story (P1, P2, P3) | Story tasks | Article VII |
| **2. Progressive Delivery** | Define MVP, plan incremental shipping | Delivery plan | Article VII |
| **3. Load Tasks** | Read plan, verify dependencies per story | Task selected | Article IV |
| **4. Write Tests** | Create tests from ACs (should FAIL) | Test files | Article III |
| **5. Implement** | Write code to make tests pass | Implementation | Article III |
| **6. Verify** | Run all tests, lint, build | verification-report.md | Article V |
| **7. Update** | Mark complete, handover if needed | Updated plan | Article V |

## Templates You Will Use

- **@.claude/shared-imports/constitution.md** - Architectural principles (all phases)
- **@.claude/templates/quality-checklist.md** - Pre-implementation gates (Phase 0)
- **@.claude/templates/plan.md** - Input plan with tasks and ACs (Phase 3)
- **@.claude/templates/verification-report.md** - Verification results (Phase 6)
- **@.claude/templates/handover.md** - For blocked tasks or agent transitions (Phase 7)

## The Process

Copy this checklist to track progress:

```
SDD Implementation Progress:
- [ ] Phase 0: Quality Gates Validated (constitution check + audit PASS)
- [ ] Phase 1: Story Tasks Loaded (by priority)
- [ ] Phase 2: Progressive Delivery Planned (MVP defined)
- [ ] Phase 3: Tasks Loaded (dependencies verified)
- [ ] Phase 4: Tests Written (from ACs, should FAIL)
- [ ] Phase 5: Implementation Complete
- [ ] Phase 6: Verification Complete (ALL ACs pass)
- [ ] Phase 7: Plan Updated (story marked complete)
```

---

## Detailed Workflows

### Phase 0: Quality Gate Validation

**See:** @.claude/skills/implement-and-verify/workflows/quality-gates.md

**Summary**:
- Validate quality checklist (quality-checklist.md)
- **MANDATORY**: Verify /audit has passed (Article V)
  - Audit report must exist
  - Status must be PASS or PASS WITH WARNINGS
  - Critical Issues must = 0
- Block implementation if gates fail (audit blocking is non-overridable)

### Phases 1-2: Story-by-Story Execution & Progressive Delivery

**See:** @.claude/skills/implement-and-verify/workflows/story-by-story-execution.md

**Summary**:
- Load tasks by story (P1, P2, P3)
- Implement each story completely
- **Auto-invoke /verify --story P#** after each story
- Only proceed to next story after current story verification passes
- Each story is independently shippable (MVP = P1 complete)

### Phases 3-7: TDD Implementation Workflow

**See:** @.claude/skills/implement-and-verify/workflows/tdd-implementation.md

**Summary**:
- **Phase 3**: Load tasks, verify dependencies, extract ACs
- **Phase 4**: Write tests FIRST (must FAIL initially)
- **Phase 5**: Implement minimal code to pass tests
- **Phase 6**: Verify all ACs (100% coverage required)
- **Phase 7**: Update plan, generate verification report, create handover if needed

---

## Examples & Patterns

**See:** @.claude/skills/implement-and-verify/examples/implementation-examples.md

**Five concrete examples**:
1. Successful implementation (test-first → implement → verify)
2. Failing AC → debug → fix
3. Rollback on breaking change
4. Story-level verification (P1 independent test)
5. Progressive delivery workflow (P1 → P2 → P3)

**Key Patterns**:
- Test-First Always: `Write Test → FAIL → Implement → PASS`
- Debug on Failure: `AC Fails → Debug → Fix → Re-verify`
- Progressive Delivery: `P1 Complete → Verify → Ship or Continue`

---

## Enforcement & Failure Modes

**See:** @.claude/skills/implement-and-verify/references/enforcement-rules.md

**Three Critical Rules**:
1. **No Completion Without Passing ACs** - Status must be "blocked" if any AC fails
2. **Test-First Mandatory** - Tests written before implementation (must FAIL initially)
3. **100% AC Coverage** - Every AC must have passing test

**Common Pitfalls**: Implementing before tests, skipping lint/build, marking complete with failures

**11 Failure Modes with Solutions**: Quality gates skipped, test-first violated, coverage incomplete, false positive tests, story verification skipped, dependency violations, over-engineering, etc.

---

## Agent Integration & Related Workflows

**See:** @.claude/skills/implement-and-verify/references/integration.md

**Executor Agent Execution**:
- Triggered by: User runs `/implement plan.md`
- Agent: executor-implement-verify
- Receives: plan.md, tasks.md, spec.md, constitution
- Returns: Implemented code, verification reports per story, handovers if blocked

**Supporting Agents**:
- Code Analyzer: For understanding existing code before modification
- Debugger: For test failures (via debug-issues skill)

**Handover Protocols**:
- To Planner: If requirements unclear
- To Orchestrator: If blocked by external dependency

**Verification Workflow**:
```
implement-and-verify skill (completes story P1)
    ↓ auto-invokes
/verify plan.md --story P1 (SlashCommand tool)
    ↓ produces
verification-P1.md (PASS/FAIL report)
```

---

## Prerequisites

Before using this skill:
- ✅ tasks.md exists (Article IV: tasks before implementation)
- ✅ plan.md exists with ≥2 ACs per user story
- ✅ spec.md exists with user stories and priorities
- ✅ All [NEEDS CLARIFICATION] markers resolved (or override approved)
- ✅ **Audit has passed** (or CRITICAL issues resolved) - **MANDATORY**
- ⚠️ Optional: quality-checklist.md validated (Article V quality gate)
- ⚠️ Optional: Test framework set up (for TDD)

## Dependencies

**Depends On**:
- **specify-feature skill** - Provides spec.md with user stories
- **create-implementation-plan skill** - Provides plan.md with ACs and tech stack
- **generate-tasks skill** - MUST run before this skill (Article IV)
- **/audit command** - Should have passed before implementation starts

**Integrates With**:
- **debug-issues skill** - Use when tests fail or ACs don't pass
- **analyze-code skill** - Use when understanding existing code before modifying
- **/verify command** - Automatically invoked after each story completes

**Tool Dependencies**:
- Read, Write, Edit tools (code implementation)
- Bash tool (running tests, builds, linters)
- Grep, Glob tools (finding files and code patterns)

## Next Steps

After implementation completes, **automatic workflow progression per story**:

**Automatic Chain** (per User Story):
```
implement-and-verify (implements story P1)
    ↓ (auto-invokes /verify)
/verify plan.md --story P1 (validates P1 independently)
    ↓ (if PASS)
Ready for P2 OR ship MVP
    ↓ (if user continues)
implement-and-verify (implements story P2)
    ↓ (auto-invokes /verify)
/verify plan.md --story P2 (validates P2 independently)
    ↓ (if PASS)
Ready for P3 OR ship enhancement
    ↓ (continues for all stories)
```

**User Action Required**:
- **After P1 verification passes**: Decision to ship MVP or continue to P2
- **After any story passes**: Can ship incrementally (Article VII progressive delivery)
- **If verification fails**: Debug with debug-issues skill, fix, re-verify

**Outputs Created** (per story):
- `YYYYMMDD-HHMM-verification-P#.md` - Story verification report
- `YYYYMMDD-HHMM-handover-*.md` - If blocked or transitioning agents
- Updated `tasks.md` with completed tasks marked
- Test files (created before implementation per Article III)

**Commands**:
- **/verify plan.md --story P#** - Automatically invoked after each story
- **/bug** - If tests fail and debugging needed
- **/analyze** - If existing code analysis needed

## Related Skills & Commands

**Direct Integration**:
- **specify-feature skill** - Provides spec.md with user stories (workflow start)
- **create-implementation-plan skill** - Provides plan.md with ACs (workflow predecessor)
- **generate-tasks skill** - Provides tasks.md with task breakdown (required predecessor)
- **debug-issues skill** - Use when tests fail or blockers occur
- **analyze-code skill** - Use when existing code needs understanding
- **/implement command** - User-facing command that invokes this skill
- **/verify command** - Automatically invoked after each story (per P1, P2, P3)

**Workflow Context**:
- Position: **Phase 4** of SDD workflow (final execution phase)
- Triggers: User runs /implement plan.md after audit passes
- Output: Implemented code + verification reports per story

**Quality Gates**:
- **Pre-Implementation**: quality-checklist.md validation (Article V)
- **Per-Story**: /verify --story P# automatic validation (Article VII)
- **Test-First**: Tests written before implementation (Article III)
- **100% AC Coverage**: Every AC must have passing test

**Progressive Delivery Pattern** (Article VII):
```
P1 implemented → /verify --story P1 → PASS → Ship MVP or Continue
P2 implemented → /verify --story P2 → PASS → Ship Enhancement or Continue
P3 implemented → /verify --story P3 → PASS → Ship Complete Feature
```

Each story is independently shippable, enabling faster value delivery.

## Success Metrics

**Verification Quality:**
- 100% AC coverage required
- All ACs must pass
- No task complete without verification

**Implementation Quality:**
- Tests written first
- Minimal implementation (YAGNI)
- Lint and build pass

## When to Use This Skill

**Use implement-and-verify when:**
- User has a plan ready to execute
- User wants to implement tasks with TDD
- User needs AC verification
- User says "implement the plan"

**Don't use when:**
- No plan exists yet (use create-plan skill)
- User just wants to analyze code (use analyze-code skill)
- User wants to debug (use debugging skill)

## Version

**Version:** 1.2.0
**Last Updated:** 2025-10-23
**Owner:** Claude Code Intelligence Toolkit

**Change Log**:
- v1.2.0 (2025-10-23): Refactored to progressive disclosure pattern (<500 lines)
- v1.1.0 (2025-10-23): Added Phase 0 Step 0.3 - Mandatory audit validation enforcement
- v1.0.0 (2025-10-22): Initial version with cross-skill references
