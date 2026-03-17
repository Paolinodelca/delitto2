# Load Structured Question Bank — Specification

## Purpose

This document specifies the first planned loader for the structured question bank.

The loader is responsible for reading the pilot structured question bank file and returning a safe in-memory representation that can later support:

- inspection
- validation
- selection experiments
- future runtime integration

This module should be intentionally simple in its first version.

It is not yet responsible for:
- ranking
- selection logic
- runtime composition
- tone choice
- adaptive follow-up behavior

Its only purpose is:
- load the structured question bank safely

---

# Proposed module name

Proposed implementation module:

loadStructuredQuestionBank.js

Suggested location:

src/interview/

---

# Input

The loader should read:

- `config/question_bank_v2.json`

This is the pilot structured question bank introduced in migration phase 1.

The file is expected to contain:

- `version`
- `questions`

---

# Expected file shape

Example:

```json
{
  "version": 1,
  "questions": [
    {
      "key": "transferability_examples",
      "category": "role_fit",
      "intent": "Detect whether the candidate can explain why past experience is transferable to the target role.",
      "signals": ["transferability", "clarity", "ownership"],
      "senioritySuitability": ["entry", "junior", "mid"],
      "companyContextSuitability": ["corporate_structured"],
      "toneSuitability": ["standard", "supportive"],
      "selectionWeight": "high",
      "variants": {
        "standard": {
          "prompt": "..."
        }
      },
      "tags": [],
      "metadata": {},
      "extensions": {}
    }
  ]
}