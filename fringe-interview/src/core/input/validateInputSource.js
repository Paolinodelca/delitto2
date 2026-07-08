function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateInputSource(inputSource = {}) {
  const errors = [];

  if (!isObject(inputSource)) {
    return {
      isValid: false,
      errors: ["InputSource must be an object."],
    };
  }

  if (!inputSource.id) {
    errors.push("id is required.");
  }

  if (!inputSource.type) {
    errors.push("type is required.");
  }

  if (!isObject(inputSource.quality)) {
    errors.push("quality must be an object.");
  }

  if (!isObject(inputSource.provenance)) {
    errors.push("provenance must be an object.");
  }

  if (!isObject(inputSource.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!inputSource.metadata.version) {
      errors.push("metadata.version is required.");
    }

    if (!inputSource.metadata.createdAt) {
      errors.push("metadata.createdAt is required.");
    }

    if (!inputSource.metadata.updatedAt) {
      errors.push("metadata.updatedAt is required.");
    }
  }

  if (!isObject(inputSource.extensions)) {
    errors.push("extensions must be an object.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateInputSource,
};