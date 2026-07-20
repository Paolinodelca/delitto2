const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const {
  validateGenerationPlan,
} = require("./validateGenerationPlan");

const {
  validateGenerationWritePreflight,
} = require("./validateGenerationWritePreflight");

const {
  buildGenerationWriteReport,
} = require("./buildGenerationWriteReport");

const {
  validateGenerationWriteReport,
} = require("./validateGenerationWriteReport");

const {
  buildGenerationFileWriteResult,
} = require("./buildGenerationFileWriteResult");

const {
  validateGenerationFileWriteResult,
} = require("./validateGenerationFileWriteResult");

const {
  writeGenerationFileAtomically,
} = require("./writeGenerationFileAtomically");

function safeIdentity(value) {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  )
    ? value
    : "unavailable";
}

function hashFile(filePath, fsOps) {
  return crypto
    .createHash("sha256")
    .update(
      fsOps.readFileSync(
        filePath
      )
    )
    .digest("hex");
}

function buildGuardFailure({
  generationPlan,
  writePreflightReport,
  code,
  message,
}) {
  return buildGenerationWriteReport({
    status: "failed",
    planIdentity:
      safeIdentity(
        generationPlan &&
        generationPlan.planIdentity
      ),
    preflightIdentity:
      safeIdentity(
        writePreflightReport &&
        writePreflightReport.planIdentity
      ),
    fileResults: [],
    errors: [
      {
        code,
        message,
      },
    ],
    warnings: [],
    metadata: {
      writerId:
        "imago-generation-plan-writer",
      mode: "write",
      failurePolicy:
        "stop_on_first_failure",
      atomicPerFile: true,
      transactionalPlan: false,
    },
  });
}

function buildSkippedResult(
  file,
  preflightFile
) {
  return buildGenerationFileWriteResult({
    relativePath:
      file.relativePath,
    action:
      preflightFile.action,
    status: "skipped",
    expectedContentHash:
      file.contentHash,
    writtenContentHash: null,
    errorCode:
      "not_attempted_after_failure",
    message:
      "File was not attempted because a previous operation failed.",
    metadata: {
      attempted: false,
    },
  });
}

function validateOperationalCoherence({
  generationPlan,
  writePreflightReport,
}) {
  const planFiles =
    Array.isArray(
      generationPlan.files
    )
      ? generationPlan.files
      : [];

  const preflightFiles =
    Array.isArray(
      writePreflightReport.files
    )
      ? writePreflightReport.files
      : [];

  if (
    planFiles.length !==
    preflightFiles.length
  ) {
    return {
      valid: false,
      message:
        "GenerationPlan and WritePreflightReport contain different file counts.",
    };
  }

  const byPath = new Map();

  for (
    const preflightFile
    of preflightFiles
  ) {
    if (
      !preflightFile ||
      typeof preflightFile.relativePath !==
        "string" ||
      byPath.has(
        preflightFile.relativePath
      )
    ) {
      return {
        valid: false,
        message:
          "WritePreflightReport contains missing or duplicate relative paths.",
      };
    }

    byPath.set(
      preflightFile.relativePath,
      preflightFile
    );
  }

  const seen = new Set();
  const pairs = [];

  for (
    const file
    of planFiles
  ) {
    if (
      !file ||
      typeof file.relativePath !==
        "string" ||
      seen.has(
        file.relativePath
      )
    ) {
      return {
        valid: false,
        message:
          "GenerationPlan contains missing or duplicate relative paths.",
      };
    }

    seen.add(
      file.relativePath
    );

    const preflightFile =
      byPath.get(
        file.relativePath
      );

    if (!preflightFile) {
      return {
        valid: false,
        message:
          `Missing preflight entry for ${file.relativePath}.`,
      };
    }

    if (
      file.contentHash !==
        preflightFile.contentHash ||
      !["create", "overwrite"]
        .includes(
          preflightFile.action
        ) ||
      typeof preflightFile.resolvedPath !==
        "string" ||
      !path.isAbsolute(
        preflightFile.resolvedPath
      ) ||
      typeof preflightFile.parentDirectory !==
        "string" ||
      path.dirname(
        preflightFile.resolvedPath
      ) !==
        preflightFile.parentDirectory ||
      path.resolve(
        writePreflightReport.resolvedTargetRoot,
        file.relativePath
      ) !==
        preflightFile.resolvedPath ||
      preflightFile.action ===
        "overwrite" &&
      file.overwritePolicy !==
        "allow_explicit"
    ) {
      return {
        valid: false,
        message:
          `Operational preflight entry is incoherent for ${file.relativePath}.`,
      };
    }

    pairs.push({
      file,
      preflightFile,
    });
  }

  return {
    valid: true,
    pairs,
  };
}

