const fs = require("fs");
const os = require("os");
const path = require("path");

const builderExports =
  require("../tools/imago-builder");

const {
  buildGenerationPlan,
  buildGenerationWritePreflight,
  validateGenerationWritePreflight,
} = builderExports;

const failures = [];
const skipped = [];

function expect(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function ensureDirectory(directory) {
  fs.mkdirSync(directory, {
    recursive: true,
  });
}

function buildPlan({
  planId = "generation_write_preflight_regression_v1",
  targetRoot = ".",
  files,
}) {
  return buildGenerationPlan({
    planId,

    generatorId:
      "generation_write_preflight_regression_generator",

    targetRoot,

    source: {
      moduleType: "test",
      sourceId: "preflight_regression",
      sourceVersion: "1.0",
    },

    files,
  });
}

function replaceRoots(
  value,
  replacements
) {
  if (
    typeof value !== "string"
  ) {
    return value;
  }

  return replacements.reduce(
    (result, replacement) =>
      result
        .split(replacement.path)
        .join(replacement.token),
    value
  );
}

function sanitize(
  preflight,
  replacements
) {
  return {
    ...preflight,

    rootDirectory:
      replaceRoots(
        preflight.rootDirectory,
        replacements
      ),

    resolvedTargetRoot:
      replaceRoots(
        preflight.resolvedTargetRoot,
        replacements
      ),

    files:
      preflight.files.map(
        (file) => ({
          ...file,

          resolvedPath:
            replaceRoots(
              file.resolvedPath,
              replacements
            ),

          parentDirectory:
            replaceRoots(
              file.parentDirectory,
              replacements
            ),
        })
      ),

    conflicts:
      preflight.conflicts.map(
        (conflict) => ({
          ...conflict,

          resolvedPath:
            replaceRoots(
              conflict.resolvedPath,
              replacements
            ),
        })
      ),

    metadata: {
      ...preflight.metadata,
      createdAt: null,
    },
  };
}

function validateReport(
  preflight,
  scenarioId
) {
  const validation =
    validateGenerationWritePreflight(
      preflight
    );

  expect(
    validation.isValid === true,
    `${scenarioId}: report validation failed: ${validation.errors.join(
      "; "
    )}`
  );
}

function createStandardFixture(root) {
  ensureDirectory(root);

  ensureDirectory(
    path.join(
      root,
      "overwrite"
    )
  );

  ensureDirectory(
    path.join(
      root,
      "blocked"
    )
  );

  ensureDirectory(
    path.join(
      root,
      "existing-directory"
    )
  );

  ensureDirectory(
    path.join(
      root,
      "parent"
    )
  );

  fs.writeFileSync(
    path.join(
      root,
      "overwrite/file.js"
    ),
    "old\n"
  );

  fs.writeFileSync(
    path.join(
      root,
      "blocked/file.js"
    ),
    "old\n"
  );

  fs.writeFileSync(
    path.join(
      root,
      "parent/occupied"
    ),
    "file\n"
  );
}

function buildStandardPlan() {
  return buildPlan({
    files: [
      {
        relativePath:
          "create/new.js",
        content:
          "new\n",
        overwritePolicy:
          "forbid",
      },

      {
        relativePath:
          "missing/deep/file.js",
        content:
          "new\n",
        overwritePolicy:
          "forbid",
      },

      {
        relativePath:
          "overwrite/file.js",
        content:
          "new\n",
        overwritePolicy:
          "allow_explicit",
      },

      {
        relativePath:
          "blocked/file.js",
        content:
          "new\n",
        overwritePolicy:
          "forbid",
      },

      {
        relativePath:
          "existing-directory",
        content:
          "new\n",
        overwritePolicy:
          "forbid",
      },

      {
        relativePath:
          "parent/occupied/file.js",
        content:
          "new\n",
        overwritePolicy:
          "forbid",
      },
    ],
  });
}

function tryCreateSymlink({
  target,
  linkPath,
  type,
}) {
  fs.symlinkSync(
    target,
    linkPath,
    type
  );
}

function prepareSymlinkFixture({
  root,
  externalRoot,
}) {
  ensureDirectory(
    path.join(
      root,
      "internal/shared"
    )
  );

  ensureDirectory(
    externalRoot
  );

  tryCreateSymlink({
    target:
      path.join(
        root,
        "internal/shared"
      ),

    linkPath:
      path.join(
        root,
        "internal-link"
      ),

    type:
      process.platform === "win32"
        ? "dir"
        : undefined,
  });

  tryCreateSymlink({
    target:
      externalRoot,

    linkPath:
      path.join(
        root,
        "external-link"
      ),

    type:
      process.platform === "win32"
        ? "dir"
        : undefined,
  });

  tryCreateSymlink({
    target:
      path.join(
        root,
        "missing-target"
      ),

    linkPath:
      path.join(
        root,
        "broken-link"
      ),

    type:
      process.platform === "win32"
        ? "file"
        : undefined,
  });
}

function prepareLoopFixture(root) {
  tryCreateSymlink({
    target:
      path.join(
        root,
        "loop-b"
      ),

    linkPath:
      path.join(
        root,
        "loop-a"
      ),

    type:
      process.platform === "win32"
        ? "file"
        : undefined,
  });

  tryCreateSymlink({
    target:
      path.join(
        root,
        "loop-a"
      ),

    linkPath:
      path.join(
        root,
        "loop-b"
      ),

    type:
      process.platform === "win32"
        ? "file"
        : undefined,
  });
}

const baseRoot =
  path.resolve(
    process.cwd(),
    "tmp/test-generation-write-preflight-regression"
  );

const firstRoot =
  path.join(
    baseRoot,
    "first"
  );

const secondRoot =
  path.join(
    baseRoot,
    "second"
  );

const firstExternal =
  path.join(
    baseRoot,
    "first-external"
  );

const secondExternal =
  path.join(
    baseRoot,
    "second-external"
  );

fs.rmSync(baseRoot, {
  recursive: true,
  force: true,
});

try {
  createStandardFixture(
    firstRoot
  );

  createStandardFixture(
    secondRoot
  );

  const standardPlan =
    buildStandardPlan();

  const firstStandard =
    buildGenerationWritePreflight({
      plan:
        standardPlan,

      rootDirectory:
        firstRoot,

      allowOverwrite:
        true,
    });

  const secondStandard =
    buildGenerationWritePreflight({
      plan:
        standardPlan,

      rootDirectory:
        secondRoot,

      allowOverwrite:
        true,
    });

  validateReport(
    firstStandard,
    "standard-first"
  );

  validateReport(
    secondStandard,
    "standard-second"
  );

  const firstStandardSnapshot =
    sanitize(
      firstStandard,
      [
        {
          path:
            firstRoot,
          token:
            "<ROOT>",
        },
      ]
    );

  const secondStandardSnapshot =
    sanitize(
      secondStandard,
      [
        {
          path:
            secondRoot,
          token:
            "<ROOT>",
        },
      ]
    );

  expect(
    JSON.stringify(
      firstStandardSnapshot
    ) ===
      JSON.stringify(
        secondStandardSnapshot
      ),
    "Equivalent standard preflight reports differ."
  );

  expect(
    firstStandard.preflightStatus ===
      "blocked",
    "Standard scenario must be blocked."
  );

  const actionByPath =
    Object.fromEntries(
      firstStandard.files.map(
        (file) => [
          file.relativePath,
          file.action,
        ]
      )
    );

  expect(
    actionByPath[
      "create/new.js"
    ] === "create",
    "Create action missing."
  );

  expect(
    actionByPath[
      "missing/deep/file.js"
    ] === "create",
    "Parent-missing create action missing."
  );

  expect(
    actionByPath[
      "overwrite/file.js"
    ] === "overwrite",
    "Overwrite action missing."
  );

  expect(
    actionByPath[
      "blocked/file.js"
    ] === "blocked",
    "Overwrite-forbidden action missing."
  );

  expect(
    firstStandard.conflicts.some(
      (conflict) =>
        conflict.relativePath ===
          "existing-directory" &&
        conflict.conflictType ===
          "existing_directory"
    ),
    "Existing-directory conflict missing."
  );

  expect(
    firstStandard.conflicts.some(
      (conflict) =>
        conflict.relativePath ===
          "parent/occupied/file.js" &&
        conflict.conflictType ===
          "parent_is_file"
    ),
    "Parent-is-file conflict missing."
  );

  /*
   * Unsafe root and target escape do not require fixture writes.
   */
  const simplePlan =
    buildPlan({
      files: [
        {
          relativePath:
            "safe.js",
          content:
            "safe\n",
          overwritePolicy:
            "forbid",
        },
      ],
  });

  const filesystemRoot =
    path.parse(
      path.resolve(
        process.cwd()
      )
    ).root;

  const unsafeRootReport =
    buildGenerationWritePreflight({
      plan:
        simplePlan,

      rootDirectory:
        filesystemRoot,
    });

  validateReport(
    unsafeRootReport,
    "unsafe-root"
  );

  expect(
    unsafeRootReport.preflightStatus ===
      "invalid",
    "Filesystem root must be invalid."
  );

  const homeReport =
    buildGenerationWritePreflight({
      plan:
        simplePlan,

      rootDirectory:
        os.homedir(),
    });

  validateReport(
    homeReport,
    "home-root"
  );

  expect(
    homeReport.preflightStatus ===
      "invalid",
    "Home directory must be invalid."
  );

  const escapePlan =
    buildPlan({
      planId:
        "generation_write_preflight_escape_v1",

      targetRoot:
        "../outside-target",

      files: [
        {
          relativePath:
            "safe.js",
          content:
            "safe\n",
          overwritePolicy:
            "forbid",
        },
      ],
    });

  const escapeReport =
    buildGenerationWritePreflight({
      plan:
        escapePlan,

      rootDirectory:
        firstRoot,
    });

  validateReport(
    escapeReport,
    "target-escape"
  );

  expect(
    escapeReport.preflightStatus ===
      "invalid",
    "Target escape must be invalid."
  );

  expect(
    escapeReport.conflicts.some(
      (conflict) =>
        conflict.conflictType ===
          "path_escape"
    ),
    "Target escape conflict missing."
  );

  /*
   * Symlink regression is executed only where true symbolic links
   * can be created. It is never simulated with junctions.
   */
  let symlinkSupported = true;
  let symlinkSkipReason = null;

  try {
    prepareSymlinkFixture({
      root:
        firstRoot,

      externalRoot:
        firstExternal,
    });

    prepareSymlinkFixture({
      root:
        secondRoot,

      externalRoot:
        secondExternal,
    });
  } catch (error) {
    symlinkSupported = false;

    symlinkSkipReason =
      error && error.code
        ? error.code
        : "symlink creation unavailable";

    skipped.push(
      `Symlink regression scenarios: SKIPPED (${symlinkSkipReason})`
    );
  }

  if (symlinkSupported) {
    const symlinkPlan =
      buildPlan({
        planId:
          "generation_write_preflight_symlink_regression_v1",

        files: [
          {
            relativePath:
              "internal-link/new.js",
            content:
              "new\n",
            overwritePolicy:
              "forbid",
          },

          {
            relativePath:
              "external-link/new.js",
            content:
              "new\n",
            overwritePolicy:
              "forbid",
          },

          {
            relativePath:
              "broken-link",
            content:
              "new\n",
            overwritePolicy:
              "forbid",
          },
        ],
      });

    const firstSymlink =
      buildGenerationWritePreflight({
        plan:
          symlinkPlan,

        rootDirectory:
          firstRoot,
      });

    const secondSymlink =
      buildGenerationWritePreflight({
        plan:
          symlinkPlan,

        rootDirectory:
          secondRoot,
      });

    validateReport(
      firstSymlink,
      "symlink-first"
    );

    validateReport(
      secondSymlink,
      "symlink-second"
    );

    const firstSymlinkSnapshot =
      sanitize(
        firstSymlink,
        [
          {
            path:
              firstRoot,
            token:
              "<ROOT>",
          },

          {
            path:
              firstExternal,
            token:
              "<EXTERNAL>",
          },
        ]
      );

    const secondSymlinkSnapshot =
      sanitize(
        secondSymlink,
        [
          {
            path:
              secondRoot,
            token:
              "<ROOT>",
          },

          {
            path:
              secondExternal,
            token:
              "<EXTERNAL>",
          },
        ]
      );

    expect(
      JSON.stringify(
        firstSymlinkSnapshot
      ) ===
        JSON.stringify(
          secondSymlinkSnapshot
        ),
      "Equivalent symlink preflight reports differ."
    );

    const internalEntry =
      firstSymlink.files.find(
        (file) =>
          file.relativePath ===
          "internal-link/new.js"
      );

    expect(
      internalEntry &&
      internalEntry.action ===
        "create",
      "Internal symlink must allow create."
    );

    expect(
      firstSymlink.conflicts.some(
        (conflict) =>
          conflict.relativePath ===
            "external-link/new.js" &&
          conflict.conflictType ===
            "external_symlink"
      ),
      "External symlink conflict missing."
    );

    expect(
      firstSymlink.conflicts.some(
        (conflict) =>
          conflict.relativePath ===
            "broken-link" &&
          conflict.conflictType ===
            "external_symlink"
      ),
      "Broken symlink conflict missing."
    );

    let loopSupported = true;
    let loopSkipReason = null;

    try {
      prepareLoopFixture(
        firstRoot
      );

      prepareLoopFixture(
        secondRoot
      );
    } catch (error) {
      loopSupported = false;

      loopSkipReason =
        error && error.code
          ? error.code
          : "symlink loop unavailable";

      skipped.push(
        `Symlink loop regression: SKIPPED (${loopSkipReason})`
      );
    }

    if (loopSupported) {
      const loopPlan =
        buildPlan({
          planId:
            "generation_write_preflight_loop_regression_v1",

          files: [
            {
              relativePath:
                "loop-a",
              content:
                "new\n",
              overwritePolicy:
                "forbid",
            },
          ],
        });

      const firstLoop =
        buildGenerationWritePreflight({
          plan:
            loopPlan,

          rootDirectory:
            firstRoot,
        });

      const secondLoop =
        buildGenerationWritePreflight({
          plan:
            loopPlan,

          rootDirectory:
            secondRoot,
        });

      validateReport(
        firstLoop,
        "loop-first"
      );

      validateReport(
        secondLoop,
        "loop-second"
      );

      expect(
        firstLoop.preflightStatus ===
          "blocked",
        "Symlink loop must be blocked."
      );

      expect(
        firstLoop.conflicts.some(
          (conflict) =>
            conflict.conflictType ===
              "external_symlink"
        ),
        "Symlink loop conflict missing."
      );

      expect(
        JSON.stringify(
          sanitize(
            firstLoop,
            [
              {
                path:
                  firstRoot,
                token:
                  "<ROOT>",
              },
            ]
          )
        ) ===
          JSON.stringify(
            sanitize(
              secondLoop,
              [
                {
                  path:
                    secondRoot,
                  token:
                    "<ROOT>",
                },
              ]
            )
          ),
        "Equivalent loop reports differ."
      );
    }
  }

  /*
   * Public exports are exact for the preflight API and private
   * containment/symlink helpers remain inaccessible.
   */
  expect(
    typeof builderExports
      .buildGenerationWritePreflight ===
      "function",
    "buildGenerationWritePreflight export missing."
  );

  expect(
    typeof builderExports
      .validateGenerationWritePreflight ===
      "function",
    "validateGenerationWritePreflight export missing."
  );

  [
    "isPathContained",
    "inspectExistingPath",
    "inspectPathSymlinkChain",
    "resolveSafeTargetRoot",
    "resolveRealPathProjection",
  ].forEach((privateName) => {
    expect(
      Object.prototype.hasOwnProperty.call(
        builderExports,
        privateName
      ) === false,
      `Private helper exported: ${privateName}.`
    );
  });

  console.log(
    JSON.stringify(
      {
        test:
          "Generation Write Preflight Final Regression",

        status:
          failures.length === 0
            ? "PASS"
            : "FAIL",

        standardStatus:
          firstStandard.preflightStatus,

        standardSummary:
          firstStandard.summary,

        unsafeRootStatus:
          unsafeRootReport.preflightStatus,

        homeRootStatus:
          homeReport.preflightStatus,

        targetEscapeStatus:
          escapeReport.preflightStatus,

        symlinkScenarios:
          symlinkSupported
            ? "PASS"
            : `SKIPPED (${symlinkSkipReason})`,

        skipped,

        publicExports: {
          buildGenerationWritePreflight:
            typeof builderExports
              .buildGenerationWritePreflight ===
              "function",

          validateGenerationWritePreflight:
            typeof builderExports
              .validateGenerationWritePreflight ===
              "function",
        },
      },
      null,
      2
    )
  );
} finally {
  fs.rmSync(baseRoot, {
    recursive: true,
    force: true,
  });
}

skipped.forEach((message) => {
  console.log(message);
});

if (failures.length > 0) {
  console.error(
    "Generation Write Preflight Final Regression Test: FAIL"
  );

  console.error(
    JSON.stringify(
      failures,
      null,
      2
    )
  );

  process.exit(1);
}

console.log(
  "Generation Write Preflight Final Regression Test: PASS"
);
