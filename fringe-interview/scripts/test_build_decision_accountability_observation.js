const {
  buildDecisionAccountabilityObservation,
} = require("../src/core/measurement/decisionAccountability/buildDecisionAccountabilityObservation");

const {
  validateDecisionAccountabilityObservation,
} = require("../src/core/measurement/decisionAccountability/validateDecisionAccountabilityObservation");

const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

const demoInput = {
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
  metadata: {
    sourceMode: "manual_demo_configuration",
  },
  extensions: {},
};

/* Scenario A */
const complete = buildDecisionAccountabilityObservation(demoInput);
const completeValidation = validateDecisionAccountabilityObservation(complete);

expect(completeValidation.isValid === true, `A: ${completeValidation.errors.join("; ")}`);
expect(complete.observationType === "decision_accountability", "A: observationType");
expect(complete.observationStatus === "observed", "A: observationStatus");
expect(complete.decisionAuthority === "final", "A: decisionAuthority");
expect(complete.consequenceScope === "site", "A: consequenceScope");
expect(complete.accountabilityEvidence === "explicit_with_outcomes", "A: accountabilityEvidence");
expect(complete.responsibilityContinuityMonths === 30, "A: continuity");
expect(complete.evidenceIds.length === 2, "A: evidenceIds");

/* Scenario B */
const normalized = buildDecisionAccountabilityObservation({
  observationId: "decision_accountability_normalized",
  decisionAuthority: "invalid",
  consequenceScope: "invalid",
  accountabilityEvidence: "invalid",
  responsibilityContinuityMonths: -4,
  evidenceIds: ["ev_01", "ev_01", "", null],
  inferenceSupportInputs: {
    evidenceQuality: 2,
    sourceConvergence: -1,
    consistency: "high",
    coverage: null,
  },
});

expect(normalized.decisionAuthority === "none", "B: decisionAuthority");
expect(normalized.consequenceScope === "individual_task", "B: consequenceScope");
expect(normalized.accountabilityEvidence === "claimed", "B: accountabilityEvidence");
expect(normalized.responsibilityContinuityMonths === 0, "B: continuity");
expect(normalized.evidenceIds.length === 1, "B: evidence dedup");
expect(normalized.inferenceSupportInputs.evidenceQuality === 1, "B: evidenceQuality clamp");
expect(normalized.inferenceSupportInputs.sourceConvergence === 0, "B: sourceConvergence clamp");

/* Scenario C */
const notObserved = buildDecisionAccountabilityObservation({
  observationId: "decision_accountability_not_observed",
});
const notObservedValidation = validateDecisionAccountabilityObservation(notObserved);

expect(notObserved.observationStatus === "not_observed", "C: status");
expect(notObservedValidation.isValid === true, `C: ${notObservedValidation.errors.join("; ")}`);
expect(notObservedValidation.warnings.length > 0, "C: warnings");

/* Scenario D */
const missingId = buildDecisionAccountabilityObservation({});
const missingIdValidation = validateDecisionAccountabilityObservation(missingId);

expect(missingId.observationId === null, "D: observationId");
expect(missingIdValidation.isValid === false, "D: validation");
expect(missingIdValidation.errors.some((error) => error.includes("observationId")), "D: observationId error");

/* Scenario E */
const immutableInput = JSON.parse(JSON.stringify(demoInput));
const immutableBefore = JSON.stringify(immutableInput);
buildDecisionAccountabilityObservation(immutableInput);
expect(JSON.stringify(immutableInput) === immutableBefore, "E: input mutated");

console.log(JSON.stringify({
  test: "Decision Accountability Observation v0.1",
  status: failures.length === 0 ? "PASS" : "FAIL",
  complete,
  completeValidation,
  notObserved: {
    observationStatus: notObserved.observationStatus,
    warnings: notObservedValidation.warnings,
  },
}, null, 2));

if (failures.length > 0) {
  console.error("Decision Accountability Observation Test: FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log("Decision Accountability Observation Test: PASS");
