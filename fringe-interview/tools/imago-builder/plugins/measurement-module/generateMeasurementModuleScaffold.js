const {
  validateMeasurementModuleSpec,
} = require("./validateMeasurementModuleSpec");

const {
  buildMeasurementTemplateContext,
} = require("./buildMeasurementTemplateContext");

const {
  buildMeasurementModulePlan,
} = require("./buildMeasurementModulePlan");

const GENERATOR_ID =
  "measurement_module_scaffold_v1";

function isObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function normalizeMeasurementModuleScaffoldInput(input) {
  const sourceInput =
    isObject(input)
      ? input
      : {};

  return {
    spec:
      sourceInput.spec,

    targetRoot:
      typeof sourceInput.targetRoot === "string"
        ? sourceInput.targetRoot
        : ".",
  };
}

function uniqueStrings(values) {
  const result = [];
  const seen = new Set();

  (
    Array.isArray(values)
      ? values
      : []
  ).forEach((value) => {
    if (
      typeof value !== "string" ||
      value.trim().length === 0 ||
      seen.has(value)
    ) {
      return;
    }

    seen.add(value);
    result.push(value);
  });

  return result;
}

function collectScaffoldDiagnostics({
  specValidation,
  contextWarnings,
  contextErrors,
  plan,
}) {
  return {
    errors:
      uniqueStrings([
        ...specValidation.errors,
        ...contextErrors,
        ...(
          Array.isArray(plan.errors)
            ? plan.errors
            : []
        ),
      ]),

    warnings:
      uniqueStrings([
        ...specValidation.warnings,
        ...contextWarnings,
        ...(
          Array.isArray(plan.warnings)
            ? plan.warnings
            : []
        ),
      ]),
  };
}

function buildGeneratedFileSummary(plan) {
  if (
    !plan ||
    plan.planStatus !== "ready" ||
    !Array.isArray(plan.files)
  ) {
    return [];
  }

  return plan.files.map(
    (file) => ({
      relativePath:
        file.relativePath,

      contentHash:
        file.contentHash,

      overwritePolicy:
        file.overwritePolicy,

      artifactType:
        file.metadata &&
        typeof file.metadata.artifactType ===
          "string"
          ? file.metadata.artifactType
          : null,
    })
  );
}

function buildMeasurementModuleScaffoldResult({
  specValidation,
  contextStatus,
  plan,
  errors,
  warnings,
}) {
  const generated =
    plan.planStatus === "ready";

  return {
    mode: "dry_run",

    generatorId:
      GENERATOR_ID,

    specValidation,

    contextStatus,

    plan,

    // "generated" means that a complete plan was produced; no filesystem
    // write is performed by this orchestrator.
    generated,

    files:
      buildGeneratedFileSummary(
        plan
      ),

    errors,

    warnings,

    metadata: {
      version: "1.0",
      createdAt:
        new Date().toISOString(),
    },
  };
}

function generateMeasurementModuleScaffold(input = {}) {
  const {
    spec,
    targetRoot,
  } =
    normalizeMeasurementModuleScaffoldInput(
      input
    );

  const specValidation =
    validateMeasurementModuleSpec(
      spec
    );

  let contextStatus = null;
  let contextWarnings = [];
  let contextErrors = [];

  if (
    specValidation.isValid === true
  ) {
    const context =
      buildMeasurementTemplateContext({
        spec,
      });

    contextStatus =
      context.contextStatus || null;

    contextWarnings =
      Array.isArray(context.warnings)
        ? context.warnings
        : [];

    contextErrors =
      Array.isArray(context.errors)
        ? context.errors
        : [];
  }

  const plan =
    buildMeasurementModulePlan({
      spec,
      targetRoot,
    });

  const {
    errors,
    warnings,
  } =
    collectScaffoldDiagnostics({
      specValidation,
      contextWarnings,
      contextErrors,
      plan,
    });

  return buildMeasurementModuleScaffoldResult({
    specValidation,
    contextStatus,
    plan,
    errors,
    warnings,
  });
}

module.exports = {
  generateMeasurementModuleScaffold,
};
