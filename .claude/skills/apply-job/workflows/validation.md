# Validation Workflow

Multi-stage validation gates with collapsed output format.

---

## Gate 1: Post-Classification (After Step 1)

**When**: Before asking clarifying questions

**Checklist**:
- [ ] Job type classified with confidence >70%
- [ ] CV variant selected and path verified
- [ ] ≥3 matching keywords identified from JD
- [ ] Primary metrics selected (2-3 from Metrics Bank)

**Stop Conditions**:
- Classification confidence <70%: Ask user for clarification
- No matching keywords: Verify job is in scope, ask user

---

## Gate 2: Post-Research (After Step 3)

**When**: Before generating content

**Checklist**:
- [ ] Company name verified (exactly as in JD)
- [ ] Role title captured (exactly as in JD)
- [ ] 3+ company-specific details extracted (list them)
- [ ] Recent news found (last 12 months) OR noted as unavailable
- [ ] Cultural signals identified

**Stop Conditions**:
- <3 company details: Expand research or ask user for input
- Company website unreachable: Note and proceed with available info

**Output Format** (brief):
```
Research: [Company Name] | [Role Title]
Details found: 4 | News: Yes | Swiss: No
```

---

## Gate 3: Post-Generation (Step 5)

**When**: After generating cover letter, before presenting

### 12 Quality Checks

**Content (5 checks)**:
1. Word count: 350-450
2. Company-specific details: ≥3
3. Quantified achievements: ≥2
4. Company name verified
5. Role title exact match

**Style (5 checks)**:
6. No blacklisted phrases
7. No em-dashes
8. No subjunctive mood
9. Active voice ≥90%
10. Confident closing

**Verification (2 checks)**:
11. All metrics verified against Metrics Bank
12. No placeholders remaining

### Collapsed Quality Report (Default)

Present to user:
```
Quality: PASSED ✓ (12/12 checks)
Word count: 412 | Company-specific: Yes | Metrics verified

[Show details]
```

### Expanded Quality Report (On Request)

<details>
<summary>Show details</summary>

**Content:**
✓ Word count: 412 (350-450)
✓ Company details: 4 (≥3 required)
  1. [Detail 1]
  2. [Detail 2]
  3. [Detail 3]
  4. [Detail 4]
✓ Achievements: 3 (≥2 required)
  1. 37% D30 retention (verified)
  2. 125% retention lift (verified)
  3. CHF 11.5M Series A (verified)

**Style:**
✓ No blacklisted phrases
✓ No em-dashes
✓ Active voice: 95% (18/19 sentences)
✓ Sentence length avg: 14 words

**Verification:**
✓ Company name: [Name] (matches JD)
✓ Role title: [Title] (matches JD)
✓ All metrics verified against source

</details>

---

## Gate 4: Pre-Output (Step 6)

**When**: Before saving files

**Checklist**:
- [ ] HTML renders without errors
- [ ] All placeholders replaced
- [ ] File structure created correctly
- [ ] CV variant path verified

**Placeholder Scan**:
Search for: `{{`, `[COMPANY]`, `[DATE]`, `[ROLE]`
If found: FAIL - replace before proceeding

---

## Active Voice Heuristic

**Quick Check** (for 400-word letter):
- Max 2 passive constructions allowed
- Scan for: `was/were [verb]ed`, `has/have been`, `is/are being`
- Calculate: `(Total sentences - Passive) / Total ≥ 90%`

---

## Failure Protocol

### Severity Levels

| Level | Examples | Action |
|-------|----------|--------|
| **Critical** | Wrong company name | STOP. Regenerate. |
| **High** | Blacklisted phrase | Self-correct |
| **Medium** | Word count 460 | Trim |
| **Low** | Missing 3rd detail | Note, proceed |

### Retry Rules

1. **Max 2 iterations** for self-correction
2. After 2 failures: Present with explicit warning
3. Critical failures: Never present without resolution

---

## Quality Check Reference

| Check | Pass Criteria | Location |
|-------|---------------|----------|
| Word count | 350-450 | wc -w |
| Company details | ≥3 specific | Body paragraphs |
| Achievements | ≥2 quantified | Body paragraphs |
| Blacklist | None of 20 phrases | Full scan |
| Em-dashes | 0 instances | Search: — |
| Subjunctive | 0 instances | would/could/might |
| Active voice | ≥90% | Sentence analysis |
| Closing | Confident | Last paragraph |
| Metrics | All verified | Cross-reference |
| Placeholders | None | Search: {{ |
