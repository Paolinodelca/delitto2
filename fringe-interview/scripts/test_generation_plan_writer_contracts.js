const fs = require("fs");
const path = require("path");

const {
  buildGenerationPlan,
  validateGenerationPlan,
  buildGenerationWritePreflight,
  validateGenerationWritePreflight,
  buildGenerationFileWriteResult,
  validateGenerationFileWriteResult,
  buildGenerationWriteReport,
  validateGenerationWriteReport,
  writeGenerationPlan,
} = require("../tools/imago-builder");

const failures = [];

function expect(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function deepClone(value) {
  return JSON.parse(
    JSON.stringify(value)
  );
}

function hash(character) {
  return character.repeat(64);
}

function validFileResult(overrides = {}) {
  return buildGenerationFileWriteResult({
    relativePath: "src/example.js",
    action: "create",
    status: "success",
    expectedContentHash: hash("a"),
    writtenContentHash: hash("a"),
    errorCode: null,
    message: null,
    metadata: {
      verified: true,
    },
    ...overrides,
  });
}

function validateFileFixture(
  fixture,
  expected,
  label
) {
  const before = deepClone(fixture);
  const validation =
    validateGenerationFileWriteResult(
      fixture
    );

  expect(
    validation.isValid === expected,
    `${label}: expected ${expected}, received ${validation.isValid}.`
  );

  expect(
    JSON.stringify(fixture) ===
      JSON.stringify(before),
    `${label}: validator mutated input.`
  );
}

const validFile =
  validFileResult();

validateFileFixture(
  validFile,
  true,
  "valid file result"
);

validateFileFixture(
  {
    ...validFile,
    action: "delete",
  },
  false,
  "invalid action"
);

validateFileFixture(
  {
    ...validFile,
    status: "pending",
  },
  false,
  "invalid status"
);

validateFileFixture(
  {
    ...validFile,
    expectedContentHash: "bad",
  },
  false,
  "invalid hash"
);

validateFileFixture(
  {
    ...validFile,
    relativePath: "../escape.js",
  },
  false,
  "invalid path"
);

validateFileFixture(
  {
    ...validFile,
    metadata: [],
  },
  false,
  "invalid metadata"
);

const completedFixture =
  buildGenerationWriteReport({
    status: "completed",
    planIdentity: hash("1"),
    preflightIdentity: hash("1"),
    fileResults: [
      validFileResult(),
    ],
    errors: [],
    warnings: [],
    metadata: {
      writerId: "test-writer",
      mode: "fixture",
      createdAt:
        "2026-07-20T00:00:00.000Z",
    },
  });

const partialFixture =
  buildGenerationWriteReport({
    status: "partial",
    planIdentity: hash("2"),
    preflightIdentity: hash("2"),
    fileResults: [
      validFileResult(),
      validFileResult({
        relativePath:
          "src/failed.js",
        status: "failed",
        writtenContentHash: null,
        errorCode:
          "write_failed",
        message:
          "Write failed.",
      }),
    ],
    errors: [
      {
        code:
          "partial_write",
        message:
          "One file failed.",
      },
    ],
    warnings: [],
    metadata: {
      writerId: "test-writer",
      mode: "fixture",
      createdAt:
        "2026-07-20T00:00:00.000Z",
    },
  });

const failedFixture =
  buildGenerationWriteReport({
    status: "failed",
    planIdentity: hash("3"),
    preflightIdentity: hash("3"),
    fileResults: [],
    errors: [
      {
        code:
          "guard_failed",
        message:
          "Writer did not start.",
      },
    ],
    warnings: [],
    metadata: {
      writerId: "test-writer",
      mode: "fixture",
      createdAt:
        "2026-07-20T00:00:00.000Z",
    },
  });

[
  ["completed fixture", completedFixture],
  ["partial fixture", partialFixture],
  ["failed fixture", failedFixture],
].forEach(([label, fixture]) => {
  const before = deepClone(fixture);
  const validation =
    validateGenerationWriteReport(
      fixture
    );

  expect(
    validation.isValid === true,
    `${label}: ${validation.errors.join("; ")}`
  );

  expect(
    JSON.stringify(fixture) ===
      JSON.stringify(before),
    `${label}: validator mutated input.`
  );
});

const invalidReports = [
  [
    "summary incoherent",
    {
      ...completedFixture,
      summary: {
        ...completedFixture.summary,
        successfulFiles: 0,
      },
    },
  ],
  [
    "completed with failed file",
    {
      ...partialFixture,
      status: "completed",
    },
  ],
  [
    "partial without success",
    buildGenerationWriteReport({
      status: "partial",
      planIdentity: hash("4"),
      preflightIdentity: hash("4"),
      fileResults: [
        validFileResult({
          status: "failed",
          writtenContentHash: null,
          errorCode: "failed",
          message: "Failed.",
        }),
      ],
      errors: [
        {
          code: "partial",
          message: "Invalid partial.",
        },
      ],
    }),
  ],
  [
    "failed with all success",
    {
      ...completedFixture,
      status: "failed",
      errors: [
        {
          code: "false_failure",
          message: "Invalid failure.",
        },
      ],
    },
  ],
  [
    "invalid status enum",
    {
      ...failedFixture,
      status: "pending",
    },
  ],
  [
    "missing identity",
    {
      ...failedFixture,
      planIdentity: "",
    },
  ],
];

invalidReports.forEach(
  ([label, fixture]) => {
    const validation =
      validateGenerationWriteReport(
        fixture
      );

    expect(
      validation.isValid === false,
      `${label}: expected invalid.`
    );
  }
);

const fixtureRoot =
  path.resolve(
    process.cwd(),
    "tmp/test-generation-plan-writer-contracts"
  );

fs.rmSync(fixtureRoot, {
  recursive: true,
  force: true,
});

fs.mkdirSync(fixtureRoot, {
  recursive: true,
});

try {
  const plan =
    buildGenerationPlan({
      planId:
        "writer_contract_plan_v1",
      generatorId:
        "writer_contract_generator",
      targetRoot: ".",
      source: {
        moduleType: "test",
        sourceId: "writer-contracts",
        sourceVersion: "1.0",
      },
      files: [
        {
          relativePath:
            "generated/file.js",
          content:
            "module.exports = {};\n",
          overwritePolicy:
            "forbid",
        },
      ],
    });

  expect(
    validateGenerationPlan(plan)
      .isValid === true,
    "GenerationPlan with identity must validate."
  );

  const readyPreflight =
    buildGenerationWritePreflight({
      plan,
      rootDirectory:
        fixtureRoot,
    });

  expect(
    readyPreflight.preflightStatus ===
      "ready",
    "Ready preflight fixture must be ready."
  );

  expect(
    readyPreflight.planIdentity ===
      plan.planIdentity,
    "Preflight must propagate planIdentity."
  );

  expect(
    validateGenerationWritePreflight(
      readyPreflight
    ).isValid === true,
    "Ready preflight with identity must validate."
  );

  const planBefore =
    deepClone(plan);

  const preflightBefore =
    deepClone(readyPreflight);

  const filesystemBefore =
    fs.readdirSync(
      fixtureRoot
    );

  const readyResult =
    writeGenerationPlan({
      generationPlan: plan,
      writePreflightReport:
        readyPreflight,
    });

  expect(
    readyResult.status ===
      "failed",
    "Ready guard must not simulate completed."
  );

  expect(
    readyResult.errors.some(
      (error) =>
        error.code ===
        "writer_not_implemented"
    ),
    "Ready guard must return writer_not_implemented."
  );

  expect(
    readyResult.summary.successfulFiles ===
      0,
    "Ready guard must report zero successful files."
  );

  expect(
    validateGenerationWriteReport(
      readyResult
    ).isValid === true,
    "Ready guard output must validate."
  );

  expect(
    JSON.stringify(plan) ===
      JSON.stringify(planBefore),
    "writeGenerationPlan mutated GenerationPlan."
  );

  expect(
    JSON.stringify(
      readyPreflight
    ) ===
      JSON.stringify(
        preflightBefore
      ),
    "writeGenerationPlan mutated WritePreflightReport."
  );

  expect(
    JSON.stringify(
      fs.readdirSync(
        fixtureRoot
      )
    ) ===
      JSON.stringify(
        filesystemBefore
      ),
    "writeGenerationPlan changed filesystem."
  );

  const secondPlan =
    buildGenerationPlan({
      planId:
        "writer_contract_plan_v2",
      generatorId:
        "writer_contract_generator",
      targetRoot: ".",
      source: {
        moduleType: "test",
        sourceId:
          "writer-contracts-other",
        sourceVersion: "1.0",
      },
      files: [
        {
          relativePath:
            "generated/file.js",
          content:
            "module.exports = { other: true };\n",
          overwritePolicy:
            "forbid",
        },
      ],
    });

  const mismatch =
    writeGenerationPlan({
      generationPlan:
        secondPlan,
      writePreflightReport:
        readyPreflight,
    });

  expect(
    mismatch.errors.some(
      (error) =>
        error.code ===
        "plan_preflight_mismatch"
    ),
    "Mismatch must be detected."
  );

  const blockedRoot =
    path.join(
      fixtureRoot,
      "blocked"
    );

  fs.mkdirSync(blockedRoot);

  fs.writeFileSync(
    path.join(
      blockedRoot,
      "existing.js"
    ),
    "existing\n"
  );

  const blockedPlan =
    buildGenerationPlan({
      planId:
        "writer_blocked_plan_v1",
      generatorId:
        "writer_contract_generator",
      targetRoot: ".",
      source: {
        moduleType: "test",
        sourceId: "blocked",
        sourceVersion: "1.0",
      },
      files: [
        {
          relativePath:
            "existing.js",
          content: "new\n",
          overwritePolicy:
            "forbid",
        },
      ],
    });

  const blockedPreflight =
    buildGenerationWritePreflight({
      plan:
        blockedPlan,
      rootDirectory:
        blockedRoot,
    });

  const blockedResult =
    writeGenerationPlan({
      generationPlan:
        blockedPlan,
      writePreflightReport:
        blockedPreflight,
    });

  expect(
    blockedResult.errors.some(
      (error) =>
        error.code ===
        "preflight_not_ready"
    ),
    "Blocked preflight must be rejected."
  );

  const invalidPreflight = {
    ...readyPreflight,
    planIdentity: "invalid",
  };

  const invalidPreflightResult =
    writeGenerationPlan({
      generationPlan: plan,
      writePreflightReport:
        invalidPreflight,
    });

  expect(
    invalidPreflightResult.errors.some(
      (error) =>
        error.code ===
        "write_preflight_invalid"
    ),
    "Invalid preflight must be rejected."
  );

  const invalidPlan = {
    ...plan,
    planIdentity: "invalid",
  };

  const invalidPlanResult =
    writeGenerationPlan({
      generationPlan:
        invalidPlan,
      writePreflightReport:
        readyPreflight,
    });

  expect(
    invalidPlanResult.errors.some(
      (error) =>
        error.code ===
        "generation_plan_invalid"
    ),
    "Invalid plan must be rejected."
  );

  [
    readyResult,
    mismatch,
    blockedResult,
    invalidPreflightResult,
    invalidPlanResult,
  ].forEach((report, index) => {
    const validation =
      validateGenerationWriteReport(
        report
      );

    expect(
      validation.isValid === true,
      `Guard report ${index} must validate: ${validation.errors.join("; ")}`
    );
  });
} finally {
  fs.rmSync(fixtureRoot, {
    recursive: true,
    force: true,
  });
}

console.log(
  JSON.stringify(
    {
      test:
        "Generation Plan Writer Contracts and Ready Guard",
      status:
        failures.length === 0
          ? "PASS"
          : "FAIL",
      contractStatuses: [
        "completed",
        "partial",
        "failed",
      ],
      fileActions: [
        "create",
        "overwrite",
      ],
      fileStatuses: [
        "success",
        "failed",
        "skipped",
      ],
    },
    null,
    2
  )
);

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
  "Generation Plan Writer Contracts and Ready Guard Test: PASS"
);
