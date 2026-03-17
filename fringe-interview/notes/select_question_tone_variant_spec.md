# Select Question Tone Variant — Fringe Interview

## Purpose

This module resolves the final prompt to use for each selected structured question.

The system already provides:
- a set of selected question keys (questionSelectionStrategy)
- a tone mode (e.g. incisive, supportive, hr_relational, etc.)
- a structured question bank with tone variants

This module connects these elements and produces:

→ final resolved prompts ready for use in the interview

---

## Inputs

The module receives:

```json
{
  "structuredQuestionBank": { ... },
  "questionSelectionStrategy": {
    "toneMode": "incisive",
    "selectedQuestionKeys": [
      "stakeholder_interaction",
      "transferability_examples",
      "learning_orientation",
      "initiative_examples",
      "closing_reflection"
    ]
  }
}