const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const Module = require("module");

const {
  buildExecutionThroughOthersMeasurementSpec,
} = require("../tools/imago-builder/fixtures/executionThroughOthers.measurement.spec");

const {
  buildMeasurementModulePlan,
} = require("../tools/imago-builder/plugins/measurement-module/buildMeasurementModulePlan");

const {
  validateGenerationPlan,
} = require("../tools/imago-builder/core/validateGenerationPlan");

const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

function withoutCreatedAt(plan) {
  return {
    ...plan,
    metadata: {
      ...plan.metadata,
      createdAt: null,
    },
  };
}

function loadInstrumentedFailureBuilder() {
  const filename = path.resolve(
    "tools/imago-builder/plugins/measurement-module/buildMeasurementModulePlan.js"
  );

  const originalSource = fs.readFileSync(filename, "utf8");
  const marker = [
    "    template:",
    "      buildObservationTemplate,",
  ].join("\n");

  const replacement = [
    "    template:",
    "      {",
    "        ...buildObservationTemplate,",
    "        requiredPlaceholders: [",
    "          ...buildObservationTemplate.requiredPlaceholders,",
    '          "FORCED_MISSING_PLACEHOLDER",',
    "        ],",
    "        content:",
    '          buildObservationTemplate.content + "\\n{{FORCED_MISSING_PLACEHOLDER}}",',
    "      },",
  ].join("\n");

  if (!originalSource.includes(marker)) {
    throw new Error("Instrumentation marker not found.");
  }

  const instrumentedSource = originalSource.replace(marker, replacement);
  const instrumentedModule = new Module(filename, module);
  instrumentedModule.filename = filename;
  instrumentedModule.paths = Module._nodeModulePaths(path.dirname(filename));
  instrumentedModule._compile(instrumentedSource, filename);

  return instrumentedModule.exports.buildMeasurementModulePlan;
}

const spec = buildExecutionThroughOthersMeasurementSpec();
const specBefore = JSON.stringify(spec);
const plan = buildMeasurementModulePlan({ spec, targetRoot: "." });
const validation = validateGenerationPlan(plan);

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

expect(plan.planStatus === "ready", "A: plan ready");
expect(plan.files.length === 12, "A: 12 files");
expect(validation.isValid === true, `A: validation ${validation.errors.join("; ")}`);
expect(JSON.stringify(plan.files.map((file) => file.relativePath)) === JSON.stringify(expectedPaths), "A: path order");

plan.files.forEach((file, index) => {
  expect(file.content.length > 0, `B${index}: content`);
  expect(/^[a-f0-9]{64}$/.test(file.contentHash), `B${index}: hash`);
  expect(file.overwritePolicy === "forbid", `B${index}: overwrite`);
  expect(typeof file.metadata.artifactType === "string", `B${index}: artifact metadata`);
  expect(!/\{\{[A-Z][A-Z0-9_]*\}\}/.test(file.content), `B${index}: unresolved placeholder`);
});

const syntaxRoot = path.resolve("tmp/test-measurement-plan-syntax");
fs.rmSync(syntaxRoot, { recursive: true, force: true });
fs.mkdirSync(syntaxRoot, { recursive: true });
try {
  plan.files
    .filter((file) => file.relativePath.endsWith(".js"))
    .forEach((file, index) => {
      const syntaxFile = path.join(syntaxRoot, `${index}.js`);
      fs.writeFileSync(syntaxFile, file.content, "utf8");
      execFileSync(process.execPath, ["--check", syntaxFile], { stdio: "pipe" });
    });
} finally {
  fs.rmSync(syntaxRoot, { recursive: true, force: true });
}

const manifestEntry = plan.files[11];
const manifest = JSON.parse(manifestEntry.content);
expect(manifest.generatedAt === null, "C: generatedAt null");
expect(manifest.generatedFiles.length === 11, "C: 11 manifest entries");
expect(!manifest.generatedFiles.some((item) => item.relativePath === manifestEntry.relativePath), "C: manifest not self-referential");
plan.files.slice(0, 11).forEach((file, index) => {
  const listed = manifest.generatedFiles[index];
  expect(listed.relativePath === file.relativePath, `C${index}: path`);
  expect(listed.contentHash === file.contentHash, `C${index}: hash`);
});

expect(plan.summary.totalFiles === 12, "D: total");
expect(plan.summary.sourceFiles === 6, "D: source");
expect(plan.summary.testFiles === 2, "D: test");
expect(plan.summary.healthFiles === 2, "D: health");
expect(plan.summary.regressionFiles === 1, "D: regression");
expect(plan.summary.manifestFiles === 1, "D: manifest");
expect(plan.summary.otherFiles === 0, "D: other");

const reducedSpec = {
  ...spec,
  generation: {
    ...spec.generation,
    includeHealth: false,
    includeHealthTest: false,
  },
};
const reducedPlan = buildMeasurementModulePlan({ spec: reducedSpec, targetRoot: "." });
expect(reducedPlan.planStatus === "ready", "E: reduced ready");
expect(reducedPlan.files.length === 10, "E: reduced count");
expect(!reducedPlan.files.some((file) => file.metadata.artifactType === "health" || file.metadata.artifactType === "health_test"), "E: no health artifacts");
const reducedIndex = reducedPlan.files.find((file) => file.metadata.artifactType === "index");
expect(!reducedIndex.content.includes("healthExecutionThroughOthersMeasurement"), "E: index no health");
const reducedManifest = JSON.parse(reducedPlan.files.at(-1).content);
expect(reducedManifest.generatedFiles.length === 9, "E: reduced manifest count");

const failureBuilder = loadInstrumentedFailureBuilder();
const failedPlan = failureBuilder({ spec, targetRoot: "." });
expect(failedPlan.planStatus === "invalid", "F: failed status");
expect(failedPlan.files.length === 0, "F: atomic empty files");
expect(failedPlan.summary.totalFiles === 0, "F: no partial summary");
expect(failedPlan.errors.some((error) => error.includes("observation_builder") && error.includes("measurement.buildObservation") && error.includes("FORCED_MISSING_PLACEHOLDER")), "F: precise error");

expect(JSON.stringify(spec) === specBefore, "G: spec immutability");

const first = buildMeasurementModulePlan({ spec: buildExecutionThroughOthersMeasurementSpec(), targetRoot: "." });
const second = buildMeasurementModulePlan({ spec: buildExecutionThroughOthersMeasurementSpec(), targetRoot: "." });
expect(JSON.stringify(withoutCreatedAt(first)) === JSON.stringify(withoutCreatedAt(second)), "H: deterministic plan");

console.log(JSON.stringify({
  test: "Measurement Module Plan Atomic Rendering",
  status: failures.length === 0 ? "PASS" : "FAIL",
  fileOrder: plan.files.map((file) => file.metadata.artifactType),
  summary: plan.summary,
  manifestGeneratedFiles: manifest.generatedFiles.length,
  reducedFiles: reducedPlan.files.length,
  failureErrors: failedPlan.errors,
}, null, 2));

if (failures.length > 0) {
  console.error("Measurement Module Plan Atomic Rendering Test: FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log("Measurement Module Plan Atomic Rendering Test: PASS");
