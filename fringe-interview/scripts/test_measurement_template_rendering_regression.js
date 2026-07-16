const {
  buildExecutionThroughOthersMeasurementSpec,
} = require("../tools/imago-builder/fixtures/executionThroughOthers.measurement.spec");

const {
  buildMeasurementTemplateContext,
  validateTemplateDefinition,
  renderTemplate,
  buildGeneratedFileEntry,
} = require("../tools/imago-builder");

const buildObservationTemplate = require(
  "../tools/imago-builder/plugins/measurement-module/templates/buildObservation.template.js"
);
const buildMeasureDefinitionTemplate = require(
  "../tools/imago-builder/plugins/measurement-module/templates/buildMeasureDefinition.template.js"
);
const buildMeasureResultTemplate = require(
  "../tools/imago-builder/plugins/measurement-module/templates/buildMeasureResult.template.js"
);
const healthTemplate = require(
  "../tools/imago-builder/plugins/measurement-module/templates/health.template.js"
);
const generationManifestTemplate = require(
  "../tools/imago-builder/plugins/measurement-module/templates/generationManifest.template.json"
);

const failures = [];
function expect(condition, message) {
  if (!condition) failures.push(message);
}

function buildFullContext(templateContext) {
  return {
    MEASURE_ID: templateContext.measureId,
    PASCAL_NAME: templateContext.pascalName,
    CONSTANT_NAME: templateContext.constantName,
    MODULE_DIRECTORY: templateContext.moduleDirectory,
    FACTOR_DEFAULT_FIELDS: templateContext.factorDefaultFields,
    FACTOR_VALIDATION_LINES: templateContext.factorValidationLines,
    FACTOR_DEFINITION_ENTRIES: templateContext.factorDefinitionEntries,
    FACTOR_COMPONENT_INITIALIZERS: templateContext.factorComponentInitializers,
    FACTOR_IDS_JSON: templateContext.factorIdsJson,
    LABEL_JSON: JSON.stringify(templateContext.label),
    DESCRIPTION_JSON: JSON.stringify(templateContext.description),
    THRESHOLDS_JSON: templateContext.thresholdsJson,
    BENCHMARK_REFERENCE_JSON: templateContext.benchmarkReferenceJson,
    INFERENCE_SUPPORT_FIELDS_JSON: templateContext.inferenceSupportFieldsJson,
    INFERENCE_SUPPORT_WEIGHTS_JSON: templateContext.inferenceSupportWeightsJson,
    PROVENANCE_JSON: templateContext.provenanceJson,
    IMPLEMENTATION_STATUS: templateContext.implementationStatus,
    GENERATOR_ID_JSON: JSON.stringify("measurement-module-generator"),
    GENERATOR_VERSION_JSON: JSON.stringify("0.1"),
    MEASURE_ID_JSON: JSON.stringify(templateContext.measureId),
    MODULE_DIRECTORY_JSON: JSON.stringify(templateContext.moduleDirectory),
    SPEC_VERSION_JSON: JSON.stringify(templateContext.metadata.specVersion),
    IMPLEMENTATION_STATUS_JSON: JSON.stringify(templateContext.implementationStatus),
    GENERATED_FILES_JSON: JSON.stringify([
      `src/core/measurement/${templateContext.moduleDirectory}/build${templateContext.pascalName}Observation.js`,
      `src/core/measurement/${templateContext.moduleDirectory}/build${templateContext.pascalName}MeasureDefinition.js`,
      `src/core/measurement/${templateContext.moduleDirectory}/build${templateContext.pascalName}MeasureResult.js`,
      `src/core/measurement/${templateContext.moduleDirectory}/health${templateContext.pascalName}.js`,
    ], null, 2),
    GENERATED_AT_JSON: JSON.stringify("runtime_generated_at"),
  };
}

function selectContext(template, fullContext) {
  return Object.fromEntries(
    [...template.requiredPlaceholders, ...template.optionalPlaceholders]
      .filter((key) => Object.prototype.hasOwnProperty.call(fullContext, key))
      .map((key) => [key, fullContext[key]])
  );
}

