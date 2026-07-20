const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const {
  buildGenerationFileWriteResult,
} = require("./buildGenerationFileWriteResult");

const {
  validateGenerationFileWriteResult,
} = require("./validateGenerationFileWriteResult");

const ALLOWED_ACTIONS = [
  "create",
  "overwrite",
];

const FALLBACK_HASH =
  "0".repeat(64);

let temporaryCounter = 0;

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

function isSha256(value) {
  return (
    typeof value === "string" &&
    /^[a-f0-9]{64}$/.test(value)
  );
}

function isSafeRelativePath(value) {
  return (
    isNonEmptyString(value) &&
    !path.posix.isAbsolute(value) &&
    !path.win32.isAbsolute(value) &&
    !value
      .replace(/\\/g, "/")
      .split("/")
      .some(
        (segment) =>
          segment === ".."
      )
  );
}

function validateGeneratedFileEntry(
  entry
) {
  const errors = [];

  if (!isObject(entry)) {
    return [
      "generatedFileEntry must be an object.",
    ];
  }

  if (
    !isSafeRelativePath(
      entry.relativePath
    )
  ) {
    errors.push(
      "generatedFileEntry.relativePath must be a safe relative path."
    );
  }

  if (
    typeof entry.content !==
    "string"
  ) {
    errors.push(
      "generatedFileEntry.content must be a string."
    );
  }

  if (
    !isSha256(
      entry.contentHash
    )
  ) {
    errors.push(
      "generatedFileEntry.contentHash must be a valid SHA-256 hash."
    );
  }

  return errors;
}

function validatePreflightFileEntry(
  entry
) {
  const errors = [];

  if (!isObject(entry)) {
    return [
      "preflightFileEntry must be an object.",
    ];
  }

  if (
    !isSafeRelativePath(
      entry.relativePath
    )
  ) {
    errors.push(
      "preflightFileEntry.relativePath must be a safe relative path."
    );
  }

  if (
    !isNonEmptyString(
      entry.resolvedPath
    ) ||
    !path.isAbsolute(
      entry.resolvedPath
    )
  ) {
    errors.push(
      "preflightFileEntry.resolvedPath must be an absolute path."
    );
  }

  if (
    !ALLOWED_ACTIONS.includes(
      entry.action
    )
  ) {
    errors.push(
      "preflightFileEntry.action must be create or overwrite."
    );
  }

  if (
    !isSha256(
      entry.contentHash
    )
  ) {
    errors.push(
      "preflightFileEntry.contentHash must be a valid SHA-256 hash."
    );
  }

  return errors;
}

function defaultHashFile(
  filePath,
  fsOps
) {
  const content =
    fsOps.readFileSync(
      filePath
    );

  return crypto
    .createHash("sha256")
    .update(content)
    .digest("hex");
}

function defaultNonce() {
  return crypto
    .randomBytes(12)
    .toString("hex");
}

function buildFailureResult({
  generatedFileEntry,
  preflightFileEntry,
  errorCode,
  message,
  cleanupError = null,
}) {
  const result =
    buildGenerationFileWriteResult({
      relativePath:
        isSafeRelativePath(
          generatedFileEntry &&
          generatedFileEntry.relativePath
        )
          ? generatedFileEntry.relativePath
          : (
              isSafeRelativePath(
                preflightFileEntry &&
                preflightFileEntry.relativePath
              )
                ? preflightFileEntry.relativePath
                : "__invalid_generation_file__"
            ),

      action:
        ALLOWED_ACTIONS.includes(
          preflightFileEntry &&
          preflightFileEntry.action
        )
          ? preflightFileEntry.action
          : "create",

      status:
        "failed",

      expectedContentHash:
        isSha256(
          generatedFileEntry &&
          generatedFileEntry.contentHash
        )
          ? generatedFileEntry.contentHash
          : (
              isSha256(
                preflightFileEntry &&
                preflightFileEntry.contentHash
              )
                ? preflightFileEntry.contentHash
                : FALLBACK_HASH
            ),

      writtenContentHash:
        null,

      errorCode,

      message,

      metadata: {
        atomic: true,
        cleanupError:
          cleanupError
            ? {
                code:
                  cleanupError.code ||
                  "temporary_cleanup_failed",

                message:
                  cleanupError.message ||
                  "Temporary cleanup failed.",
              }
            : null,
      },
    });

  const validation =
    validateGenerationFileWriteResult(
      result
    );

  if (
    validation.isValid !==
    true
  ) {
    throw new Error(
      `Internal GenerationFileWriteResult construction failed: ${validation.errors.join(
        "; "
      )}`
    );
  }

  return result;
}

