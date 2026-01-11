---
description: Process docs-to-process/ artifacts into curated docs/, enforce size limits, cleanup floating root docs
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(wc:*), Bash(ls:*), Bash(rm:*), Bash(mv:*)
---

# Streamline Documentation

Process session artifacts from `docs-to-process/` into curated domain documentation in `docs/`, enforce size limits, and clean up the repository.

## Pre-Flight Check

**CRITICAL**: Read CHANGELOG before making any changes:

!`cat docs/CHANGELOG.md`

Verify current state:

!`ls -la docs-to-process/ 2>/dev/null | head -20`
!`wc -l CLAUDE.md README.md workbook.md 2>/dev/null || echo "Missing state files"`

## Step 0: Handle Floating Documents

Check for floating .md files in prohibited locations:

```bash
# Root (only CLAUDE.md, README.md, workbook.md allowed)
ls -la *.md | grep -v "CLAUDE.md\|README.md\|workbook.md"

# docs/ root (only CLAUDE.md, CHANGELOG.md, README.md allowed)
ls -la docs/*.md docs/*.txt | grep -v "CLAUDE.md\|CHANGELOG.md\|README.md"
```

**For each floating document found:**
1. Move to `docs-to-process/` immediately
2. Add to processing queue
3. Process with other artifacts

**Floating = any .md file not in:**
- Root: CLAUDE.md, README.md, workbook.md
- docs/: CLAUDE.md, CHANGELOG.md, README.md
- docs-to-process/: staging artifacts
- docs/{domain}/: curated knowledge

## Step 1: Scan Staging Area

List all unprocessed artifacts in `docs-to-process/`:

```bash
ls -la docs-to-process/*.md 2>/dev/null || echo "No artifacts to process"
```

For each artifact found, read and analyze for valuable insights.

## Step 2: Classify and Extract Insights

For each artifact in `docs-to-process/`:

1. **Identify domain** based on content:
   - Architecture patterns → `docs/architecture/`
   - Backend integration → `docs/backend/`
   - UI/Widget patterns → `docs/frontend/`
   - Testing strategies → `docs/testing/`
   - Build/Deploy config → `docs/deployment/`
   - Feature-specific → `docs/features/{feature-name}/`

2. **Extract valuable insights**:
   - Proven patterns (used in 2+ places)
   - Critical constraints (blocks progress if violated)
   - Anti-patterns (causes bugs/issues)
   - Decision rationale (why not alternatives)

3. **Discard low-value content**:
   - Raw research notes without conclusions
   - Implementation details already in code
   - Speculation without evidence
   - Redundant information

## Step 3: Update Domain Documentation

**CRITICAL**: Replace entirely, do NOT append.

For each insight:

1. Check if target doc exists in `docs/{domain}/`
2. If exists: **Replace entire content** with updated version
3. If not exists: Create new doc following template

**Domain doc template**:
```markdown
# {Topic Title}

**Last Updated**: {YYYY-MM-DD}
**Component**: flutter_mobile

## Overview
{2-3 sentence summary}

## Current Implementation
{What exists today with code references}

## Key Patterns
### Pattern 1: {Name}
{Description + example}

## Anti-Patterns
- **Don't**: {What to avoid}
- **Instead**: {Correct approach}

## References
- **Code**: `lib/path/to/file.dart:L{line}`
- **Related**: docs/{domain}/{related}.md
```

## Step 4: Extract High-Impact Rules

If insight qualifies as high-impact rule (affects ALL development):

1. Add to CLAUDE.md in appropriate section
2. Keep concise (1-2 sentences max)
3. Include enforcement mechanism

## Step 5: Update CHANGELOG

**CRITICAL**: Log ALL changes made during consolidation.

Update `docs/CHANGELOG.md` with:

```markdown
## [YYYY-MM-DD HH:MM] Session: {current-session-id}

### Added
- {new files created in docs/}

### Modified
- {existing files updated in docs/}

### Deleted
- {files removed from docs/ or docs-to-process/}

### Rules Updated
- {any CLAUDE.md updates}
```

