const fs = require("fs");
const path = require("path");

const {
  buildGenerationPlan,
  buildGenerationWritePreflight,
  validateGenerationWriteReport,
  writeGenerationPlan,
} = require("../tools/imago-builder");

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

const root =
  path.resolve(
    process.cwd(),
    "tmp/test-generation-plan-writer-contracts"
  );

fs.rmSync(root, {
  recursive: true,
  force: true,
});
fs.mkdirSync(root, {
  recursive: true,
});

try {
  const plan =
    buildGenerationPlan({
      planId: "contracts",
      generatorId:
        "contracts-writer",
      targetRoot: ".",
      source: {
        moduleType: "test",
        sourceId: "contracts",
        sourceVersion: "1.0",
      },
      files: [
        makeFile(
          "generated.js",
          "generated\n"
        ),
      ],
    });

  const preflight =
    buildGenerationWritePreflight({
      plan,
      rootDirectory: root,
    });

  const completed =
    writeGenerationPlan({
      generationPlan: plan,
      writePreflightReport:
        preflight,
    });

  expect(
    completed.status ===
      "completed",
    "Ready matching plan must execute."
  );

  expect(
    completed.summary.successfulFiles ===
      1,
    "Completed execution must report one success."
  );

  expect(
    validateGenerationWriteReport(
      completed
    ).isValid === true,
    "Completed report must validate."
  );

  const mismatchPlan =
    buildGenerationPlan({
      planId: "contracts-other",
      generatorId:
        "contracts-writer",
      targetRoot: ".",
      source: {
        moduleType: "test",
        sourceId: "contracts-other",
        sourceVersion: "1.0",
      },
      files: [
        makeFile(
          "other.js",
          "other\n"
        ),
      ],
    });

  const mismatch =
    writeGenerationPlan({
      generationPlan:
        mismatchPlan,
      writePreflightReport:
        preflight,
    });

  expect(
    mismatch.status ===
      "failed" &&
    mismatch.errors.some(
      (error) =>
        error.code ===
          "plan_preflight_mismatch"
    ),
    "Identity mismatch guard failed."
  );

  const blockedPlan =
    buildGenerationPlan({
      planId: "blocked",
      generatorId:
        "contracts-writer",
      targetRoot: ".",
      source: {
        moduleType: "test",
        sourceId: "blocked",
        sourceVersion: "1.0",
      },
      files: [
        makeFile(
          "blocked.js",
          "new\n"
        ),
      ],
    });

  fs.writeFileSync(
    path.join(root, "blocked.js"),
    "existing\n"
  );

  const blockedPreflight =
    buildGenerationWritePreflight({
      plan:
        blockedPlan,
      rootDirectory:
        root,
    });

  const blocked =
    writeGenerationPlan({
      generationPlan:
        blockedPlan,
      writePreflightReport:
        blockedPreflight,
    });

  expect(
    blocked.status ===
      "failed" &&
    blocked.errors.some(
      (error) =>
        error.code ===
          "preflight_not_ready"
    ),
    "Blocked preflight guard failed."
  );

  console.log(
    JSON.stringify(
      {
        test:
          "Generation Plan Writer Contracts and Guards",
        status:
          failures.length === 0
            ? "PASS"
            : "FAIL",
        readyStatus:
          completed.status,
        mismatchStatus:
          mismatch.status,
        blockedStatus:
          blocked.status,
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
  "Generation Plan Writer Contracts and Guards Test: PASS"
);
