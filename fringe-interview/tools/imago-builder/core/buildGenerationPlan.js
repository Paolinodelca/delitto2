const crypto = require("crypto");

const {
  calculateGenerationPlanIdentity,
} = require("./calculateGenerationPlanIdentity");

const ALLOWED_OVERWRITE_POLICIES = ["forbid", "allow_explicit"];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeOptionalString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const result = [];
  value.forEach((item) => {
    if (typeof item !== "string" || item.trim().length === 0 || seen.has(item)) return;
    seen.add(item);
    result.push(item);
  });
  return result;
}

function normalizeRelativePath(value) {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/\\/g, "/");
  return normalized.trim().length > 0 ? normalized : null;
}

function calculateContentHash(content) {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

function classifyRelativePath(relativePath) {
  const path = typeof relativePath === "string" ? relativePath : "";
  const fileName = path.split("/").pop() || "";
  if (fileName === "GENERATION_MANIFEST.json") return "manifestFiles";
  if (path.includes("regression")) return "regressionFiles";
  if (path.includes("health")) return "healthFiles";
  if (path.startsWith("scripts/") && fileName.includes("test_")) return "testFiles";
  if (path.startsWith("src/") || path.startsWith("tools/")) return "sourceFiles";
  return "otherFiles";
}

function buildSummary(files) {
  const summary = {
    totalFiles: files.length,
    sourceFiles: 0,
    testFiles: 0,
    healthFiles: 0,
    regressionFiles: 0,
    manifestFiles: 0,
    otherFiles: 0,
  };
  files.forEach((file) => {
    summary[classifyRelativePath(file.relativePath)] += 1;
  });
  return summary;
}

function normalizeFileEntry(file) {
  if (!isObject(file)) return null;
  const relativePath = normalizeRelativePath(file.relativePath);
  const content = typeof file.content === "string" ? file.content : null;
  if (relativePath === null || content === null) return null;
  return {
    relativePath,
    content,
    overwritePolicy: ALLOWED_OVERWRITE_POLICIES.includes(file.overwritePolicy)
      ? file.overwritePolicy
      : "forbid",
    contentHash: calculateContentHash(content),
    metadata: isObject(file.metadata) ? { ...file.metadata } : {},
  };
}

function buildGenerationPlan(input = {}) {
  const sourceInput = isObject(input) ? input : {};
  const planId = normalizeOptionalString(sourceInput.planId);
  const generatorId = normalizeOptionalString(sourceInput.generatorId);
  const targetRoot = normalizeOptionalString(sourceInput.targetRoot);
  const source = isObject(sourceInput.source) ? sourceInput.source : {};
  const normalizedFiles = Array.isArray(sourceInput.files)
    ? sourceInput.files.map(normalizeFileEntry).filter((file) => file !== null)
    : [];
  const warnings = normalizeStringArray(sourceInput.warnings);
  const errors = normalizeStringArray(sourceInput.errors);
  const hasUnprocessableRootFiles =
    Array.isArray(sourceInput.files) &&
    sourceInput.files.length > 0 &&
    normalizedFiles.length !== sourceInput.files.length;
  const planStatus =
    planId === null ||
    generatorId === null ||
    targetRoot === null ||
    errors.length > 0 ||
    normalizedFiles.length === 0 ||
    hasUnprocessableRootFiles
      ? "invalid"
      : "ready";
  const inputMetadata = isObject(sourceInput.metadata) ? sourceInput.metadata : {};
  const plan = {
    planId,
    planStatus,
    generatorId,
    targetRoot,
    source: {
      moduleType: normalizeOptionalString(source.moduleType),
      sourceId: normalizeOptionalString(source.sourceId),
      sourceVersion: normalizeOptionalString(source.sourceVersion),
    },
    files: normalizedFiles,
    summary: buildSummary(normalizedFiles),
    warnings,
    errors,
    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
      ...inputMetadata,
    },
    extensions: {},
  };

  return {
    ...plan,
    planIdentity:
      calculateGenerationPlanIdentity(plan),
  };
}

module.exports = { buildGenerationPlan };
