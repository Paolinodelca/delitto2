# IMAGO — FHT-AR03 Live Knowledge Acquisition Purpose Planning Integration Resolution

## Status

ARCHITECTURE / PRODUCT AUTHORITY REVIEW

## Verdict

**C — PRODUCT AUTHORITY DECISION REQUIRED**

First Human Test gate remains **CLOSED**.

---

## Purpose

FHT-AR03 reviewed repository-first the minimum production boundary required to bootstrap canonical Knowledge Acquisition purposes before the live Private Beta Interview Runtime.

The review followed the blocker identified by FHT-AI01:

the repository contained the canonical downstream Knowledge Acquisition execution chain, but the live `/private-beta` journey did not yet possess production acquisition purposes from which Runtime semantic authority could derive.

No implementation was authorized in this task.

---

## 1. Production chain audit

Canonical contracts exist for:

`PersonKnowledgeMatrix`
→ `KnowledgeCoverage`
→ `KnowledgeOpportunity`
→ `KnowledgeAcquisitionNeed`
→ `KnowledgeAcquisitionStrategy`
→ `KnowledgeAcquisitionRequirement`
→ `KnowledgeAcquisitionDesign`
→ `KnowledgeAcquisitionSolutionDecision`
→ `KnowledgeAcquisitionCapabilityConfiguration`
→ `KnowledgeAcquisitionPlan`
→ `KnowledgeAcquisitionRuntimeSession`
→ `KnowledgeAcquisitionExecution`.

However, the production Private Beta journey did not execute the upstream acquisition-purpose sequence:

`Opportunity → Need → Strategy → Requirement → Design`.

Those builders/evaluators existed in Core and deterministic tests/fixtures, but no production acquisition-purpose planner consumed them before the interview.

---

## 2. Existing pre-interview person state

Before interview Runtime, the Private Beta journey possessed application-level artifacts including:

- CV;
- optional person-owned narrative;
- CandidateProfile;
- RoleProfile;
- JobFit;
- pre-interview understanding.

These artifacts were not canonical Person Knowledge.

The repository did not authorize promoting CandidateProfile, JobFit, CV summaries, or free-form application projections into PersonKnowledgeMatrix merely to bootstrap Knowledge Acquisition.

Canonical PersonKnowledgeMatrix was produced only after authorized Evidence interpretation in existing semantic Knowledge paths.

---

## 3. Bootstrap gap

Existing `KnowledgeCoverage` described dimensions already represented by PersonKnowledgeMatrix.

Existing `KnowledgeOpportunity` evaluation supported incomplete states of known dimensions, but did not canonically express:

`legitimate Knowledge Goal`
+
`dimension completely unobserved`
→ `acquisition opportunity`.

Therefore an empty PersonKnowledgeMatrix could not by itself produce acquisition opportunities for:

- `decision_accountability`;
- `quantified_outcome`.

Absence of canonical Person Knowledge could not be reinterpreted as weakness, absence, or deficit.

A separate legitimate acquisition-goal authority was required.

---

## 4. Downstream acquisition readiness

Once a valid KnowledgeOpportunity exists, the repository already provides deterministic lineage through:

`Opportunity`
→ `Need`
→ `Strategy`
→ `Requirement`.

The principal unresolved boundary was therefore the authorization of the initial professional Knowledge goals for dimensions not yet represented in PersonKnowledgeMatrix.

---

## 5. Semantic Design authority

The repository already recognizes the authorized semantic policy/dimension pairs:

`decision_accountability`
→ `professional_semantic_policy:decision_accountability:v1`

and:

`quantified_outcome`
→ `professional_semantic_policy:quantified_outcome:v1`.

However, `KnowledgeAcquisitionDesign` receives `semanticPolicyRef` as an input.

Validator acceptance of a policy/dimension pair does not itself constitute production planning authority to decide that the corresponding Knowledge dimension should be acquired for a person/session.

---

## 6. Decision Accountability planning

Existing Product Authority, including PD-034, supports the principle that target importance combined with insufficient Person Knowledge may prioritize acquisition without manufacturing a person deficit.

However, the repository lacked the bootstrap representation needed when the dimension was entirely unobserved and absent from PersonKnowledgeMatrix.

---

## 7. Quantified Outcome planning

`OBS-010 — Quantified outcomes` and FHT-PA01 authorize the semantic meaning and execution policy for Quantified Outcome.

They do not independently establish:

“Quantified Outcome must be an acquisition goal in this session.”

Deriving that goal directly from target wording such as KPI or continuous improvement would introduce a new target → professional Knowledge-purpose mapping not already canonically authorized.

---

## 8. Multiple purposes

The architecture can support:

`one session`
→ multiple independent `KnowledgeAcquisitionDesign`s.

But the list of legitimate acquisition purposes must be established upstream before Runtime.

Runtime must not generate this list from question wording, expectedSignals, future answer text, numbers, percentages, keywords, or post-answer classification.

---

## 9. Missing Product Authority

The unresolved Product Authority question was:

> How is the set of professional Knowledge dimensions that IMAGO is authorized to attempt to acquire determined before acquisition, independently from future answers, when those dimensions are not yet present in PersonKnowledgeMatrix?

The minimum alternatives identified were:

1. target-authorized goals;
2. bounded product/session-purpose goals;
3. a combination in which product/session purpose defines the authorized goal space and target may select or prioritize already-authorized goals without creating Person Knowledge.

The review identified option 3 as the minimum direction most consistent with existing product principles, but did not authorize it autonomously.

---

## 10. Required next authority

Exactly one next task was identified:

**FHT-PD01 — Professional Knowledge Acquisition Goal Bootstrap Authority**

Its exclusive responsibility:

define the Product Authority governing legitimate professional Knowledge acquisition goals before Runtime, without introducing a general professional taxonomy or autonomous universal planner.

FHT-AP01 was not authorized by FHT-AR03 until that Product Authority decision existed.

---

## Repository effect

No implementation files were modified.

No tests were modified.

No overlay was produced.

No commit or push was performed.

FHT-AR03 is a review/authority-resolution artifact only.