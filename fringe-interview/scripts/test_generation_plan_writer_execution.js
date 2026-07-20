const fs = require("fs");
const path = require("path");

const {
  buildGenerationPlan,
  buildGenerationWritePreflight,
  validateGenerationWriteReport,
  writeGenerationPlan,
} = require("../tools/imago-builder");

const {
  createGenerationPlanWriter,
} = require("../tools/imago-builder/core/writeGenerationPlan");

const {
  buildGenerationFileWriteResult,
} = require("../tools/imago-builder");

const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildPlan({
  id,
  files,
  targetRoot = ".",
}) {
  return buildGenerationPlan({
    planId: id,
    generatorId:
      "generation_plan_writer_execution_test",
    targetRoot,
    source: {
      moduleType: "test",
      sourceId: id,
      sourceVersion: "1.0",
    },
    files,
  });
}

function file(relativePath, content, overwritePolicy = "forbid") {
  const crypto = require("crypto");
  return {
    relativePath,
    content,
    contentHash:
      crypto
        .createHash("sha256")
        .update(content, "utf8")
        .digest("hex"),
    overwritePolicy,
    metadata: {
      nested: {
        immutable: true,
      },
    },
  };
}

function runReady(plan, rootDirectory, allowOverwrite = false) {
  const preflight =
    buildGenerationWritePreflight({
      plan,
      rootDirectory,
      allowOverwrite,
    });

  expect(
    preflight.preflightStatus === "ready",
    `Expected ready preflight, received ${preflight.preflightStatus}.`
  );

  return {
    preflight,
    report:
      writeGenerationPlan({
        generationPlan: plan,
        writePreflightReport:
          preflight,
      }),
  };
}

const root =
  path.resolve(
    process.cwd(),
    "tmp/test-generation-plan-writer-execution"
  );

fs.rmSync(root, {
  recursive: true,
  force: true,
});
fs.mkdirSync(root, {
  recursive: true,
});

