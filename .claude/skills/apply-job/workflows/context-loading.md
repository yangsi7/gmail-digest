# Context Loading Strategy

Lazy loading workflow to minimize token usage. Load context only when needed.

---

## Loading Phases

### Phase 1: Startup (~800 tokens)

**Loaded via @ import**:
- `references/job-types.md`

**Purpose**: Job classification keywords and CV variant mapping

**When**: Immediately when skill is invoked

---

### Phase 2: Post-Classification (~2,000 tokens)

**Load after Gate 1 passes**:
- `references/profile-essential.md`

**Purpose**:
- Identity and contact info
- Value proposition
- Metrics Bank (6 key metrics)
- Key story titles (5 stories)
- CV variant paths

**Trigger**: Classification confidence >70%

---

### Phase 3: Post-Clarification (~1,500 tokens)

**Load after user answers 5 questions**:
- `references/writing-rules.md`

**Purpose**:
- Cover letter structure rules
- Non-negotiables (em-dash, subjunctive, voice)
- Vocabulary blacklist/whitelist
- Evidence formula
- Opening/closing strategies

**Trigger**: User responses received

---

### Phase 4: Swiss Company (Conditional, ~600 tokens)

**Load only if Swiss company detected**:
- `references/swiss-market-rules.md`

**Purpose**:
- Swiss tone expectations
- Regional variations (German, French, Italian)
- Key differences from US market

**Detection signals**:
- Company HQ in Switzerland
- .ch domain
- Swiss German/French in job description
- Company location mentions Zurich, Geneva, Basel, etc.

---

## Token Budget

| Phase | Cumulative | Files Loaded |
|-------|------------|--------------|
| Startup | ~800 | job-types.md |
| After classification | ~2,800 | + profile-essential.md |
| After clarification | ~4,300 | + writing-rules.md |
| Full (Swiss) | ~4,900 | + swiss-market-rules.md |

**Target**: <5,000 tokens total (vs previous 13,600 at startup)

**Reduction**: 64% for full workflow, 94% at startup

---

## Loading Triggers

```
/apply invoked
    │
    ▼
[LOAD: job-types.md via @ import]
    │
    ▼
Step 1: Scrape & Classify
    │
    ▼
Gate 1: Classification >70%?
    │ YES
    ▼
[LOAD: profile-essential.md]
    │
    ▼
Step 2: Ask 5 clarification questions
    │
    ▼
User responds
    │
    ▼
[LOAD: writing-rules.md]
    │
    ▼
Step 3: Research company
    │
    ▼
Swiss company detected?
    │ YES
    ▼
[LOAD: swiss-market-rules.md]
    │
    ▼
Steps 4-6: Generate, Validate, Output
```

---

## Reference Files (Not Auto-Loaded)

These files are available but loaded only on demand:

| File | When to Load |
|------|--------------|
| `references/quality-rules.md` | During validation if detailed rules needed |
| `docs/profile/professional-profile.md` | If deep profile details required |
| `docs/applications/_templates/` | During HTML generation |

---

## Why Lazy Loading?

**Before optimization**:
- Startup: 13,600 tokens (cover-letter-context-guide.md)
- Before job even scraped
- 80,000 potential tokens for full workflow

**After optimization**:
- Startup: 800 tokens (job-types.md only)
- Context loaded per phase
- 4,900 tokens max for full workflow

**Benefits**:
1. 94% reduction at startup
2. Faster initial response
3. More context available for generation
4. Lower token costs
