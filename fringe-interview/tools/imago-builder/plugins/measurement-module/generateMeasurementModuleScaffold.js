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

function generateMeasurementModuleScaffold(input = {}) {
  const sourceInput =
    isObject(input)
      ? input
      : {};

  const spec =
    sourceInput.spec;

  const targetRoot =
    typeof sourceInput.targetRoot === "string"
      ? sourceInput.targetRoot
      : ".";

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

  const errors =
    uniqueStrings([
      ...specValidation.errors,
      ...contextErrors,
      ...(
        Array.isArray(plan.errors)
          ? plan.errors
          : []
      ),
    ]);

  const warnings =
    uniqueStrings([
      ...specValidation.warnings,
      ...contextWarnings,
      ...(
        Array.isArray(plan.warnings)
          ? plan.warnings
          : []
      ),
    ]);

  const generated =
    plan.planStatus === "ready";

  return {
    mode: "dry_run",

    generatorId:
      GENERATOR_ID,

    specValidation,

    contextStatus,

    plan,

    generated,

    files:
      generated
        ? plan.files.map(
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
          )
        : [],

    errors,

    warnings,

    metadata: {
      version: "1.0",
      createdAt:
        new Date().toISOString(),
    },
  };
}

module.exports = {
  generateMeasurementModuleScaffold,
};