try {
  const createRoot =
    path.join(root, "create-only");
  fs.mkdirSync(createRoot);

  const createPlan =
    buildPlan({
      id: "create-only",
      files: [
        file("a.js", "a\n"),
        file("b.js", "b\n"),
      ],
    });

  const createBefore =
    clone(createPlan);

  const {
    preflight:
      createPreflight,
    report:
      createReport,
  } = runReady(
    createPlan,
    createRoot
  );

  const preflightBefore =
    clone(createPreflight);

  expect(
    createReport.status ===
      "completed",
    "Create-only plan must complete."
  );
  expect(
    createReport.summary.totalFiles === 2 &&
    createReport.summary.successfulFiles === 2 &&
    createReport.summary.createdFiles === 2,
    "Create-only summary is incoherent."
  );
  expect(
    createReport.fileResults.map(
      (result) =>
        result.relativePath
    ).join(",") ===
      "a.js,b.js",
    "Execution order differs from GenerationPlan."
  );
  expect(
    fs.readFileSync(
      path.join(createRoot, "a.js"),
      "utf8"
    ) === "a\n" &&
    fs.readFileSync(
      path.join(createRoot, "b.js"),
      "utf8"
    ) === "b\n",
    "Create-only contents differ."
  );
  expect(
    validateGenerationWriteReport(
      createReport
    ).isValid === true,
    "Create-only report is invalid."
  );
  expect(
    JSON.stringify(createPlan) ===
      JSON.stringify(createBefore),
    "Writer mutated GenerationPlan."
  );
  expect(
    JSON.stringify(createPreflight) ===
      JSON.stringify(preflightBefore),
    "Writer mutated WritePreflightReport."
  );

  const nestedRoot =
    path.join(root, "nested");
  fs.mkdirSync(nestedRoot);

  const nestedPlan =
    buildPlan({
      id: "nested",
      files: [
        file(
          "one/two/a.js",
          "nested-a\n"
        ),
        file(
          "one/three/b.js",
          "nested-b\n"
        ),
      ],
    });

  const nested =
    runReady(
      nestedPlan,
      nestedRoot
    );

  expect(
    nested.report.status ===
      "completed",
    "Nested-directory plan must complete."
  );
  expect(
    fs.existsSync(
      path.join(
        nestedRoot,
        "one/two/a.js"
      )
    ) &&
    fs.existsSync(
      path.join(
        nestedRoot,
        "one/three/b.js"
      )
    ),
    "Authorized nested directories were not created."
  );

  const mixedRoot =
    path.join(root, "mixed");
  fs.mkdirSync(mixedRoot);
  fs.writeFileSync(
    path.join(mixedRoot, "old.js"),
    "old\n",
    "utf8"
  );

  const mixedPlan =
    buildPlan({
      id: "mixed",
      files: [
        file("new.js", "new\n"),
        file(
          "old.js",
          "updated\n",
          "allow_explicit"
        ),
      ],
    });

  const mixed =
    runReady(
      mixedPlan,
      mixedRoot,
      true
    );

  expect(
    mixed.report.status ===
      "completed" &&
    mixed.report.summary.createdFiles === 1 &&
    mixed.report.summary.overwrittenFiles === 1,
    "Mixed plan summary is incoherent."
  );

  const mismatchRoot =
    path.join(root, "mismatch");
  fs.mkdirSync(mismatchRoot);

  const mismatchPlan =
    buildPlan({
      id: "mismatch",
      files: [
        file("x.js", "x\n"),
      ],
    });

  const mismatchPreflight =
    buildGenerationWritePreflight({
      plan:
        mismatchPlan,
      rootDirectory:
        mismatchRoot,
    });

  mismatchPreflight.files[0] = {
    ...mismatchPreflight.files[0],
    contentHash:
      "f".repeat(64),
  };

  const mismatchReport =
    writeGenerationPlan({
      generationPlan:
        mismatchPlan,
      writePreflightReport:
        mismatchPreflight,
    });

  expect(
    mismatchReport.status ===
      "failed" &&
    mismatchReport.errors.some(
      (error) =>
        error.code ===
          "plan_preflight_files_mismatch"
    ),
    "Operational mismatch was not detected."
  );
  expect(
    fs.readdirSync(
      mismatchRoot
    ).length === 0,
    "Mismatch mutated filesystem."
  );

  const partialRoot =
    path.join(root, "partial");
  fs.mkdirSync(partialRoot);

  const partialPlan =
    buildPlan({
      id: "partial",
      files: [
        file("first.js", "first\n"),
        file("second.js", "second\n"),
        file("third.js", "third\n"),
      ],
    });

  const partialPreflight =
    buildGenerationWritePreflight({
      plan:
        partialPlan,
      rootDirectory:
        partialRoot,
    });

  let callCount = 0;

  const partialWriter =
    createGenerationPlanWriter({
      writeFileAtomically({
        generatedFileEntry,
        preflightFileEntry,
      }) {
        callCount += 1;

        if (callCount === 2) {
          return buildGenerationFileWriteResult({
            relativePath:
              generatedFileEntry.relativePath,
            action:
              preflightFileEntry.action,
            status: "failed",
            expectedContentHash:
              generatedFileEntry.contentHash,
            writtenContentHash: null,
            errorCode:
              "forced_failure",
            message:
              "Forced failure.",
            metadata: {
              attempted: true,
            },
          });
        }

        return require(
          "../tools/imago-builder/core/writeGenerationFileAtomically"
        ).writeGenerationFileAtomically({
          generatedFileEntry,
          preflightFileEntry,
        });
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
      "partial",
    "Failure after success must produce partial."
  );
  expect(
    partialReport.fileResults[0].status ===
      "success" &&
    partialReport.fileResults[1].status ===
      "failed" &&
    partialReport.fileResults[2].status ===
      "skipped" &&
    partialReport.fileResults[2].errorCode ===
      "not_attempted_after_failure",
    "Stop-on-first-failure results are incorrect."
  );

  const failedRoot =
    path.join(root, "failed");
  fs.mkdirSync(failedRoot);

  const failedPlan =
    buildPlan({
      id: "failed",
      files: [
        file("one.js", "one\n"),
        file("two.js", "two\n"),
      ],
    });

  const failedPreflight =
    buildGenerationWritePreflight({
      plan:
        failedPlan,
      rootDirectory:
        failedRoot,
    });

  const failedWriter =
    createGenerationPlanWriter({
      writeFileAtomically({
        generatedFileEntry,
        preflightFileEntry,
      }) {
        return buildGenerationFileWriteResult({
          relativePath:
            generatedFileEntry.relativePath,
          action:
            preflightFileEntry.action,
          status: "failed",
          expectedContentHash:
            generatedFileEntry.contentHash,
          writtenContentHash: null,
          errorCode:
            "forced_first_failure",
          message:
            "First write failed.",
          metadata: {
            attempted: true,
          },
        });
      },
    });

  const failedReport =
    failedWriter.writeGenerationPlan({
      generationPlan:
        failedPlan,
      writePreflightReport:
        failedPreflight,
    });

  expect(
    failedReport.status ===
      "failed" &&
    failedReport.fileResults[0].status ===
      "failed" &&
    failedReport.fileResults[1].status ===
      "skipped",
    "First-file failure behavior is incorrect."
  );

  const hashRoot =
    path.join(root, "post-hash");
  fs.mkdirSync(hashRoot);

  const hashPlan =
    buildPlan({
      id: "post-hash",
      files: [
        file("hash.js", "hash\n"),
      ],
    });

  const hashPreflight =
    buildGenerationWritePreflight({
      plan:
        hashPlan,
      rootDirectory:
        hashRoot,
    });

  const hashWriter =
    createGenerationPlanWriter({
      hashTarget: () =>
        "0".repeat(64),
    });

  const hashReport =
    hashWriter.writeGenerationPlan({
      generationPlan:
        hashPlan,
      writePreflightReport:
        hashPreflight,
    });

  expect(
    hashReport.status ===
      "failed" &&
    hashReport.fileResults[0]
      .errorCode ===
      "post_write_hash_mismatch",
    "Post-write hash mismatch was not detected."
  );

  const directoryFailureRoot =
    path.join(root, "directory-failure");
  fs.mkdirSync(directoryFailureRoot);

  const directoryPlan =
    buildPlan({
      id: "directory-failure",
      files: [
        file("new/a.js", "a\n"),
        file("new/b.js", "b\n"),
      ],
    });

  const directoryPreflight =
    buildGenerationWritePreflight({
      plan:
        directoryPlan,
      rootDirectory:
        directoryFailureRoot,
    });

  const directoryWriter =
    createGenerationPlanWriter({
      fsOps: {
        ...fs,
        mkdirSync() {
          throw new Error(
            "forced mkdir failure"
          );
        },
      },
    });

  const directoryReport =
    directoryWriter.writeGenerationPlan({
      generationPlan:
        directoryPlan,
      writePreflightReport:
        directoryPreflight,
    });

  expect(
    directoryReport.status ===
      "failed" &&
    directoryReport.fileResults.every(
      (result) =>
        result.status ===
          "skipped"
    ) &&
    directoryReport.errors.some(
      (error) =>
        error.code ===
          "directory_preparation_failed"
    ),
    "Directory preparation failure behavior is incorrect."
  );

  console.log(
    JSON.stringify(
      {
        test:
          "Generation Plan Writer Execution",
        status:
          failures.length === 0
            ? "PASS"
            : "FAIL",
        completed:
          createReport.summary,
        partial:
          partialReport.summary,
        failed:
          failedReport.summary,
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
  "Generation Plan Writer Execution Test: PASS"
);
