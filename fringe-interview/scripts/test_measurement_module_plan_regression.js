const {
  buildMeasurementModulePlan,
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

function sanitizePlan(plan) {
  return {
    ...plan,

    metadata: {
      ...plan.metadata,
      createdAt: null,
    },
  };
}

function sanitizeWrapper(wrapper) {
  return {
    ...wrapper,

    metadata: {
      ...wrapper.metadata,
      createdAt: null,
    },

    plan:
      sanitizePlan(
        wrapper.plan
      ),
  };
}

function buildPlanSnapshot(plan) {
  return {
    planId:
      plan.planId,

    planStatus:
      plan.planStatus,

    generatorId:
      plan.generatorId,

    source:
      plan.source,

    targetRoot:
      plan.targetRoot,

    files:
      plan.files.map(
        (file) => ({
          relativePath:
            file.relativePath,

          content:
            file.content,

          contentHash:
            file.contentHash,

          overwritePolicy:
            file.overwritePolicy,

          metadata:
            file.metadata,
        })
      ),

    summary:
      plan.summary,

    warnings:
      plan.warnings,

    errors:
      plan.errors,
  };
}

function buildWrapperSnapshot(wrapper) {
  return {
    mode:
      wrapper.mode,

    generatorId:
      wrapper.generatorId,

    specValidation:
      wrapper.specValidation,

    contextStatus:
      wrapper.contextStatus,

    generated:
      wrapper.generated,

    files:
      wrapper.files,

    errors:
      wrapper.errors,

    warnings:
      wrapper.warnings,

    plan:
      buildPlanSnapshot(
        wrapper.plan
      ),
  };
}

const targetRoot =
  "tmp/execution-through-others-regression";

const firstPlan =
  buildMeasurementModulePlan({
    spec:
      buildExecutionThroughOthersMeasurementSpec(),

    targetRoot,
  });

const secondPlan =
  buildMeasurementModulePlan({
    spec:
      buildExecutionThroughOthersMeasurementSpec(),

    targetRoot,
  });

expect(
  JSON.stringify(
    sanitizePlan(firstPlan)
  ) ===
    JSON.stringify(
      sanitizePlan(secondPlan)
    ),
  "plans differ apart from metadata.createdAt"
);

const firstPlanSnapshot =
  buildPlanSnapshot(firstPlan);

const secondPlanSnapshot =
  buildPlanSnapshot(secondPlan);

expect(
  JSON.stringify(
    firstPlanSnapshot
  ) ===
    JSON.stringify(
      secondPlanSnapshot
    ),
  "plan snapshots differ"
);

const firstWrapper =
  generateMeasurementModuleScaffold({
    spec:
      buildExecutionThroughOthersMeasurementSpec(),

    targetRoot,
  });

const secondWrapper =
  generateMeasurementModuleScaffold({
    spec:
      buildExecutionThroughOthersMeasurementSpec(),

    targetRoot,
  });

expect(
  JSON.stringify(
    sanitizeWrapper(firstWrapper)
  ) ===
    JSON.stringify(
      sanitizeWrapper(secondWrapper)
    ),
  "wrappers differ apart from allowed timestamps"
);

const firstWrapperSnapshot =
  buildWrapperSnapshot(
    firstWrapper
  );

const secondWrapperSnapshot =
  buildWrapperSnapshot(
    secondWrapper
  );

expect(
  JSON.stringify(
    firstWrapperSnapshot
  ) ===
    JSON.stringify(
      secondWrapperSnapshot
    ),
  "wrapper snapshots differ"
);

const manifest =
  JSON.parse(
    firstPlan.files[
      firstPlan.files.length - 1
    ].content
  );

expect(
  manifest.generatedAt === null,
  "manifest generatedAt"
);

expect(
  manifest.generatedFiles.length ===
    11,
  "manifest file count"
);

console.log(
  JSON.stringify(
    {
      test:
        "Measurement Module Plan Regression",

      status:
        failures.length === 0
          ? "PASS"
          : "FAIL",

      planId:
        firstPlan.planId,

      planStatus:
        firstPlan.planStatus,

      fileCount:
        firstPlan.files.length,

      summary:
        firstPlan.summary,

      wrapperFileCount:
        firstWrapper.files.length,

      manifestGeneratedFiles:
        manifest.generatedFiles.length,
    },
    null,
    2
  )
);

if (failures.length > 0) {
  console.error(
    "Measurement Module Plan Regression Test: FAIL"
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
  "Measurement Module Plan Regression Test: PASS"
);
