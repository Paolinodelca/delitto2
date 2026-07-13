const {
  buildCapabilityDefinition,
} = require("../src/core/capability/buildCapabilityDefinition");

const {
  validateCapabilityDefinition,
} = require("../src/core/capability/validateCapabilityDefinition");

const {
  buildCapabilityContribution,
} = require("../src/core/capability/buildCapabilityContribution");

const {
  validateCapabilityContribution,
} = require("../src/core/capability/validateCapabilityContribution");

const {
  buildCapabilityContributionMatch,
} = require("../src/core/capability/buildCapabilityContributionMatch");

const {
  validateCapabilityContributionMatch,
} = require("../src/core/capability/validateCapabilityContributionMatch");

const {
  buildCapabilityAggregationContext,
} = require("../src/core/capability/buildCapabilityAggregationContext");

const {
  validateCapabilityAggregationContext,
} = require("../src/core/capability/validateCapabilityAggregationContext");

const {
  buildCapabilityResult,
} = require("../src/core/capability/buildCapabilityResult");

const {
  validateCapabilityResult,
} = require("../src/core/capability/validateCapabilityResult");

const failures = [];

function approximatelyEqual(
  first,
  second,
  tolerance = 0.0001
) {
  return (
    typeof first === "number" &&
    typeof second === "number" &&
    Math.abs(first - second) <=
      tolerance
  );
}

function hasText(list, expectedText) {
  return (
    Array.isArray(list) &&
    list.some(
      (item) =>
        typeof item === "string" &&
        item.includes(expectedText)
    )
  );
}

function buildRequirement({
  contributionKey,
  sourceMeasureId,
  weight,
  minimumContribution = 0.3,
  allowedDirections = [
    "supporting",
  ],
}) {
  return {
    contributionKey,
    sourceMeasureId,
    weight,
    minimumContribution,
    allowedDirections,
  };
}

function buildDefinition({
  capabilityId = "leadership_demo",
  requiredContributions = [],
  optionalContributions = [],
  allowPartialResult = true,
  minimumRequiredCoverage = 1,
  minimumTotalCoverage = 1,
  normalizeWeights = true,
} = {}) {
  return buildCapabilityDefinition({
    capabilityId,

    label: "Capability Regression Demo",

    description:
      "Generic capability used by the Capability Core regression test.",

    purpose:
      "Verify the complete deterministic Capability Core pipeline.",

    requiredContributions,

    optionalContributions,

    aggregationPolicy: {
      strategy:
        "weighted_contribution_balance",

      supportingDirection:
        "supporting",

      contradictingDirection:
        "contradicting",

      neutralDirection:
        "neutral",

      normalizeWeights,
    },

    coveragePolicy: {
      minimumRequiredCoverage,
      minimumTotalCoverage,
      allowPartialResult,
    },

    thresholds: {
      weak: 0.3,
      moderate: 0.5,
      strong: 0.7,
      veryStrong: 0.85,
    },

    rationale:
      "Generic regression capability definition.",
  });
}

function buildContribution({
  contributionId,
  capabilityId = "leadership_demo",
  sourceMeasureId,
  sourceMeasureValue = 0.8,
  direction = "supporting",
  relevance = 0.8,
  inferenceSupport = 0.85,
} = {}) {
  return buildCapabilityContribution({
    contributionId,
    capabilityId,
    sourceMeasureId,
    sourceMeasureValue,
    direction,
    relevance,
    inferenceSupport,

    context: {
      contextType: "observed_context",
      targetContextType: "target_context",
    },

    evidenceIds: [
      `ev_${contributionId}`,
    ],

    rationale:
      "Explicit contribution used by Capability Core regression.",
  });
}

