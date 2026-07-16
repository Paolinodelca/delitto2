const {
  buildMeasurementModuleSpec,
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

function expectInvalid(spec, expectedText, scenario) {
  const validation = validateMeasurementModuleSpec(spec);

  expect(validation.isValid === false, `${scenario}: expected invalid`);
  expect(
    validation.errors.some((error) => error.includes(expectedText)),
    `${scenario}: expected error containing ${expectedText}; received ${validation.errors.join(" | ")}`
  );
}

const fixture = buildExecutionThroughOthersMeasurementSpec();
const fixtureValidation = validateMeasurementModuleSpec(fixture);
expect(fixtureValidation.isValid === true, `fixture: ${fixtureValidation.errors.join("; ")}`);

expectInvalid(
  buildMeasurementModuleSpec({
    measureId: "Invalid-Measure",
    label: "Invalid",
    description: "Invalid measure id.",
    factors: [{ factorId: "sampleFactor", label: "Sample", allowedValues: ["none", "present"], defaultValue: "none", weight: 1 }],
  }),
  "measureId",
  "measureId"
);

const namingIncoherent = buildExecutionThroughOthersMeasurementSpec();
namingIncoherent.naming.pascalName = "DifferentName";
expectInvalid(namingIncoherent, "canonical derivation", "naming");

const duplicateFactor = buildMeasurementModuleSpec({
  measureId: "duplicate_factor",
  label: "Duplicate Factor",
  description: "Duplicate factor test.",
  factors: [
    { factorId: "sameFactor", label: "First", observationField: "firstField", allowedValues: ["none", "present"], defaultValue: "none", weight: 0.5 },
    { factorId: "sameFactor", label: "Second", observationField: "secondField", allowedValues: ["none", "present"], defaultValue: "none", weight: 0.5 },
  ],
});
expectInvalid(duplicateFactor, "Duplicate factorId", "factor duplicate");

const duplicateObservation = buildMeasurementModuleSpec({
  measureId: "duplicate_observation",
  label: "Duplicate Observation",
  description: "Duplicate observation field test.",
  factors: [
    { factorId: "firstFactor", label: "First", observationField: "sameField", allowedValues: ["none", "present"], defaultValue: "none", weight: 0.5 },
    { factorId: "secondFactor", label: "Second", observationField: "sameField", allowedValues: ["none", "present"], defaultValue: "none", weight: 0.5 },
  ],
});
expectInvalid(duplicateObservation, "Duplicate observationField", "observation duplicate");

const invalidDefault = buildMeasurementModuleSpec({
  measureId: "invalid_default",
  label: "Invalid Default",
  description: "Invalid default test.",
  factors: [{ factorId: "sampleFactor", label: "Sample", allowedValues: ["none", "present"], defaultValue: "missing", weight: 1 }],
});
expectInvalid(invalidDefault, "defaultValue", "default value");

const incompleteConfigured = buildMeasurementModuleSpec({
  measureId: "incomplete_scoring",
  label: "Incomplete Scoring",
  description: "Incomplete scoring test.",
  factors: [{
    factorId: "sampleFactor",
    label: "Sample",
    allowedValues: ["none", "present"],
    defaultValue: "none",
    weight: 1,
    scoringStatus: "configured",
    scoringMap: { none: 0 },
  }],
});
expectInvalid(incompleteConfigured, "scoringMap", "scoring map");

const invalidWeights = buildMeasurementModuleSpec({
  measureId: "invalid_weights",
  label: "Invalid Weights",
  description: "Invalid factor weights.",
  factors: [
    { factorId: "firstFactor", label: "First", allowedValues: ["none", "present"], defaultValue: "none", weight: 0.4 },
    { factorId: "secondFactor", label: "Second", allowedValues: ["none", "present"], defaultValue: "none", weight: 0.4 },
  ],
});
expectInvalid(invalidWeights, "weights must sum to 1", "factor weights");

const invalidThresholds = buildExecutionThroughOthersMeasurementSpec();
invalidThresholds.thresholds.moderate = 0.9;
expectInvalid(invalidThresholds, "thresholds must satisfy", "thresholds");

const invalidInference = buildExecutionThroughOthersMeasurementSpec();
invalidInference.inferenceSupport.weights.coverage = 0.1;
expectInvalid(invalidInference, "weights must sum to 1", "inference weights");

const invalidZeroField = buildExecutionThroughOthersMeasurementSpec();
invalidZeroField.observation.notObservedPolicy.zeroFields.push("unknownField");
expectInvalid(invalidZeroField, "unknown field", "zero field");

const invalidGeneration = buildExecutionThroughOthersMeasurementSpec();
invalidGeneration.generation.includeObservationBuilder = false;
expectInvalid(invalidGeneration, "includeObservationValidator requires", "generation dependency");

const alteredSemantic = buildExecutionThroughOthersMeasurementSpec();
alteredSemantic.semanticCompletion.scoringConfigured = true;
expectInvalid(alteredSemantic, "semanticCompletion.scoringConfigured", "semantic completion");

const alteredStatus = buildExecutionThroughOthersMeasurementSpec();
alteredStatus.specStatus = "ready";
expectInvalid(alteredStatus, "specStatus must be", "spec status");

const circular = {};
circular.self = circular;
const nonSerializable = buildExecutionThroughOthersMeasurementSpec();
nonSerializable.benchmarkReference = circular;
expectInvalid(nonSerializable, "JSON-serializable", "benchmark circular");

expectInvalid(null, "must be an object", "root");

console.log(JSON.stringify({
  test: "Measurement Module Spec Validator",
  status: failures.length === 0 ? "PASS" : "FAIL",
  fixtureWarnings: fixtureValidation.warnings,
}, null, 2));

if (failures.length > 0) {
  console.error("Measurement Module Spec Validator Test: FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log("Measurement Module Spec Validator Test: PASS");
