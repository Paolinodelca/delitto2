const { buildGenerationPlan } = require("../tools/imago-builder");

const failures = [];
function expect(condition, message) {
  if (!condition) failures.push(message);
}
function buildInput() {
  return {
    planId: "generation_plan_regression_v1",
    generatorId: "generation_plan_regression_generator",
    targetRoot: "tmp/generation-plan-regression",
    source: {
      moduleType: "measurement",
      sourceId: "regression_measurement",
      sourceVersion: "1.0",
    },
    files: [
      {
        relativePath: "tools/example/buildExample.js",
        content: "module.exports = {};\n",
        metadata: { category: "source" },
      },
      {
        relativePath: "scripts/test_example_regression.js",
        content: "console.log('PASS');\n",
        overwritePolicy: "forbid",
      },
    ],
    warnings: ["Example warning.", "Example warning."],
    errors: [],
    metadata: { project: "imago-builder" },
  };
}
function withoutCreatedAt(plan) {
  return { ...plan, metadata: { ...plan.metadata, createdAt: null } };
}
function snapshot(plan) {
  return {
    planId: plan.planId,
    status: plan.planStatus,
    generatorId: plan.generatorId,
    targetRoot: plan.targetRoot,
    source: plan.source,
    paths: plan.files.map((file) => file.relativePath),
    contents: plan.files.map((file) => file.content),
    hashes: Object.fromEntries(plan.files.map((file) => [file.relativePath, file.contentHash])),
    overwritePolicies: plan.files.map((file) => file.overwritePolicy),
    fileMetadata: plan.files.map((file) => file.metadata),
    summary: plan.summary,
    warnings: plan.warnings,
    errors: plan.errors,
  };
}

const first = buildGenerationPlan(buildInput());
const second = buildGenerationPlan(buildInput());
expect(JSON.stringify(withoutCreatedAt(first)) === JSON.stringify(withoutCreatedAt(second)), "plans differ apart from createdAt");
expect(JSON.stringify(snapshot(first)) === JSON.stringify(snapshot(second)), "snapshots differ");
expect(first.warnings.length === 1, "duplicate warnings not removed");

console.log(JSON.stringify({
  test: "Generation Plan Regression",
  status: failures.length === 0 ? "PASS" : "FAIL",
  snapshot: snapshot(first),
}, null, 2));

if (failures.length > 0) {
  console.error("Generation Plan Regression Test: FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}
console.log("Generation Plan Regression Test: PASS");
