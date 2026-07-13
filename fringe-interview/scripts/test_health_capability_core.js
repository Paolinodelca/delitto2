const {
  healthBuildCapabilityCore,
} = require("../src/core/capability/healthBuildCapabilityCore");

const health =
  healthBuildCapabilityCore();

console.log(
  JSON.stringify(health, null, 2)
);

const failures = [];

if (health.status !== "PASS") {
  failures.push(
    'Expected health.status === "PASS".'
  );
}

if (
  health.capabilityId !==
  "leadership_demo"
) {
  failures.push(
    'Expected capabilityId === "leadership_demo".'
  );
}

if (
  !health.match ||
  health.match.requiredCoverage !== 1
) {
  failures.push(
    "Expected match.requiredCoverage === 1."
  );
}

if (
  !health.match ||
  health.match.totalCoverage !== 1
) {
  failures.push(
    "Expected match.totalCoverage === 1."
  );
}

if (
  !health.aggregation ||
  health.aggregation.entryCount !== 3
) {
  failures.push(
    "Expected aggregation.entryCount === 3."
  );
}

if (
  !health.aggregation ||
  health.aggregation
    .supportingEntryCount !== 3
) {
  failures.push(
    "Expected aggregation.supportingEntryCount === 3."
  );
}

if (
  !health.aggregation ||
  health.aggregation
    .contradictingEntryCount !== 0
) {
  failures.push(
    "Expected aggregation.contradictingEntryCount === 0."
  );
}

if (
  !health.result ||
  health.result.resultStatus !== "draft"
) {
  failures.push(
    'Expected result.resultStatus === "draft".'
  );
}

if (
  !health.result ||
  typeof health.result.netStrength !==
    "number" ||
  health.result.netStrength <= 0
) {
  failures.push(
    "Expected result.netStrength > 0."
  );
}

if (
  !health.result ||
  typeof health.result.inferenceSupport !==
    "number" ||
  health.result.inferenceSupport <= 0
) {
  failures.push(
    "Expected result.inferenceSupport > 0."
  );
}

if (
  !health.result ||
  health.result.coverageSufficient !== true
) {
  failures.push(
    "Expected result.coverageSufficient === true."
  );
}

if (failures.length > 0) {
  console.error(
    "Capability Core Health: FAIL"
  );

  console.error(
    JSON.stringify(failures, null, 2)
  );

  process.exit(1);
}

console.log(
  "Capability Core Health: PASS"
);