const fs = require("fs");
const path = require("path");

const {
  buildGenerationPlan,
  buildGenerationWritePreflight,
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
    "tmp/test-generation-plan-writer-regression"
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
      planId: "regression",
      generatorId:
        "writer-regression",
      targetRoot: ".",
      source: {
        moduleType: "test",
        sourceId: "regression",
        sourceVersion: "1.0",
      },
      files: [
        makeFile("one.js", "one\n"),
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
    "Ready regression must complete."
  );

  const mismatchPlan =
    buildGenerationPlan({
      planId: "other",
      generatorId:
        "writer-regression",
      targetRoot: ".",
      source: {
        moduleType: "test",
        sourceId: "other",
        sourceVersion: "1.0",
      },
      files: [
        makeFile("other.js", "other\n"),
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
    mismatch.errors[0].code ===
      "plan_preflight_mismatch",
    "Mismatch regression failed."
  );

  console.log(
    JSON.stringify(
      {
        test:
          "Generation Plan Writer Regression",
        status:
          failures.length === 0
            ? "PASS"
            : "FAIL",
        completed:
          sanitize(completed),
        mismatch:
          sanitize(mismatch),
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
  "Generation Plan Writer Regression Test: PASS"
);
