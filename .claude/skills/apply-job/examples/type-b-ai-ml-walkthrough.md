# Example Walkthrough: Type B - AI/ML Product Manager

This example demonstrates the complete `/apply` workflow with lazy context loading.

---

## Step 1: User Invocation

```
User: /apply https://example-company.com/jobs/senior-product-manager-ai
```

**Context loaded at startup**: `job-types.md` (~800 tokens)

---

## Step 2: Job Analysis & Classification

**Claude actions**:
1. Scrapes job description via Firecrawl MCP
2. Scans for keywords using job-types.md

**Keyword matches found**:
- "AI" (2 occurrences)
- "machine learning" (3 occurrences)
- "data science" (1 occurrence)
- "analytics" (2 occurrences)

**Classification**: Type B - AI/ML Product Management

**Gate 1 Check**:
- [x] Job type: B (AI/ML)
- [x] CV variant: `docs/profile/variants/cv-simon-yang-ai-product.html`
- [x] Keywords matched: 8 (≥3 required)

**After Gate 1 passes, load**: `profile-essential.md` (~2,000 tokens)

---

## Step 3: Clarification

**Claude presents**:

```
I've classified this as **Type B: AI/ML Product Management**.
The role emphasizes ML model development, data pipelines, and analytics.
Is that correct?

What 2-3 aspects of this role interest you most?

Any specific achievement you want to emphasize?

Company tone: startup casual, corporate formal, or Swiss formal?

Any gaps or concerns to address proactively?
```

**User responds**:
- Classification correct
- Interests: "Building data products, scaling ML pipelines"
- Achievement: "The 37% retention at Oxa"
- Tone: "Swiss formal"
- No gaps

**After clarification, load**: `writing-rules.md` (~1,500 tokens)

---

## Step 4: Company Research

**Claude actions via Firecrawl**:

1. Scrapes company About page
2. Searches for recent news
3. Extracts culture signals

**Research Summary**:
```
Research: Example AI Corp | Senior Product Manager - AI
Details found: 4 | News: Yes | Swiss: No
```

**Details extracted**:
1. "Enterprise AI platform serving Fortune 500" (About page)
2. "Recently raised $50M Series C led by Sequoia" (TechCrunch, Nov 2025)
3. "Team of 45 ML engineers" (Careers page)
4. "Focus on explainable AI for financial services" (Product page)

**Gate 2 Check**:
- [x] Company name verified: Example AI Corp
- [x] Role title: Senior Product Manager - AI
- [x] Company-specific details: 4 (≥3 required)
- [x] Recent news: Yes (Series C)

---

## Step 5: Generation

**Cover letter generated** (412 words):

```
What draws me to Example AI Corp is your focus on explainable AI for
financial services. This is exactly the intersection I pursued at ISS-ESG,
where I led physical climate risk products that translated complex ML
outputs into actionable risk scores for institutional investors.

At Oxa Life, I built the Grafana-based analytics infrastructure that
enabled real-time tracking of user behavior across our biometrics platform.
This data-driven approach resulted in 37% Day-30 retention, compared to the
8% industry benchmark for health apps. When early signals showed users
struggling with the meditation focus, I led the strategic pivot to stress
monitoring. The result was a 125% improvement in long-term retention.

Your recent $50M Series C signals rapid scaling ahead. I have direct
experience building product teams through growth phases. At Oxa, I grew
the product function from 1 to 8 people, establishing hiring processes
and mentoring junior PMs while maintaining hands-on involvement in
technical architecture decisions.

The role's emphasis on ML pipelines resonates with my background. My PhD
in atmospheric science at ETH Zurich involved building ensemble numerical
models that processed terabytes of climate data. This technical foundation
enables me to collaborate effectively with your 45-person ML engineering
team and make informed decisions about model complexity, inference costs,
and data quality trade-offs.

I look forward to discussing how my experience in data-intensive products
can contribute to Example AI Corp's mission of making enterprise AI more
transparent and trustworthy.
```

---

## Step 6: Validation (Gate 3)

**Quality Report (Collapsed)**:

```
Quality: PASSED ✓ (12/12 checks)
Word count: 412 | Company-specific: Yes | Metrics verified

[Show details]
```

**Metrics Verification** (internal):
| Claimed | Source | Status |
|---------|--------|--------|
| 37% D30 retention | profile-essential.md | VERIFIED |
| 8% benchmark | profile-essential.md | VERIFIED |
| 125% improvement | profile-essential.md | VERIFIED |
| Team 1→8 | profile-essential.md | VERIFIED |

---

## Step 7: Output

**Claude creates folder structure**:

```
docs/applications/example-ai-corp/
├── job-description.md
├── cover-letter.md
├── cover-letter.html
└── application-email.md
```

**Claude presents**:

```
Here's your tailored cover letter:

[Cover letter text]

Quality: PASSED ✓ (12/12 checks)
Word count: 412 | Company-specific: Yes | Metrics verified

I recommend using **cv-simon-yang-ai-product.html** for this application.

Shall I create the application folder and save the files?
```

---

## Context Loading Summary

| Phase | File Loaded | Tokens | Cumulative |
|-------|-------------|--------|------------|
| Startup | job-types.md | ~800 | 800 |
| After Gate 1 | profile-essential.md | ~2,000 | 2,800 |
| After clarification | writing-rules.md | ~1,500 | 4,300 |
| **Total** | | | **4,300** |

**vs Previous**: 13,600 tokens at startup
**Reduction**: 68% for this workflow

---

## Key Patterns Demonstrated

1. **Lazy loading**: Context loaded per phase, not all upfront
2. **Gate progression**: 4 validation checkpoints
3. **Company research**: 4 specific details extracted
4. **Metrics verification**: All claims traced to profile-essential.md
5. **Collapsed quality report**: 2-line summary with expandable details
6. **CV variant selection**: Matched to job type
7. **Correct folder path**: `docs/applications/{company}/` (no YYYY-MM)
