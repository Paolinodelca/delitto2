const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const {
  buildGenerationPlan,
  buildGenerationWritePreflight,
  buildGenerationWriteReport,
  buildGenerationFileWriteResult,
  validateGenerationPlan,
  validateGenerationWritePreflight,
  validateGenerationWriteReport,
} = require("../tools/imago-builder");

const {
  createGenerationWriterCli,
} = require("../tools/imago-builder/cli/write-generation-plan");

function hash(content) {
  return crypto
    .createHash("sha256")
    .update(content, "utf8")
    .digest("hex");
}

function file(relativePath, content) {
  return {
    relativePath,
    content,
    contentHash:
      hash(content),
    overwritePolicy: "forbid",
    metadata: {},
  };
}

function plan(id, files) {
  return buildGenerationPlan({
    planId: id,
    generatorId:
      "generation-writer-cli-regression",
    targetRoot: ".",
    source: {
      moduleType: "test",
      sourceId: id,
      sourceVersion: "1.0",
    },
    files,
  });
}

function capture() {
  let value = "";

  return {
    stream: {
      write(chunk) {
        value += String(chunk);
      },
    },
    read() {
      return value;
    },
  };
}

function sanitize({
  exitCode,
  envelope,
}) {
  return {
    exitCode,
    mode:
      envelope.mode,
    success:
      envelope.success,
    errorCode:
      envelope.error
        ? envelope.error.code
        : null,
    preflightStatus:
      envelope.preflightReport
        ? envelope
            .preflightReport
            .preflightStatus
        : null,
    writeStatus:
      envelope.writeReport
        ? envelope.writeReport.status
        : null,
    summary:
      envelope.writeReport
        ? envelope
            .writeReport
            .summary
        : envelope.preflightReport
          ? envelope
              .preflightReport
              .summary
          : null,
  };
}

const root =
  path.resolve(
    process.cwd(),
    "tmp/test-generation-writer-cli-regression"
  );

fs.rmSync(root, {
  recursive: true,
  force: true,
});
fs.mkdirSync(root, {
  recursive: true,
});

try {
  const planValue =
    plan(
      "cli-regression",
      [
        file("1.js", "1\n"),
        file("2.js", "2\n"),
        file("3.js", "3\n"),
      ]
    );

  const planPath =
    path.join(
      root,
      "plan.json"
    );

  fs.writeFileSync(
    planPath,
    JSON.stringify(
      planValue
    ),
    "utf8"
  );

  const readyRoot =
    path.join(root, "ready");
  fs.mkdirSync(readyRoot);

  const ready =
    createGenerationWriterCli({
      stdout:
        capture().stream,
      stderr:
        capture().stream,
      cwd: root,
    }).run([
      "--plan",
      planPath,
      "--target-root",
      readyRoot,
    ]);

  const blockedRoot =
    path.join(root, "blocked");
  fs.mkdirSync(blockedRoot);
  fs.writeFileSync(
    path.join(
      blockedRoot,
      "1.js"
    ),
    "external\n"
  );

  const blocked =
    createGenerationWriterCli({
      stdout:
        capture().stream,
      stderr:
        capture().stream,
      cwd: root,
    }).run([
      "--plan",
      planPath,
      "--target-root",
      blockedRoot,
    ]);

  const completedRoot =
    path.join(root, "completed");
  fs.mkdirSync(completedRoot);

  const completed =
    createGenerationWriterCli({
      stdout:
        capture().stream,
      stderr:
        capture().stream,
      cwd: root,
    }).run([
      "--plan",
      planPath,
      "--target-root",
      completedRoot,
      "--write",
    ]);

  const partialApi = {
    validateGenerationPlan,
    buildGenerationWritePreflight,
    validateGenerationWritePreflight,
    validateGenerationWriteReport,
    writeGenerationPlan({
      generationPlan,
      writePreflightReport,
    }) {
      return buildGenerationWriteReport({
        status: "partial",
        planIdentity:
          generationPlan.planIdentity,
        preflightIdentity:
          writePreflightReport.planIdentity,
        fileResults: [
          buildGenerationFileWriteResult({
            relativePath: "1.js",
            action: "create",
            status: "success",
            expectedContentHash:
              generationPlan.files[0].contentHash,
            writtenContentHash:
              generationPlan.files[0].contentHash,
            errorCode: null,
            message: "success",
            metadata: {
              attempted: true,
            },
          }),
          buildGenerationFileWriteResult({
            relativePath: "2.js",
            action: "create",
            status: "failed",
            expectedContentHash:
              generationPlan.files[1].contentHash,
            writtenContentHash: null,
            errorCode:
              "atomic_publish_failed",
            message: "failed",
            metadata: {
              attempted: true,
            },
          }),
          buildGenerationFileWriteResult({
            relativePath: "3.js",
            action: "create",
            status: "skipped",
            expectedContentHash:
              generationPlan.files[2].contentHash,
            writtenContentHash: null,
            errorCode:
              "not_attempted_after_failure",
            message: "skipped",
            metadata: {
              attempted: false,
            },
          }),
        ],
        errors: [
          {
            code:
              "atomic_publish_failed",
            message: "failed",
          },
        ],
        warnings: [],
        metadata: {
          mode: "write",
          failurePolicy:
            "stop_on_first_failure",
          atomicPerFile: true,
          transactionalPlan: false,
        },
      });
    },
  };

  const partialRoot =
    path.join(root, "partial");
  fs.mkdirSync(partialRoot);

  const partial =
    createGenerationWriterCli({
      stdout:
        capture().stream,
      stderr:
        capture().stream,
      cwd: root,
      builderApi:
        partialApi,
    }).run([
      "--plan",
      planPath,
      "--target-root",
      partialRoot,
      "--write",
    ]);

  const snapshot = {
    ready:
      sanitize(ready),
    blocked:
      sanitize(blocked),
    completed:
      sanitize(completed),
    partial:
      sanitize(partial),
  };

  const pass =
    snapshot.ready.exitCode === 0 &&
    snapshot.ready.mode ===
      "preflight" &&
    snapshot.ready.success ===
      true &&
    snapshot.ready
      .preflightStatus ===
      "ready" &&
    snapshot.blocked.exitCode ===
      2 &&
    snapshot.blocked.success ===
      false &&
    snapshot.blocked
      .preflightStatus ===
      "blocked" &&
    snapshot.completed.exitCode ===
      0 &&
    snapshot.completed
      .writeStatus ===
      "completed" &&
    snapshot.partial.exitCode ===
      4 &&
    snapshot.partial
      .writeStatus ===
      "partial";

  console.log(
    JSON.stringify(
      {
        test:
          "Generation Writer CLI Regression",
        status:
          pass
            ? "PASS"
            : "FAIL",
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
  process.exit(
    process.exitCode
  );
}

console.log(
  "Generation Writer CLI Regression Test: PASS"
);
