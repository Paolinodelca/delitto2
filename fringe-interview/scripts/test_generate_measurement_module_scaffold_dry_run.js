const fs = require("fs");
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

function sanitizeCreatedAt(value) {
  if (Array.isArray(value)) {
    return value.map(
      sanitizeCreatedAt
    );
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    return Object.fromEntries(
      Object.entries(value).map(
        ([key, nestedValue]) => [
          key,
          key === "createdAt"
            ? null
            : sanitizeCreatedAt(
                nestedValue
              ),
        ]
      )
    );
  }

  return value;
}

function buildInvalidSpec() {
  const spec =
    buildExecutionThroughOthersMeasurementSpec();

  return {
    ...spec,

    factors:
      spec.factors.map(
        (factor, index) => ({
          ...factor,

          weight:
            index === 0
              ? 0.9
              : factor.weight,
        })
      ),
  };
}

function buildDraftSpec() {
  const spec =
    buildExecutionThroughOthersMeasurementSpec();

  return {
    ...spec,
    specStatus: "draft",
  };
}

function buildReducedSpec() {
  const spec =
    buildExecutionThroughOthersMeasurementSpec();

  return {
    ...spec,

    generation: {
      ...spec.generation,

      includeHealth:
        false,

      includeHealthTest:
        false,
    },
  };
}

const targetRoot =
  "tmp/non-written-measurement-scaffold";

const absoluteTarget =
  path.resolve(
    process.cwd(),
    targetRoot
  );

if (fs.existsSync(absoluteTarget)) {
  fs.rmSync(
    absoluteTarget,
    {
      recursive: true,
      force: true,
    }
  );
}

const spec =
  buildExecutionThroughOthersMeasurementSpec();

const specBefore =
  JSON.stringify(spec);

const input = {
  spec,
  targetRoot,
};

const inputBefore =
  JSON.stringify(input);

const result =
  generateMeasurementModuleScaffold(
    input
  );

expect(
  result.mode === "dry_run",
  "mode"
);

expect(
  result.generatorId ===
    "measurement_module_scaffold_v1",
  "generatorId"
);

expect(
  result.generated === true,
  "generated"
);

expect(
  result.contextStatus === "ready",
  "contextStatus"
);

expect(
  JSON.stringify(input) ===
    inputBefore,
  "input mutated"
);

expect(
  result.plan.planStatus === "ready",
  "plan ready"
);

expect(
  result.plan.targetRoot ===
    targetRoot,
  "targetRoot"
);

expect(
  result.files.length === 12,
  "files length"
);

expect(
  result.files.length ===
    result.plan.files.length,
  "minimal view length"
);

result.files.forEach(
  (file, index) => {
    const planFile =
      result.plan.files[index];

    expect(
      Object.prototype.hasOwnProperty.call(
        file,
        "content"
      ) === false,
      `file ${index} must not expose content`
    );

    expect(
      JSON.stringify(
        Object.keys(file)
      ) ===
        JSON.stringify([
          "relativePath",
          "contentHash",
          "overwritePolicy",
          "artifactType",
        ]),
      `file ${index} minimal shape`
    );

    expect(
      file.relativePath ===
        planFile.relativePath,
      `file ${index} relativePath`
    );

    expect(
      file.contentHash ===
        planFile.contentHash,
      `file ${index} contentHash`
    );

    expect(
      file.overwritePolicy ===
        "forbid",
      `file ${index} overwritePolicy`
    );

    expect(
      file.artifactType ===
        planFile.metadata.artifactType,
      `file ${index} artifactType`
    );
  }
);

expect(
  result.files[
    result.files.length - 1
  ].artifactType === "manifest",
  "manifest last"
);

expect(
  result.errors.length === 0,
  `errors: ${result.errors.join("; ")}`
);

expect(
  fs.existsSync(absoluteTarget) ===
    false,
  "targetRoot must not be created"
);

expect(
  JSON.stringify(spec) ===
    specBefore,
  "spec mutated"
);

const invalidResult =
  generateMeasurementModuleScaffold({
    spec:
      buildInvalidSpec(),

    targetRoot:
      "tmp/invalid-scaffold",
  });

expect(
  invalidResult.generated ===
    false,
  "invalid generated"
);

expect(
  invalidResult.plan.planStatus ===
    "invalid",
  "invalid plan status"
);

expect(
  invalidResult.files.length ===
    0 &&
    invalidResult.plan.files.length ===
      0,
  "invalid files"
);

expect(
  invalidResult.errors.length > 0,
  "invalid errors"
);

expect(
  invalidResult.errors.length ===
    new Set(
      invalidResult.errors
    ).size,
  "invalid errors deduplicated"
);

const draftResult =
  generateMeasurementModuleScaffold({
    spec:
      buildDraftSpec(),

    targetRoot:
      "tmp/draft-scaffold",
  });

expect(
  draftResult.generated === false,
  "draft generated"
);

expect(
  draftResult.files.length === 0,
  "draft files"
);

expect(
  draftResult.errors.some(
    (error) =>
      error.includes(
        "not ready for scaffold generation"
      )
  ),
  "draft error"
);

const reducedResult =
  generateMeasurementModuleScaffold({
    spec:
      buildReducedSpec(),

    targetRoot:
      "tmp/reduced-scaffold",
  });

expect(
  reducedResult.generated === true,
  "reduced generated"
);

expect(
  reducedResult.files.length === 10,
  "reduced file count"
);

expect(
  reducedResult.files.every(
    (file) =>
      file.artifactType !==
        "health" &&
      file.artifactType !==
        "health_test"
  ),
  "reduced excludes health"
);

const defaultRootResult =
  generateMeasurementModuleScaffold({
    spec:
      buildExecutionThroughOthersMeasurementSpec(),
  });

expect(
  defaultRootResult.plan.targetRoot === ".",
  "default targetRoot"
);

const first =
  generateMeasurementModuleScaffold({
    spec:
      buildExecutionThroughOthersMeasurementSpec(),

    targetRoot:
      "tmp/deterministic-scaffold",
  });

const second =
  generateMeasurementModuleScaffold({
    spec:
      buildExecutionThroughOthersMeasurementSpec(),

    targetRoot:
      "tmp/deterministic-scaffold",
  });

expect(
  JSON.stringify(
    sanitizeCreatedAt(first)
  ) ===
    JSON.stringify(
      sanitizeCreatedAt(second)
    ),
  "determinism"
);

console.log(
  JSON.stringify(
    {
      test:
        "Measurement Module Scaffold Dry Run",

      status:
        failures.length === 0
          ? "PASS"
          : "FAIL",

      mode:
        result.mode,

      generated:
        result.generated,

      fileCount:
        result.files.length,

      targetRoot:
        result.plan.targetRoot,

      lastArtifact:
        result.files[
          result.files.length - 1
        ].artifactType,

      reducedFileCount:
        reducedResult.files.length,

      invalidErrorCount:
        invalidResult.errors.length,
    },
    null,
    2
  )
);

if (failures.length > 0) {
  console.error(
    "Measurement Module Scaffold Dry Run Test: FAIL"
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
  "Measurement Module Scaffold Dry Run Test: PASS"
);
