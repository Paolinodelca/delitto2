const {
  buildPlantManagerLeadershipScenarioComparison,
} = require("../src/core/capability/examples/buildPlantManagerLeadershipScenarioComparison");

const {
  validateCapabilityContribution,
} = require("../src/core/capability/validateCapabilityContribution");

const {
  validateCapabilityContributionMatch,
} = require("../src/core/capability/validateCapabilityContributionMatch");

const {
  validateCapabilityAggregationContext,
} = require("../src/core/capability/validateCapabilityAggregationContext");

const {
  validateCapabilityResult,
} = require("../src/core/capability/validateCapabilityResult");

const {
  buildCapabilityContributionMatch,
} = require("../src/core/capability/buildCapabilityContributionMatch");

const {
  buildCapabilityAggregationContext,
} = require("../src/core/capability/buildCapabilityAggregationContext");

const {
  buildCapabilityResult,
} = require("../src/core/capability/buildCapabilityResult");

const failures = [];

function expect(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function approximatelyEqual(
  first,
  second,
  tolerance = 0.0001
) {
  return (
    typeof first === "number" &&
    typeof second === "number" &&
    Number.isFinite(first) &&
    Number.isFinite(second) &&
    Math.abs(first - second) <= tolerance
  );
}

function sanitizeCreatedAt(value) {
  if (Array.isArray(value)) {
    return value.map(
      (item) =>
        sanitizeCreatedAt(item)
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

function hasObservation(
  comparison,
  expected
) {
  return comparison.observations.includes(
    expected
  );
}

function validateScenarioPipeline(
  scenario,
  scenarioName
) {
  const matchValidation =
    validateCapabilityContributionMatch(
      scenario.match
    );

  const aggregationValidation =
    validateCapabilityAggregationContext(
      scenario.aggregationContext
    );

  const resultValidation =
    validateCapabilityResult(
      scenario.result
    );

  expect(
    matchValidation.isValid === true,
    `Scenario J: ${scenarioName} match invalid: ${matchValidation.errors.join(
      "; "
    )}`
  );

  expect(
    aggregationValidation.isValid === true,
    `Scenario J: ${scenarioName} aggregation invalid: ${aggregationValidation.errors.join(
      "; "
    )}`
  );

  expect(
    resultValidation.isValid === true,
    `Scenario J: ${scenarioName} result invalid: ${resultValidation.errors.join(
      "; "
    )}`
  );

  return {
    matchValidation,
    aggregationValidation,
    resultValidation,
  };
}

/*
 * Scenario A — Wrapper
 */
const comparison =
  buildPlantManagerLeadershipScenarioComparison();

expect(
  comparison.comparisonId ===
    "plant_manager_leadership_scenario_comparison_v1",
  "Scenario A: unexpected comparisonId."
);

expect(
  comparison.comparisonStatus ===
    "demonstration",
  "Scenario A: unexpected comparisonStatus."
);

expect(
  comparison.capabilityId ===
    "leadership",
  "Scenario A: capabilityId must be leadership."
);

expect(
  comparison.limitations.length ===
    4,
  "Scenario A: expected exactly four root limitations."
);

/*
 * Scenario B — Stessa definition
 */
const {
  strong,
  emerging,
  weakContradicted,
} = comparison.scenarios;

[
  strong,
  emerging,
  weakContradicted,
].forEach((scenario) => {
  expect(
    scenario.result.capabilityId ===
      comparison.definition.capabilityId,
    `Scenario B: ${scenario.scenarioId} capabilityId mismatch.`
  );
});

expect(
  comparison.definition.metadata
    .projectionId ===
    comparison.projectionId,
  "Scenario B: projectionId mismatch."
);

expect(
  comparison.definition.metadata
    .targetId ===
    comparison.targetId,
  "Scenario B: targetId mismatch."
);

/*
 * Scenario C — Strong
 */
const strongValidation =
  validateCapabilityResult(
    strong.result
  );

expect(
  strongValidation.isValid === true,
  `Scenario C: strong result invalid: ${strongValidation.errors.join(
    "; "
  )}`
);

expect(
  strong.result.resultStatus ===
    "draft",
  "Scenario C: strong resultStatus must be draft."
);

expect(
  strong.result.capabilityBand ===
    "strong",
  "Scenario C: strong capabilityBand must be strong."
);

expect(
  strong.result.coverage.sufficient ===
    true,
  "Scenario C: strong coverage must be sufficient."
);

expect(
  strong.result.strength.net > 0,
  "Scenario C: strong net strength must be positive."
);

/*
 * Scenario D — Emerging
 */
const emergingValidation =
  validateCapabilityResult(
    emerging.result
  );

expect(
  emergingValidation.isValid === true,
  `Scenario D: emerging result invalid: ${emergingValidation.errors.join(
    "; "
  )}`
);

expect(
  emerging.result.strength.net <
    strong.result.strength.net,
  "Scenario D: emerging net must be lower than strong net."
);

expect(
  emerging.match.coverage.total < 1,
  "Scenario D: emerging coverage total must be below 1."
);

expect(
  emerging.result.resultStatus ===
    "partial",
  `Scenario D: emerging resultStatus was ${emerging.result.resultStatus}.`
);

expect(
  emerging.result.capabilityBand !==
    "very_strong",
  "Scenario D: emerging capabilityBand must not be very_strong."
);

expect(
  [
    "weakly_observed",
    "partially_observed",
  ].includes(
    emerging.result
      .manifestationStatus
  ),
  `Scenario D: unexpected emerging manifestationStatus ${emerging.result.manifestationStatus}.`
);

const emergingMatches = [
  ...emerging.match.requiredMatches,
  ...emerging.match.optionalMatches,
];

expect(
  emergingMatches.some(
    (item) =>
      item.status ===
        "partially_satisfied" ||
      item.status ===
        "missing"
  ),
  "Scenario D: emerging scenario must contain partially_satisfied or missing requirements."
);

/*
 * Scenario E — Weak contradicted
 */
const weakValidation =
  validateCapabilityResult(
    weakContradicted.result
  );

expect(
  weakValidation.isValid === true,
  `Scenario E: weak result invalid: ${weakValidation.errors.join(
    "; "
  )}`
);

expect(
  weakContradicted.match.coverage.total ===
    1,
  "Scenario E: weak coverage total must equal 1."
);

expect(
  weakContradicted.result.strength
    .supporting === 0,
  "Scenario E: weak supporting strength must equal 0."
);

expect(
  weakContradicted.result.strength
    .contradicting > 0,
  "Scenario E: weak contradicting strength must be positive."
);

expect(
  weakContradicted.result.strength
    .net === 0,
  "Scenario E: weak net strength must equal 0."
);

expect(
  weakContradicted.result
    .capabilityBand ===
    "not_supported",
  `Scenario E: weak capabilityBand was ${weakContradicted.result.capabilityBand}.`
);

expect(
  weakContradicted.result
    .explainability
    .dominantDirection ===
    "contradicting",
  "Scenario E: weak dominantDirection must be contradicting."
);

expect(
  weakContradicted.result
    .inferenceSupport.value > 0,
  "Scenario E: weak inferenceSupport must be positive."
);

/*
 * Scenario F — Ordinamento
 */
const ordered =
  comparison.comparison
    .orderedByNetStrength;

expect(
  ordered.length === 3,
  "Scenario F: expected exactly three ordered scenarios."
);

expect(
  ordered[0].scenarioId ===
    "plant_manager_leadership_strong",
  "Scenario F: strong must be first."
);

expect(
  ordered[2].scenarioId ===
    "plant_manager_leadership_weak_contradicted",
  "Scenario F: weak contradicted must be last."
);

expect(
  strong.result.strength.net >
    emerging.result.strength.net,
  "Scenario F: strong net must exceed emerging net."
);

expect(
  emerging.result.strength.net >
    weakContradicted.result
      .strength.net,
  "Scenario F: emerging net must exceed weak net."
);

/*
 * Scenario G — Spread
 */
expect(
  comparison.comparison
    .netStrengthSpread > 0,
  "Scenario G: netStrengthSpread must be positive."
);

expect(
  approximatelyEqual(
    comparison.comparison
      .netStrengthSpread,
    strong.result.strength.net -
      weakContradicted.result
        .strength.net
  ),
  "Scenario G: netStrengthSpread mismatch."
);

/*
 * Scenario H — Observations
 */
[
  "The shared Leadership model differentiates the three hypothetical profiles by net strength.",
  "The emerging scenario has lower coverage than the strong scenario.",
  "The weak scenario is limited by contradicting evidence rather than by missing evidence.",
  "All scenarios were evaluated with the same projected CapabilityDefinition.",
].forEach((observation) => {
  expect(
    hasObservation(
      comparison,
      observation
    ),
    `Scenario H: missing observation "${observation}".`
  );
});

/*
 * Scenario I — Contributi validi
 */
[
  ...emerging.contributions,
  ...weakContradicted.contributions,
].forEach((contribution) => {
  const validation =
    validateCapabilityContribution(
      contribution
    );

  expect(
    validation.isValid === true,
    `Scenario I: contribution ${contribution.contributionId} invalid: ${validation.errors.join(
      "; "
    )}`
  );
});

/*
 * Scenario J — Pipeline valida
 */
const pipelineValidations = {
  strong:
    validateScenarioPipeline(
      strong,
      "strong"
    ),

  emerging:
    validateScenarioPipeline(
      emerging,
      "emerging"
    ),

  weakContradicted:
    validateScenarioPipeline(
      weakContradicted,
      "weakContradicted"
    ),
};

/*
 * Scenario K — Nessuna mutazione alla definition
 */
const definitionBefore =
  JSON.stringify(
    comparison.definition
  );

const emergingContributionsBefore =
  JSON.stringify(
    emerging.contributions
  );

const emergingRebuiltMatch =
  buildCapabilityContributionMatch({
    definition:
      comparison.definition,

    contributions:
      emerging.contributions,
  });

const emergingRebuiltAggregation =
  buildCapabilityAggregationContext({
    definition:
      comparison.definition,

    match:
      emergingRebuiltMatch,

    contributions:
      emerging.contributions,
  });

buildCapabilityResult({
  definition:
    comparison.definition,

  match:
    emergingRebuiltMatch,

  aggregationContext:
    emergingRebuiltAggregation,
});

expect(
  JSON.stringify(
    comparison.definition
  ) ===
    definitionBefore,
  "Scenario K: definition was mutated."
);

expect(
  JSON.stringify(
    emerging.contributions
  ) ===
    emergingContributionsBefore,
  "Scenario K: emerging contributions were mutated."
);

/*
 * Scenario L — Determinismo
 */
const firstComparison =
  buildPlantManagerLeadershipScenarioComparison();

const secondComparison =
  buildPlantManagerLeadershipScenarioComparison();

expect(
  JSON.stringify(
    sanitizeCreatedAt(
      firstComparison
    )
  ) ===
    JSON.stringify(
      sanitizeCreatedAt(
        secondComparison
      )
    ),
  "Scenario L: outputs must be functionally identical apart from createdAt."
);

/*
 * Scenario M — Nessun contenuto applicativo
 */
[
  "cv",
  "interview",
  "parser",
  "runtime",
  "fit",
  "report",
  "renderer",
].forEach((forbiddenField) => {
  expect(
    !Object.prototype.hasOwnProperty.call(
      comparison,
      forbiddenField
    ),
    `Scenario M: root must not contain ${forbiddenField}.`
  );
});

console.log(
  JSON.stringify(
    {
      test:
        "Plant Manager Leadership Scenario Comparison v0.1",

      status:
        failures.length === 0
          ? "PASS"
          : "FAIL",

      comparisonId:
        comparison.comparisonId,

      capabilityId:
        comparison.capabilityId,

      targetId:
        comparison.targetId,

      projectionId:
        comparison.projectionId,

      orderedByNetStrength:
        comparison.comparison
          .orderedByNetStrength,

      strongestScenarioId:
        comparison.comparison
          .strongestScenarioId,

      weakestScenarioId:
        comparison.comparison
          .weakestScenarioId,

      netStrengthSpread:
        comparison.comparison
          .netStrengthSpread,

      capabilityBands:
        comparison.comparison
          .capabilityBands,

      manifestationStatuses:
        comparison.comparison
          .manifestationStatuses,

      inferenceSupportBands:
        comparison.comparison
          .inferenceSupportBands,

      coverageSufficiency:
        comparison.comparison
          .coverageSufficiency,

      observations:
        comparison.observations,

      pipelineValidations,
    },
    null,
    2
  )
);

if (failures.length > 0) {
  console.error(
    "Plant Manager Leadership Scenario Comparison Test: FAIL"
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
  "Plant Manager Leadership Scenario Comparison Test: PASS"
);
