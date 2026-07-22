const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const {
  generateMeasurementModuleScaffold,
  validateGenerationPlan,
  validateGenerationWritePreflight,
  validateGenerationWriteReport,
} = require("../tools/imago-builder");

const {
  buildExecutionThroughOthersMeasurementSpec,
} = require("../tools/imago-builder/fixtures/executionThroughOthers.measurement.spec");

const failures = [];

function expect(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function sha256File(filePath) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(filePath))
    .digest("hex");
}

function snapshotTree(rootDirectory) {
  if (!fs.existsSync(rootDirectory)) {
    return [];
  }

  return fs
    .readdirSync(rootDirectory, {
      recursive: true,
      withFileTypes: true,
    })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const relativePath = path
        .relative(rootDirectory, path.join(entry.parentPath || entry.path, entry.name))
        .split(path.sep)
        .join("/");

      const absolutePath = path.resolve(rootDirectory, relativePath);

      return {
        relativePath,
        contentHash: sha256File(absolutePath),
      };
    })
    .sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

const rootDirectory = fs.mkdtempSync(
  path.join(os.tmpdir(), "imago-measurement-e2e-")
);

const targetRoot = "generated/measurement-module";
const absoluteTargetRoot = path.resolve(rootDirectory, targetRoot);

try {
  const dryRun = generateMeasurementModuleScaffold({
    spec: buildExecutionThroughOthersMeasurementSpec(),
    targetRoot,
    rootDirectory,
  });

  expect(dryRun.mode === "dry_run", "dry-run mode");
  expect(dryRun.generated === true, "dry-run generated");
  expect(dryRun.plan.planStatus === "ready", "dry-run plan ready");
  expect(
    validateGenerationPlan(dryRun.plan).isValid === true,
    "dry-run plan valid"
  );
  expect(
    fs.existsSync(absoluteTargetRoot) === false,
    "dry-run must not create the target root"
  );

  const writeResult = generateMeasurementModuleScaffold({
    spec: buildExecutionThroughOthersMeasurementSpec(),
    targetRoot,
    rootDirectory,
    write: true,
  });

  expect(writeResult.mode === "write", "write mode");
  expect(writeResult.generated === true, "write generated");
  expect(writeResult.written === true, "write completed");
  expect(
    validateGenerationPlan(writeResult.plan).isValid === true,
    "write plan valid"
  );
  expect(
    validateGenerationWritePreflight(writeResult.preflightReport).isValid === true,
    "write preflight valid"
  );
  expect(
    validateGenerationWriteReport(writeResult.writeReport).isValid === true,
    "write report valid"
  );
  expect(
    writeResult.writeReport.summary.successfulFiles === writeResult.plan.files.length,
    "all planned files written"
  );

  writeResult.plan.files.forEach((file) => {
    const outputPath = path.resolve(absoluteTargetRoot, file.relativePath);

    expect(fs.existsSync(outputPath), `written file exists: ${file.relativePath}`);

    if (fs.existsSync(outputPath)) {
      expect(
        sha256File(outputPath) === file.contentHash,
        `written hash matches plan: ${file.relativePath}`
      );
    }
  });

  const treeBeforeBlockedAttempt = snapshotTree(absoluteTargetRoot);

  const blockedResult = generateMeasurementModuleScaffold({
    spec: buildExecutionThroughOthersMeasurementSpec(),
    targetRoot,
    rootDirectory,
    write: true,
    allowOverwrite: true,
  });

  expect(blockedResult.mode === "write", "blocked mode");
  expect(blockedResult.generated === true, "blocked plan generated");
  expect(blockedResult.written === false, "blocked write not completed");
  expect(
    blockedResult.preflightReport &&
      blockedResult.preflightReport.preflightStatus === "blocked",
    "blocked preflight status"
  );
  expect(blockedResult.writeReport === null, "writer not invoked after blocked preflight");
  expect(
    validateGenerationWritePreflight(blockedResult.preflightReport).isValid === true,
    "blocked preflight valid"
  );
  expect(
    JSON.stringify(snapshotTree(absoluteTargetRoot)) ===
      JSON.stringify(treeBeforeBlockedAttempt),
    "blocked attempt must not mutate generated files"
  );

  console.log(
    JSON.stringify(
      {
        test: "Measurement Module End-to-End Regression",
        status: failures.length === 0 ? "PASS" : "FAIL",
        plannedFiles: writeResult.plan.files.length,
        writeStatus: writeResult.writeReport.status,
        blockedStatus: blockedResult.preflightReport.preflightStatus,
      },
      null,
      2
    )
  );
} finally {
  fs.rmSync(rootDirectory, {
    recursive: true,
    force: true,
  });
}

if (failures.length > 0) {
  console.error("Measurement Module End-to-End Regression: FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log("Measurement Module End-to-End Regression: PASS");