function buildSnapshot() {
  const spec = buildExecutionThroughOthersMeasurementSpec();
  const templateContext = buildMeasurementTemplateContext({ spec });
  expect(templateContext.contextStatus === "ready", "context must be ready");

  const fullContext = buildFullContext(templateContext);
  const definitions = [
    {
      template: buildObservationTemplate,
      relativePath: `src/core/measurement/${templateContext.moduleDirectory}/build${templateContext.pascalName}Observation.js`,
      category: "source",
    },
    {
      template: buildMeasureDefinitionTemplate,
      relativePath: `src/core/measurement/${templateContext.moduleDirectory}/build${templateContext.pascalName}MeasureDefinition.js`,
      category: "source",
    },
    {
      template: buildMeasureResultTemplate,
      relativePath: `src/core/measurement/${templateContext.moduleDirectory}/build${templateContext.pascalName}MeasureResult.js`,
      category: "source",
    },
    {
      template: healthTemplate,
      relativePath: `src/core/measurement/${templateContext.moduleDirectory}/health${templateContext.pascalName}.js`,
      category: "health",
    },
    {
      template: generationManifestTemplate,
      relativePath: `src/core/measurement/${templateContext.moduleDirectory}/GENERATION_MANIFEST.json`,
      category: "manifest",
    },
  ];

  const entries = definitions.map(({ template, relativePath, category }) => {
    const validation = validateTemplateDefinition(template);
    expect(validation.isValid === true, `${template.templateId}: ${validation.errors.join("; ")}`);

    const rendered = renderTemplate({
      template,
      context: selectContext(template, fullContext),
    });
    expect(rendered.rendered === true, `${template.templateId}: ${rendered.errors.join("; ")}`);
    expect(rendered.unresolvedPlaceholders.length === 0, `${template.templateId}: unresolved placeholders`);

    const entry = buildGeneratedFileEntry({
      relativePath,
      renderedTemplate: rendered,
      metadata: {
        category,
        specId: templateContext.metadata.specId,
        specVersion: templateContext.metadata.specVersion,
        implementationStatus: templateContext.implementationStatus,
      },
    });

    return {
      relativePath: entry.relativePath,
      content: entry.content,
      contentHash: entry.contentHash,
      overwritePolicy: entry.overwritePolicy,
      templateId: entry.metadata.templateId,
      templateVersion: entry.metadata.templateVersion,
      metadata: {
        category: entry.metadata.category,
        specId: entry.metadata.specId,
        specVersion: entry.metadata.specVersion,
        implementationStatus: entry.metadata.implementationStatus,
      },
    };
  });

  return {
    measureId: templateContext.measureId,
    implementationStatus: templateContext.implementationStatus,
    factorIds: JSON.parse(templateContext.factorIdsJson),
    entries,
  };
}

const first = buildSnapshot();
const second = buildSnapshot();
expect(JSON.stringify(first) === JSON.stringify(second), "pipeline must be deterministic");
expect(first.entries.length === 5, "five principal entries expected");
expect(first.factorIds.join("|") === [
  "delegatedExecutionScope",
  "collectiveDeliveryEvidence",
  "managerialLayerUse",
  "personalInterventionDependence",
].join("|"), "factor order must be preserved");

const definitionEntry = first.entries.find(
  (entry) => entry.templateId === "measurement.buildMeasureDefinition"
);
expect(Boolean(definitionEntry), "definition entry missing");
expect(definitionEntry && definitionEntry.content.includes('direction:\n    "inverse"'), "inverse direction missing");
expect(definitionEntry && definitionEntry.content.includes('scoringStatus:\n    "configuration_required"'), "configuration_required scoring missing");
expect(definitionEntry && definitionEntry.content.includes("scoringMap:\n    {},"), "empty scoring map missing");
expect(definitionEntry && !definitionEntry.content.includes("repeated_quantified:"), "scoring was invented");

const resultEntry = first.entries.find(
  (entry) => entry.templateId === "measurement.buildMeasureResult"
);
expect(resultEntry && resultEntry.content.includes("// BEGIN SEMANTIC SCORING CONFIGURATION"), "semantic start marker missing");
expect(resultEntry && resultEntry.content.includes("// END SEMANTIC SCORING CONFIGURATION"), "semantic end marker missing");
expect(resultEntry && resultEntry.content.includes('resultStatus: "configuration_required"'), "result status missing");
expect(resultEntry && resultEntry.content.includes("score: 0"), "score 0 missing");
expect(resultEntry && resultEntry.content.includes('band: "not_supported"'), "band missing");

const manifestEntry = first.entries.find(
  (entry) => entry.templateId === "measurement.generationManifest"
);
expect(Boolean(manifestEntry), "manifest entry missing");
if (manifestEntry) {
  try {
    JSON.parse(manifestEntry.content);
  } catch (error) {
    failures.push(`manifest invalid: ${error.message}`);
  }
  expect(!/[A-Za-z]:\//.test(manifestEntry.content) && !manifestEntry.content.includes("/tmp/"), "manifest contains absolute path");
}

console.log(JSON.stringify({
  test: "Measurement Template Rendering Regression",
  status: failures.length === 0 ? "PASS" : "FAIL",
  measureId: first.measureId,
  implementationStatus: first.implementationStatus,
  entryCount: first.entries.length,
  entries: first.entries.map((entry) => ({
    relativePath: entry.relativePath,
    contentHash: entry.contentHash,
    templateId: entry.templateId,
    templateVersion: entry.templateVersion,
  })),
}, null, 2));

if (failures.length > 0) {
  console.error("Measurement Template Rendering Regression Test: FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}
console.log("Measurement Template Rendering Regression Test: PASS");
