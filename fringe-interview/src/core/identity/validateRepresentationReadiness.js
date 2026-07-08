function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateRepresentationReadiness(representationReadiness = {}) {
  const errors = [];

  if (!isObject(representationReadiness)) {
    return {
      isValid: false,
      errors: ["RepresentationReadiness must be an object."],
    };
  }

  if (!representationReadiness.status) {
    errors.push("status is required.");
  }

  if (!isObject(representationReadiness.canGenerate)) {
    errors.push("canGenerate must be an object.");
  } else {
    if (typeof representationReadiness.canGenerate.narrative !== "boolean") {
      errors.push("canGenerate.narrative must be a boolean.");
    }

    if (typeof representationReadiness.canGenerate.cv !== "boolean") {
      errors.push("canGenerate.cv must be a boolean.");
    }

    if (typeof representationReadiness.canGenerate.linkedin !== "boolean") {
      errors.push("canGenerate.linkedin must be a boolean.");
    }

    if (
      typeof representationReadiness.canGenerate.interviewPreparation !==
      "boolean"
    ) {
      errors.push("canGenerate.interviewPreparation must be a boolean.");
    }
  }

  if (!Array.isArray(representationReadiness.blockers)) {
    errors.push("blockers must be an array.");
  }

  if (!Array.isArray(representationReadiness.warnings)) {
    errors.push("warnings must be an array.");
  }

  if (!isObject(representationReadiness.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!representationReadiness.metadata.version) {
      errors.push("metadata.version is required.");
    }

    if (!representationReadiness.metadata.createdAt) {
      errors.push("metadata.createdAt is required.");
    }
  }

  if (!isObject(representationReadiness.extensions)) {
    errors.push("extensions must be an object.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateRepresentationReadiness,
};