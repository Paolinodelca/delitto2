const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const { validateTemplateDefinition } = require("../tools/imago-builder/core/validateTemplateDefinition");
const { renderTemplate } = require("../tools/imago-builder/core/renderTemplate");
const { buildMeasurementTemplateContext } = require("../tools/imago-builder/plugins/measurement-module/buildMeasurementTemplateContext");
const { buildExecutionThroughOthersMeasurementSpec } = require("../tools/imago-builder/fixtures/executionThroughOthers.measurement.spec");

const templateDirectory = "../tools/imago-builder/plugins/measurement-module/templates";
const templateFiles = [
  "buildObservation.template.js",
  "validateObservation.template.js",
  "buildMeasureDefinition.template.js",
  "buildMeasureResult.template.js",
  "validateMeasureResult.template.js",
  "index.template.js",
  "health.template.js",
  "testObservation.template.js",
  "testMeasureResult.template.js",
  "testHealth.template.js",
  "testRegression.template.js",
  "generationManifest.template.json",
];
const failures = [];
function expect(condition, message) { if (!condition) failures.push(message); }

const executionThroughOthersSpec = buildExecutionThroughOthersMeasurementSpec();
const base = buildMeasurementTemplateContext({ spec: executionThroughOthersSpec });
expect(base.contextStatus === "ready", "context must be ready");

const context = {
  MEASURE_ID: base.measureId,
  PASCAL_NAME: base.pascalName,
  CONSTANT_NAME: base.constantName,
  MODULE_DIRECTORY: base.moduleDirectory,
  FACTOR_DEFAULT_FIELDS: base.factorDefaultFields,
  FACTOR_VALIDATION_LINES: base.factorValidationLines,
  FACTOR_DEFINITION_ENTRIES: base.factorDefinitionEntries,
  FACTOR_COMPONENT_INITIALIZERS: base.factorComponentInitializers,
  FACTOR_IDS_JSON: base.factorIdsJson,
  LABEL_JSON: JSON.stringify(base.label),
  DESCRIPTION_JSON: JSON.stringify(base.description),
  THRESHOLDS_JSON: base.thresholdsJson,
  BENCHMARK_REFERENCE_JSON: base.benchmarkReferenceJson,
  INFERENCE_SUPPORT_FIELDS_JSON: base.inferenceSupportFieldsJson,
  INFERENCE_SUPPORT_WEIGHTS_JSON: base.inferenceSupportWeightsJson,
  PROVENANCE_JSON: base.provenanceJson,
  IMPLEMENTATION_STATUS: base.implementationStatus,
  IMPORT_LINES: "const buildExample = require(\"./buildExample\");",
  EXPORT_LINES: "  buildExample,",
  GENERATOR_ID_JSON: JSON.stringify("measurement-module-generator"),
  GENERATOR_VERSION_JSON: JSON.stringify("0.1"),
  MEASURE_ID_JSON: JSON.stringify(base.measureId),
  MODULE_DIRECTORY_JSON: JSON.stringify(base.moduleDirectory),
  SPEC_VERSION_JSON: JSON.stringify(base.metadata.specVersion),
  IMPLEMENTATION_STATUS_JSON: JSON.stringify(base.implementationStatus),
  GENERATED_FILES_JSON: JSON.stringify(["buildObservation.js"], null, 2),
  GENERATED_AT_JSON: JSON.stringify("2026-01-01T00:00:00.000Z"),
};

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "imago-template-test-"));
const renderedSnapshots = [];
try {
  templateFiles.forEach((fileName) => {
    const template = require(`${templateDirectory}/${fileName}`);
    const validation = validateTemplateDefinition(template);
    expect(validation.isValid === true, `${fileName}: ${validation.errors.join("; ")}`);
    const renderContext = Object.fromEntries(
      [...template.requiredPlaceholders, ...template.optionalPlaceholders]
        .filter((key) => Object.prototype.hasOwnProperty.call(context, key))
        .map((key) => [key, context[key]])
    );
    const first = renderTemplate({ template, context: renderContext });
    const second = renderTemplate({ template, context: renderContext });
    expect(first.rendered === true, `${fileName}: rendering failed ${first.errors.join("; ")}`);
    expect(first.unresolvedPlaceholders.length === 0, `${fileName}: unresolved placeholders`);
    expect(first.content.length > 0, `${fileName}: empty output`);
    expect(first.content === second.content, `${fileName}: non deterministic`);
    expect(!first.content.includes("{{#"), `${fileName}: block syntax found`);
    expect(!first.content.includes("{{/"), `${fileName}: closing block syntax found`);
    renderedSnapshots.push([fileName, first.content]);
    if (template.outputType === "javascript") {
      expect(first.content.includes("module.exports") || first.content.includes("require("), `${fileName}: CommonJS syntax missing`);
      const generatedPath = path.join(tempRoot, fileName.replace(".template", ".generated"));
      fs.writeFileSync(generatedPath, first.content, "utf8");
      const result = spawnSync(process.execPath, ["--check", generatedPath], { encoding: "utf8" });
      expect(result.status === 0, `${fileName}: node --check failed ${result.stderr}`);
    } else if (template.outputType === "json") {
      try { JSON.parse(first.content); } catch (error) { failures.push(`${fileName}: invalid JSON ${error.message}`); }
      expect(!/[A-Za-z]:\//.test(first.content) && !first.content.includes("/tmp/"), `${fileName}: absolute path found`);
    }
  });

  const recursiveTemplate = {
    templateId: "no_recursive_test", templateVersion: "1.0", outputType: "text", targetCategory: "other",
    requiredPlaceholders: ["FIRST_VALUE", "SECOND_VALUE"], optionalPlaceholders: [],
    content: "{{FIRST_VALUE}}|{{SECOND_VALUE}}", metadata: {}, extensions: {},
  };
  const recursive = renderTemplate({ template: recursiveTemplate, context: {
    FIRST_VALUE: "{{SECOND_VALUE}}", SECOND_VALUE: "resolved",
  }});
  expect(recursive.content === "{{SECOND_VALUE}}|resolved\n", "recursive rendering occurred");
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

console.log(JSON.stringify({
  test: "Versioned Measurement Module Templates",
  status: failures.length === 0 ? "PASS" : "FAIL",
  templateCount: templateFiles.length,
  renderedTemplateIds: renderedSnapshots.map(([name]) => name),
}, null, 2));
if (failures.length) {
  console.error("Measurement Module Templates Test: FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}
console.log("Measurement Module Templates Test: PASS");
