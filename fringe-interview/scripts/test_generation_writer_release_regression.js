const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const {
  buildGenerationPlan,
  buildGenerationWritePreflight,
  buildGenerationFileWriteResult,
  writeGenerationPlan,
} = require("../tools/imago-builder");

const {
  createGenerationPlanWriter,
} = require("../tools/imago-builder/core/writeGenerationPlan");

const {
  writeGenerationFileAtomically,
} = require("../tools/imago-builder/core/writeGenerationFileAtomically");

function file(relativePath, content) {
  return {
    relativePath,
    content,
    contentHash:
      crypto.createHash("sha256").update(content, "utf8").digest("hex"),
    overwritePolicy: "forbid",
    metadata: {},
  };
}

function plan(id) {
  return buildGenerationPlan({
    planId: id,
    generatorId: "release-regression",
    targetRoot: ".",
    source: {
      moduleType: "test",
      sourceId: id,
      sourceVersion: "1.0",
    },
    files: [
      file("1.js", "1\n"),
      file("2.js", "2\n"),
      file("3.js", "3\n"),
    ],
  });
}

function sanitize(report) {
  return {
    status: report.status,
    fileResults:
      report.fileResults.map(
        (result) => ({
          relativePath:
            result.relativePath,
          action:
            result.action,
          status:
            result.status,
          errorCode:
            result.errorCode,
          attempted:
            result.metadata.attempted ??
            null,
        })
      ),
    summary:
      report.summary,
    errors:
      report.errors.map(
        (error) => ({
          code: error.code,
        })
      ),
    metadata: {
      mode:
        report.metadata.mode,
      failurePolicy:
        report.metadata.failurePolicy,
      atomicPerFile:
        report.metadata.atomicPerFile,
      transactionalPlan:
        report.metadata.transactionalPlan,
    },
  };
}

const root =
  path.resolve(
    process.cwd(),
    "tmp/test-generation-writer-release-regression"
  );

fs.rmSync(root, {
  recursive: true,
  force: true,
});
fs.mkdirSync(root, {
  recursive: true,
});

try {
  const completedRoot =
    path.join(root, "completed");
  fs.mkdirSync(completedRoot);

  const completedPlan =
    plan("release-completed");

  const completed =
    writeGenerationPlan({
      generationPlan:
        completedPlan,
      writePreflightReport:
        buildGenerationWritePreflight({
          plan:
            completedPlan,
          rootDirectory:
            completedRoot,
        }),
    });

  const partialRoot =
    path.join(root, "partial");
  fs.mkdirSync(partialRoot);

  const partialPlan =
    plan("release-partial");

  const partialPreflight =
    buildGenerationWritePreflight({
      plan:
        partialPlan,
      rootDirectory:
        partialRoot,
    });

  let calls = 0;

  const partialWriter =
    createGenerationPlanWriter({
      writeFileAtomically(args) {
        calls += 1;

        if (calls === 2) {
          return buildGenerationFileWriteResult({
            relativePath:
              args.generatedFileEntry.relativePath,
            action:
              args.preflightFileEntry.action,
            status: "failed",
            expectedContentHash:
              args.generatedFileEntry.contentHash,
            writtenContentHash: null,
            errorCode:
              "atomic_publish_failed",
            message:
              "Stable forced failure.",
            metadata: {
              attempted: true,
            },
          });
        }

        return writeGenerationFileAtomically(args);
      },
    });

  const partial =
    partialWriter.writeGenerationPlan({
      generationPlan:
        partialPlan,
      writePreflightReport:
        partialPreflight,
    });

  const blockedRoot =
    path.join(root, "blocked");
  fs.mkdirSync(blockedRoot);
  fs.writeFileSync(
    path.join(blockedRoot, "1.js"),
    "external\n"
  );

  const blockedPlan =
    plan("release-blocked");

  const blocked =
    writeGenerationPlan({
      generationPlan:
        blockedPlan,
      writePreflightReport:
        buildGenerationWritePreflight({
          plan:
            blockedPlan,
          rootDirectory:
            blockedRoot,
        }),
    });

  const snapshot = {
    completed:
      sanitize(completed),
    partial:
      sanitize(partial),
    blocked:
      sanitize(blocked),
  };

  const pass =
    completed.status === "completed" &&
    completed.summary.successfulFiles === 3 &&
    partial.status === "partial" &&
    partial.summary.successfulFiles === 1 &&
    partial.summary.failedFiles === 1 &&
    partial.summary.skippedFiles === 1 &&
    blocked.status === "failed" &&
    blocked.fileResults.length === 0;

  console.log(
    JSON.stringify(
      {
        test:
          "Generation Writer Release Regression",
        status:
          pass ? "PASS" : "FAIL",
        snapshot,
      },
      null,
      2
    )
  );

  if (!pass) {
    process.exitCode = 1;
  }
} finally {
  fs.rmSync(root, {
    recursive: true,
    force: true,
  });
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(
  "Generation Writer Release Regression: PASS"
);