function executeCapabilityPipeline({
  definition,
  contributions,
}) {
  const definitionValidation =
    validateCapabilityDefinition(
      definition
    );

  const contributionValidations =
    contributions.map(
      (contribution) =>
        validateCapabilityContribution(
          contribution
        )
    );

  const match =
    buildCapabilityContributionMatch({
      definition,
      contributions,
    });

  const matchValidation =
    validateCapabilityContributionMatch(
      match
    );

  const aggregationContext =
    buildCapabilityAggregationContext({
      definition,
      match,
      contributions,
    });

  const aggregationContextValidation =
    validateCapabilityAggregationContext(
      aggregationContext
    );

  const result =
    buildCapabilityResult({
      definition,
      match,
      aggregationContext,
    });

  const resultValidation =
    validateCapabilityResult(result);

  return {
    definitionValidation,
    contributionValidations,
    match,
    matchValidation,
    aggregationContext,
    aggregationContextValidation,
    result,
    resultValidation,
  };
}

function assertValidPipeline(
  pipeline,
  scenarioName
) {
  if (
    pipeline.definitionValidation
      .isValid !== true
  ) {
    failures.push(
      `${scenarioName}: definition invalid: ${pipeline.definitionValidation.errors.join(
        "; "
      )}`
    );
  }

  pipeline.contributionValidations.forEach(
    (validation, index) => {
      if (validation.isValid !== true) {
        failures.push(
          `${scenarioName}: contribution ${index} invalid: ${validation.errors.join(
            "; "
          )}`
        );
      }
    }
  );

  if (
    pipeline.matchValidation.isValid !==
    true
  ) {
    failures.push(
      `${scenarioName}: match invalid: ${pipeline.matchValidation.errors.join(
        "; "
      )}`
    );
  }

  if (
    pipeline.aggregationContextValidation
      .isValid !== true
  ) {
    failures.push(
      `${scenarioName}: aggregation context invalid: ${pipeline.aggregationContextValidation.errors.join(
        "; "
      )}`
    );
  }

  if (
    pipeline.resultValidation.isValid !==
    true
  ) {
    failures.push(
      `${scenarioName}: result invalid: ${pipeline.resultValidation.errors.join(
        "; "
      )}`
    );
  }
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
      Object.entries(value)
        .filter(
          ([key]) =>
            key !== "createdAt"
        )
        .map(
          ([key, nestedValue]) => [
            key,
            sanitizeCreatedAt(
              nestedValue
            ),
          ]
        )
    );
  }

  return value;
}

/*
 * SCENARIO A — Supporting completo
 */
const supportingDefinition =
  buildDefinition({
    requiredContributions: [
      buildRequirement({
        contributionKey:
          "management_scope",

        sourceMeasureId:
          "management_scope",

        weight: 0.5,

        minimumContribution: 0.4,
      }),

      buildRequirement({
        contributionKey:
          "decision_accountability",

        sourceMeasureId:
          "decision_accountability",

        weight: 0.3,

        minimumContribution: 0.3,
      }),
    ],

    optionalContributions: [
      buildRequirement({
        contributionKey:
          "context_relevance",

        sourceMeasureId:
          "context_relevance",

        weight: 0.2,

        minimumContribution: null,
      }),
    ],
  });

const supportingContributions = [
  buildContribution({
    contributionId:
      "regression_support_management",

    sourceMeasureId:
      "management_scope",

    sourceMeasureValue: 0.8,

    relevance: 0.9,

    inferenceSupport: 0.9,
  }),

  buildContribution({
    contributionId:
      "regression_support_decision",

    sourceMeasureId:
      "decision_accountability",

    sourceMeasureValue: 0.75,

    relevance: 0.8,

    inferenceSupport: 0.85,
  }),

  buildContribution({
    contributionId:
      "regression_support_context",

    sourceMeasureId:
      "context_relevance",

    sourceMeasureValue: 0.9,

    relevance: 1,

    inferenceSupport: 0.8,
  }),
];

const supportingPipeline =
  executeCapabilityPipeline({
    definition:
      supportingDefinition,

    contributions:
      supportingContributions,
  });

