const {
  buildDecisionAccountabilityObservation,
} = require("../src/core/measurement/decisionAccountability/buildDecisionAccountabilityObservation");

const {
  buildDecisionAccountabilityMeasureDefinition,
} = require("../src/core/measurement/decisionAccountability/buildDecisionAccountabilityMeasureDefinition");

const {
  buildDecisionAccountabilityMeasureResult,
} = require("../src/core/measurement/decisionAccountability/buildDecisionAccountabilityMeasureResult");

const {
  validateDecisionAccountabilityMeasureResult,
} = require("../src/core/measurement/decisionAccountability/validateDecisionAccountabilityMeasureResult");

const {
  validateMeasurementDefinition,
} = require("../src/core/measurement/validateMeasurementDefinition");

const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

function sanitizeCreatedAt(value) {
  if (Array.isArray(value)) return value.map(sanitizeCreatedAt);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [
        key,
        key === "createdAt" ? null : sanitizeCreatedAt(nested),
      ])
    );
  }
  return value;
}

function buildDemoObservation(overrides = {}) {
  return buildDecisionAccountabilityObservation({
    observationId: "decision_accountability_obs_demo_001",
    decisionAuthority: "final",
    consequenceScope: "site",
    accountabilityEvidence: "explicit_with_outcomes",
    responsibilityContinuityMonths: 30,
    context: {
      roleType: "plant_manager",
      decisionDomain: "industrial_operations",
      organizationType: "corporate_industrial",
    },
    evidenceIds: [
      "ev_decision_accountability_demo_01",
      "ev_decision_accountability_demo_02",
    ],
    inferenceSupportInputs: {
      evidenceQuality: 0.9,
      sourceConvergence: 0.85,
      consistency: 0.9,
      coverage: 0.8,
    },
    limitations: [],
    metadata: { sourceMode: "manual_demo_configuration" },
    extensions: {},
    ...overrides,
  });
}

const definition = buildDecisionAccountabilityMeasureDefinition();
const definitionValidation = validateMeasurementDefinition(definition);
expect(definitionValidation.isValid === true, `Definition: ${definitionValidation.errors.join("; ")}`);
expect(definition.dimensionId === "decision_accountability", "Definition: dimensionId");
expect(definition.aggregation.mode === "weighted_sum", "Definition: aggregation mode");
expect(Math.abs(Object.values(definition.aggregation.weights).reduce((a, b) => a + b, 0) - 1) < 0.0001, "Definition: weight total");

/* Scenario A/B/C */
const strongObservation = buildDemoObservation();
const strongResult = buildDecisionAccountabilityMeasureResult({
  observation: strongObservation,
  definition,
});
const strongValidation = validateDecisionAccountabilityMeasureResult(strongResult);

expect(strongValidation.isValid === true, `A: ${strongValidation.errors.join("; ")}`);
expect(strongResult.components.decisionAuthorityScore === 1, "A: decisionAuthorityScore");
expect(strongResult.components.consequenceScopeScore === 0.85, "A: consequenceScopeScore");
expect(strongResult.components.accountabilityEvidenceScore === 1, "A: accountabilityEvidenceScore");
expect(strongResult.components.responsibilityContinuityScore === 1, "A: continuity score");
expect(strongResult.score === 0.9625, `A: score ${strongResult.score}`);
expect(strongResult.band === "very_strong", "A: band");
expect(strongResult.resultStatus === "draft", "A: status");
expect(strongResult.inferenceSupport.value === 0.8675, `B: inference ${strongResult.inferenceSupport.value}`);
expect(strongResult.inferenceSupport.band === "very_high", "B: inference band");

[
  "Final decision authority was observed.",
  "Observed decisions affected a broad organizational scope.",
  "Decision responsibility was explicitly connected to observable outcomes.",
  "Observed responsibility continuity reached the configured benchmark.",
].forEach((note) => {
  expect(strongResult.explainability.notes.includes(note), `C: missing note ${note}`);
});
expect(strongResult.explainability.strongestComponent === "decisionAuthority", "C: strongest");
expect(strongResult.explainability.weakestComponent === "consequenceScope", "C: weakest");

