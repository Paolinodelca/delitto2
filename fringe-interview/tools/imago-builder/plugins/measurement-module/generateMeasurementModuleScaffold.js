const {
  validateMeasurementModuleSpec,
} = require("./validateMeasurementModuleSpec");

const {
  buildMeasurementTemplateContext,
} = require("./buildMeasurementTemplateContext");

const {
  buildMeasurementModulePlan,
} = require("./buildMeasurementModulePlan");

const {
  buildGenerationWritePreflight,
} = require("../../core/buildGenerationWritePreflight");

const {
  writeGenerationPlan,
} = require("../../core/writeGenerationPlan");

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

    write:
      sourceInput.write === true,

    allowOverwrite:
      sourceInput.allowOverwrite === true,

    rootDirectory:
      typeof sourceInput.rootDirectory === "string"
        ? sourceInput.rootDirectory
        : process.cwd(),
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

function normalizeDiagnosticMessages(values) {
  return (
    Array.isArray(values)
      ? values
      : []
  ).map((value) => {
    if (typeof value === "string") {
      return value;
    }

    if (
      isObject(value) &&
      typeof value.message === "string"
    ) {
      return value.message;
    }

    return null;
  });
}

function collectScaffoldDiagnostics({
  specValidation,
  contextWarnings,
  contextErrors,
  plan,
  preflightReport = null,
  writeReport = null,
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
        ...normalizeDiagnosticMessages(
          preflightReport &&
          preflightReport.errors
        ),
        ...normalizeDiagnosticMessages(
          preflightReport &&
          preflightReport.conflicts
        ),
        ...normalizeDiagnosticMessages(
          writeReport &&
          writeReport.errors
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
        ...normalizeDiagnosticMessages(
          preflightReport &&
          preflightReport.warnings
        ),
        ...normalizeDiagnosticMessages(
          writeReport &&
          writeReport.warnings
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
  mode,
  specValidation,
  contextStatus,
  plan,
  preflightReport = null,
  writeReport = null,
  errors,
  warnings,
}) {
  const generated =
    plan.planStatus === "ready";

  const result = {
    mode,

    generatorId:
      GENERATOR_ID,

    specValidation,

    contextStatus,

    plan,

    // "generated" means that a complete plan was produced. In write mode,
    // materialization status is exposed separately through "written".
    generated,

    files:
      buildGeneratedFileSummary(
        plan
      ),

    errors,

    warnings,
  };

  if (mode === "write") {
    result.preflightReport =
      preflightReport;

    result.writeReport =
      writeReport;

    result.written =
      Boolean(
        writeReport &&
        writeReport.status ===
          "completed"
      );
  }

  result.metadata = {
    version: "1.0",
    createdAt:
      new Date().toISOString(),
  };

  return result;
}

function generateMeasurementModuleScaffold(input = {}) {
  const {
    spec,
    targetRoot,
    write,
    allowOverwrite,
    rootDirectory,
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

  let preflightReport = null;
  let writeReport = null;

  if (
    write === true &&
    plan.planStatus === "ready"
  ) {
    preflightReport =
      buildGenerationWritePreflight({
        plan,
        rootDirectory,
        allowOverwrite,
      });

    if (
      preflightReport.preflightStatus ===
        "ready"
    ) {
      writeReport =
        writeGenerationPlan({
          generationPlan:
            plan,
          writePreflightReport:
            preflightReport,
        });
    }
  }

  const {
    errors,
    warnings,
  } =
    collectScaffoldDiagnostics({
      specValidation,
      contextWarnings,
      contextErrors,
      plan,
      preflightReport,
      writeReport,
    });

  return buildMeasurementModuleScaffoldResult({
    mode:
      write === true
        ? "write"
        : "dry_run",
    specValidation,
    contextStatus,
    plan,
    preflightReport,
    writeReport,
    errors,
    warnings,
  });
}

module.exports = {
  generateMeasurementModuleScaffold,
};
