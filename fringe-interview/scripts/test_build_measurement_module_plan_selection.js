const fs = require("fs");
const path = require("path");
const Module = require("module");

const {
  buildExecutionThroughOthersMeasurementSpec,
} = require("../tools/imago-builder/fixtures/executionThroughOthers.measurement.spec");

const {
  buildMeasurementTemplateContext,
} = require("../tools/imago-builder/plugins/measurement-module/buildMeasurementTemplateContext");

const {
  buildMeasurementModulePlan,
} = require("../tools/imago-builder/plugins/measurement-module/buildMeasurementModulePlan");

const failures = [];

function expect(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function loadPrivateHelpers() {
  const filename = path.resolve(
    __dirname,
    "../tools/imago-builder/plugins/measurement-module/buildMeasurementModulePlan.js"
  );

  const source = fs.readFileSync(
    filename,
    "utf8"
  );

  const instrumentedSource = [
    source,
    "",
    "module.exports.__private = {",
    "  TEMPLATE_REGISTRY,",
    "  selectMeasurementTemplates,",
    "  buildMeasurementExtendedContext,",
    "  buildIndexImportExportBlocks,",
    "};",
  ].join("\n");

  const privateModule =
    new Module(
      filename,
      module
    );

  privateModule.filename =
    filename;

  privateModule.paths =
    Module._nodeModulePaths(
      path.dirname(filename)
    );

  privateModule._compile(
    instrumentedSource,
    filename
  );

  return privateModule.exports.__private;
}

function allScalarOrString(object) {
  return Object.values(object).every(
    (value) =>
      value === null ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
  );
}

const privateHelpers =
  loadPrivateHelpers();

const spec =
  buildExecutionThroughOthersMeasurementSpec();

const specBefore =
  JSON.stringify(spec);

const baseContext =
  buildMeasurementTemplateContext({
    spec,
  });

const baseContextBefore =
  JSON.stringify(baseContext);

const registry =
  privateHelpers.TEMPLATE_REGISTRY;

const expectedArtifactOrder = [
  "observation_builder",
  "observation_validator",
  "measure_definition",
  "measure_result_builder",
  "measure_result_validator",
  "index",
  "health",
  "observation_test",
  "measure_result_test",
  "health_test",
  "regression_test",
  "manifest",
];

const expectedFlags = [
  "includeObservationBuilder",
  "includeObservationValidator",
  "includeMeasureDefinition",
  "includeMeasureResultBuilder",
  "includeMeasureResultValidator",
  "includeIndex",
  "includeHealth",
  "includeObservationTest",
  "includeMeasureResultTest",
  "includeHealthTest",
  "includeRegression",
  "includeManifest",
];

expect(
  registry.length === 12,
  "Registry must contain 12 artifacts."
);

expect(
  registry.map((entry) => entry.artifactType).join("|") ===
    expectedArtifactOrder.join("|"),
  "Registry artifact order is invalid."
);

expect(
  registry.map((entry) => entry.generationFlag).join("|") ===
    expectedFlags.join("|"),
  "Generation flag mapping is invalid."
);

registry.forEach((entry, index) => {
  expect(
    entry.template &&
      typeof entry.template.templateId === "string",
    `Registry template ${index} is missing.`
  );

  expect(
    typeof entry.buildRelativePath === "function",
    `Registry path builder ${index} is missing.`
  );
});

const selected =
  privateHelpers.selectMeasurementTemplates({
    spec,
  });

const expectedPaths = [
  "src/core/measurement/executionThroughOthers/buildExecutionThroughOthersObservation.js",
  "src/core/measurement/executionThroughOthers/validateExecutionThroughOthersObservation.js",
  "src/core/measurement/executionThroughOthers/buildExecutionThroughOthersMeasureDefinition.js",
  "src/core/measurement/executionThroughOthers/buildExecutionThroughOthersMeasureResult.js",
  "src/core/measurement/executionThroughOthers/validateExecutionThroughOthersMeasureResult.js",
  "src/core/measurement/executionThroughOthers/index.js",
  "src/core/measurement/executionThroughOthers/healthExecutionThroughOthers.js",
  "scripts/test_build_execution_through_others_observation.js",
  "scripts/test_build_execution_through_others_measure_result.js",
  "scripts/test_health_execution_through_others.js",
  "scripts/test_execution_through_others_regression.js",
  "src/core/measurement/executionThroughOthers/GENERATION_MANIFEST.json",
];

expect(
  selected.length === 12,
  "Complete fixture must select 12 artifacts."
);

expect(
  selected.map((entry) => entry.artifactType).join("|") ===
    expectedArtifactOrder.join("|"),
  "Selected artifact order is invalid."
);

expect(
  selected.map((entry) => entry.relativePath).join("|") ===
    expectedPaths.join("|"),
  "Generated artifact paths are invalid."
);

expect(
  selected[selected.length - 1].artifactType === "manifest",
  "Manifest must be the final selected artifact."
);

const extendedContext =
  privateHelpers.buildMeasurementExtendedContext({
    spec,
    baseContext,
  });

expect(
  allScalarOrString(extendedContext),
  "Extended context must contain only scalar or string values."
);

[
  "LABEL_JSON",
  "DESCRIPTION_JSON",
  "GENERATOR_ID_JSON",
  "GENERATOR_VERSION_JSON",
  "MEASURE_ID_JSON",
  "MODULE_DIRECTORY_JSON",
  "SPEC_VERSION_JSON",
  "IMPLEMENTATION_STATUS_JSON",
  "FACTOR_IDS_JSON",
  "FACTOR_WEIGHTS_JSON",
  "THRESHOLDS_JSON",
  "BENCHMARK_REFERENCE_JSON",
  "INFERENCE_SUPPORT_FIELDS_JSON",
  "INFERENCE_SUPPORT_WEIGHTS_JSON",
  "GENERATION_FLAGS_JSON",
  "PROVENANCE_JSON",
  "GENERATED_FILES_JSON",
  "GENERATED_AT_JSON",
].forEach((key) => {
  try {
    JSON.parse(extendedContext[key]);
  } catch (error) {
    failures.push(`${key} is not valid JSON: ${error.message}`);
  }
});

expect(
  extendedContext.GENERATED_FILES_JSON === "[]",
  "GENERATED_FILES_JSON must be an empty JSON array in 0098D-2."
);

expect(
  extendedContext.GENERATED_AT_JSON === "null",
  "GENERATED_AT_JSON must be null in 0098D-2."
);

const expectedExports = [
  "buildExecutionThroughOthersObservation",
  "validateExecutionThroughOthersObservation",
  "buildExecutionThroughOthersMeasureDefinition",
  "buildExecutionThroughOthersMeasureResult",
  "validateExecutionThroughOthersMeasureResult",
  "healthExecutionThroughOthersMeasurement",
];

expectedExports.forEach((exportName) => {
  expect(
    extendedContext.IMPORT_LINES.includes(exportName),
    `IMPORT_LINES missing ${exportName}.`
  );

  expect(
    extendedContext.EXPORT_LINES.includes(exportName),
    `EXPORT_LINES missing ${exportName}.`
  );
});

expect(
  !extendedContext.IMPORT_LINES.includes("test_"),
  "Index imports must not include tests."
);

expect(
  !extendedContext.EXPORT_LINES.includes("GENERATION_MANIFEST"),
  "Index exports must not include manifest."
);

const reducedSpec =
  JSON.parse(
    JSON.stringify(spec)
  );

reducedSpec.generation.includeHealth = false;
reducedSpec.generation.includeHealthTest = false;

const reducedSelected =
  privateHelpers.selectMeasurementTemplates({
    spec: reducedSpec,
  });

const reducedContext =
  privateHelpers.buildMeasurementExtendedContext({
    spec: reducedSpec,
    baseContext:
      buildMeasurementTemplateContext({
        spec: reducedSpec,
      }),
  });

expect(
  reducedSelected.length === 10,
  "Reduced selection must contain 10 artifacts."
);

expect(
  !reducedSelected.some(
    (entry) =>
      entry.artifactType === "health" ||
      entry.artifactType === "health_test"
  ),
  "Disabled health artifacts must not be selected."
);

expect(
  reducedSelected[reducedSelected.length - 1].artifactType === "manifest",
  "Manifest must remain last in reduced selection."
);

expect(
  !reducedContext.IMPORT_LINES.includes("healthExecutionThroughOthers"),
  "Reduced imports must not contain health."
);

expect(
  !reducedContext.EXPORT_LINES.includes("healthExecutionThroughOthers"),
  "Reduced exports must not contain health."
);

const secondSelected =
  privateHelpers.selectMeasurementTemplates({
    spec,
  });

const secondContext =
  privateHelpers.buildMeasurementExtendedContext({
    spec,
    baseContext,
  });

expect(
  JSON.stringify(selected) === JSON.stringify(secondSelected),
  "Template selection must be deterministic."
);

expect(
  JSON.stringify(extendedContext) === JSON.stringify(secondContext),
  "Extended context must be deterministic."
);

expect(
  JSON.stringify(spec) === specBefore,
  "Spec was mutated."
);

expect(
  JSON.stringify(baseContext) === baseContextBefore,
  "Base context was mutated."
);

const targetRoot =
  "tmp/non-written-measurement-selection";

if (fs.existsSync(targetRoot)) {
  fs.rmSync(targetRoot, {
    recursive: true,
    force: true,
  });
}

const foundationPlan =
  buildMeasurementModulePlan({
    spec,
    targetRoot,
  });

expect(
  foundationPlan.planStatus === "ready",
  "0098D-3 must expose a complete ready plan."
);

expect(
  foundationPlan.files.length === 12,
  "0098D-3 must expose all rendered files."
);

expect(
  !fs.existsSync(targetRoot),
  "Orchestrator must not create filesystem paths."
);

console.log(
  JSON.stringify(
    {
      test:
        "Measurement Module Registry and Extended Context",

      status:
        failures.length === 0
          ? "PASS"
          : "FAIL",

      registryArtifacts:
        registry.map(
          (entry) => ({
            artifactType:
              entry.artifactType,
            generationFlag:
              entry.generationFlag,
            templateId:
              entry.template.templateId,
          })
        ),

      selectedPaths:
        selected.map(
          (entry) =>
            entry.relativePath
        ),

      reducedArtifactCount:
        reducedSelected.length,

      extendedContextKeys:
        Object.keys(extendedContext),
    },
    null,
    2
  )
);

if (failures.length > 0) {
  console.error(
    "Measurement Module Registry and Extended Context Test: FAIL"
  );

  console.error(
    JSON.stringify(
      failures,
      null,
      2
    )
  );

  process.exit(1);
}

console.log(
  "Measurement Module Registry and Extended Context Test: PASS"
);
