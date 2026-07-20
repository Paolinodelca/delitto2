const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  validateGenerationPlan,
} = require("./validateGenerationPlan");

const {
  calculateGenerationPlanIdentity,
} = require("./calculateGenerationPlanIdentity");

const CONFLICT_MESSAGES = {
  unsafe_root:
    "The selected root or target root is not safe for generation.",
  path_escape:
    "Target path escapes the resolved target root.",
  external_symlink:
    "Symbolic link resolves outside the target root.",
  existing_directory:
    "Target path already exists as a directory.",
  existing_other:
    "Target path already exists as an unsupported filesystem type.",
  parent_is_file:
    "A parent path segment exists as a file.",
  parent_not_creatable:
    "Parent directory cannot be created safely.",
  overwrite_forbidden:
    "Target file exists and overwrite is not permitted.",
};

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

function uniqueStrings(values) {
  const result = [];
  const seen = new Set();

  (
    Array.isArray(values)
      ? values
      : []
  ).forEach((value) => {
    if (
      typeof value !== "string" ||
      value.trim().length === 0 ||
      seen.has(value)
    ) {
      return;
    }

    seen.add(value);
    result.push(value);
  });

  return result;
}

function buildEmptySummary() {
  return {
    totalFiles: 0,
    createFiles: 0,
    overwriteFiles: 0,
    blockedFiles: 0,
    existingFiles: 0,
    missingParentDirectories: 0,
  };
}

function isPathContained({
  parentPath,
  candidatePath,
  allowEqual = true,
}) {
  const relative =
    path.relative(
      parentPath,
      candidatePath
    );

  if (relative === "") {
    return allowEqual;
  }

  return (
    !path.isAbsolute(relative) &&
    relative !== ".." &&
    !relative.startsWith(
      `..${path.sep}`
    )
  );
}

function isFilesystemRoot(resolvedPath) {
  return (
    resolvedPath ===
    path.parse(resolvedPath).root
  );
}

function isHomeDirectory(resolvedPath) {
  return (
    resolvedPath ===
    path.resolve(
      os.homedir()
    )
  );
}

function inspectExistingPath(resolvedPath) {
  try {
    const stat =
      fs.lstatSync(
        resolvedPath
      );

    if (stat.isSymbolicLink()) {
      return {
        exists: true,
        type: "symlink",
        stat,
      };
    }

    if (stat.isFile()) {
      return {
        exists: true,
        type: "file",
        stat,
      };
    }

    if (stat.isDirectory()) {
      return {
        exists: true,
        type: "directory",
        stat,
      };
    }

    return {
      exists: true,
      type: "other",
      stat,
    };
  } catch (error) {
    if (
      error &&
      error.code === "ENOENT"
    ) {
      return {
        exists: false,
        type: null,
        stat: null,
      };
    }

    throw error;
  }
}

function resolveRealPathProjection(
  resolvedPath
) {
  const missingSegments = [];
  let current =
    resolvedPath;

  while (true) {
    const inspection =
      inspectExistingPath(current);

    if (inspection.exists) {
      let realExistingPath;

      try {
        realExistingPath =
          fs.realpathSync(current);
      } catch (error) {
        return {
          safe: false,
          realPath: null,
          errorType:
            "unresolvable_symlink",
        };
      }

      return {
        safe: true,

        realPath:
          missingSegments
            .reverse()
            .reduce(
              (accumulator, segment) =>
                path.join(
                  accumulator,
                  segment
                ),
              realExistingPath
            ),

        errorType: null,
      };
    }

    const parent =
      path.dirname(current);

    if (parent === current) {
      return {
        safe: false,
        realPath: null,
        errorType:
          "unresolvable_path",
      };
    }

    missingSegments.push(
      path.basename(current)
    );

    current = parent;
  }
}

