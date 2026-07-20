const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const {
  buildGenerationPlan,
  buildGenerationWritePreflight,
  buildGenerationWriteReport,
  buildGenerationFileWriteResult,
  writeGenerationPlan,
  validateGenerationPlan,
  validateGenerationWritePreflight,
  validateGenerationWriteReport,
} = require("../tools/imago-builder");

const {
  EXIT_CODES,
  parseCliArguments,
  createGenerationWriterCli,
} = require("../tools/imago-builder/cli/write-generation-plan");

const failures = [];

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

function file(
  relativePath,
  content,
  overwritePolicy = "forbid"
) {
  return {
    relativePath,
    content,
    contentHash:
      hash(content),
    overwritePolicy,
    metadata: {
      immutable: true,
    },
  };
}

function plan(id, files) {
  return buildGenerationPlan({
    planId: id,
    generatorId:
      "generation-writer-cli-test",
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

function clone(value) {
  return JSON.parse(
    JSON.stringify(value)
  );
}

function writePlan(
  directory,
  name,
  value
) {
  const planPath =
    path.join(
      directory,
      name
    );

  fs.writeFileSync(
    planPath,
    JSON.stringify(
      value,
      null,
      2
    ),
    "utf8"
  );

  return planPath;
}

const root =
  path.resolve(
    process.cwd(),
    "tmp/test-generation-writer-cli"
  );

fs.rmSync(root, {
  recursive: true,
  force: true,
});
fs.mkdirSync(root, {
  recursive: true,
});

try {
  const parserCases = [
    {
      argv: [],
      code:
        "cli_arguments_invalid",
    },
    {
      argv: [
        "--plan",
        "x.json",
      ],
      code:
        "cli_arguments_invalid",
    },
    {
      argv: [
        "--target-root",
        "x",
      ],
      code:
        "cli_arguments_invalid",
    },
    {
      argv: [
        "--wirte",
      ],
      code:
        "cli_arguments_invalid",
    },
    {
      argv: [
        "--plan",
      ],
      code:
        "cli_arguments_invalid",
    },
    {
      argv: [
        "--overwrite-report",
        "--plan",
        "x",
        "--target-root",
        "y",
      ],
      code:
        "cli_arguments_invalid",
    },
  ];

  parserCases.forEach(
    ({ argv, code }) => {
      const parsed =
        parseCliArguments(
          argv
        );

      expect(
        parsed.valid ===
          false &&
        parsed.error.code ===
          code,
        `Parser case failed: ${argv.join(" ")}`
      );
    }
  );

  const helpOut =
    capture();

  const help =
    createGenerationWriterCli({
      stdout:
        helpOut.stream,
      stderr:
        capture().stream,
      cwd: root,
      version: "9.8.3",
    }).run([
      "--help",
    ]);

  expect(
    help.exitCode ===
      EXIT_CODES.success &&
    helpOut.read().includes(
      "Default mode is preflight-only"
    ),
    "Help behavior differs."
  );

  const versionOut =
    capture();

  const version =
    createGenerationWriterCli({
      stdout:
        versionOut.stream,
      stderr:
        capture().stream,
      cwd: root,
      version: "9.8.3",
    }).run([
      "--version",
    ]);

  expect(
    version.exitCode ===
      0 &&
    versionOut.read().trim() ===
      "9.8.3",
    "Version behavior differs."
  );

  const missingOut =
    capture();

  const missing =
    createGenerationWriterCli({
      stdout:
        missingOut.stream,
      stderr:
        capture().stream,
      cwd: root,
    }).run([
      "--plan",
      "missing.json",
      "--target-root",
      "target",
      "--json",
    ]);

  expect(
    missing.exitCode ===
      1 &&
    JSON.parse(
      missingOut.read()
    ).error.code ===
      "plan_file_missing",
    "Missing plan behavior differs."
  );

  const invalidJsonPath =
    path.join(
      root,
      "invalid.json"
    );

  fs.writeFileSync(
    invalidJsonPath,
    "{bad",
    "utf8"
  );

  const invalidJsonOut =
    capture();

  const invalidJson =
    createGenerationWriterCli({
      stdout:
        invalidJsonOut.stream,
      stderr:
        capture().stream,
      cwd: root,
    }).run([
      "--plan",
      invalidJsonPath,
      "--target-root",
      path.join(root, "target"),
      "--json",
    ]);

  expect(
    invalidJson.exitCode ===
      1 &&
    JSON.parse(
      invalidJsonOut.read()
    ).error.code ===
      "plan_json_invalid",
    "Invalid JSON behavior differs."
  );

  const invalidPlanPath =
    writePlan(
      root,
      "invalid-plan.json",
      {
        files: [],
      }
    );

  const invalidPlanOut =
    capture();

  const invalidPlan =
    createGenerationWriterCli({
      stdout:
        invalidPlanOut.stream,
      stderr:
        capture().stream,
      cwd: root,
    }).run([
      "--plan",
      invalidPlanPath,
      "--target-root",
      path.join(root, "target"),
      "--json",
    ]);

  expect(
    invalidPlan.exitCode ===
      1 &&
    JSON.parse(
      invalidPlanOut.read()
    ).error.code ===
      "generation_plan_invalid",
    "Invalid GenerationPlan behavior differs."
  );

  const readyRoot =
    path.join(
      root,
      "ready-target"
    );

  fs.mkdirSync(readyRoot);

  const readyPlan =
    plan(
      "cli-ready",
      [
        file(
          "nested/file.js",
          "ready\n"
        ),
      ]
    );

  const readyBefore =
    clone(readyPlan);

  const readyPlanPath =
    writePlan(
      root,
      "ready-plan.json",
      readyPlan
    );

  const readyOut =
    capture();

  const ready =
    createGenerationWriterCli({
      stdout:
        readyOut.stream,
      stderr:
        capture().stream,
      cwd: root,
    }).run([
      "--plan",
      readyPlanPath,
      "--target-root",
      readyRoot,
    ]);

  expect(
    ready.exitCode ===
      0 &&
    ready.envelope.mode ===
      "preflight" &&
    ready.envelope.success ===
      true &&
    ready.envelope.writeReport ===
      null &&
    !fs.existsSync(
      path.join(
        readyRoot,
        "nested"
      )
    ),
    "Ready preflight-only behavior differs."
  );

  expect(
    JSON.stringify(readyPlan) ===
      JSON.stringify(readyBefore),
    "CLI mutated loaded plan."
  );

  const blockedRoot =
    path.join(
      root,
      "blocked-target"
    );

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
      "cli-blocked",
      [
        file(
          "blocked.js",
          "generated\n"
        ),
      ]
    );

  const blockedPath =
    writePlan(
      root,
      "blocked-plan.json",
      blockedPlan
    );

  const blockedOut =
    capture();

  const blocked =
    createGenerationWriterCli({
      stdout:
        blockedOut.stream,
      stderr:
        capture().stream,
      cwd: root,
    }).run([
      "--plan",
      blockedPath,
      "--target-root",
      blockedRoot,
      "--json",
    ]);

  const blockedEnvelope =
    JSON.parse(
      blockedOut.read()
    );

  expect(
    blocked.exitCode ===
      2 &&
    blockedEnvelope.success ===
      false &&
    blockedEnvelope
      .preflightReport
      .preflightStatus ===
      "blocked" &&
    fs.readFileSync(
      path.join(
        blockedRoot,
        "blocked.js"
      ),
      "utf8"
    ) === "external\n",
    "Blocked preflight behavior differs."
  );

  const writeRoot =
    path.join(
      root,
      "write-target"
    );

  fs.mkdirSync(writeRoot);

  const writePlanValue =
    plan(
      "cli-write",
      [
        file(
          "one.js",
          "one\n"
        ),
        file(
          "sub/two.js",
          "two\n"
        ),
      ]
    );

  const writePlanPath =
    writePlan(
      root,
      "write-plan.json",
      writePlanValue
    );

  const writeOut =
    capture();

  const completed =
    createGenerationWriterCli({
      stdout:
        writeOut.stream,
      stderr:
        capture().stream,
      cwd: root,
    }).run([
      "--plan",
      writePlanPath,
      "--target-root",
      writeRoot,
      "--write",
      "--json",
    ]);

  const completedEnvelope =
    JSON.parse(
      writeOut.read()
    );

  expect(
    completed.exitCode ===
      0 &&
    completedEnvelope
      .writeReport.status ===
      "completed" &&
    fs.readFileSync(
      path.join(
        writeRoot,
        "one.js"
      ),
      "utf8"
    ) === "one\n" &&
    fs.readFileSync(
      path.join(
        writeRoot,
        "sub/two.js"
      ),
      "utf8"
    ) === "two\n",
    "Completed write behavior differs."
  );

  const overwriteRoot =
    path.join(
      root,
      "overwrite-target"
    );

  fs.mkdirSync(overwriteRoot);
  fs.writeFileSync(
    path.join(
      overwriteRoot,
      "old.js"
    ),
    "old\n",
    "utf8"
  );

  const overwritePlan =
    plan(
      "cli-overwrite",
      [
        file(
          "old.js",
          "updated\n",
          "allow_explicit"
        ),
      ]
    );

  const overwritePath =
    writePlan(
      root,
      "overwrite-plan.json",
      overwritePlan
    );

  const noOverwrite =
    createGenerationWriterCli({
      stdout:
        capture().stream,
      stderr:
        capture().stream,
      cwd: root,
    }).run([
      "--plan",
      overwritePath,
      "--target-root",
      overwriteRoot,
    ]);

  expect(
    noOverwrite.exitCode ===
      2,
    "Overwrite without authorization must block."
  );

  const overwriteCompleted =
    createGenerationWriterCli({
      stdout:
        capture().stream,
      stderr:
        capture().stream,
      cwd: root,
    }).run([
      "--plan",
      overwritePath,
      "--target-root",
      overwriteRoot,
      "--allow-overwrite",
      "--write",
    ]);

  expect(
    overwriteCompleted.exitCode ===
      0 &&
    fs.readFileSync(
      path.join(
        overwriteRoot,
        "old.js"
      ),
      "utf8"
    ) === "updated\n",
    "Authorized overwrite behavior differs."
  );

  const seamRoot =
    path.join(
      root,
      "seam-target"
    );

  fs.mkdirSync(seamRoot);

  const seamPlan =
    plan(
      "cli-seam",
      [
        file("1.js", "1\n"),
        file("2.js", "2\n"),
        file("3.js", "3\n"),
      ]
    );

  const seamPath =
    writePlan(
      root,
      "seam-plan.json",
      seamPlan
    );

  const seamApi = {
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

  const partial =
    createGenerationWriterCli({
      stdout:
        capture().stream,
      stderr:
        capture().stream,
      cwd: root,
      builderApi:
        seamApi,
    }).run([
      "--plan",
      seamPath,
      "--target-root",
      seamRoot,
      "--write",
    ]);

  expect(
    partial.exitCode ===
      4 &&
    partial.envelope
      .writeReport.status ===
      "partial",
    "Partial write exit code differs."
  );

  const failedApi = {
    ...seamApi,
    writeGenerationPlan({
      generationPlan,
      writePreflightReport,
    }) {
      return buildGenerationWriteReport({
        status: "failed",
        planIdentity:
          generationPlan.planIdentity,
        preflightIdentity:
          writePreflightReport.planIdentity,
        fileResults: [
          buildGenerationFileWriteResult({
            relativePath: "1.js",
            action: "create",
            status: "failed",
            expectedContentHash:
              generationPlan.files[0].contentHash,
            writtenContentHash: null,
            errorCode:
              "atomic_publish_failed",
            message: "failed",
            metadata: {
              attempted: true,
            },
          }),
          buildGenerationFileWriteResult({
            relativePath: "2.js",
            action: "create",
            status: "skipped",
            expectedContentHash:
              generationPlan.files[1].contentHash,
            writtenContentHash: null,
            errorCode:
              "not_attempted_after_failure",
            message: "skipped",
            metadata: {
              attempted: false,
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

  const failed =
    createGenerationWriterCli({
      stdout:
        capture().stream,
      stderr:
        capture().stream,
      cwd: root,
      builderApi:
        failedApi,
    }).run([
      "--plan",
      seamPath,
      "--target-root",
      seamRoot,
      "--write",
    ]);

  expect(
    failed.exitCode ===
      3 &&
    failed.envelope
      .writeReport.status ===
      "failed",
    "Failed write exit code differs."
  );

  const reportRoot =
    path.join(
      root,
      "reports"
    );

  fs.mkdirSync(reportRoot);

  const reportPath =
    path.join(
      reportRoot,
      "result.json"
    );

  const reportResult =
    createGenerationWriterCli({
      stdout:
        capture().stream,
      stderr:
        capture().stream,
      cwd: root,
    }).run([
      "--plan",
      readyPlanPath,
      "--target-root",
      readyRoot,
      "--report",
      reportPath,
    ]);

  const reportBytes =
    fs.readFileSync(
      reportPath
    );

  expect(
    reportResult.exitCode ===
      0 &&
    reportBytes[0] !==
      0xef &&
    JSON.parse(
      reportBytes.toString(
        "utf8"
      )
    ).command ===
      "imago-builder-write",
    "Report output differs."
  );

  const existingReport =
    createGenerationWriterCli({
      stdout:
        capture().stream,
      stderr:
        capture().stream,
      cwd: root,
    }).run([
      "--plan",
      readyPlanPath,
      "--target-root",
      readyRoot,
      "--report",
      reportPath,
    ]);

  expect(
    existingReport.exitCode ===
      5 &&
    existingReport.envelope
      .error.code ===
      "report_already_exists",
    "Existing report must be rejected."
  );

  const overwrittenReport =
    createGenerationWriterCli({
      stdout:
        capture().stream,
      stderr:
        capture().stream,
      cwd: root,
    }).run([
      "--plan",
      readyPlanPath,
      "--target-root",
      readyRoot,
      "--report",
      reportPath,
      "--overwrite-report",
    ]);

  expect(
    overwrittenReport.exitCode ===
      0,
    "Report overwrite authorization differs."
  );

  const missingParentReport =
    createGenerationWriterCli({
      stdout:
        capture().stream,
      stderr:
        capture().stream,
      cwd: root,
    }).run([
      "--plan",
      readyPlanPath,
      "--target-root",
      readyRoot,
      "--report",
      path.join(
        root,
        "missing/reports/result.json"
      ),
    ]);

  expect(
    missingParentReport.exitCode ===
      5 &&
    missingParentReport.envelope
      .error.code ===
      "report_parent_missing",
    "Missing report parent behavior differs."
  );

  console.log(
    JSON.stringify(
      {
        test:
          "Generation Writer CLI",
        status:
          failures.length === 0
            ? "PASS"
            : "FAIL",
        exitCodes: {
          ready:
            ready.exitCode,
          blocked:
            blocked.exitCode,
          completed:
            completed.exitCode,
          failed:
            failed.exitCode,
          partial:
            partial.exitCode,
          reportFailure:
            existingReport.exitCode,
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
  "Generation Writer CLI Test: PASS"
);
