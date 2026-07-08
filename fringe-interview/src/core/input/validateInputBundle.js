const { validateInputSource } = require("./validateInputSource");

const PROFESSIONAL_HISTORY_ARRAY_FIELDS = [
  "experiences",
  "education",
  "skills",
  "achievements",
  "motivations",
  "preferences",
  "constraints",
  "targetDirections",
  "openNotes",
];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateInputBundle(inputBundle = {}) {
  const errors = [];

  if (!isObject(inputBundle)) {
    return {
      isValid: false,
      errors: ["InputBundle must be an object."],
    };
  }

  if (!Array.isArray(inputBundle.sources)) {
    errors.push("sources must be an array.");
  } else {
    inputBundle.sources.forEach((source, index) => {
      const validation = validateInputSource(source);

      validation.errors.forEach((error) => {
        errors.push(`sources[${index}].${error}`);
      });
    });
  }

  if (!isObject(inputBundle.professionalHistory)) {
    errors.push("professionalHistory must be an object.");
  } else {
    PROFESSIONAL_HISTORY_ARRAY_FIELDS.forEach((field) => {
      if (!Array.isArray(inputBundle.professionalHistory[field])) {
        errors.push(`professionalHistory.${field} must be an array.`);
      }
    });
  }

  if (!isObject(inputBundle.discovery)) {
    errors.push("discovery must be an object.");
  } else {
    if (!Array.isArray(inputBundle.discovery.questions)) {
      errors.push("discovery.questions must be an array.");
    }

    if (!Array.isArray(inputBundle.discovery.answers)) {
      errors.push("discovery.answers must be an array.");
    }

    if (!inputBundle.discovery.status) {
      errors.push("discovery.status is required.");
    }
  }

  if (!Array.isArray(inputBundle.updates)) {
    errors.push("updates must be an array.");
  }

  if (!isObject(inputBundle.context)) {
    errors.push("context must be an object.");
  }

  if (!isObject(inputBundle.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!inputBundle.metadata.version) {
      errors.push("metadata.version is required.");
    }

    if (!inputBundle.metadata.createdAt) {
      errors.push("metadata.createdAt is required.");
    }

    if (!inputBundle.metadata.updatedAt) {
      errors.push("metadata.updatedAt is required.");
    }
  }

  if (!isObject(inputBundle.extensions)) {
    errors.push("extensions must be an object.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateInputBundle,
};