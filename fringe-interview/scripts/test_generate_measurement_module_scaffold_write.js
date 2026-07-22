const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  generateMeasurementModuleScaffold,
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

const rootDirectory =
  fs.mkdtempSync(
    path.join(
      os.tmpdir(),
      "imago-measurement-write-"
    )
  );

const targetRoot =
  "generated/measurement-module";

const spec =
  buildExecutionThroughOthersMeasurementSpec();

const input = {
  spec,
  targetRoot,
  rootDirectory,
  write: true,
};

const inputBefore =
  JSON.stringify(input);

const result =
  generateMeasurementModuleScaffold(
    input
  );

expect(
  result.mode === "write",
  "mode"
);

expect(
  result.generated === true,
  "generated"
);

expect(
  result.written === true,
  "written"
);

expect(
  result.preflightReport &&
  result.preflightReport.preflightStatus ===
    "ready",
  "preflight ready"
);

expect(
  result.writeReport &&
  result.writeReport.status ===
    "completed",
  "write completed"
);

expect(
  result.writeReport &&
  result.writeReport.summary.successfulFiles ===
    result.plan.files.length,
  "all files written"
);

expect(
  result.errors.length === 0,
  `errors: ${result.errors.join("; ")}`
);

result.plan.files.forEach((file) => {
  const outputPath =
    path.resolve(
      rootDirectory,
      targetRoot,
      file.relativePath
    );

  expect(
    fs.existsSync(outputPath),
    `missing output: ${file.relativePath}`
  );

  if (fs.existsSync(outputPath)) {
    expect(
      fs.readFileSync(
        outputPath,
        "utf8"
      ) === file.content,
      `content mismatch: ${file.relativePath}`
    );
  }
});

expect(
  JSON.stringify(input) ===
    inputBefore,
  "input mutated"
);

const blockedResult =
  generateMeasurementModuleScaffold({
    spec:
      buildExecutionThroughOthersMeasurementSpec(),
    targetRoot,
    rootDirectory,
    write: true,
    allowOverwrite: true,
  });

expect(
  blockedResult.mode === "write",
  "blocked mode"
);

expect(
  blockedResult.generated === true,
  "blocked generated"
);

expect(
  blockedResult.written === false,
  "blocked written"
);

expect(
  blockedResult.preflightReport &&
  blockedResult.preflightReport.preflightStatus ===
    "blocked",
  "blocked preflight"
);

expect(
  blockedResult.writeReport === null,
  "writer must not run after blocked preflight"
);

expect(
  blockedResult.errors.length > 0,
  "blocked errors"
);

fs.rmSync(
  rootDirectory,
  {
    recursive: true,
    force: true,
  }
);

console.log(
  JSON.stringify(
    {
      test:
        "Measurement Module Scaffold Write",
      status:
        failures.length === 0
          ? "PASS"
          : "FAIL",
      fileCount:
        result.plan.files.length,
      writeStatus:
        result.writeReport &&
        result.writeReport.status,
      blockedStatus:
        blockedResult.preflightReport &&
        blockedResult.preflightReport.preflightStatus,
    },
    null,
    2
  )
);

if (failures.length > 0) {
  console.error(
    "Measurement Module Scaffold Write Test: FAIL"
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
  "Measurement Module Scaffold Write Test: PASS"
);