function resolveSafeTargetRoot({
  resolvedRootDirectory,
  resolvedTargetRoot,
}) {
  const realRootProjection =
    resolveRealPathProjection(
      resolvedRootDirectory
    );

  if (
    realRootProjection.safe !==
    true
  ) {
    return {
      safe: false,
      realRootDirectory: null,
      realTargetRoot: null,
      errorType:
        realRootProjection.errorType,
    };
  }

  const realTargetProjection =
    resolveRealPathProjection(
      resolvedTargetRoot
    );

  if (
    realTargetProjection.safe !==
    true
  ) {
    return {
      safe: false,
      realRootDirectory:
        realRootProjection.realPath,
      realTargetRoot: null,
      errorType:
        realTargetProjection.errorType,
    };
  }

  if (
    !isPathContained({
      parentPath:
        realRootProjection.realPath,

      candidatePath:
        realTargetProjection.realPath,

      allowEqual: true,
    })
  ) {
    return {
      safe: false,
      realRootDirectory:
        realRootProjection.realPath,
      realTargetRoot:
        realTargetProjection.realPath,
      errorType:
        "target_root_escape",
    };
  }

  return {
    safe: true,

    realRootDirectory:
      realRootProjection.realPath,

    realTargetRoot:
      realTargetProjection.realPath,

    errorType: null,
  };
}

function classifyResolvedType(
  resolvedPath
) {
  const inspection =
    inspectExistingPath(
      resolvedPath
    );

  if (!inspection.exists) {
    return {
      exists: false,
      type: null,
    };
  }

  return {
    exists: true,
    type:
      inspection.type === "symlink"
        ? "other"
        : inspection.type,
  };
}

function inspectPathSymlinkChain({
  resolvedTargetRoot,
  resolvedPath,
  realTargetRoot,
}) {
  const relative =
    path.relative(
      resolvedTargetRoot,
      resolvedPath
    );

  const segments =
    relative === ""
      ? []
      : relative.split(
          path.sep
        );

  let currentLexical =
    resolvedTargetRoot;

  let currentReal =
    realTargetRoot;

  let encounteredMissing = false;
  let parentExists = true;

  const encounteredSymlinks = [];

  for (
    let index = 0;
    index < segments.length;
    index += 1
  ) {
    const segment =
      segments[index];

    const isFinal =
      index ===
      segments.length - 1;

    currentLexical =
      path.join(
        currentLexical,
        segment
      );

    const inspection =
      inspectExistingPath(
        currentLexical
      );

    if (!inspection.exists) {
      encounteredMissing = true;

      if (!isFinal) {
        parentExists = false;
      }

      currentReal =
        path.join(
          currentReal,
          segment
        );

      if (
        !isPathContained({
          parentPath:
            realTargetRoot,

          candidatePath:
            currentReal,

          allowEqual: false,
        })
      ) {
        return {
          safe: false,
          conflictType:
            "external_symlink",
          message:
            "Symbolic link resolves outside the target root.",
          encounteredSymlinks,
          targetExists: false,
          targetType: null,
          parentExists: false,
          parentCreatable: false,
        };
      }

      continue;
    }

    if (
      inspection.type ===
      "symlink"
    ) {
      let realSymlinkTarget;

      try {
        realSymlinkTarget =
          fs.realpathSync(
            currentLexical
          );
      } catch (error) {
        return {
          safe: false,
          conflictType:
            "external_symlink",
          message:
            "Symbolic link could not be resolved safely.",
          encounteredSymlinks: [
            ...encounteredSymlinks,
            currentLexical,
          ],
          targetExists:
            isFinal,
          targetType: "other",
          parentExists:
            !encounteredMissing,
          parentCreatable: false,
        };
      }

      encounteredSymlinks.push(
        currentLexical
      );

      if (
        !isPathContained({
          parentPath:
            realTargetRoot,

          candidatePath:
            realSymlinkTarget,

          allowEqual: true,
        })
      ) {
        return {
          safe: false,
          conflictType:
            "external_symlink",
          message:
            "Symbolic link resolves outside the target root.",
          encounteredSymlinks,
          targetExists:
            isFinal,
          targetType: "other",
          parentExists:
            !encounteredMissing,
          parentCreatable: false,
        };
      }

      const realType =
        classifyResolvedType(
          realSymlinkTarget
        );

      if (
        !isFinal &&
        realType.type !==
          "directory"
      ) {
        return {
          safe: false,
          conflictType:
            realType.type === "file"
              ? "parent_is_file"
              : "parent_not_creatable",
          message:
            realType.type === "file"
              ? "A parent path segment exists as a file."
              : "Parent directory cannot be created safely.",
          encounteredSymlinks,
          targetExists: false,
          targetType: null,
          parentExists: false,
          parentCreatable: false,
        };
      }

      currentReal =
        realSymlinkTarget;

      if (isFinal) {
        return {
          safe: true,
          conflictType: null,
          message: null,
          encounteredSymlinks,
          targetExists: true,
          targetType:
            realType.type,
          parentExists:
            !encounteredMissing,
          parentCreatable: true,
        };
      }

      continue;
    }

    currentReal =
      path.join(
        currentReal,
        segment
      );

    if (
      !isPathContained({
        parentPath:
          realTargetRoot,

        candidatePath:
          currentReal,

        allowEqual: false,
      })
    ) {
      return {
        safe: false,
        conflictType:
          "external_symlink",
        message:
          "Symbolic link resolves outside the target root.",
        encounteredSymlinks,
        targetExists:
          isFinal,
        targetType:
          inspection.type,
        parentExists:
          !encounteredMissing,
        parentCreatable: false,
      };
    }

    if (!isFinal) {
      if (
        inspection.type ===
        "file"
      ) {
        return {
          safe: false,
          conflictType:
            "parent_is_file",
          message:
            "A parent path segment exists as a file.",
          encounteredSymlinks,
          targetExists: false,
          targetType: null,
          parentExists: false,
          parentCreatable: false,
        };
      }

      if (
        inspection.type !==
        "directory"
      ) {
        return {
          safe: false,
          conflictType:
            "parent_not_creatable",
          message:
            "Parent directory cannot be created safely.",
          encounteredSymlinks,
          targetExists: false,
          targetType: null,
          parentExists: false,
          parentCreatable: false,
        };
      }
    }

    if (isFinal) {
      return {
        safe: true,
        conflictType: null,
        message: null,
        encounteredSymlinks,
        targetExists: true,
        targetType:
          inspection.type,
        parentExists:
          !encounteredMissing,
        parentCreatable: true,
      };
    }
  }

  return {
    safe: true,
    conflictType: null,
    message: null,
    encounteredSymlinks,
    targetExists: false,
    targetType: null,
    parentExists:
      !encounteredMissing,
    parentCreatable: true,
  };
}

