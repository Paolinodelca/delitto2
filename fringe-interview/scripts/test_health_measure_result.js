const {
  healthBuildMeasureResult,
} = require("../src/core/measurement/healthBuildMeasureResult");

const result =
  healthBuildMeasureResult();

console.log(
  JSON.stringify(result, null, 2)
);

if (result.status !== "PASS") {
  console.error(
    'Expected status === "PASS".'
  );
  process.exit(1);
}

if (
  result.dimensionId !==
  "management_scope"
) {
  console.error(
    'Expected dimensionId === "management_scope".'
  );
  process.exit(1);
}

if (
  !result.contextRelevanceProfile
) {
  console.error(
    "Expected contextRelevanceProfile."
  );
  process.exit(1);
}

if (
  result.contextRelevanceProfile
    .profileId !==
  "management_context_health"
) {
  console.error(
    "Expected context relevance health profileId."
  );
  process.exit(1);
}

if (
  !result.contextRelevanceProfile
    .activeFactors.includes(
      "contextRelevance"
    )
) {
  console.error(
    "Expected contextRelevance active."
  );
  process.exit(1);
}

if (
  !result.contextRelevanceProfile
    .contextRelevanceComponent
) {
  console.error(
    "Expected contextRelevance component."
  );
  process.exit(1);
}

if (
  result.contextRelevanceProfile
    .contextRelevanceComponent
    .normalizedValue !== 0.8
) {
  console.error(
    "Expected normalized context relevance === 0.8."
  );
  process.exit(1);
}

if (
  result.baseDefinitionUnchanged !== true
) {
  console.error(
    "Expected definition unchanged."
  );
  process.exit(1);
}

if (
  !result.validation ||
  !result.validation
    .contextRelevanceResult ||
  result.validation
    .contextRelevanceResult
    .isValid !== true
) {
  console.error(
    "Expected context relevance validation to pass."
  );
  process.exit(1);
}

console.log(
  "test_health_measure_result PASS"
);