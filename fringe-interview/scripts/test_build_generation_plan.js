const crypto = require("crypto");
const {
  buildGenerationPlan,
  validateGenerationPlan,
} = require("../tools/imago-builder");

const failures = [];
function expect(condition, message) {
  if (!condition) failures.push(message);
}
function hash(content) {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}
function buildValidInput() {
  return {
    planId: "generation_plan_test_v1",
    generatorId: "generation_plan_test_generator",
    targetRoot: "tmp/generated-plan",
    source: {
      moduleType: "measurement",
      sourceId: "example_measurement",
      sourceVersion: "1.0",
    },
    files: [
      { relativePath: "src/example/source.js", content: "module.exports = {};\n" },
      { relativePath: "scripts/test_example.js", content: "console.log('PASS');\n" },
      { relativePath: "src/example/healthExample.js", content: "module.exports = {};\n" },
      { relativePath: "scripts/test_example_regression.js", content: "console.log('PASS');\n" },
      { relativePath: "src/example/GENERATION_MANIFEST.json", content: "{}\n" },
      { relativePath: "README.md", content: "# Example\n" },
    ],
  };
}

const validPlan = buildGenerationPlan(buildValidInput());
const validValidation = validateGenerationPlan(validPlan);
expect(validPlan.planStatus === "ready", "A: planStatus");
expect(validPlan.files.length === 6, "A: files length");
expect(JSON.stringify(validPlan.summary) === JSON.stringify({
  totalFiles: 6,
  sourceFiles: 1,
  testFiles: 1,
  healthFiles: 1,
  regressionFiles: 1,
  manifestFiles: 1,
  otherFiles: 1,
}), "A: summary");
expect(validValidation.isValid === true, `A: ${validValidation.errors.join("; ")}`);

validPlan.files.forEach((file) => {
  expect(/^[a-f0-9]{64}$/.test(file.contentHash), `B: hash format ${file.relativePath}`);
  expect(file.contentHash === hash(file.content), `B: hash mismatch ${file.relativePath}`);
});
const changedPlan = buildGenerationPlan({
  ...buildValidInput(),
  files: [{ relativePath: "src/example/source.js", content: "changed" }],
});
expect(changedPlan.files[0].contentHash !== validPlan.files[0].contentHash, "B: hash changes");

const normalizedPlan = buildGenerationPlan({
  ...buildValidInput(),
  files: [{ relativePath: "src\\example\\file.js", content: "x" }],
});
expect(normalizedPlan.files[0].relativePath === "src/example/file.js", "C: path normalization");

const duplicatePlan = buildGenerationPlan({
  ...buildValidInput(),
  files: [
    { relativePath: "src/example/file.js", content: "one" },
    { relativePath: "src/example/file.js", content: "two" },
  ],
});
const duplicateValidation = validateGenerationPlan(duplicatePlan);
expect(duplicatePlan.files.length === 2, "D: duplicates preserved");
expect(duplicateValidation.isValid === false, "D: duplicate invalid");
expect(duplicateValidation.errors.some((e) => e.includes("Duplicate relativePath")), "D: duplicate error");

const traversalValidation = validateGenerationPlan(buildGenerationPlan({
  ...buildValidInput(),
  files: [{ relativePath: "../outside.js", content: "x" }],
}));
expect(traversalValidation.isValid === false, "E: traversal invalid");
expect(traversalValidation.errors.some((e) => e.includes("path traversal")), "E: traversal error");

["C:/temp/file.js", "/tmp/file.js"].forEach((absolutePath) => {
  const validation = validateGenerationPlan(buildGenerationPlan({
    ...buildValidInput(),
    files: [{ relativePath: absolutePath, content: "x" }],
  }));
  expect(validation.isValid === false, `F: ${absolutePath}`);
  expect(validation.errors.some((e) => e.includes("must be relative")), `F: error ${absolutePath}`);
});

const emptyValidation = validateGenerationPlan(buildGenerationPlan({
  ...buildValidInput(),
  files: [{ relativePath: "src/example/empty.js", content: "" }],
}));
expect(emptyValidation.isValid === true, "G: empty content valid");
expect(emptyValidation.warnings.some((w) => w.includes("content is empty")), "G: empty warning");

const invalidPlan = buildGenerationPlan({});
const invalidValidation = validateGenerationPlan(invalidPlan);
expect(invalidPlan.planStatus === "invalid", "H: invalid status");
expect(invalidValidation.isValid === false, "H: invalid validation");

const immutableInput = buildValidInput();
immutableInput.metadata = { project: "imago-builder" };
immutableInput.files[0].metadata = { category: "source" };
const immutableSnapshot = JSON.stringify(immutableInput);
buildGenerationPlan(immutableInput);
expect(JSON.stringify(immutableInput) === immutableSnapshot, "I: input mutated");

const metadataPlan = buildGenerationPlan({
  ...buildValidInput(),
  metadata: { project: "imago-builder", owner: "builder" },
});
expect(metadataPlan.metadata.version === "1.0", "J: version");
expect(typeof metadataPlan.metadata.createdAt === "string" && metadataPlan.metadata.createdAt.length > 0, "J: createdAt");
expect(metadataPlan.metadata.project === "imago-builder", "J: metadata preserved");
expect(metadataPlan.metadata.owner === "builder", "J: metadata owner");

console.log(JSON.stringify({
  test: "Generation Plan Foundation",
  status: failures.length === 0 ? "PASS" : "FAIL",
  planStatus: validPlan.planStatus,
  summary: validPlan.summary,
  validation: validValidation,
}, null, 2));

if (failures.length > 0) {
  console.error("Generation Plan Test: FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}
console.log("Generation Plan Test: PASS");
