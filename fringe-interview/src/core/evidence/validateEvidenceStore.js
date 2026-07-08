const { validateEvidence } = require("./validateEvidence");

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateEvidenceStore(evidenceStore = {}) {
  const errors = [];

  if (!isObject(evidenceStore)) {
    return {
      isValid: false,
      errors: ["EvidenceStore must be an object."],
    };
  }

  if (!Array.isArray(evidenceStore.evidence)) {
    errors.push("evidence must be an array.");
  } else {
    evidenceStore.evidence.forEach((evidence, index) => {
      const validation = validateEvidence(evidence);

      validation.errors.forEach((error) => {
        errors.push(`evidence[${index}].${error}`);
      });
    });
  }

  if (!Array.isArray(evidenceStore.sources)) {
    errors.push("sources must be an array.");
  }

  if (!isObject(evidenceStore.statistics)) {
    errors.push("statistics must be an object.");
  }

  if (!isObject(evidenceStore.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!evidenceStore.metadata.version) {
      errors.push("metadata.version is required.");
    }

    if (!evidenceStore.metadata.createdAt) {
      errors.push("metadata.createdAt is required.");
    }

    if (
      evidenceStore.metadata.inputBundleVersion !== null &&
      evidenceStore.metadata.inputBundleVersion !== undefined &&
      typeof evidenceStore.metadata.inputBundleVersion !== "string"
    ) {
      errors.push("metadata.inputBundleVersion must be a string when provided.");
    }
  }

  if (!isObject(evidenceStore.extensions)) {
    errors.push("extensions must be an object.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateEvidenceStore,
};