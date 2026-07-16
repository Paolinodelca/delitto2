const ALLOWED_STATUSES = [
  "ready",
  "blocked",
  "invalid",
];

const ALLOWED_EXISTING_TYPES = [
  "file",
  "directory",
  "other",
  null,
];

const ALLOWED_OVERWRITE_POLICIES = [
  "forbid",
  "allow_explicit",
];

const ALLOWED_ACTIONS = [
  "create",
  "overwrite",
  "blocked",
];

const ALLOWED_CONFLICT_TYPES = [
  "unsafe_root",
  "path_escape",
  "external_symlink",
  "existing_file",
  "existing_directory",
  "existing_other",
  "parent_is_file",
  "parent_not_creatable",
  "overwrite_forbidden",
];

const SUMMARY_FIELDS = [
  "totalFiles",
  "createFiles",
  "overwriteFiles",
  "blockedFiles",
  "existingFiles",
  "missingParentDirectories",
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

function isNonNegativeInteger(value) {
  return (
    Number.isInteger(value) &&
    value >= 0
  );
}

function isSha256(value) {
  return (
    typeof value === "string" &&
    /^[a-f0-9]{64}$/.test(value)
  );
}

function validateStringArray(value, fieldName, errors) {
  if (!Array.isArray(value)) {
    errors.push(`${fieldName} must be an array.`);
    return;
  }

  value.forEach((item, index) => {
    if (!isNonEmptyString(item)) {
      errors.push(
        `${fieldName}[${index}] must be a non-empty string.`
      );
    }
  });
}

function validateGenerationWritePreflight(preflight = {}) {
  const errors = [];
  const warnings = [];

  if (!isObject(preflight)) {
    return {
      isValid: false,
      errors: [
        "GenerationWritePreflight must be an object.",
      ],
      warnings: [],
    };
  }

  if (!ALLOWED_STATUSES.includes(preflight.preflightStatus)) {
    errors.push("preflightStatus is not allowed.");
  }

  if (!isNonEmptyString(preflight.planId)) {
    errors.push("planId must be a non-empty string.");
  }

  if (!isNonEmptyString(preflight.generatorId)) {
    errors.push("generatorId must be a non-empty string.");
  }

  if (!isNonEmptyString(preflight.rootDirectory)) {
    errors.push("rootDirectory must be a non-empty string.");
  }

  if (!isNonEmptyString(preflight.targetRoot)) {
    errors.push("targetRoot must be a non-empty string.");
  }

  if (!isNonEmptyString(preflight.resolvedTargetRoot)) {
    errors.push("resolvedTargetRoot must be a non-empty string.");
  }

  if (typeof preflight.allowOverwrite !== "boolean") {
    errors.push("allowOverwrite must be a boolean.");
  }

  if (!isObject(preflight.planValidation)) {
    errors.push("planValidation must be an object.");
  } else {
    if (typeof preflight.planValidation.isValid !== "boolean") {
      errors.push("planValidation.isValid must be a boolean.");
    }

    validateStringArray(
      preflight.planValidation.errors,
      "planValidation.errors",
      errors
    );

    validateStringArray(
      preflight.planValidation.warnings,
      "planValidation.warnings",
      errors
    );
  }

  if (!Array.isArray(preflight.files)) {
    errors.push("files must be an array.");
  } else {
    preflight.files.forEach((file, index) => {
      if (!isObject(file)) {
        errors.push(`files[${index}] must be an object.`);
        return;
      }

      if (!isNonEmptyString(file.relativePath)) {
        errors.push(
          `files[${index}].relativePath must be a non-empty string.`
        );
      }

      if (!isNonEmptyString(file.resolvedPath)) {
        errors.push(
          `files[${index}].resolvedPath must be a non-empty string.`
        );
      }

      if (typeof file.exists !== "boolean") {
        errors.push(`files[${index}].exists must be a boolean.`);
      }

      if (!ALLOWED_EXISTING_TYPES.includes(file.existingType)) {
        errors.push(`files[${index}].existingType is not allowed.`);
      }

      if (!ALLOWED_OVERWRITE_POLICIES.includes(file.overwritePolicy)) {
        errors.push(`files[${index}].overwritePolicy is not allowed.`);
      }

      if (typeof file.overwriteAllowed !== "boolean") {
        errors.push(
          `files[${index}].overwriteAllowed must be a boolean.`
        );
      }

      if (!isNonEmptyString(file.parentDirectory)) {
        errors.push(
          `files[${index}].parentDirectory must be a non-empty string.`
        );
      }

      if (typeof file.parentExists !== "boolean") {
        errors.push(
          `files[${index}].parentExists must be a boolean.`
        );
      }

      if (typeof file.parentCreatable !== "boolean") {
        errors.push(
          `files[${index}].parentCreatable must be a boolean.`
        );
      }

      if (!isSha256(file.contentHash)) {
        errors.push(
          `files[${index}].contentHash must be a valid SHA-256 hash.`
        );
      }

      if (!ALLOWED_ACTIONS.includes(file.action)) {
        errors.push(`files[${index}].action is not allowed.`);
      }
    });
  }

  if (!isObject(preflight.summary)) {
    errors.push("summary must be an object.");
  } else {
    SUMMARY_FIELDS.forEach((field) => {
      if (!isNonNegativeInteger(preflight.summary[field])) {
        errors.push(
          `summary.${field} must be a non-negative integer.`
        );
      }
    });

    if (Array.isArray(preflight.files)) {
      const actual = {
        totalFiles: preflight.files.length,
        createFiles: preflight.files.filter(
          (file) => file && file.action === "create"
        ).length,
        overwriteFiles: preflight.files.filter(
          (file) => file && file.action === "overwrite"
        ).length,
        blockedFiles: preflight.files.filter(
          (file) => file && file.action === "blocked"
        ).length,
        existingFiles: preflight.files.filter(
          (file) => file && file.exists === true
        ).length,
        missingParentDirectories: new Set(
          preflight.files
            .filter(
              (file) => file && file.parentExists === false
            )
            .map((file) => file.parentDirectory)
        ).size,
      };

      if (preflight.summary.totalFiles !== actual.totalFiles) {
        errors.push("summary.totalFiles does not match files.");
      }

      if (preflight.summary.createFiles !== actual.createFiles) {
        errors.push("summary.createFiles does not match files.");
      }

      if (preflight.summary.overwriteFiles !== actual.overwriteFiles) {
        errors.push("summary.overwriteFiles does not match files.");
      }

      if (preflight.summary.blockedFiles !== actual.blockedFiles) {
        errors.push("summary.blockedFiles does not match files.");
      }

      if (preflight.summary.existingFiles !== actual.existingFiles) {
        errors.push("summary.existingFiles does not match files.");
      }

      const actionTotal =
        preflight.summary.createFiles +
        preflight.summary.overwriteFiles +
        preflight.summary.blockedFiles;

      if (actionTotal !== preflight.summary.totalFiles) {
        errors.push(
          "summary action counts must equal totalFiles."
        );
      }

      /*
       * In 0098E-1A parent existence is deliberately unobserved, so the
       * builder keeps missingParentDirectories at zero. From 0098E-1B
       * onward this count will be compared with real filesystem evidence.
       */
      const inspectionPending =
        preflight.preflightStatus === "invalid" &&
        Array.isArray(preflight.errors) &&
        preflight.errors.includes(
          "Filesystem inspection has not been executed."
        );

      if (
        !inspectionPending &&
        preflight.summary.missingParentDirectories !==
          actual.missingParentDirectories
      ) {
        errors.push(
          "summary.missingParentDirectories does not match files."
        );
      }
    }
  }

  if (!Array.isArray(preflight.conflicts)) {
    errors.push("conflicts must be an array.");
  } else {
    preflight.conflicts.forEach((conflict, index) => {
      if (!isObject(conflict)) {
        errors.push(`conflicts[${index}] must be an object.`);
        return;
      }

      if (!isNonEmptyString(conflict.relativePath)) {
        errors.push(
          `conflicts[${index}].relativePath must be a non-empty string.`
        );
      }

      if (!isNonEmptyString(conflict.resolvedPath)) {
        errors.push(
          `conflicts[${index}].resolvedPath must be a non-empty string.`
        );
      }

      if (!ALLOWED_CONFLICT_TYPES.includes(conflict.conflictType)) {
        errors.push(
          `conflicts[${index}].conflictType is not allowed.`
        );
      }

      if (!isNonEmptyString(conflict.message)) {
        errors.push(
          `conflicts[${index}].message must be a non-empty string.`
        );
      }
    });
  }

  validateStringArray(preflight.errors, "errors", errors);
  validateStringArray(preflight.warnings, "warnings", errors);

  if (!isObject(preflight.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!preflight.metadata.version) {
      errors.push("metadata.version is required.");
    }

    if (!preflight.metadata.createdAt) {
      errors.push("metadata.createdAt is required.");
    }
  }

  const blockedFiles =
    Array.isArray(preflight.files)
      ? preflight.files.filter(
          (file) => file && file.action === "blocked"
        ).length
      : 0;

  if (preflight.preflightStatus === "ready") {
    if (
      (Array.isArray(preflight.conflicts) &&
        preflight.conflicts.length > 0) ||
      (Array.isArray(preflight.errors) &&
        preflight.errors.length > 0) ||
      blockedFiles > 0
    ) {
      errors.push(
        "preflightStatus ready is inconsistent with conflicts, errors, or blocked files."
      );
    }
  }

  if (
    preflight.preflightStatus === "blocked" &&
    (!Array.isArray(preflight.conflicts) ||
      preflight.conflicts.length === 0) &&
    blockedFiles === 0
  ) {
    errors.push(
      "preflightStatus blocked requires a conflict or blocked file."
    );
  }

  if (
    preflight.preflightStatus === "invalid" &&
    (!Array.isArray(preflight.errors) ||
      preflight.errors.length === 0)
  ) {
    errors.push(
      "preflightStatus invalid requires an explicit error."
    );
  }

  if (preflight.targetRoot === ".") {
    warnings.push('targetRoot is ".".');
  }

  if (preflight.allowOverwrite === true) {
    warnings.push("allowOverwrite is true.");
  }

  if (
    Array.isArray(preflight.files) &&
    preflight.files.some((file) => file && file.exists === true)
  ) {
    warnings.push("Pre-existing files are present.");
  }

  if (
    isObject(preflight.summary) &&
    preflight.summary.missingParentDirectories > 0
  ) {
    warnings.push("Parent directories are missing.");
  }

  if (preflight.preflightStatus !== "ready") {
    warnings.push("preflightStatus is not ready.");
  }

  if (
    Array.isArray(preflight.warnings) &&
    preflight.warnings.length > 0
  ) {
    warnings.push("WritePreflightReport contains declared warnings.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: Array.from(new Set(warnings)),
  };
}

module.exports = {
  validateGenerationWritePreflight,
};
