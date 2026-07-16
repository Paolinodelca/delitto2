const {
  buildMeasurementModuleSpec,
  buildMeasurementModuleNaming,
  validateMeasurementModuleSpec,
} = require("../tools/imago-builder");

const {
  buildExecutionThroughOthersMeasurementSpec,
} = require("../tools/imago-builder/fixtures/executionThroughOthers.measurement.spec");

const failures = [];

function expect(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function sanitizeCreatedAt(spec) {
  return {
    ...spec,
    metadata: {
      ...spec.metadata,
      createdAt: null,
    },
  };
}

/* Scenario A */
const fixture = buildExecutionThroughOthersMeasurementSpec();
const fixtureValidation = validateMeasurementModuleSpec(fixture);

expect(fixtureValidation.isValid === true, `A: ${fixtureValidation.errors.join("; ")}`);
expect(fixture.measureId === "execution_through_others", "A: measureId");
expect(fixture.factors.length === 4, "A: factors length");
expect(fixture.specStatus === "configuration_required", "A: specStatus");
expect(fixture.semanticCompletion.readyForGeneration === true, "A: readyForGeneration");
expect(fixture.semanticCompletion.scoringConfigured === false, "A: scoringConfigured");
expect(fixture.semanticCompletion.explainabilityConfigured === false, "A: explainabilityConfigured");
expect(fixture.semanticCompletion.benchmarkConfigured === false, "A: benchmarkConfigured");

/* Scenario B */
const naming = buildMeasurementModuleNaming({
  measureId: "execution_through_others",
});

expect(naming.moduleDirectory === "executionThroughOthers", "B: moduleDirectory");
expect(naming.pascalName === "ExecutionThroughOthers", "B: pascalName");
expect(naming.camelName === "executionThroughOthers", "B: camelName");
expect(naming.snakeName === "execution_through_others", "B: snakeName");
expect(naming.constantName === "EXECUTION_THROUGH_OTHERS", "B: constantName");

/* Scenario C */
const minimal = buildMeasurementModuleSpec({
  measureId: "minimal_measure",
  label: "Minimal Measure",
  description: "Minimal measurement specification.",
  factors: [
    {
      factorId: "sampleFactor",
      label: "Sample Factor",
      allowedValues: ["none", "present"],
      defaultValue: "none",
      weight: 1,
    },
  ],
});

const minimalValidation = validateMeasurementModuleSpec(minimal);

expect(minimalValidation.isValid === true, `C: ${minimalValidation.errors.join("; ")}`);
expect(Object.values(minimal.generation).every((value) => value === true), "C: generation defaults");
expect(minimal.thresholds.weak === 0.3, "C: weak");
expect(minimal.thresholds.moderate === 0.5, "C: moderate");
expect(minimal.thresholds.strong === 0.7, "C: strong");
expect(minimal.thresholds.veryStrong === 0.85, "C: veryStrong");
expect(minimal.inferenceSupport.fields.length === 4, "C: inference fields");
expect(minimal.observation.contextEnabled === true, "C: contextEnabled");
expect(minimal.observation.evidenceIdsEnabled === true, "C: evidenceIdsEnabled");
expect(minimal.observation.limitationsEnabled === true, "C: limitationsEnabled");
expect(minimal.provenance.status === "hypothesis", "C: provenance");
expect(minimal.specStatus === "configuration_required", "C: status");

/* Scenario D */
const ready = buildMeasurementModuleSpec({
  measureId: "ready_measure",
  label: "Ready Measure",
  description: "Fully configured measurement specification.",
  factors: [
    {
      factorId: "sampleFactor",
      label: "Sample Factor",
      allowedValues: ["none", "present"],
      defaultValue: "none",
      weight: 1,
      scoringStatus: "configured",
      scoringMap: {
        none: 0,
        present: 1,
      },
    },
  ],
  benchmarkReference: {
    sampleFactor: "present",
  },
  extensions: {
    explainabilityConfiguration: {
      strategy: "component_notes",
    },
  },
});

const readyValidation = validateMeasurementModuleSpec(ready);

expect(readyValidation.isValid === true, `D: ${readyValidation.errors.join("; ")}`);
expect(ready.specStatus === "ready", "D: status");
expect(ready.semanticCompletion.scoringConfigured === true, "D: scoring");
expect(ready.semanticCompletion.explainabilityConfigured === true, "D: explainability");
expect(ready.semanticCompletion.benchmarkConfigured === true, "D: benchmark");
expect(ready.semanticCompletion.readyForGeneration === true, "D: readyForGeneration");
expect(ready.semanticCompletion.missingItems.length === 0, "D: missingItems");

/* Scenario E */
const immutableInput = {
  measureId: "immutable_measure",
  label: "Immutable Measure",
  description: "Immutability test.",
  factors: [
    {
      factorId: "sampleFactor",
      label: "Sample Factor",
      allowedValues: ["none", "present"],
      defaultValue: "none",
      weight: 1,
      metadata: {
        source: "test",
      },
    },
  ],
  metadata: {
    domain: "test",
  },
};
const immutableSnapshot = JSON.stringify(immutableInput);
buildMeasurementModuleSpec(immutableInput);
expect(JSON.stringify(immutableInput) === immutableSnapshot, "E: input mutated");

/* Scenario F */
const first = buildExecutionThroughOthersMeasurementSpec();
const second = buildExecutionThroughOthersMeasurementSpec();
expect(
  JSON.stringify(sanitizeCreatedAt(first)) === JSON.stringify(sanitizeCreatedAt(second)),
  "F: deterministic output"
);

console.log(JSON.stringify({
  test: "Measurement Module Spec Builder",
  status: failures.length === 0 ? "PASS" : "FAIL",
  fixtureStatus: fixture.specStatus,
  naming: fixture.naming,
  semanticCompletion: fixture.semanticCompletion,
  validation: fixtureValidation,
}, null, 2));

if (failures.length > 0) {
  console.error("Measurement Module Spec Builder Test: FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log("Measurement Module Spec Builder Test: PASS");