assertValidPipeline(
  supportingPipeline,
  "Scenario A"
);

if (
  supportingPipeline.match.coverage
    .required !== 1
) {
  failures.push(
    "Scenario A: expected required coverage === 1."
  );
}

if (
  supportingPipeline.match.coverage
    .total !== 1
) {
  failures.push(
    "Scenario A: expected total coverage === 1."
  );
}

if (
  supportingPipeline
    .aggregationContext.entries
    .length !== 3
) {
  failures.push(
    "Scenario A: expected three aggregation entries."
  );
}

if (
  supportingPipeline.result
    .resultStatus !== "draft"
) {
  failures.push(
    'Scenario A: expected resultStatus === "draft".'
  );
}

if (
  supportingPipeline.result
    .strength.supporting <= 0
) {
  failures.push(
    "Scenario A: expected supporting strength > 0."
  );
}

if (
  supportingPipeline.result
    .strength.contradicting !== 0
) {
  failures.push(
    "Scenario A: expected contradicting strength === 0."
  );
}

if (
  supportingPipeline.result
    .strength.net <= 0
) {
  failures.push(
    "Scenario A: expected net strength > 0."
  );
}

if (
  supportingPipeline.result
    .coverage.sufficient !== true
) {
  failures.push(
    "Scenario A: expected sufficient coverage."
  );
}

/*
 * SCENARIO B — Supporting e contradicting
 */
const mixedDefinition =
  buildDefinition({
    requiredContributions: [
      buildRequirement({
        contributionKey:
          "management_scope",

        sourceMeasureId:
          "management_scope",

        weight: 0.6,

        allowedDirections: [
          "supporting",
        ],
      }),

      buildRequirement({
        contributionKey:
          "conflict_handling",

        sourceMeasureId:
          "conflict_handling",

        weight: 0.4,

        allowedDirections: [
          "contradicting",
        ],
      }),
    ],
  });

const mixedPipeline =
  executeCapabilityPipeline({
    definition: mixedDefinition,

    contributions: [
      buildContribution({
        contributionId:
          "regression_mixed_support",

        sourceMeasureId:
          "management_scope",

        sourceMeasureValue: 0.9,

        relevance: 0.9,

        direction: "supporting",
      }),

      buildContribution({
        contributionId:
          "regression_mixed_contradict",

        sourceMeasureId:
          "conflict_handling",

        sourceMeasureValue: 0.7,

        relevance: 0.8,

        direction: "contradicting",
      }),
    ],
  });

assertValidPipeline(
  mixedPipeline,
  "Scenario B"
);

if (
  mixedPipeline.aggregationContext
    .supportingEntries.length !== 1
) {
  failures.push(
    "Scenario B: expected one supporting entry."
  );
}

if (
  mixedPipeline.aggregationContext
    .contradictingEntries.length !== 1
) {
  failures.push(
    "Scenario B: expected one contradicting entry."
  );
}

if (
  mixedPipeline.result.strength
    .supporting <= 0 ||
  mixedPipeline.result.strength
    .contradicting <= 0
) {
  failures.push(
    "Scenario B: expected both strength directions > 0."
  );
}

const expectedMixedDirection =
  mixedPipeline.result.strength
    .supporting >
  mixedPipeline.result.strength
    .contradicting
    ? "supporting"
    : mixedPipeline.result.strength
          .supporting <
        mixedPipeline.result.strength
          .contradicting
      ? "contradicting"
      : "balanced";

if (
  mixedPipeline.result
    .explainability
    .dominantDirection !==
  expectedMixedDirection
) {
  failures.push(
    "Scenario B: dominantDirection is inconsistent with produced strengths."
  );
}

if (
  !hasText(
    mixedPipeline.result.limitations,
    "Capability result includes contradicting contributions."
  )
) {
  failures.push(
    "Scenario B: expected contradiction limitation."
  );
}

/*
 * SCENARIO C — Required mancante, partial consentito
 */
