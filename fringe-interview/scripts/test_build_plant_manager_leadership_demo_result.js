const {
  buildPlantManagerLeadershipDemoResult,
} = require("../src/core/capability/examples/buildPlantManagerLeadershipDemoResult");

const {
  validateCapabilityProjection,
} = require("../src/core/capability/validateCapabilityProjection");

const {
  validateCapabilityDefinition,
} = require("../src/core/capability/validateCapabilityDefinition");

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

function expect(
  condition,
  message
) {
  if (!condition) {
    failures.push(message);
  }
}

function approximatelyEqual(
  first,
  second,
  tolerance = 0.0002
) {
  return (
    typeof first === "number" &&
    typeof second === "number" &&
    Number.isFinite(first) &&
    Number.isFinite(second) &&
    Math.abs(first - second) <=
      tolerance
  );
}

function sanitizeCreatedAt(
  value
) {
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

function hasText(
  values,
  expected
) {
  return (
    Array.isArray(values) &&
    values.some(
      (value) =>
        typeof value === "string" &&
        value.includes(expected)
    )
  );
}

function findContribution(
  contributions,
  measureId
) {
  return contributions.find(
    (contribution) =>
      contribution.source &&
      contribution.source.measureId ===
        measureId
  );
}

function findAggregationEntry(
  aggregationContext,
  measureId
) {
  return aggregationContext.entries.find(
    (entry) =>
      entry.sourceMeasureId ===
        measureId ||
      (
        entry.contribution &&
        entry.contribution.source &&
        entry.contribution.source
          .measureId === measureId
      ) ||
      (
        entry.source &&
        entry.source.measureId ===
          measureId
      ) ||
      entry.contributionKey ===
        measureId
  );
}

/*
 * Scenario A — Wrapper
 */
const demo =
  buildPlantManagerLeadershipDemoResult();

expect(
  demo.scenarioId ===
    "plant_manager_leadership_demo_strong_001",
  "Scenario A: unexpected scenarioId."
);

expect(
  demo.scenarioStatus ===
    "demonstration",
  "Scenario A: unexpected scenarioStatus."
);

expect(
  Array.isArray(
    demo.limitations
  ) &&
    demo.limitations.length === 4,
  "Scenario A: expected exactly four limitations."
);

expect(
  demo.scenarioContext
    .candidateType ===
    "hypothetical_professional_profile",
  "Scenario A: unexpected candidateType."
);

expect(
  demo.scenarioContext.targetId ===
    demo.projection.targetId,
  "Scenario A: targetId mismatch."
);

expect(
  demo.scenarioContext
    .capabilityId ===
    "leadership",
  "Scenario A: capabilityId mismatch."
);

/*
 * Scenario B — Projection e definition
 */
const projectionValidation =
  validateCapabilityProjection(
    demo.projection
  );

const definitionValidation =
  validateCapabilityDefinition(
    demo.definition
  );

expect(
  projectionValidation.isValid ===
    true,
  `Scenario B: projection invalid: ${projectionValidation.errors.join(
    "; "
  )}`
);

expect(
  definitionValidation.isValid ===
    true,
  `Scenario B: definition invalid: ${definitionValidation.errors.join(
    "; "
  )}`
);

expect(
  demo.definition.capabilityId ===
    "leadership",
  "Scenario B: definition capabilityId must be leadership."
);

expect(
  demo.definition
    .requiredContributions.length ===
    4,
  "Scenario B: expected four required contributions."
);

expect(
  demo.definition
    .optionalContributions.length ===
    3,
  "Scenario B: expected three optional contributions."
);

/*
 * Scenario C — Contributions
 */
expect(
  demo.contributions.length ===
    7,
  "Scenario C: expected seven contributions."
);

const contributionValidations =
  demo.contributions.map(
    (contribution) =>
      validateCapabilityContribution(
        contribution
      )
  );

contributionValidations.forEach(
  (validation, index) => {
    expect(
      validation.isValid === true,
      `Scenario C: contribution ${index} invalid: ${validation.errors.join(
        "; "
      )}`
    );
  }
);

expect(
  demo.contributions.filter(
    (contribution) =>
      contribution.direction ===
      "supporting"
  ).length === 6,
  "Scenario C: expected six supporting contributions."
);

expect(
  demo.contributions.filter(
    (contribution) =>
      contribution.direction ===
      "contradicting"
  ).length === 1,
  "Scenario C: expected one contradicting contribution."
);

expect(
  demo.contributions.filter(
    (contribution) =>
      contribution.direction ===
      "neutral"
  ).length === 0,
  "Scenario C: expected zero neutral contributions."
);

const expectedContributionValues = {
  collective_direction:
    0.8075,

  people_mobilization:
    0.72,

  decision_accountability:
    0.855,

  execution_through_others:
    0.855,

  people_development:
    0.595,

  organizational_influence:
    0.4,

  direction_under_uncertainty:
    0.72,
};

Object.entries(
  expectedContributionValues
).forEach(
  ([
    measureId,
    expectedValue,
  ]) => {
    const contribution =
      findContribution(
        demo.contributions,
        measureId
      );

    expect(
      Boolean(contribution),
      `Scenario C: missing contribution ${measureId}.`
    );

    if (contribution) {
      expect(
        approximatelyEqual(
          contribution.strength
            .contributionValue,
          expectedValue,
          0.0001
        ),
        `Scenario C: ${measureId} expected contributionValue ${expectedValue}.`
      );
    }
  }
);

/*
 * Scenario D — Matching
 */
const matchValidation =
  validateCapabilityContributionMatch(
    demo.match
  );

expect(
  matchValidation.isValid === true,
  `Scenario D: match invalid: ${matchValidation.errors.join(
    "; "
  )}`
);

expect(
  demo.match.requiredMatches.length ===
    4,
  "Scenario D: expected four required matches."
);

expect(
  demo.match.optionalMatches.length ===
    3,
  "Scenario D: expected three optional matches."
);

expect(
  demo.match.coverage.required ===
    1,
  "Scenario D: required coverage must be 1."
);

expect(
  demo.match.coverage.optional ===
    1,
  "Scenario D: optional coverage must be 1."
);

expect(
  demo.match.coverage.total ===
    1,
  "Scenario D: total coverage must be 1."
);

[
  ...demo.match.requiredMatches,
  ...demo.match.optionalMatches,
].forEach(
  (requirement, index) => {
    expect(
      requirement.status ===
        "satisfied",
      `Scenario D: requirement ${index} must be satisfied.`
    );
  }
);

/*
 * Scenario E — Aggregation
 */
const aggregationValidation =
  validateCapabilityAggregationContext(
    demo.aggregationContext
  );

expect(
  aggregationValidation.isValid ===
    true,
  `Scenario E: aggregation context invalid: ${aggregationValidation.errors.join(
    "; "
  )}`
);

expect(
  demo.aggregationContext.entries.length ===
    7,
  "Scenario E: expected seven aggregation entries."
);

expect(
  demo.aggregationContext
    .supportingEntries.length === 6,
  "Scenario E: expected six supporting entries."
);

expect(
  demo.aggregationContext
    .contradictingEntries.length ===
    1,
  "Scenario E: expected one contradicting entry."
);

expect(
  demo.aggregationContext
    .neutralEntries.length === 0,
  "Scenario E: expected zero neutral entries."
);

expect(
  approximatelyEqual(
    demo.aggregationContext
      .preparation
      .effectiveWeightTotal,
    1,
    0.0001
  ),
  "Scenario E: effectiveWeightTotal must be approximately 1."
);


const expectedEffectiveWeightsByContributionId = {
  leadership_demo_collective_direction: 0.2,
  leadership_demo_people_mobilization: 0.18,
  leadership_demo_decision_accountability: 0.2,
  leadership_demo_execution_through_others: 0.2,
  leadership_demo_people_development: 0.08,
  leadership_demo_organizational_influence: 0.07,
  leadership_demo_direction_under_uncertainty: 0.07,
};

demo.aggregationContext.entries.forEach(
  (entry) => {
    const expectedWeight =
      expectedEffectiveWeightsByContributionId[
        entry.contributionId
      ];

    expect(
      typeof expectedWeight === "number",
      `Scenario E: unexpected contributionId ${entry.contributionId}.`
    );

    expect(
      approximatelyEqual(
        entry.effectiveWeight,
        expectedWeight,
        0.0001
      ),
      `Scenario E: ${entry.contributionId} expected effectiveWeight ${expectedWeight}, received ${entry.effectiveWeight}.`
    );
  }
);



/*
 * Scenario F — Result
 */
const resultValidation =
  validateCapabilityResult(
    demo.result
  );

expect(
  resultValidation.isValid === true,
  `Scenario F: result invalid: ${resultValidation.errors.join(
    "; "
  )}`
);

expect(
  demo.result.resultStatus ===
    "draft",
  "Scenario F: resultStatus must be draft."
);

expect(
  demo.result.capabilityBand ===
    "strong",
  "Scenario F: capabilityBand must be strong."
);

expect(
  demo.result
    .manifestationStatus ===
    "strongly_observed",
  "Scenario F: manifestationStatus must be strongly_observed."
);

expect(
  demo.result.coverage.sufficient ===
    true,
  "Scenario F: coverage must be sufficient."
);

expect(
  demo.result.inferenceSupport
    .band === "very_high",
  "Scenario F: inferenceSupport.band must be very_high."
);

expect(
  demo.result.inferenceSupport.value >
    0.8,
  "Scenario F: inferenceSupport.value must be greater than 0.80."
);

/*
 * Scenario G — Valori numerici
 */
expect(
  approximatelyEqual(
    demo.result.strength.supporting,
    0.7311
  ),
  `Scenario G: supporting strength was ${demo.result.strength.supporting}.`
);

expect(
  approximatelyEqual(
    demo.result.strength
      .contradicting,
    0.028
  ),
  `Scenario G: contradicting strength was ${demo.result.strength.contradicting}.`
);

expect(
  approximatelyEqual(
    demo.result.strength.net,
    0.7031
  ),
  `Scenario G: net strength was ${demo.result.strength.net}.`
);

expect(
  demo.result.strength
    .absoluteSupport >
    demo.result.strength.net,
  "Scenario G: absoluteSupport must exceed net strength."
);

/*
 * Scenario H — Contraddizione
 */
const organizationalInfluence =
  findContribution(
    demo.contributions,
    "organizational_influence"
  );

expect(
  organizationalInfluence &&
    organizationalInfluence
      .direction ===
      "contradicting",
  "Scenario H: organizational influence must be contradicting."
);

expect(
  organizationalInfluence &&
    approximatelyEqual(
      organizationalInfluence
        .strength
        .contributionValue,
      0.4,
      0.0001
    ),
  "Scenario H: original contradicting contributionValue must be positive 0.4."
);

const contradictingEntry =
  demo.aggregationContext
    .contradictingEntries.find(
      (entry) =>
        entry.contributionId ===
          "leadership_demo_organizational_influence" ||
        entry.contributionKey ===
          "organizational_influence" ||
        (
          entry.contribution &&
          entry.contribution
            .contributionId ===
            "leadership_demo_organizational_influence"
        )
    ) ||
  findAggregationEntry(
    demo.aggregationContext,
    "organizational_influence"
  );

expect(
  Boolean(contradictingEntry),
  "Scenario H: contradicting aggregation entry not found."
);

if (contradictingEntry) {
  expect(
    approximatelyEqual(
      contradictingEntry
        .signedContributionValue,
      -0.4,
      0.0001
    ),
    `Scenario H: signedContributionValue was ${contradictingEntry.signedContributionValue}.`
  );

  expect(
    approximatelyEqual(
      contradictingEntry
        .weightedContributionValue,
      -0.028,
      0.0001
    ),
    `Scenario H: weightedContributionValue was ${contradictingEntry.weightedContributionValue}.`
  );
}

/*
 * Scenario I — Explainability
 */
expect(
  demo.result.explainability
    .dominantDirection ===
    "supporting",
  "Scenario I: dominantDirection must be supporting."
);

expect(
  typeof demo.result.explainability
    .strongestSupportingContributionId ===
    "string" &&
    demo.result.explainability
      .strongestSupportingContributionId
      .length > 0,
  "Scenario I: strongestSupportingContributionId must be populated."
);

expect(
  demo.result.explainability
    .strongestContradictingContributionId ===
    "leadership_demo_organizational_influence",
  "Scenario I: strongestContradictingContributionId mismatch."
);

expect(
  hasText(
    demo.result.explainability.notes,
    "Supporting contributions outweigh contradicting contributions."
  ),
  "Scenario I: explainability note is missing."
);

expect(
  hasText(
    demo.result.limitations,
    "Capability result includes contradicting contributions."
  ),
  "Scenario I: contradicting-contribution limitation is missing."
);

/*
 * Scenario J — Evidence IDs
 */
const expectedEvidenceIds = [
  "demo_ev_collective_direction_01",
  "demo_ev_collective_direction_02",
  "demo_ev_people_mobilization_01",
  "demo_ev_people_mobilization_02",
  "demo_ev_decision_accountability_01",
  "demo_ev_decision_accountability_02",
  "demo_ev_execution_through_others_01",
  "demo_ev_execution_through_others_02",
  "demo_ev_people_development_01",
  "demo_ev_organizational_influence_01",
  "demo_ev_direction_under_uncertainty_01",
  "demo_ev_direction_under_uncertainty_02",
];

expectedEvidenceIds.forEach(
  (evidenceId) => {
    expect(
      demo.result.evidenceIds.includes(
        evidenceId
      ),
      `Scenario J: result.evidenceIds missing ${evidenceId}.`
    );
  }
);

expect(
  new Set(
    demo.result.evidenceIds
  ).size ===
    demo.result.evidenceIds.length,
  "Scenario J: result.evidenceIds contains duplicates."
);

/*
 * Scenario K — Nessun input applicativo reale
 */
[
  "cv",
  "interview",
  "parser",
  "runtime",
  "professionalIdentity",
  "fit",
  "comparison",
  "report",
].forEach(
  (forbiddenProperty) => {
    expect(
      !Object.prototype.hasOwnProperty.call(
        demo,
        forbiddenProperty
      ),
      `Scenario K: wrapper must not contain ${forbiddenProperty}.`
    );
  }
);

/*
 * Scenario L — Determinismo funzionale
 */
const firstDemo =
  buildPlantManagerLeadershipDemoResult();

const secondDemo =
  buildPlantManagerLeadershipDemoResult();

expect(
  JSON.stringify(
    sanitizeCreatedAt(
      firstDemo
    )
  ) ===
    JSON.stringify(
      sanitizeCreatedAt(
        secondDemo
      )
    ),
  "Scenario L: outputs must be functionally identical apart from createdAt."
);

/*
 * Scenario M — Immutabilità interna
 *
 * Ricostruisce le fasi usando gli oggetti restituiti e verifica
 * che ogni builder non modifichi gli input ricevuti.
 */
const definitionBeforeMatch =
  JSON.stringify(
    demo.definition
  );

const contributionsBeforeMatch =
  JSON.stringify(
    demo.contributions
  );

const rebuiltMatch =
  buildCapabilityContributionMatch({
    definition:
      demo.definition,

    contributions:
      demo.contributions,
  });

expect(
  JSON.stringify(
    demo.definition
  ) ===
    definitionBeforeMatch,
  "Scenario M: matching mutated definition."
);

expect(
  JSON.stringify(
    demo.contributions
  ) ===
    contributionsBeforeMatch,
  "Scenario M: matching mutated contributions."
);

const definitionBeforeAggregation =
  JSON.stringify(
    demo.definition
  );

const contributionsBeforeAggregation =
  JSON.stringify(
    demo.contributions
  );

const matchBeforeAggregation =
  JSON.stringify(
    rebuiltMatch
  );

const rebuiltAggregation =
  buildCapabilityAggregationContext({
    definition:
      demo.definition,

    match:
      rebuiltMatch,

    contributions:
      demo.contributions,
  });

expect(
  JSON.stringify(
    demo.definition
  ) ===
    definitionBeforeAggregation,
  "Scenario M: aggregation mutated definition."
);

expect(
  JSON.stringify(
    demo.contributions
  ) ===
    contributionsBeforeAggregation,
  "Scenario M: aggregation mutated contributions."
);

expect(
  JSON.stringify(
    rebuiltMatch
  ) ===
    matchBeforeAggregation,
  "Scenario M: aggregation mutated match."
);

const definitionBeforeResult =
  JSON.stringify(
    demo.definition
  );

const matchBeforeResult =
  JSON.stringify(
    rebuiltMatch
  );

const aggregationBeforeResult =
  JSON.stringify(
    rebuiltAggregation
  );

buildCapabilityResult({
  definition:
    demo.definition,

  match:
    rebuiltMatch,

  aggregationContext:
    rebuiltAggregation,
});

expect(
  JSON.stringify(
    demo.definition
  ) ===
    definitionBeforeResult,
  "Scenario M: result builder mutated definition."
);

expect(
  JSON.stringify(
    rebuiltMatch
  ) ===
    matchBeforeResult,
  "Scenario M: result builder mutated match."
);

expect(
  JSON.stringify(
    rebuiltAggregation
  ) ===
    aggregationBeforeResult,
  "Scenario M: result builder mutated aggregation context."
);

console.log(
  JSON.stringify(
    {
      test:
        "Plant Manager Leadership Demo Result v0.1",

      status:
        failures.length === 0
          ? "PASS"
          : "FAIL",

      scenarioId:
        demo.scenarioId,

      scenarioStatus:
        demo.scenarioStatus,

      capabilityId:
        demo.result.capabilityId,

      contributionCount:
        demo.contributions.length,

      requiredCoverage:
        demo.match.coverage.required,

      optionalCoverage:
        demo.match.coverage.optional,

      totalCoverage:
        demo.match.coverage.total,

      supportingEntryCount:
        demo.aggregationContext
          .supportingEntries.length,

      contradictingEntryCount:
        demo.aggregationContext
          .contradictingEntries.length,

      supportingStrength:
        demo.result.strength.supporting,

      contradictingStrength:
        demo.result.strength
          .contradicting,

      netStrength:
        demo.result.strength.net,

      inferenceSupport:
        demo.result.inferenceSupport,

      capabilityBand:
        demo.result.capabilityBand,

      manifestationStatus:
        demo.result
          .manifestationStatus,

      resultStatus:
        demo.result.resultStatus,

      projectionValidation,

      definitionValidation,

      matchValidation,

      aggregationValidation,

      resultValidation,
    },
    null,
    2
  )
);

if (failures.length > 0) {
  console.error(
    "Plant Manager Leadership Demo Result Test: FAIL"
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
  "Plant Manager Leadership Demo Result Test: PASS"
);
