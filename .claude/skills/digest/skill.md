# Gmail Digest Skill

Process Gmail inbox and create actionable digest with priority classification.

## Usage

```
/digest              # Process new emails since last run
/digest --initial    # Process last 60 days (first-time setup)
/digest --days=7     # Process last 7 days
```

## Processing Pipeline

Execute these steps in order:

### Step 1: Determine Time Range

```
If --initial flag or no previous digest exists:
  - Query: "newer_than:60d"
Else if --days=N specified:
  - Query: "newer_than:Nd"
Else:
  - Check last digest date from Supabase
  - Query emails since that date
```

### Step 2: Fetch Emails from Gmail MCP

Use `mcp__gmail__search_emails` with appropriate query:
- Get up to 100 emails per batch
- Store: id, subject, from, date, snippet

### Step 3: Filter Already Processed

Query Supabase `processed_emails` table:
```sql
SELECT gmail_id FROM processed_emails WHERE gmail_id IN (...)
```
Remove any emails already in the database.

### Step 4: Load and Apply Blacklist

Query Supabase `blacklist` table:
```sql
SELECT email_pattern FROM blacklist
```

Filter out emails where sender matches ANY blacklist pattern (case-insensitive substring match).

### Step 5: Classify Remaining Emails

Apply classification rules IN ORDER (first match wins):

| Priority | Category | Rule |
|----------|----------|------|
| CRITICAL | rav | Sender contains `@vd.zh.ch`, `@zh.ch`, or `jobroom` |
| CRITICAL | billing | Subject contains: payment fail, overdue, invoice, past due, billing, subscription |
| HIGH | action_required | Subject contains: action required, urgent, reminder, deadline, expir |
| MEDIUM | personal | Sender is human (not matching automated patterns) |
| LOW | other | Everything else |

**Automated sender patterns** (in addition to blacklist):
- Contains `noreply`, `no-reply`, `no_reply`
- Contains `notifications@`, `alerts@`, `updates@`
- Domain starts with `mail.`, `email.`, `news.`

### Step 6: Read Full Email Content for Important Emails

For CRITICAL and HIGH priority emails:
- Use `mcp__gmail__read_email` to get full content
- Extract key information for draft generation

### Step 7: Generate Draft Responses

For emails with `needs_response = true` (RAV, personal, action_required):

**RAV emails** (formal German/English):
```
Sehr geehrte Damen und Herren,

Vielen Dank für Ihre Nachricht vom [DATE].
[CONTEXTUAL RESPONSE BASED ON EMAIL CONTENT]

Mit freundlichen Grüssen,
Simon Yang
```

**Personal emails** (friendly):
```
Hi [FIRST_NAME],

Thanks for reaching out.
[CONTEXTUAL RESPONSE]

Best,
Simon
```

**Action required** (acknowledge):
```
Hi,

I've received this and will [ACTION] by [REASONABLE_DEADLINE].

Best,
Simon
```

Save drafts to Supabase `draft_responses` table.

### Step 8: Build Markdown Digest

Create digest with this structure:

```markdown
# Email Digest - [DATE]

**Summary**: X emails processed, Y critical, Z high priority

---

## CRITICAL (Immediate Action Required)

### RAV / Government
- **[SUBJECT]** from [SENDER] ([DATE])
  - [SNIPPET/SUMMARY]
  - Action: [WHAT NEEDS TO BE DONE]
  - Draft response prepared: [YES/NO]

### Billing / Payments
- **[SUBJECT]** from [SENDER] ([DATE])
  - [SNIPPET/SUMMARY]
  - Action: [PAYMENT NEEDED / CHECK ACCOUNT]

---

## HIGH PRIORITY

### Action Required
- **[SUBJECT]** from [SENDER] ([DATE])
  - [SNIPPET/SUMMARY]
  - Deadline: [IF MENTIONED]

---

## MEDIUM PRIORITY

### Personal Communications
- **[SUBJECT]** from [SENDER] ([DATE])
  - [SNIPPET/SUMMARY]
  - Response needed: [YES/NO]

---

## LOW PRIORITY (FYI)
- [SUBJECT] from [SENDER] - [ONE LINE SUMMARY]

---

## Draft Responses Prepared

| Email | Status | Preview |
|-------|--------|---------|
| RE: [SUBJECT] | Pending | [FIRST 50 CHARS]... |

---

## Statistics
- Total processed: X
- Critical: Y
- High: Z
- Medium: A
- Low: B
- Blacklisted/filtered: C
```

### Step 9: Save Digest

1. Save to Supabase `digests` table:
```sql
INSERT INTO digests (date, content, email_count, critical_count, high_count)
VALUES ([TODAY], [MARKDOWN_CONTENT], [COUNT], [CRITICAL], [HIGH])
ON CONFLICT (date) DO UPDATE SET content = EXCLUDED.content, ...
```

2. Save to filesystem:
```
docs/digests/YYYY-MM-DD.md
```

### Step 10: Mark Emails as Processed

Insert all processed emails into Supabase:
```sql
INSERT INTO processed_emails (gmail_id, thread_id, subject, sender, sender_email, received_at, priority, category, needs_response, snippet, digest_date)
VALUES ...
```

### Step 11: Report Summary

Output summary to user:
```
Digest complete for [DATE]

Processed: X emails
- Critical: Y (RAV: a, Billing: b)
- High: Z
- Medium: A
- Low: B

Filtered: C emails (blacklisted)
Draft responses: D prepared

View digest: docs/digests/YYYY-MM-DD.md
Dashboard: http://localhost:3000
```

## Classification Details

### RAV Detection
Swiss unemployment office (Regionales Arbeitsvermittlungszentrum):
- `@vd.zh.ch` - Volkswirtschaftsdirektion Kanton Zürich
- `@zh.ch` - Canton Zurich general
- `jobroom.ch` - Swiss job portal

### Billing Detection
Keywords in subject (case-insensitive):
- payment fail, payment failed, payment failure
- overdue, past due, past-due
- invoice, invoice #, invoice number
- billing, bill due
- subscription expir, account suspend
- action required + (payment|account|billing)

### Personal Detection
NOT matching:
- Any blacklist pattern
- Automated sender patterns (noreply, notifications, etc.)
- Known marketing domains
- Bulk mail indicators

## Error Handling

- If Gmail MCP fails: Report error, suggest checking connection
- If Supabase fails: Save digest to filesystem only, warn user
- If no new emails: Report "No new emails since last digest"
- If all emails blacklisted: Report count, suggest reviewing blacklist

## Maintenance Commands

```
/digest --blacklist-add "pattern" "reason"   # Add to blacklist
/digest --blacklist-remove "pattern"         # Remove from blacklist
/digest --stats                              # Show processing statistics
```