const partialDefinition =
  buildDefinition({
    requiredContributions: [
      buildRequirement({
        contributionKey:
          "management_scope",

        sourceMeasureId:
          "management_scope",

        weight: 0.5,
      }),

      buildRequirement({
        contributionKey:
          "decision_accountability",

        sourceMeasureId:
          "decision_accountability",

        weight: 0.5,
      }),
    ],

    allowPartialResult: true,

    minimumRequiredCoverage: 1,

    minimumTotalCoverage: 1,
  });

const partialPipeline =
  executeCapabilityPipeline({
    definition: partialDefinition,

    contributions: [
      buildContribution({
        contributionId:
          "regression_partial_management",

        sourceMeasureId:
          "management_scope",

        sourceMeasureValue: 0.8,

        relevance: 0.9,
      }),
    ],
  });

assertValidPipeline(
  partialPipeline,
  "Scenario C"
);

if (
  partialPipeline.match.coverage
    .required >= 1
) {
  failures.push(
    "Scenario C: expected required coverage < 1."
  );
}

if (
  !partialPipeline.match
    .requiredMatches.some(
      (requirement) =>
        requirement.status ===
        "missing"
    )
) {
  failures.push(
    "Scenario C: expected missing required requirement."
  );
}

if (
  partialPipeline.result
    .resultStatus !== "partial"
) {
  failures.push(
    'Scenario C: expected resultStatus === "partial".'
  );
}

if (
  partialPipeline.result
    .coverage.sufficient !== false
) {
  failures.push(
    "Scenario C: expected insufficient coverage."
  );
}

if (
  !hasText(
    partialPipeline.result.limitations,
    "Capability result does not meet configured coverage requirements."
  )
) {
  failures.push(
    "Scenario C: expected coverage limitation."
  );
}

/*
 * SCENARIO D — Required mancante, partial non consentito
 */
const insufficientDefinition =
  buildDefinition({
    requiredContributions:
      partialDefinition.requiredContributions,

    allowPartialResult: false,

    minimumRequiredCoverage: 1,

    minimumTotalCoverage: 1,
  });

const insufficientPipeline =
  executeCapabilityPipeline({
    definition:
      insufficientDefinition,

    contributions: [
      buildContribution({
        contributionId:
          "regression_insufficient_management",

        sourceMeasureId:
          "management_scope",

        sourceMeasureValue: 0.8,

        relevance: 0.9,
      }),
    ],
  });

assertValidPipeline(
  insufficientPipeline,
  "Scenario D"
);

if (
  insufficientPipeline.result
    .resultStatus !==
  "insufficient_evidence"
) {
  failures.push(
    "Scenario D: expected insufficient_evidence."
  );
}

if (
  insufficientPipeline.result
    .coverage.sufficient !== false
) {
  failures.push(
    "Scenario D: expected insufficient coverage."
  );
}

/*
 * SCENARIO E — Contribution sotto soglia
 */
const thresholdDefinition =
  buildDefinition({
    requiredContributions: [
      buildRequirement({
        contributionKey:
          "management_scope",

        sourceMeasureId:
          "management_scope",

        weight: 1,

        minimumContribution: 0.8,
      }),
    ],

    allowPartialResult: true,
  });

const thresholdPipeline =
  executeCapabilityPipeline({
    definition:
      thresholdDefinition,

    contributions: [
      buildContribution({
        contributionId:
          "regression_below_threshold",

        sourceMeasureId:
          "management_scope",

        sourceMeasureValue: 0.5,

        relevance: 0.8,
      }),
    ],
  });

assertValidPipeline(
  thresholdPipeline,
  "Scenario E"
);

const thresholdMatch =
  thresholdPipeline.match
    .requiredMatches[0];

if (
  thresholdMatch.status !==
  "partially_satisfied"
) {
  failures.push(
    "Scenario E: expected partially_satisfied requirement."
  );
}

