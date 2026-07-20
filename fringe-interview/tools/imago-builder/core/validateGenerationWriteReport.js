const {
  validateGenerationFileWriteResult,
} = require("./validateGenerationFileWriteResult");

const ALLOWED_STATUSES = [
  "completed",
  "partial",
  "failed",
];

const SUMMARY_FIELDS = [
  "totalFiles",
  "successfulFiles",
  "failedFiles",
  "skippedFiles",
  "createdFiles",
  "overwrittenFiles",
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

function validateErrors(
  value,
  errors
) {
  if (!Array.isArray(value)) {
    errors.push(
      "errors must be an array."
    );
    return;
  }

  value.forEach(
    (item, index) => {
      if (
        !isObject(item) ||
        !isNonEmptyString(
          item.code
        ) ||
        !isNonEmptyString(
          item.message
        )
      ) {
        errors.push(
          `errors[${index}] must contain non-empty code and message.`
        );
      }
    }
  );
}

function validateWarnings(
  value,
  errors
) {
  if (!Array.isArray(value)) {
    errors.push(
      "warnings must be an array."
    );
    return;
  }

  value.forEach(
    (item, index) => {
      if (
        !isNonEmptyString(item)
      ) {
        errors.push(
          `warnings[${index}] must be a non-empty string.`
        );
      }
    }
  );
}

function validateGenerationWriteReport(
  report = {}
) {
  const errors = [];
  const warnings = [];

  if (!isObject(report)) {
    return {
      isValid: false,
      errors: [
        "GenerationWriteReport must be an object.",
      ],
      warnings: [],
    };
  }

  if (
    !ALLOWED_STATUSES.includes(
      report.status
    )
  ) {
    errors.push(
      "status is not allowed."
    );
  }

  if (
    !isNonEmptyString(
      report.planIdentity
    )
  ) {
    errors.push(
      "planIdentity must be a non-empty string."
    );
  }

  if (
    !isNonEmptyString(
      report.preflightIdentity
    )
  ) {
    errors.push(
      "preflightIdentity must be a non-empty string."
    );
  }

  if (
    !Array.isArray(
      report.fileResults
    )
  ) {
    errors.push(
      "fileResults must be an array."
    );
  } else {
    report.fileResults.forEach(
      (result, index) => {
        const validation =
          validateGenerationFileWriteResult(
            result
          );

        validation.errors.forEach(
          (error) =>
            errors.push(
              `fileResults[${index}]: ${error}`
            )
        );
      }
    );
  }

  if (!isObject(report.summary)) {
    errors.push(
      "summary must be an object."
    );
  } else {
    SUMMARY_FIELDS.forEach(
      (field) => {
        if (
          !isNonNegativeInteger(
            report.summary[field]
          )
        ) {
          errors.push(
            `summary.${field} must be a non-negative integer.`
          );
        }
      }
    );

    if (
      Array.isArray(
        report.fileResults
      )
    ) {
      const actual = {
        totalFiles:
          report.fileResults.length,

        successfulFiles:
          report.fileResults.filter(
            (file) =>
              file &&
              file.status ===
                "success"
          ).length,

        failedFiles:
          report.fileResults.filter(
            (file) =>
              file &&
              file.status ===
                "failed"
          ).length,

        skippedFiles:
          report.fileResults.filter(
            (file) =>
              file &&
              file.status ===
                "skipped"
          ).length,

        createdFiles:
          report.fileResults.filter(
            (file) =>
              file &&
              file.status ===
                "success" &&
              file.action ===
                "create"
          ).length,

        overwrittenFiles:
          report.fileResults.filter(
            (file) =>
              file &&
              file.status ===
                "success" &&
              file.action ===
                "overwrite"
          ).length,
      };

      SUMMARY_FIELDS.forEach(
        (field) => {
          if (
            report.summary[field] !==
            actual[field]
          ) {
            errors.push(
              `summary.${field} does not match fileResults.`
            );
          }
        }
      );
    }
  }

  validateErrors(
    report.errors,
    errors
  );

  validateWarnings(
    report.warnings,
    errors
  );

  if (!isObject(report.metadata)) {
    errors.push(
      "metadata must be an object."
    );
  } else {
    [
      "writerId",
      "mode",
      "createdAt",
    ].forEach((field) => {
      if (
        !isNonEmptyString(
          report.metadata[field]
        )
      ) {
        errors.push(
          `metadata.${field} must be a non-empty string.`
        );
      }
    });
  }

  const successfulFiles =
    isObject(report.summary) &&
    Number.isInteger(
      report.summary.successfulFiles
    )
      ? report.summary.successfulFiles
      : 0;

  const incompleteFiles =
    isObject(report.summary)
      ? (
          Number.isInteger(
            report.summary.failedFiles
          )
            ? report.summary.failedFiles
            : 0
        ) +
        (
          Number.isInteger(
            report.summary.skippedFiles
          )
            ? report.summary.skippedFiles
            : 0
        )
      : 0;

  if (
    report.status ===
    "completed"
  ) {
    if (
      incompleteFiles > 0 ||
      successfulFiles === 0
    ) {
      errors.push(
        "completed requires at least one success and no failed or skipped files."
      );
    }

    if (
      Array.isArray(
        report.errors
      ) &&
      report.errors.length > 0
    ) {
      errors.push(
        "completed must not contain errors."
      );
    }
  }

  if (
    report.status ===
    "partial" &&
    (
      successfulFiles === 0 ||
      incompleteFiles === 0
    )
  ) {
    errors.push(
      "partial requires at least one success and at least one failed or skipped file."
    );
  }

  if (
    report.status ===
    "failed" &&
    successfulFiles > 0 &&
    incompleteFiles === 0
  ) {
    errors.push(
      "failed must not declare all files successful."
    );
  }

  if (
    report.status ===
    "failed" &&
    (
      !Array.isArray(
        report.errors
      ) ||
      report.errors.length === 0
    )
  ) {
    errors.push(
      "failed requires at least one error."
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
  validateGenerationWriteReport,
};
