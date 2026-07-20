const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const {
  buildGenerationPlan,
  buildGenerationWritePreflight,
  buildGenerationFileWriteResult,
  validateGenerationWriteReport,
  writeGenerationPlan,
} = require("../tools/imago-builder");

const {
  createGenerationPlanWriter,
} = require("../tools/imago-builder/core/writeGenerationPlan");

const {
  writeGenerationFileAtomically,
} = require("../tools/imago-builder/core/writeGenerationFileAtomically");

const failures = [];
const skipped = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

function sha256(content) {
  return crypto
    .createHash("sha256")
    .update(content, "utf8")
    .digest("hex");
}

function generatedFile(
  relativePath,
  content,
  overwritePolicy = "forbid"
) {
  return {
    relativePath,
    content,
    contentHash:
      sha256(content),
    overwritePolicy,
    metadata: {
      nested: {
        immutable: true,
      },
    },
  };
}

function plan(id, files) {
  return buildGenerationPlan({
    planId: id,
    generatorId:
      "generation-writer-final-regression",
    targetRoot: ".",
    source: {
      moduleType: "test",
      sourceId: id,
      sourceVersion: "1.0",
    },
    files,
  });
}

function clone(value) {
  return JSON.parse(
    JSON.stringify(value)
  );
}

function residue(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs
    .readdirSync(
      directory,
      {
        recursive: true,
      }
    )
    .filter(
      (name) =>
        String(name).includes(
          ".imago-tmp-"
        )
    );
}

function assertReportValid(
  report,
  label
) {
  const validation =
    validateGenerationWriteReport(
      report
    );

  expect(
    validation.isValid === true,
    `${label}: invalid report: ${validation.errors.join("; ")}`
  );
}

const root =
  path.resolve(
    process.cwd(),
    "tmp/test-generation-writer-final-regression"
  );

fs.rmSync(root, {
  recursive: true,
  force: true,
});
fs.mkdirSync(root, {
  recursive: true,
});

