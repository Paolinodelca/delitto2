const fs = require("fs");
const path = require("path");

const builder =
  require("../tools/imago-builder");

const writerSource =
  fs.readFileSync(
    path.resolve(
      process.cwd(),
      "tools/imago-builder/core/writeGenerationPlan.js"
    ),
    "utf8"
  );

const required = [
  "buildGenerationFileWriteResult",
  "validateGenerationFileWriteResult",
  "buildGenerationWriteReport",
  "validateGenerationWriteReport",
  "writeGenerationPlan",
];

const missing =
  required.filter(
    (name) =>
      typeof builder[name] !==
      "function"
  );

const checks = {
  contractsPresent:
    missing.length === 0,
  writerMutative:
    writerSource.includes(
      "mkdirSync"
    ),
  identityGuard:
    writerSource.includes(
      "plan_preflight_mismatch"
    ),
  readyGuard:
    writerSource.includes(
      "preflight_not_ready"
    ),
  reportValidation:
    writerSource.includes(
      "validateGenerationWriteReport"
    ),
  noWriterNotImplemented:
    !writerSource.includes(
      "writer_not_implemented"
    ),
};

const failed =
  Object.entries(checks)
    .filter(
      ([, passed]) =>
        passed !== true
    )
    .map(
      ([name]) => name
    );

console.log(
  JSON.stringify(
    {
      check:
        "Generation Plan Writer Contracts",
      status:
        failed.length === 0
          ? "PASS"
          : "FAIL",
      missing,
      checks,
      failed,
      readOnlyPhase: false,
    },
    null,
    2
  )
);

if (failed.length > 0) {
  process.exit(1);
}

console.log(
  "Generation Plan Writer Contracts Health: PASS"
);
