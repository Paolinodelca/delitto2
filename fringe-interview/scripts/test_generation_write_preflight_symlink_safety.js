const fs = require("fs");
const path = require("path");

const {
  buildGenerationPlan,
  buildGenerationWritePreflight,
  validateGenerationWritePreflight,
} = require("../tools/imago-builder");

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
  relativePath,
  overwritePolicy = "forbid",
}) {
  return buildGenerationPlan({
    planId:
      "generation_write_preflight_symlink_test_v1",

    generatorId:
      "generation_write_preflight_symlink_test_generator",

    targetRoot: ".",

    source: {
      moduleType: "test",
      sourceId: "symlink_safety",
      sourceVersion: "1.0",
    },

    files: [
      {
        relativePath,
        content: "generated\n",
        overwritePolicy,
      },
    ],
  });
}

function snapshotDirectory(root) {
  function walk(current) {
    return fs
      .readdirSync(current, {
        withFileTypes: true,
      })
      .sort((first, second) =>
        first.name.localeCompare(second.name)
      )
      .map((entry) => {
        const fullPath =
          path.join(
            current,
            entry.name
          );

        if (entry.isSymbolicLink()) {
          return {
            name: entry.name,
            type: "symlink",
            target:
              fs.readlinkSync(
                fullPath
              ),
          };
        }

        if (entry.isDirectory()) {
          return {
            name: entry.name,
            type: "directory",
            children:
              walk(fullPath),
          };
        }

        return {
          name: entry.name,
          type: "file",
          content:
            fs.readFileSync(
              fullPath,
              "utf8"
            ),
        };
      });
  }

  return walk(root);
}

