# IMAGO Dimension Recipes

## Purpose
Recipes define how explicit inputs contribute to derived or complex dimensions.

They are versioned product models, not timeless truths.

## Recipe rules
- A recipe has a stable identifier and explicit version.
- Multiple versions may coexist.
- No automatic "latest" selection is allowed.
- Inputs, component dimensions, mapping rules, weights and confidence logic are explicit.
- Missing or non-applicable inputs are handled explicitly.
- A result preserves recipe id, recipe version and source lineage.
- Recipe changes do not rewrite historical snapshots.
- Recipe calibration may evolve through validation.

## Complex dimensions
A complex dimension may combine multiple elementary or derived dimensions.

A recipe may define:
- required and optional components;
- contribution direction;
- weights;
- thresholds or transforms;
- minimum evidence/coverage conditions;
- confidence policy;
- non-applicable behaviour;
- perspective/context applicability.

Weights may change between recipe versions while historical results remain attributable to the version used.

## Perspective sensitivity
Interviewer style, role, seniority or organization may change the applicable interpretation recipe or its contextual parameters.

Perspective is not evidence and must not mutate stored knowledge.

## Measurement caution
Current numeric baselines are engineering models, not scientifically validated psychometric measures.

A dimension estimate must not be presented as an intrinsic person score.

## Validation
Recipe evolution should be driven by:
- synthetic controlled profiles;
- real-user evidence;
- consistency checks;
- unsupported-inference monitoring;
- target relevance;
- outcome correlation where lawful and methodologically justified.
