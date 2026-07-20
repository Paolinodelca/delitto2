const path = require("path");

const ALLOWED_ACTIONS = [
  "create",
  "overwrite",
];

const ALLOWED_STATUSES = [
  "success",
  "failed",
  "skipped",
];

function isObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function isNonEmptyString(value) {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

function isNullableString(value) {
  return (
    value === null ||
    isNonEmptyString(value)
  );
}

function isSha256(value) {
  return (
    typeof value === "string" &&
    /^[a-f0-9]{64}$/.test(value)
  );
}

function isSafeRelativePath(value) {
  if (!isNonEmptyString(value)) {
    return false;
  }

  const normalized =
    value.replace(/\\/g, "/");

  return (
    normalized === value &&
    !path.posix.isAbsolute(value) &&
    !path.win32.isAbsolute(value) &&
    !value
      .split("/")
      .some(
        (segment) =>
          segment === ".."
      )
  );
}

function validateGenerationFileWriteResult(
  result = {}
) {
  const errors = [];
  const warnings = [];

  if (!isObject(result)) {
    return {
      isValid: false,
      errors: [
        "GenerationFileWriteResult must be an object.",
      ],
      warnings: [],
    };
  }

  if (
    !isSafeRelativePath(
      result.relativePath
    )
  ) {
    errors.push(
      "relativePath must be a safe non-empty relative path."
    );
  }

  if (
    !ALLOWED_ACTIONS.includes(
      result.action
    )
  ) {
    errors.push(
      "action is not allowed."
    );
  }

  if (
    !ALLOWED_STATUSES.includes(
      result.status
    )
  ) {
    errors.push(
      "status is not allowed."
    );
  }

  if (
    !isSha256(
      result.expectedContentHash
    )
  ) {
    errors.push(
      "expectedContentHash must be a valid SHA-256 hash."
    );
  }

  if (
    result.writtenContentHash !==
      null &&
    !isSha256(
      result.writtenContentHash
    )
  ) {
    errors.push(
      "writtenContentHash must be null or a valid SHA-256 hash."
    );
  }

  if (
    !isNullableString(
      result.errorCode
    )
  ) {
    errors.push(
      "errorCode must be null or a non-empty string."
    );
  }

  if (
    !isNullableString(
      result.message
    )
  ) {
    errors.push(
      "message must be null or a non-empty string."
    );
  }

  if (!isObject(result.metadata)) {
    errors.push(
      "metadata must be an object."
    );
  }

  if (
    result.status === "success"
  ) {
    if (
      !isSha256(
        result.writtenContentHash
      )
    ) {
      errors.push(
        "success requires writtenContentHash."
      );
    }

    if (
      result.errorCode !== null
    ) {
      errors.push(
        "success must not contain errorCode."
      );
    }
  }

  if (
    result.status !== "success" &&
    result.writtenContentHash !==
      null
  ) {
    errors.push(
      "failed or skipped results must not declare writtenContentHash."
    );
  }

  if (
    result.status === "failed" &&
    !isNonEmptyString(
      result.errorCode
    )
  ) {
    errors.push(
      "failed requires errorCode."
    );
  }

  if (
    result.status === "skipped" &&
    !isNonEmptyString(
      result.message
    )
  ) {
    warnings.push(
      "skipped result has no explanatory message."
    );
  }

  return {
    isValid:
      errors.length === 0,

    errors,

    warnings:
      Array.from(
        new Set(warnings)
      ),
  };
}

module.exports = {
  validateGenerationFileWriteResult,
};
