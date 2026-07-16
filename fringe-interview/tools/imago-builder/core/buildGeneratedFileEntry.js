const crypto = require("crypto");
const ALLOWED_OVERWRITE_POLICIES = ["forbid", "allow_explicit"];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeRelativePath(value) {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  return value.replace(/\\/g, "/");
}

function calculateContentHash(content) {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

function buildGeneratedFileEntry({ relativePath, renderedTemplate, overwritePolicy = "forbid", metadata = {} } = {}) {
  const inputMetadata = isObject(metadata) ? { ...metadata } : {};
  const validRender = isObject(renderedTemplate) && renderedTemplate.rendered === true && typeof renderedTemplate.content === "string";

  if (!validRender) {
    return {
      relativePath: null,
      content: "",
      overwritePolicy: "forbid",
      contentHash: null,
      metadata: {
        templateId: isObject(renderedTemplate) && isObject(renderedTemplate.metadata) ? renderedTemplate.metadata.templateId || null : null,
        templateVersion: isObject(renderedTemplate) && isObject(renderedTemplate.metadata) ? renderedTemplate.metadata.templateVersion || null : null,
        ...inputMetadata,
        entryStatus: "invalid_render",
      },
    };
  }

  const normalizedPolicy = ALLOWED_OVERWRITE_POLICIES.includes(overwritePolicy) ? overwritePolicy : "forbid";
  return {
    relativePath: normalizeRelativePath(relativePath),
    content: renderedTemplate.content,
    overwritePolicy: normalizedPolicy,
    contentHash: calculateContentHash(renderedTemplate.content),
    metadata: {
      templateId: isObject(renderedTemplate.metadata) ? renderedTemplate.metadata.templateId || null : null,
      templateVersion: isObject(renderedTemplate.metadata) ? renderedTemplate.metadata.templateVersion || null : null,
      ...inputMetadata,
      ...(normalizedPolicy !== overwritePolicy ? { overwritePolicyNormalized: true } : {}),
    },
  };
}

module.exports = { buildGeneratedFileEntry };