if (
  thresholdPipeline
    .aggregationContext.entries
    .length !== 1
) {
  failures.push(
    "Scenario E: expected partial entry included."
  );
}

if (
  !hasText(
    thresholdPipeline
      .aggregationContext.entries[0]
      .limitations,
    "Contribution did not reach the configured minimum."
  )
) {
  failures.push(
    "Scenario E: expected aggregation entry limitation."
  );
}

if (
  thresholdPipeline.result
    .resultStatus !== "partial"
) {
  failures.push(
    'Scenario E: expected resultStatus === "partial".'
  );
}

/*
 * SCENARIO F — Direction incompatibile
 */
const incompatibleDefinition =
  buildDefinition({
    requiredContributions: [
      buildRequirement({
        contributionKey:
          "management_scope",

        sourceMeasureId:
          "management_scope",

        weight: 1,

        allowedDirections: [
          "supporting",
        ],
      }),
    ],

    allowPartialResult: true,
  });

const incompatiblePipeline =
  executeCapabilityPipeline({
    definition:
      incompatibleDefinition,

    contributions: [
      buildContribution({
        contributionId:
          "regression_incompatible",

        sourceMeasureId:
          "management_scope",

        direction:
          "contradicting",
      }),
    ],
  });

assertValidPipeline(
  incompatiblePipeline,
  "Scenario F"
);

if (
  incompatiblePipeline.match
    .requiredMatches[0].status !==
  "incompatible"
) {
  failures.push(
    "Scenario F: expected incompatible requirement."
  );
}

if (
  incompatiblePipeline
    .aggregationContext.entries
    .length !== 0
) {
  failures.push(
    "Scenario F: expected no aggregation entry."
  );
}

if (
  !incompatiblePipeline
    .aggregationContext
    .excludedRequirements.some(
      (requirement) =>
        requirement.reason ===
        "incompatible"
    )
) {
  failures.push(
    "Scenario F: expected excluded incompatible requirement."
  );
}

if (
  incompatiblePipeline.result
    .requirements.incompatible
    .length === 0
) {
  failures.push(
    "Scenario F: expected incompatible result requirement."
  );
}

/*
 * SCENARIO G — Nessuna contribution
 */
const noContributionPipeline =
  executeCapabilityPipeline({
    definition:
      incompatibleDefinition,

    contributions: [],
  });

assertValidPipeline(
  noContributionPipeline,
  "Scenario G"
);

if (
  noContributionPipeline
    .aggregationContext.entries
    .length !== 0
) {
  failures.push(
    "Scenario G: expected no aggregation entries."
  );
}

if (
  noContributionPipeline.result
    .strength.net !== 0
) {
  failures.push(
    "Scenario G: expected net strength === 0."
  );
}

if (
  noContributionPipeline.result
    .manifestationStatus !==
  "not_observed"
) {
  failures.push(
    "Scenario G: expected not_observed manifestation."
  );
}

if (
  ![
    "partial",
    "insufficient_evidence",
  ].includes(
    noContributionPipeline.result
      .resultStatus
  )
) {
  failures.push(
    "Scenario G: unexpected resultStatus."
  );
}

/*
 * SCENARIO H — Capability mismatch
 */
const mismatchBasePipeline =
  executeCapabilityPipeline({
    definition:
      supportingDefinition,

    contributions:
      supportingContributions,
  });

const mismatchedContext = {
  ...mismatchBasePipeline
    .aggregationContext,

  capabilityId:
    "different_capability",
};

const mismatchResult =
  buildCapabilityResult({
    definition:
      supportingDefinition,

    match:
      mismatchBasePipeline.match,

    aggregationContext:
      mismatchedContext,
  });

const mismatchResultValidation =
  validateCapabilityResult(
    mismatchResult
  );

if (
  mismatchResultValidation.isValid !==
  true
) {
  failures.push(
    `Scenario H: result structurally invalid: ${mismatchResultValidation.errors.join(
      "; "
    )}`
  );
}

