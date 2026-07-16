const {
  validateMeasurementModuleSpec,
} = require("./validateMeasurementModuleSpec");

function isObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function jsonBlock(value) {
  return JSON.stringify(value, null, 2);
}

function indentLines(value, spaces) {
  const prefix = " ".repeat(spaces);

  return String(value)
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
}

function toUpperSnakeCase(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

function buildFactorDefaultFields(factors) {
  return factors
    .map((factor) => {
      const allowedValues = jsonBlock(factor.allowedValues);

      return [
        `${factor.observationField}:`,
        "  normalizeEnum(",
        `    input.${factor.observationField},`,
        `${indentLines(allowedValues, 4)},`,
        `    ${JSON.stringify(factor.defaultValue)}`,
        "  ),",
      ].join("\n");
    })
    .join("\n\n");
}

function buildFactorValidationLines(factors) {
  return factors
    .map((factor) => {
      const constantName = `ALLOWED_${toUpperSnakeCase(
        factor.observationField
      )}`;

      return [
        "if (",
        `  !${constantName}.includes(`,
        `    observation.${factor.observationField}`,
        "  )",
        ") {",
        "  errors.push(",
        `    ${JSON.stringify(`${factor.observationField} is invalid.`)}`,
        "  );",
        "}",
      ].join("\n");
    })
    .join("\n\n");
}

function buildFactorDefinitionEntries(factors) {
  return factors
    .map((factor) => {
      const scoringMap = jsonBlock(factor.scoringMap);

      return [
        `${factor.factorId}: {`,
        "  factorId:",
        `    ${JSON.stringify(factor.factorId)},`,
        "",
        "  weight:",
        `    ${String(factor.weight)},`,
        "",
        "  direction:",
        `    ${JSON.stringify(factor.direction)},`,
        "",
        "  scoringStatus:",
        `    ${JSON.stringify(factor.scoringStatus)},`,
        "",
        "  scoringMap:",
        `${indentLines(scoringMap, 4)},`,
        "},",
      ].join("\n");
    })
    .join("\n\n");
}

function buildFactorComponentInitializers(factors) {
  return factors
    .map(
      (factor) =>
        `${factor.factorId}Score: 0,`
    )
    .join("\n");
}

function buildInvalidContext(errors) {
  return {
    contextStatus: "invalid",

    measureId: null,
    label: null,
    description: null,

    moduleDirectory: null,
    pascalName: null,
    camelName: null,
    snakeName: null,
    constantName: null,

    implementationStatus: null,

    factorCount: 0,

    factorIdsJson: "",
    factorWeightsJson: "",
    thresholdsJson: "",
    benchmarkReferenceJson: "",
    inferenceSupportFieldsJson: "",
    inferenceSupportWeightsJson: "",

    factorDefaultFields: "",
    factorValidationLines: "",
    factorDefinitionEntries: "",
    factorComponentInitializers: "",
    factorExportLines: "",

    generationFlagsJson: "",
    provenanceJson: "",

    metadata: {
      specId: null,
      specVersion: null,
    },

    warnings: [],
    errors: Array.isArray(errors) ? [...errors] : [],
  };
}

function buildMeasurementTemplateContext({ spec } = {}) {
  const validation = validateMeasurementModuleSpec(spec);

  if (validation.isValid !== true) {
    return buildInvalidContext(validation.errors);
  }

  const factors = spec.factors;
  const factorIds = factors.map((factor) => factor.factorId);
  const factorWeights = {};

  factors.forEach((factor) => {
    factorWeights[factor.factorId] = factor.weight;
  });

  const implementationStatus = spec.specStatus;

  return {
    contextStatus: "ready",

    measureId: spec.measureId,
    label: spec.label,
    description: spec.description,

    moduleDirectory: spec.naming.moduleDirectory,
    pascalName: spec.naming.pascalName,
    camelName: spec.naming.camelName,
    snakeName: spec.naming.snakeName,
    constantName: spec.naming.constantName,

    implementationStatus,

    factorCount: factors.length,

    factorIdsJson: jsonBlock(factorIds),
    factorWeightsJson: jsonBlock(factorWeights),
    thresholdsJson: jsonBlock(spec.thresholds),
    benchmarkReferenceJson: jsonBlock(spec.benchmarkReference),
    inferenceSupportFieldsJson: jsonBlock(
      spec.inferenceSupport.fields
    ),
    inferenceSupportWeightsJson: jsonBlock(
      spec.inferenceSupport.weights
    ),

    factorDefaultFields: buildFactorDefaultFields(factors),
    factorValidationLines: buildFactorValidationLines(factors),
    factorDefinitionEntries: buildFactorDefinitionEntries(factors),
    factorComponentInitializers:
      buildFactorComponentInitializers(factors),
    factorExportLines: "",

    generationFlagsJson: jsonBlock(spec.generation),
    provenanceJson: jsonBlock(spec.provenance),

    metadata: {
      specId: spec.specId,
      specVersion: spec.specVersion,
    },

    warnings: [...validation.warnings],
    errors: [],
  };
}

module.exports = {
  buildMeasurementTemplateContext,
};