function buildSuccessResult({
  generatedFileEntry,
  preflightFileEntry,
  writtenContentHash,
}) {
  const result =
    buildGenerationFileWriteResult({
      relativePath:
        generatedFileEntry.relativePath,

      action:
        preflightFileEntry.action,

      status:
        "success",

      expectedContentHash:
        generatedFileEntry.contentHash,

      writtenContentHash,

      errorCode:
        null,

      message:
        preflightFileEntry.action ===
          "create"
          ? "File created atomically."
          : "File overwritten atomically.",

      metadata: {
        atomic: true,
        encoding: "utf8",
        publishStrategy:
          preflightFileEntry.action ===
            "create"
            ? "exclusive_hard_link"
            : "same_filesystem_rename",
      },
    });

  const validation =
    validateGenerationFileWriteResult(
      result
    );

  if (
    validation.isValid !==
    true
  ) {
    throw new Error(
      `Internal GenerationFileWriteResult construction failed: ${validation.errors.join(
        "; "
      )}`
    );
  }

  return result;
}

function createAtomicGenerationFileWriter({
  fsOps = fs,
  hashFile = defaultHashFile,
  nonce = defaultNonce,
  maxTemporaryAttempts = 8,
} = {}) {
  function cleanupTemporary({
    temporaryPath,
    descriptor,
  }) {
    let cleanupError = null;

    if (
      descriptor !== null &&
      descriptor !== undefined
    ) {
      try {
        fsOps.closeSync(
          descriptor
        );
      } catch (error) {
        cleanupError = {
          code:
            "temporary_file_close_failed",
          message:
            error.message,
        };
      }
    }

    if (
      temporaryPath &&
      fsOps.existsSync(
        temporaryPath
      )
    ) {
      try {
        fsOps.unlinkSync(
          temporaryPath
        );
      } catch (error) {
        cleanupError = cleanupError || {
          code:
            "temporary_cleanup_failed",
          message:
            error.message,
        };
      }
    }

    return cleanupError;
  }

  function createTemporaryFile(
    targetPath
  ) {
    const parentDirectory =
      path.dirname(
        targetPath
      );

    const targetName =
      path.basename(
        targetPath
      );

    let lastError = null;

    for (
      let attempt = 0;
      attempt <
      maxTemporaryAttempts;
      attempt += 1
    ) {
      temporaryCounter += 1;

      const temporaryPath =
        path.join(
          parentDirectory,
          `.${targetName}.imago-tmp-${process.pid}-${temporaryCounter}-${nonce()}`
        );

      try {
        const descriptor =
          fsOps.openSync(
            temporaryPath,
            "wx",
            0o600
          );

        return {
          temporaryPath,
          descriptor,
        };
      } catch (error) {
        lastError = error;

        if (
          error &&
          error.code ===
            "EEXIST"
        ) {
          continue;
        }

        break;
      }
    }

    const error =
      new Error(
        lastError &&
        lastError.message
          ? lastError.message
          : "Temporary file could not be created."
      );

    error.code =
      "temporary_file_creation_failed";

    throw error;
  }

  function writeGenerationFileAtomically({
    generatedFileEntry,
    preflightFileEntry,
  } = {}) {
    const generatedErrors =
      validateGeneratedFileEntry(
        generatedFileEntry
      );

    if (
      generatedErrors.length > 0
    ) {
      return buildFailureResult({
        generatedFileEntry,
        preflightFileEntry,
        errorCode:
          "generation_file_entry_invalid",
        message:
          generatedErrors.join(" "),
      });
    }

    const preflightErrors =
      validatePreflightFileEntry(
        preflightFileEntry
      );

    if (
      preflightErrors.length > 0
    ) {
      return buildFailureResult({
        generatedFileEntry,
        preflightFileEntry,
        errorCode:
          "preflight_file_entry_invalid",
        message:
          preflightErrors.join(" "),
      });
    }

    if (
      generatedFileEntry.relativePath !==
        preflightFileEntry.relativePath ||
      generatedFileEntry.contentHash !==
        preflightFileEntry.contentHash
    ) {
      return buildFailureResult({
        generatedFileEntry,
        preflightFileEntry,
        errorCode:
          "preflight_file_entry_invalid",
        message:
          "Preflight file entry does not match the generated file entry.",
      });
    }

    const targetPath =
      preflightFileEntry.resolvedPath;

    const parentDirectory =
      path.dirname(
        targetPath
      );

    let parentStat;

    try {
      parentStat =
        fsOps.statSync(
          parentDirectory
        );
    } catch (error) {
      if (
        error &&
        error.code === "ENOENT"
      ) {
        return buildFailureResult({
          generatedFileEntry,
          preflightFileEntry,
          errorCode:
            "parent_directory_missing",
          message:
            "Parent directory does not exist.",
        });
      }

      return buildFailureResult({
        generatedFileEntry,
        preflightFileEntry,
        errorCode:
          "parent_path_not_directory",
        message:
          error.message,
      });
    }

    if (
      !parentStat.isDirectory()
    ) {
      return buildFailureResult({
        generatedFileEntry,
        preflightFileEntry,
        errorCode:
          "parent_path_not_directory",
        message:
          "Parent path is not a directory.",
      });
    }

    let temporaryPath = null;
    let descriptor = null;

    try {
      let temporary;

      try {
        temporary =
          createTemporaryFile(
            targetPath
          );

        temporaryPath =
          temporary.temporaryPath;

        descriptor =
          temporary.descriptor;
      } catch (error) {
        return buildFailureResult({
          generatedFileEntry,
          preflightFileEntry,
          errorCode:
            "temporary_file_creation_failed",
          message:
            error.message,
        });
      }

      try {
        const bytes =
          Buffer.from(
            generatedFileEntry.content,
            "utf8"
          );

        let offset = 0;

        while (
          offset <
          bytes.length
        ) {
          const written =
            fsOps.writeSync(
              descriptor,
              bytes,
              offset,
              bytes.length -
                offset,
              null
            );

          if (
            !Number.isInteger(
              written
            ) ||
            written <= 0
          ) {
            throw new Error(
              "Temporary file write made no progress."
            );
          }

          offset += written;
        }
      } catch (error) {
        const cleanupError =
          cleanupTemporary({
            temporaryPath,
            descriptor,
          });

        descriptor = null;

        return buildFailureResult({
          generatedFileEntry,
          preflightFileEntry,
          errorCode:
            "temporary_file_write_failed",
          message:
            error.message,
          cleanupError,
        });
      }

      try {
        fsOps.fsyncSync(
          descriptor
        );
      } catch (error) {
        const cleanupError =
          cleanupTemporary({
            temporaryPath,
            descriptor,
          });

        descriptor = null;

        return buildFailureResult({
          generatedFileEntry,
          preflightFileEntry,
          errorCode:
            "temporary_file_flush_failed",
          message:
            error.message,
          cleanupError,
        });
      }

      try {
        fsOps.closeSync(
          descriptor
        );

        descriptor = null;
      } catch (error) {
        const cleanupError =
          cleanupTemporary({
            temporaryPath,
            descriptor: null,
          });

        return buildFailureResult({
          generatedFileEntry,
          preflightFileEntry,
          errorCode:
            "temporary_file_close_failed",
          message:
            error.message,
          cleanupError,
        });
      }

      let temporaryHash;

      try {
        temporaryHash =
          hashFile(
            temporaryPath,
            fsOps
          );
      } catch (error) {
        const cleanupError =
          cleanupTemporary({
            temporaryPath,
            descriptor: null,
          });

        return buildFailureResult({
          generatedFileEntry,
          preflightFileEntry,
          errorCode:
            "temporary_hash_mismatch",
          message:
            `Temporary file hash could not be verified: ${error.message}`,
          cleanupError,
        });
      }

      if (
        temporaryHash !==
        generatedFileEntry.contentHash
      ) {
        const cleanupError =
          cleanupTemporary({
            temporaryPath,
            descriptor: null,
          });

        return buildFailureResult({
          generatedFileEntry,
          preflightFileEntry,
          errorCode:
            "temporary_hash_mismatch",
          message:
            "Temporary file hash does not match expected content hash.",
          cleanupError,
        });
      }

      if (
        preflightFileEntry.action ===
        "create"
      ) {
        try {
          fsOps.linkSync(
            temporaryPath,
            targetPath
          );
        } catch (error) {
          const cleanupError =
            cleanupTemporary({
              temporaryPath,
              descriptor: null,
            });

          return buildFailureResult({
            generatedFileEntry,
            preflightFileEntry,
            errorCode:
              error &&
              (
                error.code ===
                  "EEXIST" ||
                error.code ===
                  "EPERM"
              )
                ? "target_already_exists"
                : "atomic_publish_failed",
            message:
              error.message,
            cleanupError,
          });
        }

        try {
          fsOps.unlinkSync(
            temporaryPath
          );

          temporaryPath = null;
        } catch (error) {
          return buildFailureResult({
            generatedFileEntry,
            preflightFileEntry,
            errorCode:
              "temporary_cleanup_failed",
            message:
              "Target was published, but temporary link cleanup failed.",
            cleanupError: {
              code:
                "temporary_cleanup_failed",
              message:
                error.message,
            },
          });
        }
      } else {
        try {
          fsOps.renameSync(
            temporaryPath,
            targetPath
          );

          temporaryPath = null;
        } catch (error) {
          const cleanupError =
            cleanupTemporary({
              temporaryPath,
              descriptor: null,
            });

          return buildFailureResult({
            generatedFileEntry,
            preflightFileEntry,
            errorCode:
              "atomic_publish_failed",
            message:
              error.message,
            cleanupError,
          });
        }
      }

      return buildSuccessResult({
        generatedFileEntry,
        preflightFileEntry,
        writtenContentHash:
          temporaryHash,
      });
    } catch (error) {
      const cleanupError =
        cleanupTemporary({
          temporaryPath,
          descriptor,
        });

      return buildFailureResult({
        generatedFileEntry,
        preflightFileEntry,
        errorCode:
          "atomic_publish_failed",
        message:
          error.message,
        cleanupError,
      });
    }
  }

  return {
    writeGenerationFileAtomically,
  };
}

const {
  writeGenerationFileAtomically,
} = createAtomicGenerationFileWriter();

module.exports = {
  writeGenerationFileAtomically,
  createAtomicGenerationFileWriter,
};
