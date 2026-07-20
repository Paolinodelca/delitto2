const fs = require("fs");
const path = require("path");

const {
  buildGenerationPlan,
  buildGenerationWritePreflight,
  writeGenerationPlan,
  validateGenerationWriteReport,
} = require("../tools/imago-builder");

const failures = [];

function expect(condition, message) {
  if (!condition) {
    failures.push(message);
  }
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

function buildPlan({
  planId,
  sourceId,
  content,
}) {
  return buildGenerationPlan({
    planId,
    generatorId:
      "writer_regression_generator",
    targetRoot: ".",
    source: {
      moduleType: "test",
      sourceId,
      sourceVersion: "1.0",
    },
    files: [
      {
        relativePath:
          "generated/file.js",
        content,
        overwritePolicy:
          "forbid",
      },
    ],
  });
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
  const planA =
    buildPlan({
      planId:
        "writer_regression_a",
      sourceId:
        "source-a",
      content:
        "module.exports = 'a';\n",
    });

  const planB =
    buildPlan({
      planId:
        "writer_regression_b",
      sourceId:
        "source-b",
      content:
        "module.exports = 'b';\n",
    });

  const preflightA =
    buildGenerationWritePreflight({
      plan:
        planA,
      rootDirectory:
        root,
    });

  const matching =
    writeGenerationPlan({
      generationPlan:
        planA,
      writePreflightReport:
        preflightA,
    });

  const mismatch =
    writeGenerationPlan({
      generationPlan:
        planB,
      writePreflightReport:
        preflightA,
    });

  expect(
    matching.status === "failed",
    "Matching ready preflight must remain failed in 2A."
  );

  expect(
    matching.errors.length === 1 &&
    matching.errors[0].code ===
      "writer_not_implemented",
    "Matching report must contain writer_not_implemented."
  );

  expect(
    matching.summary.successfulFiles ===
      0,
    "Matching report must contain zero successful files."
  );

  expect(
    mismatch.status === "failed",
    "Mismatch must fail."
  );

  expect(
    mismatch.errors.length === 1 &&
    mismatch.errors[0].code ===
      "plan_preflight_mismatch",
    "Mismatch report must contain plan_preflight_mismatch."
  );

  expect(
    validateGenerationWriteReport(
      matching
    ).isValid === true,
    "Matching report must validate."
  );

  expect(
    validateGenerationWriteReport(
      mismatch
    ).isValid === true,
    "Mismatch report must validate."
  );

  const first =
    JSON.stringify(
      sanitize(matching)
    );

  const second =
    JSON.stringify(
      sanitize(
        writeGenerationPlan({
          generationPlan:
            planA,
          writePreflightReport:
            preflightA,
        })
      )
    );

  expect(
    first === second,
    "Matching regression output must be deterministic after timestamp sanitization."
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
        matching:
          sanitize(matching),
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
