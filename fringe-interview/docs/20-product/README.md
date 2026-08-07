# IMAGO Product Authority

**Status:** CANONICAL

This folder defines the product. Architecture and implementation must conform to it.

## Read order
1. PRODUCT_VISION.md
2. PRODUCT_PRINCIPLES.md
3. PRODUCT_DECISIONS.md
4. REPRESENTATION_MODEL.md
5. RECIPES.md
6. PRIVATE_BETA_USER_EXPERIENCE.md
7. PLATFORM_EVOLUTION.md
8. VALIDATION_STRATEGY.md

## Maintenance
- Keep documents concise and searchable.
- One concept has one canonical home.
- Product decisions describe what the product must do, not how it is implemented.
- Prefer consolidation of existing knowledge over new documents.
- Builder and Architect must read this folder before product-facing work.
- Markdown must pass `git diff --check` with no trailing whitespace.