function createSymlink({
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

function runPreflight({
  name,
  root,
  plan,
  allowOverwrite = false,
}) {
  const planBefore =
    JSON.stringify(plan);

  const filesystemBefore =
    JSON.stringify(
      snapshotDirectory(root)
    );

  const preflight =
    buildGenerationWritePreflight({
      plan,
      rootDirectory: root,
      allowOverwrite,
    });

  const filesystemAfter =
    JSON.stringify(
      snapshotDirectory(root)
    );

  expect(
    JSON.stringify(plan) ===
      planBefore,
    `${name}: plan mutated.`
  );

  expect(
    filesystemAfter ===
      filesystemBefore,
    `${name}: filesystem changed.`
  );

  expect(
    validateGenerationWritePreflight(
      preflight
    ).isValid === true,
    `${name}: report invalid.`
  );

  return preflight;
}

const baseRoot =
  path.resolve(
    process.cwd(),
    "tmp/test-generation-write-preflight-symlinks"
  );

fs.rmSync(baseRoot, {
  recursive: true,
  force: true,
});

ensureDirectory(baseRoot);

let symlinkSupported = true;
let symlinkSkipReason = null;

try {
  const capabilityRoot =
    path.join(
      baseRoot,
      "capability"
    );

  ensureDirectory(
    path.join(
      capabilityRoot,
      "target"
    )
  );

  try {
    createSymlink({
      target:
        path.join(
          capabilityRoot,
          "target"
        ),

      linkPath:
        path.join(
          capabilityRoot,
          "link"
        ),

      type:
        process.platform === "win32"
          ? "dir"
          : undefined,
    });

    fs.unlinkSync(
      path.join(
        capabilityRoot,
        "link"
      )
    );
  } catch (error) {
    symlinkSupported = false;
    symlinkSkipReason =
      error && error.code
        ? error.code
        : "symlink creation unavailable";
  }

  if (!symlinkSupported) {
    skipped.push(
      `Symlink scenarios: SKIPPED (${symlinkSkipReason})`
    );
  } else {
    /* A — intermediate internal directory link */
    const rootA =
      path.join(
        baseRoot,
        "a-internal-intermediate"
      );

    ensureDirectory(
      path.join(
        rootA,
        "internal/shared"
      )
    );

    createSymlink({
      target:
        path.join(
          rootA,
          "internal/shared"
        ),

      linkPath:
        path.join(
          rootA,
          "shared-link"
        ),

      type:
        process.platform === "win32"
          ? "dir"
          : undefined,
    });

    const preflightA =
      runPreflight({
        name: "A",
        root: rootA,
        plan:
          buildPlan({
            relativePath:
              "shared-link/new/file.js",
          }),
      });

    expect(
      preflightA.preflightStatus ===
        "ready",
      `A: ${preflightA.preflightStatus}`
    );

    expect(
      preflightA.files[0].action ===
        "create",
      "A: create action."
    );

    /* B — intermediate external directory link */
    const rootB =
      path.join(
        baseRoot,
        "b-external-intermediate"
      );

    const externalB =
      path.join(
        baseRoot,
        "external-b"
      );

    ensureDirectory(rootB);
    ensureDirectory(externalB);

    createSymlink({
      target: externalB,
      linkPath:
        path.join(
          rootB,
          "external-link"
        ),
      type:
        process.platform === "win32"
          ? "dir"
          : undefined,
    });

    const preflightB =
      runPreflight({
        name: "B",
        root: rootB,
        plan:
          buildPlan({
            relativePath:
              "external-link/file.js",
          }),
      });

    expect(
      preflightB.preflightStatus ===
        "blocked",
      "B: blocked."
    );

    expect(
      preflightB.conflicts.some(
        (conflict) =>
          conflict.conflictType ===
            "external_symlink"
      ),
      "B: external_symlink conflict."
    );

    /* C/D — final internal link to file */
    const rootCD =
      path.join(
        baseRoot,
        "cd-final-file"
      );

    ensureDirectory(
      path.join(
        rootCD,
        "internal"
      )
    );

    fs.writeFileSync(
      path.join(
        rootCD,
        "internal/real.js"
      ),
      "existing\n"
    );

    createSymlink({
      target:
        path.join(
          rootCD,
          "internal/real.js"
        ),
      linkPath:
        path.join(
          rootCD,
          "linked.js"
        ),
      type:
        process.platform === "win32"
          ? "file"
          : undefined,
    });

    const preflightC =
      runPreflight({
        name: "C",
        root: rootCD,
        plan:
          buildPlan({
            relativePath:
              "linked.js",
            overwritePolicy:
              "forbid",
          }),
      });

    expect(
      preflightC.preflightStatus ===
        "blocked",
      "C: blocked."
    );

    expect(
      preflightC.files[0].exists ===
        true &&
      preflightC.files[0].existingType ===
        "file",
      "C: resolved existing file."
    );

    expect(
      preflightC.conflicts.some(
        (conflict) =>
          conflict.conflictType ===
            "overwrite_forbidden"
      ),
      "C: overwrite conflict."
    );

    expect(
      !preflightC.conflicts.some(
        (conflict) =>
          conflict.conflictType ===
            "external_symlink"
      ),
      "C: internal link must not be external."
    );

    const preflightD =
      runPreflight({
        name: "D",
        root: rootCD,
        plan:
          buildPlan({
            relativePath:
              "linked.js",
            overwritePolicy:
              "allow_explicit",
          }),
        allowOverwrite: true,
      });

    expect(
      preflightD.preflightStatus ===
        "ready",
      "D: ready."
    );

    expect(
      preflightD.files[0].action ===
        "overwrite",
      "D: overwrite."
    );

    /* E — final internal link to directory */
    const rootE =
      path.join(
        baseRoot,
        "e-final-directory"
      );

    ensureDirectory(
      path.join(
        rootE,
        "internal/folder"
      )
    );

    createSymlink({
      target:
        path.join(
          rootE,
          "internal/folder"
        ),
      linkPath:
        path.join(
          rootE,
          "folder-link"
        ),
      type:
        process.platform === "win32"
          ? "dir"
          : undefined,
    });

    const preflightE =
      runPreflight({
        name: "E",
        root: rootE,
        plan:
          buildPlan({
            relativePath:
              "folder-link",
          }),
      });

    expect(
      preflightE.preflightStatus ===
        "blocked",
      "E: blocked."
    );

    expect(
      preflightE.files[0].existingType ===
        "directory",
      "E: directory type."
    );

    expect(
      preflightE.conflicts.some(
        (conflict) =>
          conflict.conflictType ===
            "existing_directory"
      ),
      "E: existing_directory."
    );

    /* F — broken symlink */
    const rootF =
      path.join(
        baseRoot,
        "f-broken"
      );

    ensureDirectory(rootF);

    createSymlink({
      target:
        path.join(
          rootF,
          "missing-target"
        ),
      linkPath:
        path.join(
          rootF,
          "broken-link"
        ),
      type:
        process.platform === "win32"
          ? "file"
          : undefined,
    });

    const preflightF =
      runPreflight({
        name: "F",
        root: rootF,
        plan:
          buildPlan({
            relativePath:
              "broken-link",
          }),
      });

    expect(
      preflightF.preflightStatus ===
        "blocked",
      "F: blocked."
    );

    expect(
      preflightF.conflicts.some(
        (conflict) =>
          conflict.conflictType ===
            "external_symlink" &&
          conflict.message ===
            "Symbolic link could not be resolved safely."
      ),
      "F: broken link conflict."
    );

    /* G — lexical internal, real external */
    const rootG =
      path.join(
        baseRoot,
        "g-lexical-internal"
      );

    const externalG =
      path.join(
        baseRoot,
        "external-g"
      );

    ensureDirectory(rootG);
    ensureDirectory(externalG);

    createSymlink({
      target: externalG,
      linkPath:
        path.join(
          rootG,
          "apparently-internal"
        ),
      type:
        process.platform === "win32"
          ? "dir"
          : undefined,
    });

    const preflightG =
      runPreflight({
        name: "G",
        root: rootG,
        plan:
          buildPlan({
            relativePath:
              "apparently-internal/inside.js",
          }),
      });

    expect(
      preflightG.preflightStatus ===
        "blocked" &&
      preflightG.conflicts.some(
        (conflict) =>
          conflict.conflictType ===
            "external_symlink"
      ),
      "G: real path must prevail."
    );

    /* H — intermediate internal link to file */
    const rootH =
      path.join(
        baseRoot,
        "h-parent-file"
      );

    ensureDirectory(
      path.join(
        rootH,
        "internal"
      )
    );

    fs.writeFileSync(
      path.join(
        rootH,
        "internal/parent-file"
      ),
      "file\n"
    );

    createSymlink({
      target:
        path.join(
          rootH,
          "internal/parent-file"
        ),
      linkPath:
        path.join(
          rootH,
          "file-link"
        ),
      type:
        process.platform === "win32"
          ? "file"
          : undefined,
    });

    const preflightH =
      runPreflight({
        name: "H",
        root: rootH,
        plan:
          buildPlan({
            relativePath:
              "file-link/child.js",
          }),
      });

    expect(
      preflightH.preflightStatus ===
        "blocked",
      "H: blocked."
    );

    expect(
      preflightH.conflicts.some(
        (conflict) =>
          conflict.conflictType ===
            "parent_is_file"
      ),
      "H: parent_is_file."
    );

    /* I — symlink loop */
    const rootI =
      path.join(
        baseRoot,
        "i-loop"
      );

    ensureDirectory(rootI);

    let loopCreated = true;

    try {
      createSymlink({
        target:
          path.join(
            rootI,
            "loop-b"
          ),
        linkPath:
          path.join(
            rootI,
            "loop-a"
          ),
        type:
          process.platform === "win32"
            ? "file"
            : undefined,
      });

      createSymlink({
        target:
          path.join(
            rootI,
            "loop-a"
          ),
        linkPath:
          path.join(
            rootI,
            "loop-b"
          ),
        type:
          process.platform === "win32"
            ? "file"
            : undefined,
      });
    } catch (error) {
      loopCreated = false;
      skipped.push(
        `Symlink loop scenario: SKIPPED (${
          error && error.code
            ? error.code
            : "unavailable"
        })`
      );
    }

    if (loopCreated) {
      const preflightI =
        runPreflight({
          name: "I",
          root: rootI,
          plan:
            buildPlan({
              relativePath:
                "loop-a",
            }),
        });

      expect(
        preflightI.preflightStatus ===
          "blocked",
        "I: blocked."
      );

      expect(
        preflightI.conflicts.some(
          (conflict) =>
            conflict.conflictType ===
              "external_symlink" &&
            conflict.message ===
              "Symbolic link could not be resolved safely."
        ),
        "I: loop conflict."
      );
    }
  }
} finally {
  fs.rmSync(baseRoot, {
    recursive: true,
    force: true,
  });
}

console.log(
  JSON.stringify(
    {
      test:
        "Generation Write Preflight Symlink Safety",

      status:
        failures.length === 0
          ? "PASS"
          : "FAIL",

      platform:
        process.platform,

      symlinkSupported,

      skipped,
    },
    null,
    2
  )
);

skipped.forEach((message) => {
  console.log(message);
});

if (failures.length > 0) {
  console.error(
    "Generation Write Preflight Symlink Safety Test: FAIL"
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
  "Generation Write Preflight Symlink Safety Test: PASS"
);
