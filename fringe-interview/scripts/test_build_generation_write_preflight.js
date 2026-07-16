const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
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

function hash(content) {
  return crypto
    .createHash("sha256")
    .update(content, "utf8")
    .digest("hex");
}

function ensureDirectory(directory) {
  fs.mkdirSync(directory, {
    recursive: true,
  });
}

function buildPlan({
  targetRoot = ".",
  files = null,
} = {}) {
  return buildGenerationPlan({
    planId:
      "generation_write_preflight_test_v1",

    generatorId:
      "generation_write_preflight_test_generator",

    targetRoot,

    source: {
      moduleType: "test",
      sourceId: "preflight_test",
      sourceVersion: "1.0",
    },

    files:
      files || [
        {
          relativePath:
            "src/example/file.js",
          content:
            "module.exports = {};\n",
          overwritePolicy:
            "forbid",
        },
      ],
  });
}

function snapshotDirectory(root) {
  if (!fs.existsSync(root)) {
    return null;
  }

  function walk(current) {
    return fs
      .readdirSync(current, {
        withFileTypes: true,
      })
      .sort((first, second) =>
        first.name.localeCompare(second.name)
      )
      .map((entry) => {
        const fullPath = path.join(
          current,
          entry.name
        );

        if (entry.isSymbolicLink()) {
          return {
            name: entry.name,
            type: "symlink",
            target: fs.readlinkSync(fullPath),
          };
        }

        if (entry.isDirectory()) {
          return {
            name: entry.name,
            type: "directory",
            children: walk(fullPath),
          };
        }

        return {
          name: entry.name,
          type: "file",
          content: fs.readFileSync(
            fullPath,
            "utf8"
          ),
        };
      });
  }

  return walk(root);
}

function runScenario({
  name,
  root,
  plan,
  allowOverwrite = false,
}) {
  const planBefore = JSON.stringify(plan);
  const inputBefore = JSON.stringify({
    rootDirectory: root,
    allowOverwrite,
  });
  const filesystemBefore = snapshotDirectory(root);

  const preflight =
    buildGenerationWritePreflight({
      plan,
      rootDirectory: root,
      allowOverwrite,
    });

  const filesystemAfter = snapshotDirectory(root);

  expect(
    JSON.stringify(plan) === planBefore,
    `${name}: plan mutated.`
  );

  expect(
    JSON.stringify({
      rootDirectory: root,
      allowOverwrite,
    }) === inputBefore,
    `${name}: input mutated.`
  );

  expect(
    JSON.stringify(filesystemAfter) ===
      JSON.stringify(filesystemBefore),
    `${name}: filesystem changed during preflight.`
  );

  return preflight;
}

const fixtureRoot = path.resolve(
  process.cwd(),
  "tmp/test-generation-write-preflight"
);

fs.rmSync(fixtureRoot, {
  recursive: true,
  force: true,
});

ensureDirectory(fixtureRoot);

