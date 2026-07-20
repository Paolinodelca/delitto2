const fs = require("fs");
const path = require("path");

const {
  buildGenerationPlan,
  buildGenerationWritePreflight,
  buildGenerationFileWriteResult,
  writeGenerationPlan,
} = require("../tools/imago-builder");

const {
  createGenerationPlanWriter,
} = require("../tools/imago-builder/core/writeGenerationPlan");

const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

function makeFile(relativePath, content) {
  const crypto = require("crypto");
  return {
    relativePath,
    content,
    contentHash:
      crypto
        .createHash("sha256")
        .update(content, "utf8")
        .digest("hex"),
    overwritePolicy: "forbid",
    metadata: {},
  };
}

function makePlan(id, files) {
  return buildGenerationPlan({
    planId: id,
    generatorId:
      "writer_execution_regression",
    targetRoot: ".",
    source: {
      moduleType: "test",
      sourceId: id,
      sourceVersion: "1.0",
    },
    files,
  });
}

function sanitize(report) {
  return {
    ...report,
    metadata: {
      ...report.metadata,
      createdAt: null,
    },
  };
}

const root =
  path.resolve(
    process.cwd(),
    "tmp/test-generation-plan-writer-execution-regression"
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
    makePlan(
      "completed",
      [
        makeFile("1.js", "1\n"),
        makeFile("2.js", "2\n"),
        makeFile("3.js", "3\n"),
      ]
    );

  const completedPreflight =
    buildGenerationWritePreflight({
      plan:
        completedPlan,
      rootDirectory:
        completedRoot,
    });

  const completed =
    writeGenerationPlan({
      generationPlan:
        completedPlan,
      writePreflightReport:
        completedPreflight,
    });

  const partialRoot =
    path.join(root, "partial");
  fs.mkdirSync(partialRoot);

  const partialPlan =
    makePlan(
      "partial",
      [
        makeFile("1.js", "1\n"),
        makeFile("2.js", "2\n"),
        makeFile("3.js", "3\n"),
      ]
    );

  const partialPreflight =
    buildGenerationWritePreflight({
      plan:
        partialPlan,
      rootDirectory:
        partialRoot,
    });

  let count = 0;
  const partialWriter =
    createGenerationPlanWriter({
      writeFileAtomically({
        generatedFileEntry,
        preflightFileEntry,
      }) {
        count += 1;
        if (count === 2) {
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

  const partial =
    partialWriter.writeGenerationPlan({
      generationPlan:
        partialPlan,
      writePreflightReport:
        partialPreflight,
    });

  expect(
    completed.status ===
      "completed" &&
    completed.summary.successfulFiles ===
      3,
    "Completed regression failed."
  );

  expect(
    partial.status ===
      "partial" &&
    partial.summary.successfulFiles ===
      1 &&
    partial.summary.failedFiles ===
      1 &&
    partial.summary.skippedFiles ===
      1,
    "Partial regression failed."
  );

  console.log(
    JSON.stringify(
      {
        test:
          "Generation Plan Writer Execution Regression",
        status:
          failures.length === 0
            ? "PASS"
            : "FAIL",
        snapshot: {
          completed:
            sanitize(completed),
          partial:
            sanitize(partial),
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
  "Generation Plan Writer Execution Regression Test: PASS"
);
