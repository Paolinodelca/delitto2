# IMAGO — FHT-DR02 FINAL REPRESENTATION SEMANTIC AUTHORITY AND INTERVIEW EVIDENCE INTEGRATION

## Status

**C — IMPLEMENTATION BLOCKED BY MISSING CANONICAL AUTHORITY**

Review/analysis only after the stop condition was reached. No implementation files were modified. No commit. No push.

## Repository-first dataflow

The current staged Beta path is:

`accepted Runtime answer`
→ `buildAcceptedRuntimeAnswerEvidenceStore`
→ optionally `runAcceptedRuntimeAnswerKnowledgeVerticalSlice`
→ Observation
→ Measurement
→ DimensionContribution
→ KnowledgeLedger / KnowledgeSnapshot
→ PersonKnowledgeMatrix / KnowledgeCoverage.

At interview completion, however, the user-visible path is separately:

`CandidateProfile + RoleProfile + sanitized JobFit + InterviewReport`
→ `buildFinalCandidateReport`
→ `buildProReportV2`
→ `buildProfessionalPerceptionSummary`
→ `buildRepresentationValueProofProjection`.

`runtimeAnswers` is passed into `buildProReportV2`, but `buildProfessionalPerceptionSummary` does not use it as semantic authority.

The staged Runtime stores only the latest optional `runtimeKnowledge` result and only when `knowledgeSemanticAuthority` and `knowledgeSubjectRef` are externally supplied. The normal staged preparation path has no repository-owned general professional semantic authority to supply there.

## Exact blocking authority gap

The generic accepted-answer vertical slice is deliberately non-interpretive. Repository continuity explicitly states that semantic construction / normalization / mapping authority **must be supplied explicitly** and that answer text must never be mapped directly to a dimension, PKM or Coverage.

The only current canonical production semantic policy found for professional Runtime evidence is the narrow:

`professional_semantic_policy:decision_accountability:v1`

Decision Accountability vertical slice.

That authority cannot legitimately be generalized to:

- cross-functional coordination;
- implementation responsibility;
- measurable result;
- investment-project autonomy;
- people leadership;
- capacity planning;
- arbitrary Professional Perception supporting signals.

Doing so inside FHT-DR02 would invent exactly the new semantic interpretation/authority that the task's stop condition forbids.

Moreover, existing Knowledge structures preserve dimension/measurement provenance but do not provide a canonical general-purpose person-claim narrative authority from which the final Professional Perception can safely derive the controlled case's required semantic claims.

## Why a partial downstream fix is not sufficient

It would be technically possible to harden some final projection mechanics independently, for example:

- filter target relation against explicit RoleProfile requirements;
- stop uncertainty items from populating `supportingEvidence`;
- suppress known legacy Professional Perception signals.

But FHT-DR02 requires all four failures to converge on an authoritative final Representation boundary, including **observable enrichment from current-session canonical Knowledge**.

Implementing only the filtering portions while current-session Knowledge cannot canonically authorize the required professional semantic material would create a partial solution and falsely imply that the central blocker is closed.

Raw `runtimeAnswers`, lexical matching, JobFit/CV-advice reuse, or a new summarization prompt are not acceptable substitutes for missing authority.

## Person-claim amplification finding

The current projection consumes already-derived Professional Perception `visibleSignals` as supporting evidence. It does not possess source-level semantic authority capable of proving that a stronger downstream person claim is entailed by the person's authoritative source/current-session Knowledge.

Therefore the controlled regression:

`support to investment projects`
≠
`autonomous investment project management`

cannot be enforced generally without either:

1. an existing canonical person-claim semantic authority that the repository does not currently expose at this boundary; or
2. phrase/domain-specific filtering, which the task explicitly forbids as the implementation mechanism.

## Target-authority / slot findings

The repository also confirms two deterministic projection defects:

- `target_relation` currently constructs evidence from `[...]gaps, ...under`, without requiring canonical RoleProfile requirement membership;
- uncertainty/under-visible material can therefore be used as `supportingEvidence` and repeated as uncertainty/target relation.

These are real defects, but correcting them alone does not satisfy FHT-DR02 because the required authoritative interview-evidence integration remains unavailable.

## Stop-condition decision

The task requires stopping if correct integration requires a new semantic authority, new semantic interpretation engine, or new Representation authority.

That condition is met.

The missing boundary is:

**canonical professional semantic authority from accepted current-session Evidence/Knowledge to claim-level Professional Perception semantics beyond the existing Decision Accountability slice.**

FHT-DR02 must not invent it.

## Verification status

No implementation was made, so implementation regressions were not added and no live verification is claimed.

Existing FHT-03 protections in the supplied repository remain untouched.

## Deliverable / overlay

`FHT-DR02_OVERLAY.zip` is intentionally empty because the stop condition was reached before any implementation/test file modification.

`TASK_FHT-DR02_MANIFEST.txt` is correspondingly empty, exactly matching the overlay implementation/test contents.
