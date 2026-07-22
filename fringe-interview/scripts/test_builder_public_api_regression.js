const builder = require("../tools/imago-builder");
const measurementModule = require(
  "../tools/imago-builder/plugins/measurement-module"
);

const expectedPublicApi = [
  "buildGeneratedFileEntry",
  "buildGenerationFileWriteResult",
  "buildGenerationPlan",
  "buildGenerationWritePreflight",
  "buildGenerationWriteReport",
  "buildMeasurementModuleNaming",
  "buildMeasurementModulePlan",
  "buildMeasurementModuleSpec",
  "buildMeasurementTemplateContext",
  "generateMeasurementModuleScaffold",
  "renderTemplate",
  "validateGenerationFileWriteResult",
  "validateGenerationPlan",
  "validateGenerationWritePreflight",
  "validateGenerationWriteReport",
  "validateMeasurementModuleSpec",
  "validateTemplateDefinition",
  "writeGenerationPlan",
].sort();

const actualPublicApi = Object.keys(builder).sort();

const expectedMeasurementModuleApi = [
  "buildMeasurementModuleNaming",
  "buildMeasurementModulePlan",
  "buildMeasurementModuleSpec",
  "buildMeasurementTemplateContext",
  "generateMeasurementModuleScaffold",
  "validateMeasurementModuleSpec",
].sort();

const actualMeasurementModuleApi =
  Object.keys(measurementModule).sort();

const forbiddenPublicApi = [
  "buildMeasurementModuleGenerationResult",
  "validateMeasurementModuleGenerationResult",
  "createGenerationPlanWriter",
  "writeGenerationFileAtomically",
  "createAtomicGenerationFileWriter",
];

const checks = {
  rootSurfaceStable:
    JSON.stringify(actualPublicApi) ===
    JSON.stringify(expectedPublicApi),

  measurementModuleSurfaceStable:
    JSON.stringify(actualMeasurementModuleApi) ===
    JSON.stringify(expectedMeasurementModuleApi),

  rootOrchestratorMatchesPlugin:
    builder.generateMeasurementModuleScaffold ===
    measurementModule.generateMeasurementModuleScaffold,

  allExportsCallable:
    actualPublicApi.every(
      (name) => typeof builder[name] === "function"
    ),

  candidateResultContractNotPublic:
    forbiddenPublicApi.every(
      (name) =>
        !Object.prototype.hasOwnProperty.call(
          builder,
          name
        )
    ),
};

const failed = Object.entries(checks)
  .filter(([, value]) => value !== true)
  .map(([name]) => name);

console.log(
  JSON.stringify(
    {
      test: "Builder Public API Regression",
      status: failed.length === 0 ? "PASS" : "FAIL",
      checks,
      expectedPublicApi,
      actualPublicApi,
      expectedMeasurementModuleApi,
      actualMeasurementModuleApi,
      failed,
    },
    null,
    2
  )
);

if (failed.length > 0) {
  process.exit(1);
}

console.log("Builder Public API Regression: PASS");