function createGenerationPlanWriter({
  fsOps = fs,
  writeFileAtomically =
    writeGenerationFileAtomically,
  hashTarget = hashFile,
} = {}) {
  function finalizeReport(input) {
    const report =
      buildGenerationWriteReport(
        input
      );

    const validation =
      validateGenerationWriteReport(
        report
      );

    if (
      validation.isValid === true
    ) {
      return report;
    }

    const fallback =
      buildGenerationWriteReport({
        status: "failed",
        planIdentity:
          safeIdentity(
            input.planIdentity
          ),
        preflightIdentity:
          safeIdentity(
            input.preflightIdentity
          ),
        fileResults: [],
        errors: [
          {
            code:
              "generation_write_report_invalid",
            message:
              validation.errors.join(
                "; "
              ) ||
              "GenerationWriteReport validation failed.",
          },
        ],
        warnings: [],
        metadata: {
          writerId:
            "imago-generation-plan-writer",
          mode: "write",
          failurePolicy:
            "stop_on_first_failure",
          atomicPerFile: true,
          transactionalPlan: false,
        },
      });

    return fallback;
  }

  function writeGenerationPlan({
    generationPlan,
    writePreflightReport,
  } = {}) {
    const planValidation =
      validateGenerationPlan(
        generationPlan
      );

    if (
      planValidation.isValid !==
      true
    ) {
      return buildGuardFailure({
        generationPlan,
        writePreflightReport,
        code:
          "generation_plan_invalid",
        message:
          "GenerationPlan validation failed.",
      });
    }

    const preflightValidation =
      validateGenerationWritePreflight(
        writePreflightReport
      );

    if (
      preflightValidation.isValid !==
      true
    ) {
      return buildGuardFailure({
        generationPlan,
        writePreflightReport,
        code:
          "write_preflight_invalid",
        message:
          "WritePreflightReport validation failed.",
      });
    }

    if (
      generationPlan.planIdentity !==
      writePreflightReport.planIdentity
    ) {
      return buildGuardFailure({
        generationPlan,
        writePreflightReport,
        code:
          "plan_preflight_mismatch",
        message:
          "GenerationPlan and WritePreflightReport identities do not match.",
      });
    }

    if (
      writePreflightReport.preflightStatus !==
      "ready"
    ) {
      return buildGuardFailure({
        generationPlan,
        writePreflightReport,
        code:
          "preflight_not_ready",
        message:
          "WritePreflightReport is not ready.",
      });
    }

    const coherence =
      validateOperationalCoherence({
        generationPlan,
        writePreflightReport,
      });

    if (
      coherence.valid !== true
    ) {
      return buildGuardFailure({
        generationPlan,
        writePreflightReport,
        code:
          "plan_preflight_files_mismatch",
        message:
          coherence.message,
      });
    }

    const fileResults = [];
    const errors = [];
    const warnings = [];
    const directories =
      Array.from(
        new Set(
          coherence.pairs
            .filter(
              ({ preflightFile }) =>
                preflightFile.parentExists ===
                  false
            )
            .map(
              ({ preflightFile }) =>
                preflightFile.parentDirectory
            )
        )
      )
        .sort(
          (a, b) =>
            a.split(path.sep).length -
              b.split(path.sep).length ||
            a.localeCompare(b)
        );

    try {
      for (
        const directory
        of directories
      ) {
        const matchingEntries =
          coherence.pairs.filter(
            ({ preflightFile }) =>
              preflightFile.parentDirectory ===
              directory
          );

        if (
          matchingEntries.some(
            ({ preflightFile }) =>
              preflightFile.parentCreatable !==
                true
          )
        ) {
          throw new Error(
            `Directory was not authorized as creatable: ${directory}`
          );
        }

        fsOps.mkdirSync(
          directory,
          {
            recursive: true,
          }
        );

        const stat =
          fsOps.statSync(
            directory
          );

        if (
          !stat.isDirectory()
        ) {
          throw new Error(
            `Prepared path is not a directory: ${directory}`
          );
        }
      }
    } catch (error) {
      coherence.pairs.forEach(
        ({ file, preflightFile }) => {
          fileResults.push(
            buildSkippedResult(
              file,
              preflightFile
            )
          );
        }
      );

      errors.push({
        code:
          "directory_preparation_failed",
        message:
          error.message,
      });

      warnings.push(
        "No file was attempted because directory preparation failed."
      );

      return finalizeReport({
        status: "failed",
        planIdentity:
          generationPlan.planIdentity,
        preflightIdentity:
          writePreflightReport.planIdentity,
        fileResults,
        errors,
        warnings,
        metadata: {
          writerId:
            "imago-generation-plan-writer",
          mode: "write",
          failurePolicy:
            "stop_on_first_failure",
          atomicPerFile: true,
          transactionalPlan: false,
        },
      });
    }

    let stopped = false;

    for (
      let index = 0;
      index <
      coherence.pairs.length;
      index += 1
    ) {
      const {
        file,
        preflightFile,
      } = coherence.pairs[index];

      if (stopped) {
        fileResults.push(
          buildSkippedResult(
            file,
            preflightFile
          )
        );
        continue;
      }

      let result =
        writeFileAtomically({
          generatedFileEntry:
            file,
          preflightFileEntry:
            preflightFile,
        });

      const resultValidation =
        validateGenerationFileWriteResult(
          result
        );

      if (
        resultValidation.isValid !==
        true
      ) {
        result =
          buildGenerationFileWriteResult({
            relativePath:
              file.relativePath,
            action:
              preflightFile.action,
            status: "failed",
            expectedContentHash:
              file.contentHash,
            writtenContentHash:
              null,
            errorCode:
              "generation_file_write_result_invalid",
            message:
              resultValidation.errors.join(
                "; "
              ),
            metadata: {
              attempted: true,
            },
          });
      }

      if (
        result.status ===
        "success"
      ) {
        let finalHash;

        try {
          finalHash =
            hashTarget(
              preflightFile.resolvedPath,
              fsOps
            );
        } catch (error) {
          finalHash = null;
        }

        if (
          finalHash !==
          file.contentHash
        ) {
          result =
            buildGenerationFileWriteResult({
              relativePath:
                file.relativePath,
              action:
                preflightFile.action,
              status: "failed",
              expectedContentHash:
                file.contentHash,
              writtenContentHash:
                null,
              errorCode:
                "post_write_hash_mismatch",
              message:
                "Published target hash does not match expected content hash.",
              metadata: {
                attempted: true,
                published: true,
              },
            });
        } else {
          result = {
            ...result,
            writtenContentHash:
              finalHash,
          };
        }
      }

      fileResults.push(
        result
      );

      if (
        result.status ===
        "failed"
      ) {
        stopped = true;

        errors.push({
          code:
            result.errorCode,
          message:
            result.message ||
            `File write failed: ${result.relativePath}`,
        });
      }
    }

    const successful =
      fileResults.filter(
        (result) =>
          result.status ===
          "success"
      ).length;

    const failed =
      fileResults.filter(
        (result) =>
          result.status ===
          "failed"
      ).length;

    const skipped =
      fileResults.filter(
        (result) =>
          result.status ===
          "skipped"
      ).length;

    let status = "completed";

    if (
      successful === 0 &&
      (
        failed > 0 ||
        skipped > 0
      )
    ) {
      status = "failed";
    } else if (
      failed > 0 ||
      skipped > 0
    ) {
      status = "partial";
    }

    if (
      status === "partial"
    ) {
      warnings.push(
        "Execution stopped after the first failure; no global rollback was attempted."
      );
    }

    if (
      skipped > 0
    ) {
      warnings.push(
        `${skipped} file(s) were not attempted.`
      );
    }

    return finalizeReport({
      status,
      planIdentity:
        generationPlan.planIdentity,
      preflightIdentity:
        writePreflightReport.planIdentity,
      fileResults,
      errors,
      warnings,
      metadata: {
        writerId:
          "imago-generation-plan-writer",
        mode: "write",
        failurePolicy:
          "stop_on_first_failure",
        atomicPerFile: true,
        transactionalPlan: false,
      },
    });
  }

  return {
    writeGenerationPlan,
  };
}

const {
  writeGenerationPlan,
} = createGenerationPlanWriter();

module.exports = {
  writeGenerationPlan,
  createGenerationPlanWriter,
};
