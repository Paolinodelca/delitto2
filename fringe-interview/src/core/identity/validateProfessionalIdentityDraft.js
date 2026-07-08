const OBSERVED_AREA_FIELDS = [
  "experiences",
  "education",
  "skills",
  "achievements",
  "motivations",
  "preferences",
  "constraints",
  "targetDirections",
  "discovery",
  "sources",
];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateProfessionalIdentityDraft(draft = {}) {
  const errors = [];

  if (!isObject(draft)) {
    return {
      isValid: false,
      errors: ["ProfessionalIdentityDraft must be an object."],
    };
  }

  if (!draft.identityStatus) {
    errors.push("identityStatus is required.");
  }

  if (!isObject(draft.evidenceSummary)) {
    errors.push("evidenceSummary must be an object.");
  }

  if (!isObject(draft.observedAreas)) {
    errors.push("observedAreas must be an object.");
  } else {
    OBSERVED_AREA_FIELDS.forEach((field) => {
      if (!Array.isArray(draft.observedAreas[field])) {
        errors.push(`observedAreas.${field} must be an array.`);
      }
    });
  }

  if (!Array.isArray(draft.gaps)) {
    errors.push("gaps must be an array.");
  }

  if (!isObject(draft.confidence)) {
    errors.push("confidence must be an object.");
  }

  if (!isObject(draft.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!draft.metadata.version) {
      errors.push("metadata.version is required.");
    }

    if (!draft.metadata.createdAt) {
      errors.push("metadata.createdAt is required.");
    }
  }

  if (!isObject(draft.extensions)) {
    errors.push("extensions must be an object.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateProfessionalIdentityDraft,
};