/* Scenario D */
const weakObservation = buildDemoObservation({
  observationId: "decision_accountability_weak",
  decisionAuthority: "recommendation",
  consequenceScope: "team",
  accountabilityEvidence: "implicit",
  responsibilityContinuityMonths: 6,
});
const weakResult = buildDecisionAccountabilityMeasureResult({ observation: weakObservation, definition });
expect(weakResult.score < strongResult.score, "D: weak score");
expect(weakResult.band !== "very_strong", "D: weak band");

/* Scenario E */
const notObserved = buildDecisionAccountabilityObservation({
  observationId: "decision_accountability_not_observed",
});
const notObservedResult = buildDecisionAccountabilityMeasureResult({ observation: notObserved, definition });
const notObservedValidation = validateDecisionAccountabilityMeasureResult(notObservedResult);
expect(notObservedResult.resultStatus === "not_observed", "E: status");
expect(notObservedResult.score === 0, "E: score");
expect(notObservedResult.band === "not_supported", "E: band");
expect(notObservedValidation.isValid === true, `E: ${notObservedValidation.errors.join("; ")}`);
expect(notObservedResult.limitations.includes("Decision accountability was not observed."), "E: limitation");

/* Scenario F */
const lowInferenceObservation = buildDemoObservation({
  observationId: "decision_accountability_low_inference",
  inferenceSupportInputs: {
    evidenceQuality: 0.3,
    sourceConvergence: 0.3,
    consistency: 0.3,
    coverage: 0.3,
  },
});
const lowInferenceResult = buildDecisionAccountabilityMeasureResult({ observation: lowInferenceObservation, definition });
expect(lowInferenceResult.inferenceSupport.value === 0.3, "F: inference value");
expect(lowInferenceResult.inferenceSupport.band === "low", "F: inference band");
expect(lowInferenceResult.limitations.includes("Decision accountability result has limited inference support."), "F: limitation");
expect(lowInferenceResult.score === strongResult.score, "F: score must remain separate");

/* Scenario G */
const invalidObservation = { ...strongObservation };
delete invalidObservation.observationId;
const invalidResult = buildDecisionAccountabilityMeasureResult({ observation: invalidObservation, definition });
const invalidValidation = validateDecisionAccountabilityMeasureResult(invalidResult);
expect(invalidResult.resultStatus === "invalid", "G: status");
expect(invalidResult.limitations.includes("Decision accountability measure was built from invalid input."), "G: limitation");
expect(invalidValidation.isValid === false, "G: structural validation should flag missing observationId");

/* Scenario H */
const observationBefore = JSON.stringify(strongObservation);
const definitionBefore = JSON.stringify(definition);
buildDecisionAccountabilityMeasureResult({ observation: strongObservation, definition });
expect(JSON.stringify(strongObservation) === observationBefore, "H: observation mutated");
expect(JSON.stringify(definition) === definitionBefore, "H: definition mutated");

/* Scenario I */
const first = buildDecisionAccountabilityMeasureResult({ observation: buildDemoObservation(), definition: buildDecisionAccountabilityMeasureDefinition() });
const second = buildDecisionAccountabilityMeasureResult({ observation: buildDemoObservation(), definition: buildDecisionAccountabilityMeasureDefinition() });
expect(JSON.stringify(sanitizeCreatedAt(first)) === JSON.stringify(sanitizeCreatedAt(second)), "I: determinism");

console.log(JSON.stringify({
  test: "Decision Accountability Measure Result v0.1",
  status: failures.length === 0 ? "PASS" : "FAIL",
  definitionValidation,
  strongResult,
  strongValidation,
  weakResult: {
    score: weakResult.score,
    band: weakResult.band,
  },
  notObservedResult: {
    resultStatus: notObservedResult.resultStatus,
    score: notObservedResult.score,
    limitations: notObservedResult.limitations,
  },
  lowInferenceResult: {
    score: lowInferenceResult.score,
    inferenceSupport: lowInferenceResult.inferenceSupport,
  },
}, null, 2));

if (failures.length > 0) {
  console.error("Decision Accountability Measure Result Test: FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log("Decision Accountability Measure Result Test: PASS");
