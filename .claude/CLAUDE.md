# .claude/CLAUDE.md - Job Search 2025

Claude Code configuration for job search repository. Optimized for Claude Opus 4.5.

---

## Project Type

Documentation-focused repository for Swiss RAV unemployment compliance.

---

## Key Paths

| Purpose | Path |
|---------|------|
| Root orchestration | `/CLAUDE.md` |
| Navigation index | `/docs/README.md` |
| CV (primary) | `/docs/profile/cv-simon-yang-2025.html` |
| Applications | `/docs/applications/{company}/` |
| RAV compliance | `/docs/rav/` |

---

## Constraints

- **Root files**: Max 6 markdown files—keeps repository navigable
- **State limits**: todo.md ≤150 lines, workbook.md ≤300 lines—prevents context overflow
- **Single tracker**: Only `docs/applications/_tracker.md`—single source of truth
- **Company folders**: Standardized structure per company—enables parallel work
- **MANDATORY PDF**: When modifying ANY HTML (CV or cover letter), ALWAYS generate PDF immediately. NO EXCEPTIONS.

---

## MCP Tools

**CLI Preferences** (faster, more reliable output):
- `rg` for content search (not `grep`)
- `fd` for file discovery (not `find`)
- `jq` for JSON parsing

**Available MCP servers**:
| Tool | Use When |
|------|----------|
| Wayback Machine | Recovering deleted/archived job postings |
| Firecrawl | Scraping job descriptions from live URLs |
| Ref | Searching technical documentation |
