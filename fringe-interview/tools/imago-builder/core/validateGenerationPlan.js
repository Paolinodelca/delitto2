const crypto = require("crypto");
const path = require("path");

const {
  calculateGenerationPlanIdentity,
} = require("./calculateGenerationPlanIdentity");

const ALLOWED_PLAN_STATUSES = ["ready", "invalid"];
const ALLOWED_OVERWRITE_POLICIES = ["forbid", "allow_explicit"];
const SUMMARY_FIELDS = [
  "totalFiles",
  "sourceFiles",
  "testFiles",
  "healthFiles",
  "regressionFiles",
  "manifestFiles",
  "otherFiles",
];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
function isStringOrNull(value) {
  return value === null || typeof value === "string";
}
function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}
function calculateContentHash(content) {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}
function isSha256(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}
function isAbsolutePath(relativePath) {
  return (
    path.posix.isAbsolute(relativePath) ||
    path.win32.isAbsolute(relativePath) ||
    /^[A-Za-z]:\//.test(relativePath)
  );
}
function containsTraversal(relativePath) {
  return relativePath.split("/").some((segment) => segment === "..");
}
function classifyRelativePath(relativePath) {
  const fileName = relativePath.split("/").pop() || "";
  if (fileName === "GENERATION_MANIFEST.json") return "manifestFiles";
  if (relativePath.includes("regression")) return "regressionFiles";
  if (relativePath.includes("health")) return "healthFiles";
  if (relativePath.startsWith("scripts/") && fileName.includes("test_")) return "testFiles";
  if (relativePath.startsWith("src/") || relativePath.startsWith("tools/")) return "sourceFiles";
  return "otherFiles";
}
function buildActualSummary(files) {
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
    if (isObject(file) && typeof file.relativePath === "string") {
      summary[classifyRelativePath(file.relativePath)] += 1;
    }
  });
  return summary;
}

