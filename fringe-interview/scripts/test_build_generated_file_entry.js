const crypto = require("crypto");
const { renderTemplate } = require("../tools/imago-builder/core/renderTemplate");
const { buildGeneratedFileEntry } = require("../tools/imago-builder/core/buildGeneratedFileEntry");
const { buildGenerationPlan, validateGenerationPlan } = require("../tools/imago-builder");

const failures = [];
function expect(condition, message) { if (!condition) failures.push(message); }
function hash(content) { return crypto.createHash("sha256").update(content, "utf8").digest("hex"); }

const template = {
  templateId: "generated_entry_test",
  templateVersion: "1.0",
  outputType: "javascript",
  targetCategory: "source",
  requiredPlaceholders: ["NAME"],
  optionalPlaceholders: [],
  content: "module.exports = {{NAME}};",
  metadata: {},
  extensions: {},
};
const rendered = renderTemplate({ template, context: { NAME: "{}" } });
const renderedBefore = JSON.stringify(rendered);
const metadataInput = { category: "source" };
const metadataBefore = JSON.stringify(metadataInput);
const entry = buildGeneratedFileEntry({
  relativePath: "src\\example\\generated.js",
  renderedTemplate: rendered,
  metadata: metadataInput,
});

expect(entry.relativePath === "src/example/generated.js", "path normalized");
expect(entry.content === rendered.content, "content preserved");
expect(entry.contentHash === hash(entry.content), "hash correct");
expect(entry.metadata.templateId === "generated_entry_test", "templateId");
expect(entry.metadata.templateVersion === "1.0", "templateVersion");
expect(entry.metadata.category === "source", "custom metadata");
expect(entry.overwritePolicy === "forbid", "overwrite default");

const invalidPolicyEntry = buildGeneratedFileEntry({
  relativePath: "src/example/normalized.js",
  renderedTemplate: rendered,
  overwritePolicy: "invalid",
});
expect(invalidPolicyEntry.overwritePolicy === "forbid", "invalid policy normalized");
expect(invalidPolicyEntry.metadata.overwritePolicyNormalized === true, "policy normalization metadata");

const invalidRenderEntry = buildGeneratedFileEntry({
  relativePath: "src/example/invalid.js",
  renderedTemplate: {
    rendered: false,
    content: "ignored",
    metadata: { templateId: "invalid_template", templateVersion: "1.0" },
  },
});
expect(invalidRenderEntry.relativePath === null, "invalid render path");
expect(invalidRenderEntry.content === "", "invalid render content");
expect(invalidRenderEntry.contentHash === null, "invalid render hash");
expect(invalidRenderEntry.metadata.entryStatus === "invalid_render", "invalid render status");
expect(JSON.stringify(rendered) === renderedBefore, "renderedTemplate mutated");
expect(JSON.stringify(metadataInput) === metadataBefore, "metadata mutated");

const plan = buildGenerationPlan({
  planId: "generated_entry_plan",
  generatorId: "generated_entry_test",
  targetRoot: "tmp/generated-entry",
  source: { moduleType: "test", sourceId: "generated_entry", sourceVersion: "1.0" },
  files: [entry],
});
const validation = validateGenerationPlan(plan);
expect(validation.isValid === true, `GenerationPlan validation: ${validation.errors.join("; ")}`);
expect(plan.files[0].contentHash === entry.contentHash, "GenerationPlan hash compatibility");

console.log(JSON.stringify({
  test: "Generated File Entry Foundation",
  status: failures.length === 0 ? "PASS" : "FAIL",
  entry,
  validation,
}, null, 2));
if (failures.length > 0) {
  console.error("Generated File Entry Test: FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}
console.log("Generated File Entry Test: PASS");