try {
  // Scenario 1: completed create with nested directories.
  const createRoot =
    path.join(root, "create");
  fs.mkdirSync(createRoot);

  const createPlan =
    plan(
      "final-create",
      [
        generatedFile(
          "a/one.js",
          "one\n"
        ),
        generatedFile(
          "a/b/two.js",
          "two\n"
        ),
        generatedFile(
          "three.js",
          "three\n"
        ),
      ]
    );

  const createPlanBefore =
    clone(createPlan);

  const createPreflight =
    buildGenerationWritePreflight({
      plan: createPlan,
      rootDirectory:
        createRoot,
    });

  const createPreflightBefore =
    clone(createPreflight);

  const createReport =
    writeGenerationPlan({
      generationPlan:
        createPlan,
      writePreflightReport:
        createPreflight,
    });

  assertReportValid(
    createReport,
    "create"
  );

  expect(
    createReport.status ===
      "completed",
    "Create scenario must complete."
  );

  expect(
    JSON.stringify(
      createReport.summary
    ) ===
      JSON.stringify({
        totalFiles: 3,
        successfulFiles: 3,
        failedFiles: 0,
        skippedFiles: 0,
        createdFiles: 3,
        overwrittenFiles: 0,
      }),
    "Create summary differs."
  );

  for (
    const entry
    of createPlan.files
  ) {
    const target =
      path.join(
        createRoot,
        entry.relativePath
      );

    expect(
      fs.readFileSync(
        target,
        "utf8"
      ) === entry.content,
      `Create content differs: ${entry.relativePath}`
    );

    expect(
      crypto
        .createHash("sha256")
        .update(
          fs.readFileSync(
            target
          )
        )
        .digest("hex") ===
        entry.contentHash,
      `Create hash differs: ${entry.relativePath}`
    );
  }

  expect(
    residue(createRoot).length ===
      0,
    "Create scenario left temporary residue."
  );

  expect(
    JSON.stringify(createPlan) ===
      JSON.stringify(createPlanBefore) &&
    JSON.stringify(createPreflight) ===
      JSON.stringify(createPreflightBefore),
    "Create scenario mutated inputs."
  );

  // Scenario 2: mixed create / overwrite.
  const mixedRoot =
    path.join(root, "mixed");
  fs.mkdirSync(mixedRoot);

  fs.writeFileSync(
    path.join(
      mixedRoot,
      "existing.js"
    ),
    "old\n",
    "utf8"
  );

  fs.writeFileSync(
    path.join(
      mixedRoot,
      "unrelated.txt"
    ),
    "unchanged\n",
    "utf8"
  );

  const mixedPlan =
    plan(
      "final-mixed",
      [
        generatedFile(
          "new-a.js",
          "new-a\n"
        ),
        generatedFile(
          "new-b.js",
          "new-b\n"
        ),
        generatedFile(
          "existing.js",
          "updated\n",
          "allow_explicit"
        ),
      ]
    );

  const mixedPreflight =
    buildGenerationWritePreflight({
      plan: mixedPlan,
      rootDirectory:
        mixedRoot,
      allowOverwrite: true,
    });

  const mixedReport =
    writeGenerationPlan({
      generationPlan:
        mixedPlan,
      writePreflightReport:
        mixedPreflight,
    });

  assertReportValid(
    mixedReport,
    "mixed"
  );

  expect(
    mixedReport.status ===
      "completed" &&
    mixedReport.summary.createdFiles ===
      2 &&
    mixedReport.summary.overwrittenFiles ===
      1,
    "Mixed scenario result differs."
  );

  expect(
    fs.readFileSync(
      path.join(
        mixedRoot,
        "existing.js"
      ),
      "utf8"
    ) === "updated\n",
    "Mixed overwrite content differs."
  );

  expect(
    fs.readFileSync(
      path.join(
        mixedRoot,
        "unrelated.txt"
      ),
      "utf8"
    ) === "unchanged\n",
    "Mixed scenario changed unrelated file."
  );

  // Scenario 3: blocked preflight, no mutation.
  const blockedRoot =
    path.join(root, "blocked");
  fs.mkdirSync(blockedRoot);
  fs.writeFileSync(
    path.join(
      blockedRoot,
      "blocked.js"
    ),
    "external\n",
    "utf8"
  );

  const blockedPlan =
    plan(
      "final-blocked",
      [
        generatedFile(
          "blocked.js",
          "generated\n"
        ),
        generatedFile(
          "new/sub.js",
          "sub\n"
        ),
      ]
    );

  const blockedPreflight =
    buildGenerationWritePreflight({
      plan: blockedPlan,
      rootDirectory:
        blockedRoot,
    });

  const blockedReport =
    writeGenerationPlan({
      generationPlan:
        blockedPlan,
      writePreflightReport:
        blockedPreflight,
    });

  expect(
    blockedReport.status ===
      "failed" &&
    blockedReport.errors.some(
      (error) =>
        error.code ===
          "preflight_not_ready"
    ),
    "Blocked scenario guard differs."
  );

  expect(
    fs.readFileSync(
      path.join(
        blockedRoot,
        "blocked.js"
      ),
      "utf8"
    ) === "external\n" &&
    !fs.existsSync(
      path.join(
        blockedRoot,
        "new"
      )
    ),
    "Blocked scenario mutated filesystem."
  );

  // Scenario 4 and 5: identity / operational mismatch before mutations.
  const mismatchRoot =
    path.join(root, "mismatch");
  fs.mkdirSync(mismatchRoot);

  const mismatchPlan =
    plan(
      "final-mismatch",
      [
        generatedFile(
          "one.js",
          "one\n"
        ),
      ]
    );

  const mismatchPreflight =
    buildGenerationWritePreflight({
      plan:
        mismatchPlan,
      rootDirectory:
        mismatchRoot,
    });

  const identityAltered =
    clone(mismatchPreflight);
  identityAltered.planIdentity =
    "0".repeat(64);

  const identityReport =
    writeGenerationPlan({
      generationPlan:
        mismatchPlan,
      writePreflightReport:
        identityAltered,
    });

  expect(
    identityReport.errors.some(
      (error) =>
        error.code ===
          "plan_preflight_mismatch"
    ),
    "Identity mismatch error differs."
  );

  const operationalAltered =
    clone(mismatchPreflight);

  operationalAltered.files[0]
    .resolvedPath =
      path.join(
        root,
        "outside.js"
      );

  operationalAltered.files[0]
    .parentDirectory =
      path.dirname(
        operationalAltered.files[0]
          .resolvedPath
      );

  const operationalReport =
    writeGenerationPlan({
      generationPlan:
        mismatchPlan,
      writePreflightReport:
        operationalAltered,
    });

  expect(
    operationalReport.errors.some(
      (error) =>
        error.code ===
          "plan_preflight_files_mismatch"
    ),
    "Operational mismatch error differs."
  );

  expect(
    fs.readdirSync(
      mismatchRoot
    ).length === 0 &&
    !fs.existsSync(
      path.join(
        root,
        "outside.js"
      )
    ),
    "Mismatch scenarios mutated filesystem."
  );

  // Scenario 6: target appears after preflight.
  const raceRoot =
    path.join(root, "race");
  fs.mkdirSync(raceRoot);

  const racePlan =
    plan(
      "final-race",
      [
        generatedFile(
          "race.js",
          "generated\n"
        ),
        generatedFile(
          "later.js",
          "later\n"
        ),
      ]
    );

  const racePreflight =
    buildGenerationWritePreflight({
      plan: racePlan,
      rootDirectory:
        raceRoot,
    });

  fs.writeFileSync(
    path.join(
      raceRoot,
      "race.js"
    ),
    "external\n",
    "utf8"
  );

  const raceReport =
    writeGenerationPlan({
      generationPlan:
        racePlan,
      writePreflightReport:
        racePreflight,
    });

  expect(
    raceReport.status ===
      "failed" &&
    raceReport.fileResults[0]
      .errorCode ===
      "target_already_exists" &&
    raceReport.fileResults[1]
      .status ===
      "skipped",
    "Create race semantics differ."
  );

  expect(
    fs.readFileSync(
      path.join(
        raceRoot,
        "race.js"
      ),
      "utf8"
    ) === "external\n" &&
    !fs.existsSync(
      path.join(
        raceRoot,
        "later.js"
      )
    ) &&
    residue(raceRoot).length ===
      0,
    "Create race changed target or left residue."
  );

  // Scenario 7: authorized missing parent becomes a file.
  const parentRaceRoot =
    path.join(root, "parent-race");
  fs.mkdirSync(parentRaceRoot);

  const parentRacePlan =
    plan(
      "final-parent-race",
      [
        generatedFile(
          "new/file.js",
          "file\n"
        ),
      ]
    );

  const parentRacePreflight =
    buildGenerationWritePreflight({
      plan:
        parentRacePlan,
      rootDirectory:
        parentRaceRoot,
    });

  fs.writeFileSync(
    path.join(
      parentRaceRoot,
      "new"
    ),
    "not-directory\n",
    "utf8"
  );

  const parentRaceReport =
    writeGenerationPlan({
      generationPlan:
        parentRacePlan,
      writePreflightReport:
        parentRacePreflight,
    });

  expect(
    parentRaceReport.status ===
      "failed" &&
    parentRaceReport.fileResults[0]
      .status ===
      "skipped" &&
    parentRaceReport.errors.some(
      (error) =>
        [
          "directory_preparation_failed",
          "filesystem_state_changed",
        ].includes(
          error.code
        )
    ),
    "Parent race result differs."
  );

  expect(
    fs.readFileSync(
      path.join(
        parentRaceRoot,
        "new"
      ),
      "utf8"
    ) === "not-directory\n",
    "Parent race destroyed existing object."
  );

  // External symlink race where supported.
  if (
    process.platform !== "win32"
  ) {
    const symlinkRoot =
      path.join(root, "symlink-race");
    const externalRoot =
      path.join(root, "external");
    fs.mkdirSync(symlinkRoot);
    fs.mkdirSync(externalRoot);

    const symlinkPlan =
      plan(
        "final-symlink-race",
        [
          generatedFile(
            "new/file.js",
            "file\n"
          ),
        ]
      );

    const symlinkPreflight =
      buildGenerationWritePreflight({
        plan:
          symlinkPlan,
        rootDirectory:
          symlinkRoot,
      });

    fs.symlinkSync(
      externalRoot,
      path.join(
        symlinkRoot,
        "new"
      ),
      "dir"
    );

    const symlinkReport =
      writeGenerationPlan({
        generationPlan:
          symlinkPlan,
        writePreflightReport:
          symlinkPreflight,
      });

    expect(
      symlinkReport.status ===
        "failed" &&
      symlinkReport.errors.some(
        (error) =>
          error.code ===
            "filesystem_state_changed"
      ) &&
      !fs.existsSync(
        path.join(
          externalRoot,
          "file.js"
        )
      ),
      "External symlink race was not rejected."
    );
  } else {
    skipped.push(
      "External symlink race: Windows privilege/filesystem dependent."
    );
  }

  // Scenario 8: partial with no rollback.
  const partialRoot =
    path.join(root, "partial");
  fs.mkdirSync(partialRoot);

  const partialPlan =
    plan(
      "final-partial",
      [
        generatedFile(
          "one.js",
          "one\n"
        ),
        generatedFile(
          "two.js",
          "two\n"
        ),
        generatedFile(
          "three.js",
          "three\n"
        ),
      ]
    );

  const partialBefore =
    clone(partialPlan);

  const partialPreflight =
    buildGenerationWritePreflight({
      plan:
        partialPlan,
      rootDirectory:
        partialRoot,
    });

  const partialPreflightBefore =
    clone(partialPreflight);

  let calls = 0;

  const partialWriter =
    createGenerationPlanWriter({
      writeFileAtomically(args) {
        calls += 1;

        if (calls === 2) {
          return buildGenerationFileWriteResult({
            relativePath:
              args.generatedFileEntry
                .relativePath,
            action:
              args.preflightFileEntry
                .action,
            status: "failed",
            expectedContentHash:
              args.generatedFileEntry
                .contentHash,
            writtenContentHash: null,
            errorCode:
              "atomic_publish_failed",
            message:
              "Forced atomic publish failure.",
            metadata: {
              attempted: true,
            },
          });
        }

        return writeGenerationFileAtomically(
          args
        );
      },
    });

  const partialReport =
    partialWriter.writeGenerationPlan({
      generationPlan:
        partialPlan,
      writePreflightReport:
        partialPreflight,
    });

  expect(
    partialReport.status ===
      "partial" &&
    partialReport.fileResults
      .map(
        (result) =>
          result.status
      )
      .join(",") ===
      "success,failed,skipped" &&
    partialReport.fileResults[2]
      .errorCode ===
      "not_attempted_after_failure" &&
    partialReport.fileResults[2]
      .metadata.attempted ===
      false,
    "Partial semantics differ."
  );

  expect(
    fs.existsSync(
      path.join(
        partialRoot,
        "one.js"
      )
    ) &&
    !fs.existsSync(
      path.join(
        partialRoot,
        "three.js"
      )
    ) &&
    partialReport.metadata
      .transactionalPlan ===
      false,
    "Partial scenario suggests rollback or attempted third file."
  );

  expect(
    JSON.stringify(partialPlan) ===
      JSON.stringify(partialBefore) &&
    JSON.stringify(
      partialPreflight
    ) ===
      JSON.stringify(
        partialPreflightBefore
      ),
    "Partial scenario mutated inputs."
  );

  // Scenario 9: post-publish mismatch.
  const postHashRoot =
    path.join(root, "post-hash");
  fs.mkdirSync(postHashRoot);

  const postHashPlan =
    plan(
      "final-post-hash",
      [
        generatedFile(
          "published.js",
          "published\n"
        ),
        generatedFile(
          "not-attempted.js",
          "later\n"
        ),
      ]
    );

  const postHashPreflight =
    buildGenerationWritePreflight({
      plan:
        postHashPlan,
      rootDirectory:
        postHashRoot,
    });

  const postHashWriter =
    createGenerationPlanWriter({
      hashTarget: () =>
        "f".repeat(64),
    });

  const postHashReport =
    postHashWriter
      .writeGenerationPlan({
        generationPlan:
          postHashPlan,
        writePreflightReport:
          postHashPreflight,
      });

  expect(
    postHashReport.status ===
      "failed" &&
    postHashReport.fileResults[0]
      .errorCode ===
      "post_write_hash_mismatch" &&
    postHashReport.fileResults[0]
      .metadata.published ===
      true &&
    postHashReport.fileResults[1]
      .status ===
      "skipped" &&
    fs.existsSync(
      path.join(
        postHashRoot,
        "published.js"
      )
    ),
    "Post-write mismatch semantics differ."
  );

  // Scenario 11: empty plan policy.
  const emptyPlan =
    plan(
      "final-empty",
      []
    );

  const emptyReport =
    writeGenerationPlan({
      generationPlan:
        emptyPlan,
      writePreflightReport: {},
    });

  expect(
    emptyReport.status ===
      "failed" &&
    emptyReport.errors.some(
      (error) =>
        error.code ===
          "generation_plan_invalid"
    ),
    "Empty plan policy must remain invalid."
  );

  console.log(
    JSON.stringify(
      {
        test:
          "Generation Writer Final Regression",
        status:
          failures.length === 0
            ? "PASS"
            : "FAIL",
        platform:
          process.platform,
        scenarios: 12,
        skipped,
        summaries: {
          completed:
            createReport.summary,
          mixed:
            mixedReport.summary,
          partial:
            partialReport.summary,
          blocked:
            blockedReport.summary,
        },
      },
      null,
      2
    )
  );
} finally {
  fs.rmSync(root, {
    recursive: true,
    force: true,
  });
}

if (failures.length > 0) {
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
  "Generation Writer Final Regression: PASS"
);