if (
  mismatchResult.resultStatus !==
  "invalid"
) {
  failures.push(
    "Scenario H: expected invalid result."
  );
}

if (
  mismatchResult.strength.net !== 0
) {
  failures.push(
    "Scenario H: expected net strength === 0."
  );
}

if (
  !hasText(
    mismatchResult.limitations,
    "Capability inputs refer to different capability identifiers."
  )
) {
  failures.push(
    "Scenario H: expected capability mismatch limitation."
  );
}

/*
 * SCENARIO I — Invalid contribution
 */
const invalidContribution =
  buildContribution({
    contributionId:
      "regression_invalid",

    sourceMeasureId:
      "management_scope",
  });

delete invalidContribution.source
  .measureId;

const invalidContributionValidation =
  validateCapabilityContribution(
    invalidContribution
  );

if (
  invalidContributionValidation.isValid !==
  false
) {
  failures.push(
    "Scenario I: expected contribution invalid."
  );
}

const invalidMatch =
  buildCapabilityContributionMatch({
    definition:
      incompatibleDefinition,

    contributions: [
      invalidContribution,
    ],
  });

const invalidMatchValidation =
  validateCapabilityContributionMatch(
    invalidMatch
  );

if (
  invalidMatchValidation.isValid !==
  true
) {
  failures.push(
    "Scenario I: expected structurally valid match."
  );
}

if (
  !invalidMatch
    .unmatchedContributions.some(
      (item) =>
        item.reason ===
        "invalid_contribution"
    )
) {
  failures.push(
    "Scenario I: expected invalid_contribution unmatched reason."
  );
}

const invalidAggregationContext =
  buildCapabilityAggregationContext({
    definition:
      incompatibleDefinition,

    match:
      invalidMatch,

    contributions: [
      invalidContribution,
    ],
  });

const invalidResult =
  buildCapabilityResult({
    definition:
      incompatibleDefinition,

    match:
      invalidMatch,

    aggregationContext:
      invalidAggregationContext,
  });

const invalidResultValidation =
  validateCapabilityResult(
    invalidResult
  );

if (
  invalidResultValidation.isValid !==
  true
) {
  failures.push(
    "Scenario I: expected structurally valid final result."
  );
}

/*
 * SCENARIO J — Immutabilità completa
 */
const immutableDefinition =
  supportingDefinition;

const immutableContributions =
  supportingContributions;

const immutableMatch =
  buildCapabilityContributionMatch({
    definition:
      immutableDefinition,

    contributions:
      immutableContributions,
  });

const immutableAggregationContext =
  buildCapabilityAggregationContext({
    definition:
      immutableDefinition,

    match:
      immutableMatch,

    contributions:
      immutableContributions,
  });

const definitionBefore =
  JSON.stringify(
    immutableDefinition
  );

const contributionsBefore =
  JSON.stringify(
    immutableContributions
  );

const matchBefore =
  JSON.stringify(
    immutableMatch
  );

const aggregationContextBefore =
  JSON.stringify(
    immutableAggregationContext
  );

buildCapabilityResult({
  definition:
    immutableDefinition,

  match:
    immutableMatch,

  aggregationContext:
    immutableAggregationContext,
});

const definitionAfter =
  JSON.stringify(
    immutableDefinition
  );

const contributionsAfter =
  JSON.stringify(
    immutableContributions
  );

const matchAfter =
  JSON.stringify(
    immutableMatch
  );

const aggregationContextAfter =
  JSON.stringify(
    immutableAggregationContext
  );

if (
  definitionBefore !== definitionAfter
) {
  failures.push(
    "Scenario J: definition was mutated."
  );
}

if (
  contributionsBefore !==
  contributionsAfter
) {
  failures.push(
    "Scenario J: contributions were mutated."
  );
}

if (
  matchBefore !== matchAfter
) {
  failures.push(
    "Scenario J: match was mutated."
  );
}