try {
  /* Scenario A — empty directory */
  const rootA = path.join(fixtureRoot, "a-empty");
  ensureDirectory(rootA);

  const preflightA = runScenario({
    name: "A",
    root: rootA,
    plan: buildPlan(),
  });

  expect(
    preflightA.preflightStatus === "ready",
    `A: status ${preflightA.preflightStatus}`
  );
  expect(
    preflightA.files.every(
      (file) => file.action === "create"
    ),
    "A: all files must be create."
  );
  expect(
    preflightA.conflicts.length === 0,
    "A: conflicts."
  );
  expect(
    validateGenerationWritePreflight(preflightA)
      .isValid === true,
    "A: report validation."
  );

  /* Scenario B — missing parents */
  const rootB = path.join(fixtureRoot, "b-parents");
  ensureDirectory(rootB);

  const preflightB = runScenario({
    name: "B",
    root: rootB,
    plan: buildPlan({
      files: [
        {
          relativePath:
            "deep/missing/folder/file.js",
          content: "content\n",
        },
      ],
    }),
  });

  expect(
    preflightB.preflightStatus === "ready",
    `B: status ${preflightB.preflightStatus}`
  );
  expect(
    preflightB.files[0].parentExists === false,
    "B: parentExists."
  );
  expect(
    preflightB.files[0].parentCreatable === true,
    "B: parentCreatable."
  );
  expect(
    preflightB.summary.missingParentDirectories === 1,
    "B: missing parent count."
  );

  /* Scenario C — existing file forbid */
  const rootC = path.join(fixtureRoot, "c-forbid");
  ensureDirectory(path.join(rootC, "src/example"));
  fs.writeFileSync(
    path.join(rootC, "src/example/file.js"),
    "existing\n"
  );

  const preflightC = runScenario({
    name: "C",
    root: rootC,
    plan: buildPlan(),
  });

  expect(
    preflightC.preflightStatus === "blocked",
    "C: blocked."
  );
  expect(
    preflightC.files[0].action === "blocked",
    "C: action."
  );
  expect(
    preflightC.conflicts.some(
      (conflict) =>
        conflict.conflictType ===
        "overwrite_forbidden"
    ),
    "C: overwrite conflict."
  );

  /* Scenario D — allow_explicit + global false */
  const rootD = path.join(fixtureRoot, "d-explicit-false");
  ensureDirectory(path.join(rootD, "src/example"));
  fs.writeFileSync(
    path.join(rootD, "src/example/file.js"),
    "existing\n"
  );

  const explicitPlan = buildPlan({
    files: [
      {
        relativePath: "src/example/file.js",
        content: "new\n",
        overwritePolicy: "allow_explicit",
      },
    ],
  });

  const preflightD = runScenario({
    name: "D",
    root: rootD,
    plan: explicitPlan,
    allowOverwrite: false,
  });

  expect(
    preflightD.preflightStatus === "blocked",
    "D: blocked."
  );
  expect(
    preflightD.files[0].overwriteAllowed === false,
    "D: overwriteAllowed."
  );

  /* Scenario E — double consent */
  const rootE = path.join(fixtureRoot, "e-overwrite");
  ensureDirectory(path.join(rootE, "src/example"));
  fs.writeFileSync(
    path.join(rootE, "src/example/file.js"),
    "existing\n"
  );

  const preflightE = runScenario({
    name: "E",
    root: rootE,
    plan: explicitPlan,
    allowOverwrite: true,
  });

  expect(
    preflightE.preflightStatus === "ready",
    `E: status ${preflightE.preflightStatus}`
  );
  expect(
    preflightE.files[0].action === "overwrite",
    "E: overwrite action."
  );
  expect(
    preflightE.files[0].overwriteAllowed === true,
    "E: overwriteAllowed."
  );

  /* Scenario F — directory at file target */
  const rootF = path.join(fixtureRoot, "f-directory");
  ensureDirectory(
    path.join(rootF, "src/example/file.js")
  );

  const preflightF = runScenario({
    name: "F",
    root: rootF,
    plan: buildPlan(),
  });

  expect(
    preflightF.preflightStatus === "blocked",
    "F: blocked."
  );
  expect(
    preflightF.files[0].existingType === "directory",
    "F: existing type."
  );
  expect(
    preflightF.conflicts.some(
      (conflict) =>
        conflict.conflictType ===
        "existing_directory"
    ),
    "F: directory conflict."
  );

  /* Scenario G — parent segment is file */
  const rootG = path.join(fixtureRoot, "g-parent-file");
  ensureDirectory(rootG);
  fs.writeFileSync(
    path.join(rootG, "occupied"),
    "file\n"
  );

  const preflightG = runScenario({
    name: "G",
    root: rootG,
    plan: buildPlan({
      files: [
        {
          relativePath: "occupied/child/file.js",
          content: "content\n",
        },
      ],
    }),
  });

  expect(
    preflightG.preflightStatus === "blocked",
    "G: blocked."
  );
  expect(
    preflightG.files[0].parentCreatable === false,
    "G: parentCreatable."
  );
  expect(
    preflightG.conflicts.some(
      (conflict) =>
        conflict.conflictType === "parent_is_file"
    ),
    "G: parent_is_file conflict."
  );

  /* Scenario H — targetRoot escape */
  const rootH = path.join(fixtureRoot, "h-escape");
  ensureDirectory(rootH);

  const preflightH = runScenario({
    name: "H",
    root: rootH,
    plan: buildPlan({
      targetRoot: "../outside",
    }),
  });

  expect(
    preflightH.preflightStatus === "invalid",
    "H: invalid."
  );
  expect(
    preflightH.files.length === 0,
    "H: no files."
  );
  expect(
    preflightH.conflicts.some(
      (conflict) =>
        conflict.conflictType === "path_escape"
    ),
    "H: path escape conflict."
  );

  /* Scenario I — filesystem root */
  const filesystemRoot = path.parse(fixtureRoot).root;
  const preflightI = buildGenerationWritePreflight({
    plan: buildPlan(),
    rootDirectory: filesystemRoot,
  });

  expect(
    preflightI.preflightStatus === "invalid",
    "I: filesystem root invalid."
  );

  /* Scenario J — home */
  const preflightJ = buildGenerationWritePreflight({
    plan: buildPlan(),
    rootDirectory: os.homedir(),
  });

  expect(
    preflightJ.preflightStatus === "invalid",
    "J: home invalid."
  );

  /* Scenario K — identical content still forbid */
  const rootK = path.join(fixtureRoot, "k-identical");
  ensureDirectory(path.join(rootK, "src/example"));
  const identicalContent = "module.exports = {};\n";
  fs.writeFileSync(
    path.join(rootK, "src/example/file.js"),
    identicalContent
  );

  const preflightK = runScenario({
    name: "K",
    root: rootK,
    plan: buildPlan({
      files: [
        {
          relativePath: "src/example/file.js",
          content: identicalContent,
          overwritePolicy: "forbid",
        },
      ],
    }),
  });

  expect(
    preflightK.preflightStatus === "blocked",
    "K: identical file blocked."
  );

  /* Scenario L — internal symlink is allowed */
  const rootL = path.join(fixtureRoot, "l-symlink");
  ensureDirectory(path.join(rootL, "real"));
  let symlinkCreated = false;

  try {
    fs.symlinkSync(
      path.join(rootL, "real"),
      path.join(rootL, "link"),
      process.platform === "win32" ? "dir" : undefined
    );
    symlinkCreated = true;
  } catch (error) {
    skipped.push(
      `Symlink scenario: SKIPPED (${error.code || "unsupported"}).`
    );
  }

  if (symlinkCreated) {
    const preflightL = runScenario({
      name: "L",
      root: rootL,
      plan: buildPlan({
        files: [
          {
            relativePath: "link/file.js",
            content: "content\n",
          },
        ],
      }),
    });

    expect(
      preflightL.preflightStatus === "ready",
      "L: internal symlink ready."
    );
    expect(
      preflightL.files[0].action === "create",
      "L: create through internal symlink."
    );
    expect(
      !preflightL.conflicts.some(
        (conflict) =>
          conflict.conflictType ===
          "external_symlink"
      ),
      "L: internal symlink must not conflict."
    );
    expect(
      validateGenerationWritePreflight(preflightL)
        .isValid === true,
      "L: report validation."
    );
  }

  /* Summary and validator coherence */
  [
    preflightA,
    preflightB,
    preflightC,
    preflightD,
    preflightE,
    preflightF,
    preflightG,
    preflightK,
  ].forEach((preflight, index) => {
    const validation =
      validateGenerationWritePreflight(preflight);

    expect(
      validation.isValid === true,
      `Validator ${index}: ${validation.errors.join("; ")}`
    );
  });

  console.log(
    JSON.stringify(
      {
        test:
          "Generation Write Preflight Filesystem Inspection",
        status:
          failures.length === 0 ? "PASS" : "FAIL",
        readyCreate:
          preflightA.summary,
        overwrite:
          preflightE.summary,
        blocked:
          preflightC.summary,
        skipped,
      },
      null,
      2
    )
  );
} finally {
  fs.rmSync(fixtureRoot, {
    recursive: true,
    force: true,
  });
}

if (failures.length > 0) {
  console.error(
    "Generation Write Preflight Filesystem Inspection Test: FAIL"
  );
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log(
  "Generation Write Preflight Filesystem Inspection Test: PASS"
);
