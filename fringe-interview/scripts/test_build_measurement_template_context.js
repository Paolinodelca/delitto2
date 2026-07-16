const {
  buildExecutionThroughOthersMeasurementSpec,
} = require("../tools/imago-builder/fixtures/executionThroughOthers.measurement.spec");

const {
  validateMeasurementModuleSpec,
} = require("../tools/imago-builder/plugins/measurement-module/validateMeasurementModuleSpec");

const {
  buildMeasurementTemplateContext,
} = require("../tools/imago-builder/plugins/measurement-module/buildMeasurementTemplateContext");

const failures = [];

function expect(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function isScalar(value) {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function assertJsonBlock(value, label) {
  expect(
    typeof value === "string",
    `${label} must be a string.`
  );

  try {
    JSON.parse(value);
  } catch (error) {
    failures.push(`${label} must contain valid JSON: ${error.message}`);
  }
}

const spec = buildExecutionThroughOthersMeasurementSpec();
const validation = validateMeasurementModuleSpec(spec);
const specBefore = JSON.stringify(spec);
const context = buildMeasurementTemplateContext({ spec });

expect(validation.isValid === true, `spec validation: ${validation.errors.join("; ")}`);
expect(context.contextStatus === "ready", "contextStatus");
expect(context.measureId === "execution_through_others", "measureId");
expect(context.factorCount === 4, "factorCount");
expect(
  context.implementationStatus === "configuration_required",
  "implementationStatus"
);

Object.entries(context).forEach(([key, value]) => {
  if (["metadata", "warnings", "errors"].includes(key)) {
    return;
  }

  expect(isScalar(value), `${key} must be scalar.`);
});

[
  "factorIdsJson",
  "factorWeightsJson",
  "thresholdsJson",
  "benchmarkReferenceJson",
  "inferenceSupportFieldsJson",
  "inferenceSupportWeightsJson",
  "generationFlagsJson",
  "provenanceJson",
].forEach((key) => assertJsonBlock(context[key], key));

[
  "factorDefaultFields",
  "factorValidationLines",
  "factorDefinitionEntries",
  "factorComponentInitializers",
  "factorExportLines",
].forEach((key) => {
  expect(typeof context[key] === "string", `${key} must be a string.`);
});

const factorIds = JSON.parse(context.factorIdsJson);
expect(
  JSON.stringify(factorIds) ===
    JSON.stringify([
      "delegatedExecutionScope",
      "collectiveDeliveryEvidence",
      "managerialLayerUse",
      "personalInterventionDependence",
    ]),
  "factor order must be preserved."
);

const weights = JSON.parse(context.factorWeightsJson);
expect(
  Object.keys(weights).join("|") === factorIds.join("|"),
  "factor weight order must be preserved."
);

expect(
  context.factorDefinitionEntries.includes(
    'direction:\n    "inverse"'
  ),
  "inverse direction must be preserved."
);

expect(
  context.factorDefinitionEntries.includes(
    'scoringStatus:\n    "configuration_required"'
  ),
  "configuration_required scoring status must be explicit."
);

expect(
  context.factorDefinitionEntries.includes("scoringMap:\n    {},"),
  "empty scoringMap must be preserved."
);

expect(
  !context.factorDefinitionEntries.includes("scoringMap: {\n      none:"),
  "no scoring must be invented."
);

expect(
  context.factorDefaultFields.indexOf("delegatedExecutionScope") <
    context.factorDefaultFields.indexOf("collectiveDeliveryEvidence") &&
    context.factorDefaultFields.indexOf("collectiveDeliveryEvidence") <
      context.factorDefaultFields.indexOf("managerialLayerUse") &&
    context.factorDefaultFields.indexOf("managerialLayerUse") <
      context.factorDefaultFields.indexOf("personalInterventionDependence"),
  "factor block order must be preserved."
);

expect(
  context.factorValidationLines.includes(
    "ALLOWED_PERSONAL_INTERVENTION_DEPENDENCE"
  ),
  "validation naming must derive from observationField."
);

expect(
  context.factorComponentInitializers ===
    [
      "delegatedExecutionScopeScore: 0,",
      "collectiveDeliveryEvidenceScore: 0,",
      "managerialLayerUseScore: 0,",
      "personalInterventionDependenceScore: 0,",
    ].join("\n"),
  "factor component initializers."
);

expect(context.factorExportLines === "", "factorExportLines must remain empty.");
expect(JSON.stringify(spec) === specBefore, "spec must not be mutated.");

const secondContext = buildMeasurementTemplateContext({ spec });
expect(
  JSON.stringify(context) === JSON.stringify(secondContext),
  "context must be deterministic."
);

const invalidSpec = {
  ...spec,
  measureId: "Invalid Measure Id",
};

const invalidContext = buildMeasurementTemplateContext({ spec: invalidSpec });
expect(invalidContext.contextStatus === "invalid", "invalid context status");
expect(invalidContext.measureId === null, "invalid scalar fallback");
expect(invalidContext.factorDefaultFields === "", "invalid block fallback");
expect(invalidContext.errors.length > 0, "invalid errors copied");

console.log(
  JSON.stringify(
    {
      test: "Measurement Template Context",
      status: failures.length === 0 ? "PASS" : "FAIL",
      contextStatus: context.contextStatus,
      measureId: context.measureId,
      factorCount: context.factorCount,
      implementationStatus: context.implementationStatus,
      factorIds,
      validation,
    },
    null,
    2
  )
);

if (failures.length > 0) {
  console.error("Measurement Template Context Test: FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log("Measurement Template Context Test: PASS");
