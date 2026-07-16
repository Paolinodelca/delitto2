const {
  buildExecutionThroughOthersMeasurementSpec,
} = require("../tools/imago-builder/fixtures/executionThroughOthers.measurement.spec");

const failures = [];

function expect(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function withoutCreatedAt(spec) {
  return {
    ...spec,
    metadata: {
      ...spec.metadata,
      createdAt: null,
    },
  };
}

function snapshot(spec) {
  return {
    specId: spec.specId,
    specVersion: spec.specVersion,
    specStatus: spec.specStatus,
    measureId: spec.measureId,
    naming: spec.naming,
    factorIds: spec.factors.map((factor) => factor.factorId),
    factorWeights: Object.fromEntries(
      spec.factors.map((factor) => [factor.factorId, factor.weight])
    ),
    thresholds: spec.thresholds,
    inferenceSupport: spec.inferenceSupport,
    generation: spec.generation,
    semanticCompletion: spec.semanticCompletion,
    provenanceStatus: spec.provenance.status,
  };
}

const first = buildExecutionThroughOthersMeasurementSpec();
const second = buildExecutionThroughOthersMeasurementSpec();

expect(
  JSON.stringify(withoutCreatedAt(first)) === JSON.stringify(withoutCreatedAt(second)),
  "Full specs must be identical apart from metadata.createdAt."
);

const firstSnapshot = snapshot(first);
const secondSnapshot = snapshot(second);

expect(
  JSON.stringify(firstSnapshot) === JSON.stringify(secondSnapshot),
  "Regression snapshots must be identical."
);

console.log(JSON.stringify({
  test: "Measurement Module Spec Regression",
  status: failures.length === 0 ? "PASS" : "FAIL",
  snapshot: firstSnapshot,
}, null, 2));

if (failures.length > 0) {
  console.error("Measurement Module Spec Regression Test: FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log("Measurement Module Spec Regression Test: PASS");