function validateGenerationPlan(plan = {}) {
  const errors = [];
  const warnings = [];
  if (!isObject(plan)) {
    return { isValid: false, errors: ["GenerationPlan must be an object."], warnings: [] };
  }
  if (!isNonEmptyString(plan.planId)) errors.push("planId must be a non-empty string.");
  if (!isSha256(plan.planIdentity)) {
    errors.push("planIdentity must be a valid SHA-256 hash.");
  } else if (
    calculateGenerationPlanIdentity(plan) !==
    plan.planIdentity
  ) {
    errors.push("planIdentity does not match GenerationPlan content.");
  }
  if (!ALLOWED_PLAN_STATUSES.includes(plan.planStatus)) errors.push("planStatus must be ready or invalid.");
  if (!isNonEmptyString(plan.generatorId)) errors.push("generatorId must be a non-empty string.");
  if (!isNonEmptyString(plan.targetRoot)) errors.push("targetRoot must be a non-empty string.");
  if (!isObject(plan.source)) {
    errors.push("source must be an object.");
  } else {
    ["moduleType", "sourceId", "sourceVersion"].forEach((field) => {
      if (!isStringOrNull(plan.source[field])) errors.push(`source.${field} must be a string or null.`);
    });
    if (plan.source.moduleType === null) warnings.push("source.moduleType is null.");
    if (plan.source.sourceId === null) warnings.push("source.sourceId is null.");
    if (plan.source.sourceVersion === null) warnings.push("source.sourceVersion is null.");
  }
  if (!Array.isArray(plan.files)) errors.push("files must be an array.");
  else if (plan.files.length === 0) errors.push("files must not be empty.");

  const duplicateCounts = new Map();
  if (Array.isArray(plan.files)) {
    plan.files.forEach((file, index) => {
      if (!isObject(file)) {
        errors.push(`files[${index}] must be an object.`);
        return;
      }
      if (!isNonEmptyString(file.relativePath)) {
        errors.push(`files[${index}].relativePath must be a non-empty string.`);
      } else {
        duplicateCounts.set(file.relativePath, (duplicateCounts.get(file.relativePath) || 0) + 1);
        if (isAbsolutePath(file.relativePath)) errors.push(`files[${index}].relativePath must be relative.`);
        if (containsTraversal(file.relativePath)) errors.push(`files[${index}].relativePath must not contain path traversal.`);
        if (file.relativePath.includes("\\")) errors.push(`files[${index}].relativePath must not contain backslashes.`);
      }
      if (typeof file.content !== "string") errors.push(`files[${index}].content must be a string.`);
      else if (file.content.length === 0) warnings.push(`files[${index}].content is empty.`);
      if (!ALLOWED_OVERWRITE_POLICIES.includes(file.overwritePolicy)) {
        errors.push(`files[${index}].overwritePolicy is not allowed.`);
      } else if (file.overwritePolicy === "allow_explicit") {
        warnings.push(`files[${index}] uses allow_explicit.`);
      }
      if (!isSha256(file.contentHash)) errors.push(`files[${index}].contentHash must be a valid SHA-256 hash.`);
      else if (typeof file.content === "string" && calculateContentHash(file.content) !== file.contentHash) {
        errors.push(`files[${index}].contentHash does not match content.`);
      }
      if (!isObject(file.metadata)) errors.push(`files[${index}].metadata must be an object.`);
    });
  }
  duplicateCounts.forEach((count, relativePath) => {
    if (count > 1) errors.push(`Duplicate relativePath: ${relativePath}.`);
  });

  if (!isObject(plan.summary)) {
    errors.push("summary must be an object.");
  } else {
    SUMMARY_FIELDS.forEach((field) => {
      if (!isNonNegativeInteger(plan.summary[field])) errors.push(`summary.${field} must be a non-negative integer.`);
    });
    if (Array.isArray(plan.files)) {
      const actual = buildActualSummary(plan.files);
      if (plan.summary.totalFiles !== plan.files.length) errors.push("summary.totalFiles must equal files.length.");
      const categoryTotal = ["sourceFiles", "testFiles", "healthFiles", "regressionFiles", "manifestFiles", "otherFiles"]
        .reduce((sum, field) => sum + (typeof plan.summary[field] === "number" ? plan.summary[field] : 0), 0);
      if (categoryTotal !== plan.summary.totalFiles) errors.push("summary category counts must equal totalFiles.");
      SUMMARY_FIELDS.forEach((field) => {
        if (plan.summary[field] !== actual[field]) errors.push(`summary.${field} does not match actual classification.`);
      });
    }
  }
  if (!Array.isArray(plan.warnings)) errors.push("warnings must be an array.");
  else if (plan.warnings.length > 0) warnings.push("GenerationPlan contains declared warnings.");
  if (!Array.isArray(plan.errors)) errors.push("errors must be an array.");
  if (!isObject(plan.metadata)) errors.push("metadata must be an object.");
  else {
    if (!plan.metadata.version) errors.push("metadata.version is required.");
    if (!plan.metadata.createdAt) errors.push("metadata.createdAt is required.");
  }
  if (!isObject(plan.extensions)) errors.push("extensions must be an object.");
  if (plan.planStatus === "invalid") warnings.push("planStatus is invalid.");
  if (Array.isArray(plan.files) && plan.files.length > 25) warnings.push("GenerationPlan contains more than 25 files.");
  if (plan.targetRoot === ".") warnings.push('targetRoot is ".".');

  const structuralCause =
    !isNonEmptyString(plan.planId) ||
    !isNonEmptyString(plan.generatorId) ||
    !isNonEmptyString(plan.targetRoot) ||
    !Array.isArray(plan.files) ||
    plan.files.length === 0 ||
    (Array.isArray(plan.errors) && plan.errors.length > 0);
  if (plan.planStatus === "ready" && structuralCause) {
    errors.push("planStatus ready is inconsistent with structural errors.");
  }
  if (plan.planStatus === "invalid" && !structuralCause) {
    errors.push("planStatus invalid has no structural cause or declared error.");
  }

  return { isValid: errors.length === 0, errors, warnings: Array.from(new Set(warnings)) };
}

module.exports = { validateGenerationPlan };