if (
  aggregationContextBefore !==
  aggregationContextAfter
) {
  failures.push(
    "Scenario J: aggregation context was mutated."
  );
}

/*
 * SCENARIO K — Determinismo
 */
const determinismRunOne =
  executeCapabilityPipeline({
    definition:
      supportingDefinition,

    contributions:
      supportingContributions,
  });

const determinismRunTwo =
  executeCapabilityPipeline({
    definition:
      supportingDefinition,

    contributions:
      supportingContributions,
  });

const sanitizedMatchOne =
  sanitizeCreatedAt(
    determinismRunOne.match
  );

const sanitizedMatchTwo =
  sanitizeCreatedAt(
    determinismRunTwo.match
  );

const sanitizedContextOne =
  sanitizeCreatedAt(
    determinismRunOne
      .aggregationContext
  );

const sanitizedContextTwo =
  sanitizeCreatedAt(
    determinismRunTwo
      .aggregationContext
  );

const sanitizedResultOne =
  sanitizeCreatedAt(
    determinismRunOne.result
  );

const sanitizedResultTwo =
  sanitizeCreatedAt(
    determinismRunTwo.result
  );

if (
  JSON.stringify(
    sanitizedMatchOne
  ) !==
  JSON.stringify(
    sanitizedMatchTwo
  )
) {
  failures.push(
    "Scenario K: match output is not deterministic."
  );
}

if (
  JSON.stringify(
    sanitizedContextOne
  ) !==
  JSON.stringify(
    sanitizedContextTwo
  )
) {
  failures.push(
    "Scenario K: aggregation context output is not deterministic."
  );
}

if (
  JSON.stringify(
    sanitizedResultOne
  ) !==
  JSON.stringify(
    sanitizedResultTwo
  )
) {
  failures.push(
    "Scenario K: result output is not deterministic."
  );
}

/*
 * Conferma separazione dei contratti.
 */
if (
  !Object.prototype.hasOwnProperty.call(
    supportingContributions[0],
    "direction"
  ) ||
  !Object.prototype.hasOwnProperty.call(
    supportingContributions[0]
      .strength,
    "contributionValue"
  ) ||
  !Object.prototype.hasOwnProperty.call(
    supportingContributions[0],
    "inferenceSupport"
  )
) {
  failures.push(
    "Contract check: CapabilityContribution does not keep direction, contributionValue and inferenceSupport separate."
  );
}

if (
  !Object.prototype.hasOwnProperty.call(
    supportingPipeline
      .aggregationContext.entries[0],
    "signedContributionValue"
  )
) {
  failures.push(
    "Contract check: signedContributionValue is missing from aggregation preparation."
  );
}

if (
  !Object.prototype.hasOwnProperty.call(
    supportingPipeline.result,
    "strength"
  ) ||
  !Object.prototype.hasOwnProperty.call(
    supportingPipeline.result,
    "inferenceSupport"
  ) ||
  !Object.prototype.hasOwnProperty.call(
    supportingPipeline.result,
    "coverage"
  ) ||
  !Object.prototype.hasOwnProperty.call(
    supportingPipeline.result,
    "manifestationStatus"
  )
) {
  failures.push(
    "Contract check: CapabilityResult concepts are not separated."
  );
}

console.log(
  "Capability Core Regression"
);

console.log(
  `Supporting result: ${supportingPipeline.result.strength.net}`
);

console.log(
  `Mixed result: ${mixedPipeline.result.strength.net}`
);

console.log(
  `Partial result status: ${partialPipeline.result.resultStatus}`
);

console.log(
  `Insufficient result status: ${insufficientPipeline.result.resultStatus}`
);

console.log(
  `No contribution manifestation: ${noContributionPipeline.result.manifestationStatus}`
);

if (failures.length > 0) {
  console.error(
    "Capability Core Regression: FAIL"
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
  "Capability Core Regression: PASS"
);