function buildConflict({
  relativePath,
  resolvedPath,
  conflictType,
  message = null,
}) {
  return {
    relativePath,
    resolvedPath,
    conflictType,
    message:
      message ||
      CONFLICT_MESSAGES[
        conflictType
      ],
  };
}

function buildInvalidReport({
  plan,
  rootDirectory,
  resolvedTargetRoot,
  allowOverwrite,
  planValidation,
  errors,
  conflicts = [],
}) {
  const sourcePlan =
    isObject(plan)
      ? plan
      : {};

  return {
    preflightStatus: "invalid",

    planId:
      isNonEmptyString(
        sourcePlan.planId
      )
        ? sourcePlan.planId
        : null,

    planIdentity:
      isNonEmptyString(
        sourcePlan.planIdentity
      )
        ? sourcePlan.planIdentity
        : calculateGenerationPlanIdentity(
            sourcePlan
          ),

    generatorId:
      isNonEmptyString(
        sourcePlan.generatorId
      )
        ? sourcePlan.generatorId
        : null,

    rootDirectory:
      isNonEmptyString(
        rootDirectory
      )
        ? path.resolve(
            rootDirectory
          )
        : null,

    targetRoot:
      isNonEmptyString(
        sourcePlan.targetRoot
      )
        ? sourcePlan.targetRoot
        : null,

    resolvedTargetRoot:
      resolvedTargetRoot || null,

    allowOverwrite,

    planValidation,

    files: [],

    summary:
      buildEmptySummary(),

    conflicts,

    errors:
      uniqueStrings(errors),

    warnings: [],

    metadata: {
      version: "1.0",
      createdAt:
        new Date().toISOString(),
    },
  };
}