## Step 6: Delete Processed Artifacts

After extraction, **permanently delete** from `docs-to-process/`:

```bash
rm docs-to-process/{filename}.md
```

**Never keep processed artifacts** - they bloat the repo.

## Step 7: Clean Root Directory

Check for prohibited root documentation:

```bash
ls -la *.md | grep -v "CLAUDE.md\|README.md\|workbook.md"
```

For any found (e.g., `ARCHITECTURE.md`, `ANALYSIS.md`, `RESEARCH.md`):

1. **Evaluate content**: Is it valuable and up-to-date?
2. **If valuable**: Extract insights → `docs/{domain}/` → delete original
3. **If stale/duplicate**: Delete immediately

**Prohibited at root**: Any `.md` file except CLAUDE.md, README.md, workbook.md

## Step 8: Enforce Size Limits

Check all documentation sizes:

```bash
wc -l CLAUDE.md README.md workbook.md docs/README.md docs/**/*.md 2>/dev/null
```

**Limits**:
- `CLAUDE.md` ≤ 600 lines → If exceeded, extract sections to docs/
- `README.md` ≤ 300 lines → If exceeded, move details to docs/
- `workbook.md` ≤ 300 lines → If exceeded, archive old context
- `docs/README.md` ≤ 200 lines → If exceeded, remove verbose descriptions
- `docs/{domain}/*.md` ≤ 500 lines → If exceeded, split into sub-topics

**If over limit**: Prune aggressively or extract to sub-documents.

## Step 9: Generate Report

After processing, report:

```markdown
## Streamline Documentation Report

**Session**: {current-session-id}
**Date**: {YYYY-MM-DD HH:MM}

### Artifacts Processed
- {filename1}.md → docs/{domain}/{topic}.md
- {filename2}.md → CLAUDE.md (rules)
- {filename3}.md → DELETED (low-value)

### Documentation Updated
- docs/architecture/state-management.md (REPLACED)
- docs/backend/cloud-functions.md (CREATED)
- CLAUDE.md line {X} (rule added)

### Root Cleanup
- ARCHITECTURE.md → docs/architecture/overview.md → DELETED
- ANALYSIS.md → DELETED (duplicate of existing)

### Size Compliance
- CLAUDE.md: {X}/600 lines ✓
- README.md: {Y}/300 lines ✓
- docs/README.md: {Z}/200 lines ✓

### Status
{✅ COMPLETE | ⚠️ NEEDS ATTENTION | ❌ FAILED}
```

## Common Scenarios

### Scenario: Research artifact with findings

```
docs-to-process/20250117-1430-uuid-research.md
```

1. Read file, identify domain (e.g., testing)
2. Extract key findings (best practices, patterns)
3. Update `docs/testing/strategy.md` (replace)
4. Delete original artifact

### Scenario: Analysis artifact with decisions

```
docs-to-process/20250117-1430-uuid-decisions.md
```

1. Read file, identify architecture decisions
2. Extract rationale and constraints
3. Update `docs/architecture/decisions.md`
4. If critical rule: Add to CLAUDE.md
5. Delete original artifact

### Scenario: Root documentation (prohibited)

```
ARCHITECTURE_ANALYSIS.md (root)
```

1. Read file, evaluate freshness
2. Extract valuable insights → `docs/architecture/`
3. Delete root file (prohibited location)

## Quality Checks

Before finishing:

- [ ] `docs-to-process/` is empty (except CLAUDE.md)
- [ ] No `.md` files in root except CLAUDE.md, README.md, workbook.md
- [ ] All domain docs ≤ 500 lines
- [ ] CLAUDE.md ≤ 600 lines
- [ ] README.md ≤ 300 lines
- [ ] No duplicate information across docs
- [ ] docs/README.md index is current
- [ ] docs/CHANGELOG.md updated with session changes

---

**Execute this workflow now. Report results when complete.**
