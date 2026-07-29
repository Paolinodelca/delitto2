const fs = require("fs");
const path = require("path");

const {
  buildExecutionThroughOthersMeasurementSpec,
} = require("../tools/imago-builder/fixtures/executionThroughOthers.measurement.spec");

const {
  buildMeasurementModulePlan,
} = require("../tools/imago-builder/plugins/measurement-module/buildMeasurementModulePlan");

const {
  buildMeasurementTemplateContext,
} = require("../tools/imago-builder/plugins/measurement-module/buildMeasurementTemplateContext");

const failures = [];

function expect(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function hasError(plan, fragment) {
  return (
    Array.isArray(plan.errors) &&
    plan.errors.some(
      (error) =>
        error.includes(fragment)
    )
  );
}

/* Scenario A — valid configuration_required spec */
const validSpec =
  buildExecutionThroughOthersMeasurementSpec();

const validSpecBefore =
  JSON.stringify(validSpec);

const validPlan =
  buildMeasurementModulePlan({
    spec: validSpec,
    targetRoot:
      "tmp/non-written-foundation",
  });

expect(
  validSpec.specStatus ===
    "configuration_required",
  "A: fixture status"
);

expect(
  validSpec.semanticCompletion.readyForGeneration ===
    true,
  "A: readyForGeneration"
);

expect(
  validPlan.planStatus ===
    "ready",
  "A: plan ready after atomic rendering"
);

expect(
  validPlan.files.length === 12,
  "A: complete public files"
);

expect(
  validPlan.planId ===
    "measurement_module_execution_through_others_v1",
  "A: deterministic planId"
);

expect(
  validPlan.generatorId ===
    "measurement_module_scaffold_v1",
  "A: generatorId"
);

expect(
  validPlan.metadata.contextStatus ===
    "ready",
  "A: context status"
);


/* Scenario B — invalid spec */
const invalidSpec = {
  ...validSpec,
  factors: validSpec.factors.map(
    (factor, index) => ({
      ...factor,
      weight:
        index === 0
          ? 0.9
          : factor.weight,
    })
  ),
};

const invalidPlan =
  buildMeasurementModulePlan({
    spec: invalidSpec,
  });

expect(
  invalidPlan.planStatus ===
    "invalid",
  "B: invalid status"
);

expect(
  invalidPlan.files.length === 0,
  "B: empty files"
);

expect(
  invalidPlan.errors.length > 0,
  "B: validation errors copied"
);

expect(
  invalidPlan.metadata.contextStatus ===
    null,
  "B: context not built"
);

/* Scenario C — draft spec */
const draftSpec = {
  ...validSpec,
  specStatus: "draft",
};

const draftPlan =
  buildMeasurementModulePlan({
    spec: draftSpec,
  });

expect(
  draftPlan.planStatus ===
    "invalid",
  "C: invalid status"
);

expect(
  draftPlan.files.length === 0,
  "C: empty files"
);

expect(
  hasError(
    draftPlan,
    "not ready for scaffold generation"
  ),
  "C: explicit draft error"
);

/* Scenario D — context builder remains valid */
const context =
  buildMeasurementTemplateContext({
    spec: validSpec,
  });

expect(
  context.contextStatus ===
    "ready",
  "D: context ready"
);

expect(
  context.measureId ===
    validSpec.measureId,
  "D: context measureId"
);

/* Scenario E — immutability */
expect(
  JSON.stringify(validSpec) ===
    validSpecBefore,
  "E: spec mutated"
);

/* Scenario F — no filesystem */
const targetPath = path.resolve(
  "tmp/non-written-foundation"
);

expect(
  fs.existsSync(targetPath) ===
    false,
  "F: targetRoot must not be created"
);

/* Scenario G — atomically empty plan on orchestration stop */
expect(
  validPlan.summary.totalFiles ===
    12,
  "G: totalFiles must be twelve"
);

expect(
  validPlan.summary.sourceFiles ===
    6 &&
    validPlan.summary.testFiles ===
      2 &&
    validPlan.summary.healthFiles ===
      2 &&
    validPlan.summary.regressionFiles ===
      1 &&
    validPlan.summary.manifestFiles ===
      1 &&
    validPlan.summary.otherFiles ===
      0,
  "G: complete summary"
);

console.log(
  JSON.stringify(
    {
      test:
        "Measurement Module Plan Orchestrator Foundation",
      status:
        failures.length === 0
          ? "PASS"
          : "FAIL",
      validPlan: {
        planId: validPlan.planId,
        planStatus:
          validPlan.planStatus,
        generatorId:
          validPlan.generatorId,
        contextStatus:
          validPlan.metadata.contextStatus,
        totalFiles:
          validPlan.summary.totalFiles,
        errors:
          validPlan.errors,
      },
    },
    null,
    2
  )
);

if (failures.length > 0) {
  console.error(
    "Measurement Module Plan Orchestrator Foundation Test: FAIL"
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
  "Measurement Module Plan Orchestrator Foundation Test: PASS"
);