function buildSummary(files) {
  const missingParents =
    new Set(
      files
        .filter(
          (file) =>
            file.parentExists ===
            false
        )
        .map(
          (file) =>
            file.parentDirectory
        )
    );

  return {
    totalFiles:
      files.length,

    createFiles:
      files.filter(
        (file) =>
          file.action ===
          "create"
      ).length,

    overwriteFiles:
      files.filter(
        (file) =>
          file.action ===
          "overwrite"
      ).length,

    blockedFiles:
      files.filter(
        (file) =>
          file.action ===
          "blocked"
      ).length,

    existingFiles:
      files.filter(
        (file) =>
          file.exists === true
      ).length,

    missingParentDirectories:
      missingParents.size,
  };
}

function buildGenerationWritePreflight({
  plan,
  rootDirectory,
  allowOverwrite = false,
} = {}) {
  const normalizedAllowOverwrite =
    allowOverwrite === true;

  try {
    const planValidation =
      validateGenerationPlan(
        plan
      );

    if (
      planValidation.isValid !==
      true
    ) {
      return buildInvalidReport({
        plan,
        rootDirectory,
        resolvedTargetRoot:
          null,
        allowOverwrite:
          normalizedAllowOverwrite,
        planValidation,
        errors:
          planValidation.errors,
      });
    }

    if (
      !isNonEmptyString(
        rootDirectory
      )
    ) {
      return buildInvalidReport({
        plan,
        rootDirectory,
        resolvedTargetRoot:
          null,
        allowOverwrite:
          normalizedAllowOverwrite,
        planValidation,
        errors: [
          "rootDirectory must be a non-empty string.",
        ],
      });
    }

    const resolvedRootDirectory =
      path.resolve(
        rootDirectory
      );

    const resolvedTargetRoot =
      path.resolve(
        resolvedRootDirectory,
        plan.targetRoot
      );

    if (
      isFilesystemRoot(
        resolvedRootDirectory
      ) ||
      isFilesystemRoot(
        resolvedTargetRoot
      ) ||
      isHomeDirectory(
        resolvedRootDirectory
      ) ||
      isHomeDirectory(
        resolvedTargetRoot
      )
    ) {
      return buildInvalidReport({
        plan,
        rootDirectory,
        resolvedTargetRoot,
        allowOverwrite:
          normalizedAllowOverwrite,
        planValidation,
        errors: [
          CONFLICT_MESSAGES.unsafe_root,
        ],
        conflicts: [
          buildConflict({
            relativePath:
              plan.targetRoot,
            resolvedPath:
              resolvedTargetRoot,
            conflictType:
              "unsafe_root",
          }),
        ],
      });
    }

    if (
      !isPathContained({
        parentPath:
          resolvedRootDirectory,
        candidatePath:
          resolvedTargetRoot,
        allowEqual: true,
      })
    ) {
      return buildInvalidReport({
        plan,
        rootDirectory,
        resolvedTargetRoot,
        allowOverwrite:
          normalizedAllowOverwrite,
        planValidation,
        errors: [
          "Resolved target root escapes rootDirectory.",
        ],
        conflicts: [
          buildConflict({
            relativePath:
              plan.targetRoot,
            resolvedPath:
              resolvedTargetRoot,
            conflictType:
              "path_escape",
          }),
        ],
      });
    }

    const safeRoot =
      resolveSafeTargetRoot({
        resolvedRootDirectory,
        resolvedTargetRoot,
      });

    if (
      safeRoot.safe !== true
    ) {
      return buildInvalidReport({
        plan,
        rootDirectory,
        resolvedTargetRoot,
        allowOverwrite:
          normalizedAllowOverwrite,
        planValidation,
        errors: [
          safeRoot.errorType ===
          "target_root_escape"
            ? "Resolved target root escapes rootDirectory through a symbolic link."
            : "Filesystem inspection could not resolve the target root safely.",
        ],
        conflicts: [
          buildConflict({
            relativePath:
              plan.targetRoot,
            resolvedPath:
              resolvedTargetRoot,
            conflictType:
              safeRoot.errorType ===
              "target_root_escape"
                ? "external_symlink"
                : "unsafe_root",
            message:
              safeRoot.errorType ===
              "target_root_escape"
                ? "Symbolic link resolves outside the target root."
                : "Symbolic link could not be resolved safely.",
          }),
        ],
      });
    }

    const conflicts = [];
    const warnings = [];

    const files =
      plan.files.map((file) => {
        const resolvedPath =
          path.resolve(
            resolvedTargetRoot,
            file.relativePath
          );

        const parentDirectory =
          path.dirname(
            resolvedPath
          );

        const overwriteAllowed =
          normalizedAllowOverwrite &&
          file.overwritePolicy ===
            "allow_explicit";

        const entry = {
          relativePath:
            file.relativePath,

          resolvedPath,

          exists: false,

          existingType: null,

          overwritePolicy:
            file.overwritePolicy,

          overwriteAllowed,

          parentDirectory,

          parentExists: false,

          parentCreatable: false,

          contentHash:
            file.contentHash,

          action: "blocked",
        };

        if (
          !isPathContained({
            parentPath:
              resolvedTargetRoot,
            candidatePath:
              resolvedPath,
            allowEqual: false,
          })
        ) {
          conflicts.push(
            buildConflict({
              relativePath:
                file.relativePath,
              resolvedPath,
              conflictType:
                "path_escape",
            })
          );

          return entry;
        }

        const chainInspection =
          inspectPathSymlinkChain({
            resolvedTargetRoot,
            resolvedPath,
            realTargetRoot:
              safeRoot.realTargetRoot,
          });

        entry.parentExists =
          chainInspection.parentExists;

        entry.parentCreatable =
          chainInspection.parentCreatable;

        entry.exists =
          chainInspection.targetExists;

        entry.existingType =
          chainInspection.targetType;

        if (
          chainInspection
            .encounteredSymlinks
            .length > 0
        ) {
          warnings.push(
            "Target path traverses an internal symbolic link."
          );
        }

        if (
          chainInspection.safe !==
          true
        ) {
          conflicts.push(
            buildConflict({
              relativePath:
                file.relativePath,
              resolvedPath,
              conflictType:
                chainInspection.conflictType,
              message:
                chainInspection.message,
            })
          );

          return entry;
        }

        if (
          chainInspection.targetExists !==
          true
        ) {
          if (
            entry.parentCreatable
          ) {
            entry.action = "create";
          } else {
            conflicts.push(
              buildConflict({
                relativePath:
                  file.relativePath,
                resolvedPath,
                conflictType:
                  "parent_not_creatable",
              })
            );
          }

          return entry;
        }

        if (
          chainInspection.targetType ===
          "file"
        ) {
          if (overwriteAllowed) {
            entry.action =
              "overwrite";
          } else {
            conflicts.push(
              buildConflict({
                relativePath:
                  file.relativePath,
                resolvedPath,
                conflictType:
                  "overwrite_forbidden",
              })
            );
          }

          return entry;
        }

        if (
          chainInspection.targetType ===
          "directory"
        ) {
          conflicts.push(
            buildConflict({
              relativePath:
                file.relativePath,
              resolvedPath,
              conflictType:
                "existing_directory",
            })
          );

          return entry;
        }

        entry.existingType =
          "other";

        conflicts.push(
          buildConflict({
            relativePath:
              file.relativePath,
            resolvedPath,
            conflictType:
              "existing_other",
          })
        );

        return entry;
      });

    const summary =
      buildSummary(files);

    const blocked =
      summary.blockedFiles > 0 ||
      conflicts.length > 0;

    return {
      preflightStatus:
        blocked
          ? "blocked"
          : "ready",

      planId:
        plan.planId,

      planIdentity:
        plan.planIdentity,

      generatorId:
        plan.generatorId,

      rootDirectory:
        resolvedRootDirectory,

      targetRoot:
        plan.targetRoot,

      resolvedTargetRoot,

      allowOverwrite:
        normalizedAllowOverwrite,

      planValidation,

      files,

      summary,

      conflicts,

      errors: [],

      warnings:
        uniqueStrings(
          warnings
        ),

      metadata: {
        version: "1.0",
        createdAt:
          new Date().toISOString(),
      },
    };
  } catch (error) {
    return buildInvalidReport({
      plan,
      rootDirectory,
      resolvedTargetRoot:
        null,
      allowOverwrite:
        normalizedAllowOverwrite,
      planValidation: {
        isValid: false,
        errors: [],
        warnings: [],
      },
      errors: [
        "Filesystem inspection could not be completed.",
      ],
    });
  }
}

module.exports = {
  buildGenerationWritePreflight,
};
