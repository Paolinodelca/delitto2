const {
  healthMeasurementCapabilityBridge,
} = require("../src/core/capability/adapters/healthMeasurementCapabilityBridge");

const failures = [];

function expect(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function approximatelyEqual(first, second, tolerance = 0.000001) {
  return (
    typeof first === "number" &&
    typeof second === "number" &&
    Math.abs(first - second) <= tolerance
  );
}

const health =
  healthMeasurementCapabilityBridge();

expect(
  health.healthy === true,
  "health.healthy must be true."
);

expect(
  health.errors.length === 0,
  `health.errors: ${health.errors.join("; ")}`
);

Object.entries(
  health.checks
).forEach(([checkName, value]) => {
  expect(
    value === true,
    `check ${checkName} must be true.`
  );
});

expect(
  health.snapshot.measureId ===
    "decision_accountability",
  "snapshot.measureId"
);

expect(
  approximatelyEqual(
    health.snapshot.measureScore,
    0.9625
  ),
  `snapshot.measureScore was ${health.snapshot.measureScore}.`
);

expect(
  health.snapshot.adapterRelevance === 1,
  "snapshot.adapterRelevance"
);

expect(
  approximatelyEqual(
    health.snapshot.requirementWeight,
    0.2
  ),
  `snapshot.requirementWeight was ${health.snapshot.requirementWeight}.`
);

expect(
  approximatelyEqual(
    health.snapshot.weightedContributionValue,
    0.1925
  ),
  `snapshot.weightedContributionValue was ${health.snapshot.weightedContributionValue}.`
);

expect(
  health.snapshot.capabilityId ===
    "leadership",
  "snapshot.capabilityId"
);

expect(
  typeof health.snapshot.capabilityBand ===
    "string" &&
    health.snapshot.capabilityBand.length > 0,
  "snapshot.capabilityBand must be present."
);

expect(
  typeof health.snapshot.manifestationStatus ===
    "string" &&
    health.snapshot.manifestationStatus.length > 0,
  "snapshot.manifestationStatus must be present."
);

console.log(
  JSON.stringify(
    {
      test:
        "Measurement to Capability Bridge Health",

      status:
        failures.length === 0
          ? "PASS"
          : "FAIL",

      health,
    },
    null,
    2
  )
);

if (failures.length > 0) {
  console.error(
    "Measurement to Capability Bridge Health Test: FAIL"
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
  "Measurement to Capability Bridge Health Test: PASS"
);
