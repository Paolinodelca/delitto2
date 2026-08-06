# PRODUCT_DECISIONS

**Status:** CANONICAL PRODUCT KNOWLEDGE

This document records long-lived product decisions that must survive
changes of Builder, Architect, roadmap or implementation.

## Decision template

### D-XXXX --- Title

**Status:** PROPOSED \| APPROVED \| SUPERSEDED

**Decision**

Short statement of the decision.

**Rationale**

Why this decision was taken.

**Consequences**

Main effects on product, architecture or implementation.

**Related documents**

Canonical documents affected.

------------------------------------------------------------------------

# Approved decisions

## D-0001 --- Representation Ownership

**Status:** APPROVED

**Decision**

The personal Representation (Professional Identity in the Interview
domain) always belongs to the represented person.

**Rationale**

Ownership, privacy and long-term trust require a single owner
independent of employers, tutors or platforms.

**Consequences**

-   The person creates or recovers the Representation.
-   The person grants and revokes access.
-   Ownership never transfers to tutors or organizations.

**Related documents**

-   PRODUCT_PRINCIPLES.md
-   DOMAIN_MODEL.md

------------------------------------------------------------------------

## D-0002 --- Tutor Access Model

**Status:** APPROVED

**Decision**

Tutors work through delegated permissions. They enter from an
independent workspace and can access only authorized Representations.

**Rationale**

Separates ownership from collaboration and simplifies privacy.

**Consequences**

-   Candidate and Tutor are different entry points.
-   Tutor sees only authorized candidates.
-   Permissions are explicit and revocable.

**Related documents**

-   DOMAIN_MODEL.md
-   PRIVATE_BETA_USER_EXPERIENCE.md

------------------------------------------------------------------------

## D-0003 --- Representation First

**Status:** APPROVED

**Decision**

The primary product asset is the Representation, not reports, CVs or
interview transcripts.

**Rationale**

Applications produce outputs from the Representation; outputs do not
redefine it.

**Consequences**

Reports, CVs, interview preparation and future applications become
different views over the same knowledge.

**Related documents**

-   PRODUCT_VISION.md
-   REPRESENTATION_MODEL.md

------------------------------------------------------------------------

## D-0004 --- Product-Led Sequencing

**Status:** APPROVED

**Decision**

Within an architecturally valid solution space, prioritize work that
creates observable user value for the current release.

**Rationale**

Avoid unnecessary hardening before the capability is consumed.

**Consequences**

Private Beta milestones focus on user experience before deferred Core
work (e.g. E-44).

**Related documents**

-   PRODUCT_PRINCIPLES.md
-   BETA_ROADMAP.md

------------------------------------------------------------------------

## D-0005 --- Knowledge Preservation

**Status:** APPROVED (subject to legal/privacy implementation)

**Decision**

After the identifiable lifecycle ends, personal data follow retention
and deletion rules. Aggregate knowledge may be retained only in lawful,
anonymized form.

**Rationale**

Aggregate learning is a strategic platform asset while respecting
privacy.

**Consequences**

-   Separate identifiable data from aggregate knowledge.
-   Design for future longitudinal analysis.
-   Final implementation requires legal validation.

**Related documents**

-   PLATFORM_EVOLUTION.md
-   REPRESENTATION_LIFECYCLE.md
