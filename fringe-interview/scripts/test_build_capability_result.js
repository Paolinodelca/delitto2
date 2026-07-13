const {
  buildCapabilityDefinition,
} = require("../src/core/capability/buildCapabilityDefinition");

const {
  buildCapabilityContribution,
} = require("../src/core/capability/buildCapabilityContribution");

const {
  buildCapabilityContributionMatch,
} = require("../src/core/capability/buildCapabilityContributionMatch");

const {
  buildCapabilityAggregationContext,
} = require("../src/core/capability/buildCapabilityAggregationContext");

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
  return Math.abs(first - second) <= tolerance;
}

function createRequirement({
  contributionKey,
  sourceMeasureId,
  weight,
  minimumContribution = 0.2,
  allowedDirections = ["supporting"],
}) {
  return {
    contributionKey,
    sourceMeasureId,
    weight,
    minimumContribution,
    allowedDirections,
  };
}

function createDefinition({
  required = [],
  optional = [],
  normalizeWeights = true,
  allowPartialResult = true,
  minimumRequiredCoverage = 1,
  minimumTotalCoverage = 1,
} = {}) {
  return buildCapabilityDefinition({
    capabilityId: "leadership",

    label: "Leadership",

    description:
      "Generic capability result test definition.",

    purpose:
      "Test deterministic capability result construction.",

    requiredContributions: required,

    optionalContributions: optional,

    aggregationPolicy: {
      strategy: "weighted_contribution_balance",
      supportingDirection: "supporting",
      contradictingDirection: "contradicting",
      neutralDirection: "neutral",
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
      "Generic capability result test.",
  });
}

function createContribution({
  contributionId,
  sourceMeasureId,
  contributionValue,
  direction = "supporting",
  inferenceSupport = 0.9,
}) {
  return buildCapabilityContribution({
    contributionId,

    capabilityId: "leadership",

    sourceMeasureId,

    sourceMeasureValue: 1,

    direction,

    relevance: contributionValue,

    inferenceSupport,

    evidenceIds: [
      `ev_${contributionId}`,
    ],

    rationale:
      "Deterministic capability result test contribution.",
  });
}

function buildPipeline({
  definition,
  contributions,
}) {
  const match =
    buildCapabilityContributionMatch({
      definition,
      contributions,
    });

  const aggregationContext =
    buildCapabilityAggregationContext({
      definition,
      match,
      contributions,
    });

  const result =
    buildCapabilityResult({
      definition,
      match,
      aggregationContext,
    });

  return {
    match,
    aggregationContext,
    result,
  };
}

/*
 * Scenario A — Strong supporting result
 */
const strongDefinition =
  createDefinition({
    required: [
      createRequirement({
        contributionKey: "measure_a",
        sourceMeasureId: "measure_a",
        weight: 0.4,
      }),

      createRequirement({
        contributionKey: "measure_b",
        sourceMeasureId: "measure_b",
        weight: 0.35,
      }),
    ],

    optional: [
      createRequirement({
        contributionKey: "measure_c",
        sourceMeasureId: "measure_c",
        weight: 0.25,
      }),
    ],
  });

const strongPipeline =
  buildPipeline({
    definition: strongDefinition,

    contributions: [
      createContribution({
        contributionId: "strong_a",
        sourceMeasureId: "measure_a",
        contributionValue: 0.9,
        inferenceSupport: 0.9,
      }),

      createContribution({
        contributionId: "strong_b",
        sourceMeasureId: "measure_b",
        contributionValue: 0.85,
        inferenceSupport: 0.9,
      }),

      createContribution({
        contributionId: "strong_c",
        sourceMeasureId: "measure_c",
        contributionValue: 0.8,
        inferenceSupport: 0.9,
      }),
    ],
  });

const strongResult =
  strongPipeline.result;

const strongValidation =
  validateCapabilityResult(
    strongResult
  );

if (!strongValidation.isValid) {
  failures.push(
    `Strong result invalid: ${strongValidation.errors.join(
      "; "
    )}`
  );
}

if (
  strongResult.resultStatus !==
  "draft"
) {
  failures.push(
    'Expected strong resultStatus === "draft".'
  );
}

if (
  strongResult.strength.supporting <= 0
) {
  failures.push(
    "Expected supporting strength > 0."
  );
}

if (
  strongResult.strength.contradicting !== 0
) {
  failures.push(
    "Expected contradicting strength === 0."
  );
}

if (
  strongResult.strength.net !==
  strongResult.strength.supporting
) {
  failures.push(
    "Expected net === supporting."
  );
}

if (
  !["strong", "very_strong"].includes(
    strongResult.capabilityBand
  )
) {
  failures.push(
    "Expected strong or very_strong capability band."
  );
}

if (
  !["observed", "strongly_observed"].includes(
    strongResult.manifestationStatus
  )
) {
  failures.push(
    "Expected observed or strongly_observed manifestation."
  );
}

if (
  strongResult.coverage.sufficient !==
  true
) {
  failures.push(
    "Expected complete coverage sufficient."
  );
}

/*
 * Scenario B — Supporting e contradicting
 */
const mixedDefinition =
  createDefinition({
    required: [
      createRequirement({
        contributionKey: "supporting_measure",
        sourceMeasureId: "supporting_measure",
        weight: 0.6,
        allowedDirections: ["supporting"],
      }),

      createRequirement({
        contributionKey: "contradicting_measure",
        sourceMeasureId: "contradicting_measure",
        weight: 0.4,
        allowedDirections: ["contradicting"],
      }),
    ],
  });

const mixedPipeline =
  buildPipeline({
    definition: mixedDefinition,

    contributions: [
      createContribution({
        contributionId: "mixed_support",
        sourceMeasureId: "supporting_measure",
        contributionValue: 0.8,
        direction: "supporting",
      }),

      createContribution({
        contributionId: "mixed_contradict",
        sourceMeasureId: "contradicting_measure",
        contributionValue: 0.5,
        direction: "contradicting",
      }),
    ],
  });

const mixedResult =
  mixedPipeline.result;

if (
  mixedResult.strength.supporting <= 0 ||
  mixedResult.strength.contradicting <= 0
) {
  failures.push(
    "Expected supporting and contradicting strengths > 0."
  );
}

if (
  !approximatelyEqual(
    mixedResult.strength.net,
    mixedResult.strength.supporting -
      mixedResult.strength.contradicting
  )
) {
  failures.push(
    "Expected mixed net === supporting - contradicting."
  );
}

if (
  mixedResult.explainability.dominantDirection !==
  "supporting"
) {
  failures.push(
    "Expected supporting dominant direction."
  );
}

if (
  !mixedResult.limitations.includes(
    "Capability result includes contradicting contributions."
  )
) {
  failures.push(
    "Expected contradiction limitation."
  );
}

/*
 * Scenario C — Contraddizioni superiori
 */
const contradictionDominantDefinition =
  createDefinition({
    required: [
      createRequirement({
        contributionKey: "weak_support",
        sourceMeasureId: "weak_support",
        weight: 0.3,
        allowedDirections: ["supporting"],
      }),

      createRequirement({
        contributionKey: "strong_contradiction",
        sourceMeasureId: "strong_contradiction",
        weight: 0.7,
        allowedDirections: ["contradicting"],
      }),
    ],
  });

const contradictionDominantResult =
  buildPipeline({
    definition:
      contradictionDominantDefinition,

    contributions: [
      createContribution({
        contributionId: "weak_support",
        sourceMeasureId: "weak_support",
        contributionValue: 0.3,
        direction: "supporting",
      }),

      createContribution({
        contributionId: "strong_contradiction",
        sourceMeasureId: "strong_contradiction",
        contributionValue: 0.9,
        direction: "contradicting",
      }),
    ],
  }).result;

if (
  contradictionDominantResult.strength.net !== 0
) {
  failures.push(
    "Expected contradiction-dominant net === 0."
  );
}

if (
  contradictionDominantResult.explainability
    .dominantDirection !==
  "contradicting"
) {
  failures.push(
    "Expected contradicting dominant direction."
  );
}

if (
  contradictionDominantResult.capabilityBand !==
  "not_supported"
) {
  failures.push(
    "Expected not_supported capability band."
  );
}

/*
 * Scenario D — Coverage incompleta, partial consentito
 */
const partialAllowedDefinition =
  createDefinition({
    required: [
      createRequirement({
        contributionKey: "available_measure",
        sourceMeasureId: "available_measure",
        weight: 0.5,
      }),

      createRequirement({
        contributionKey: "missing_measure",
        sourceMeasureId: "missing_measure",
        weight: 0.5,
      }),
    ],

    allowPartialResult: true,
    minimumRequiredCoverage: 1,
    minimumTotalCoverage: 1,
  });

const partialAllowedResult =
  buildPipeline({
    definition:
      partialAllowedDefinition,

    contributions: [
      createContribution({
        contributionId: "partial_available",
        sourceMeasureId: "available_measure",
        contributionValue: 0.8,
        inferenceSupport: 0.9,
      }),
    ],
  }).result;

if (
  partialAllowedResult.resultStatus !==
  "partial"
) {
  failures.push(
    'Expected partial resultStatus === "partial".'
  );
}

if (
  partialAllowedResult.coverage.sufficient !==
  false
) {
  failures.push(
    "Expected insufficient partial coverage."
  );
}

if (
  partialAllowedResult.manifestationStatus !==
  "partially_observed"
) {
  failures.push(
    "Expected partially_observed manifestation."
  );
}

if (
  !partialAllowedResult.limitations.includes(
    "Capability result does not meet configured coverage requirements."
  )
) {
  failures.push(
    "Expected coverage limitation."
  );
}

/*
 * Scenario E — Coverage incompleta, partial non consentito
 */
const partialDeniedDefinition =
  createDefinition({
    required: [
      createRequirement({
        contributionKey: "available_measure",
        sourceMeasureId: "available_measure",
        weight: 0.5,
      }),

      createRequirement({
        contributionKey: "missing_measure",
        sourceMeasureId: "missing_measure",
        weight: 0.5,
      }),
    ],

    allowPartialResult: false,
    minimumRequiredCoverage: 1,
    minimumTotalCoverage: 1,
  });

const partialDeniedResult =
  buildPipeline({
    definition:
      partialDeniedDefinition,

    contributions: [
      createContribution({
        contributionId: "partial_denied_available",
        sourceMeasureId: "available_measure",
        contributionValue: 0.8,
      }),
    ],
  }).result;

if (
  partialDeniedResult.resultStatus !==
  "insufficient_evidence"
) {
  failures.push(
    "Expected insufficient_evidence result."
  );
}

/*
 * Scenario F — Inference support basso
 */
const lowInferenceDefinition =
  createDefinition({
    required: [
      createRequirement({
        contributionKey: "low_inference_measure",
        sourceMeasureId: "low_inference_measure",
        weight: 1,
      }),
    ],
  });

const lowInferenceResult =
  buildPipeline({
    definition:
      lowInferenceDefinition,

    contributions: [
      createContribution({
        contributionId: "low_inference",
        sourceMeasureId: "low_inference_measure",
        contributionValue: 0.8,
        inferenceSupport: 0.3,
      }),
    ],
  }).result;

if (
  lowInferenceResult.inferenceSupport.value >=
  0.5
) {
  failures.push(
    "Expected inference support < 0.5."
  );
}

if (
  !["low", "moderate"].includes(
    lowInferenceResult.inferenceSupport.band
  )
) {
  failures.push(
    "Expected low or moderate inference band."
  );
}

if (
  !lowInferenceResult.limitations.includes(
    "Capability result has limited inference support."
  )
) {
  failures.push(
    "Expected limited inference support limitation."
  );
}

/*
 * Scenario G — Nessuna contribution
 */
const noContributionDefinition =
  createDefinition({
    required: [
      createRequirement({
        contributionKey: "missing_measure",
        sourceMeasureId: "missing_measure",
        weight: 1,
      }),
    ],

    allowPartialResult: false,
  });

const noContributionResult =
  buildPipeline({
    definition:
      noContributionDefinition,

    contributions: [],
  }).result;

if (
  noContributionResult.strength.net !== 0
) {
  failures.push(
    "Expected no-contribution net === 0."
  );
}

if (
  noContributionResult.manifestationStatus !==
  "not_observed"
) {
  failures.push(
    "Expected not_observed manifestation."
  );
}

if (
  noContributionResult.resultStatus !==
  "insufficient_evidence"
) {
  failures.push(
    "Expected no-contribution insufficient_evidence."
  );
}

if (
  noContributionResult.explainability
    .dominantDirection !==
  "none"
) {
  failures.push(
    "Expected dominantDirection === none."
  );
}

/*
 * Scenario H — Neutral contribution
 */
const neutralDefinition =
  createDefinition({
    required: [
      createRequirement({
        contributionKey: "neutral_measure",
        sourceMeasureId: "neutral_measure",
        weight: 1,
        allowedDirections: ["neutral"],
      }),
    ],
  });

const neutralResult =
  buildPipeline({
    definition:
      neutralDefinition,

    contributions: [
      createContribution({
        contributionId: "neutral_contribution",
        sourceMeasureId: "neutral_measure",
        contributionValue: 0.8,
        direction: "neutral",
      }),
    ],
  }).result;

if (
  neutralResult.contributions.neutral.length !==
  1
) {
  failures.push(
    "Expected one neutral contribution."
  );
}

if (
  neutralResult.contributions.neutral[0]
    .weightedContributionValue !== 0
) {
  failures.push(
    "Expected neutral weighted contribution === 0."
  );
}

if (
  neutralResult.strength.net !== 0
) {
  failures.push(
    "Expected neutral contribution not to modify net."
  );
}

/*
 * Scenario I — Capability mismatch
 */
const mismatchPipeline =
  buildPipeline({
    definition: strongDefinition,
    contributions: [
      createContribution({
        contributionId: "mismatch_a",
        sourceMeasureId: "measure_a",
        contributionValue: 0.9,
      }),

      createContribution({
        contributionId: "mismatch_b",
        sourceMeasureId: "measure_b",
        contributionValue: 0.9,
      }),

      createContribution({
        contributionId: "mismatch_c",
        sourceMeasureId: "measure_c",
        contributionValue: 0.9,
      }),
    ],
  });

const mismatchedContext = {
  ...mismatchPipeline.aggregationContext,
  capabilityId: "vision",
};

const mismatchResult =
  buildCapabilityResult({
    definition: strongDefinition,
    match: mismatchPipeline.match,
    aggregationContext:
      mismatchedContext,
  });

const mismatchValidation =
  validateCapabilityResult(
    mismatchResult
  );

if (
  mismatchResult.resultStatus !==
  "invalid"
) {
  failures.push(
    "Expected mismatched result invalid."
  );
}

if (
  mismatchResult.strength.net !== 0
) {
  failures.push(
    "Expected mismatched result net === 0."
  );
}

if (!mismatchValidation.isValid) {
  failures.push(
    "Expected mismatched result to remain structurally valid."
  );
}

if (
  !mismatchResult.limitations.includes(
    "Capability inputs refer to different capability identifiers."
  )
) {
  failures.push(
    "Expected capability mismatch limitation."
  );
}

/*
 * Scenario J — Strongest contributions
 */
const strongestDefinition =
  createDefinition({
    required: [
      createRequirement({
        contributionKey: "support_a",
        sourceMeasureId: "support_a",
        weight: 0.25,
        allowedDirections: ["supporting"],
      }),

      createRequirement({
        contributionKey: "support_b",
        sourceMeasureId: "support_b",
        weight: 0.25,
        allowedDirections: ["supporting"],
      }),

      createRequirement({
        contributionKey: "contradict_a",
        sourceMeasureId: "contradict_a",
        weight: 0.25,
        allowedDirections: ["contradicting"],
      }),

      createRequirement({
        contributionKey: "contradict_b",
        sourceMeasureId: "contradict_b",
        weight: 0.25,
        allowedDirections: ["contradicting"],
      }),
    ],
  });

const strongestResult =
  buildPipeline({
    definition:
      strongestDefinition,

    contributions: [
      createContribution({
        contributionId: "support_low",
        sourceMeasureId: "support_a",
        contributionValue: 0.5,
        direction: "supporting",
      }),

      createContribution({
        contributionId: "support_high",
        sourceMeasureId: "support_b",
        contributionValue: 0.9,
        direction: "supporting",
      }),

      createContribution({
        contributionId: "contradict_low",
        sourceMeasureId: "contradict_a",
        contributionValue: 0.4,
        direction: "contradicting",
      }),

      createContribution({
        contributionId: "contradict_high",
        sourceMeasureId: "contradict_b",
        contributionValue: 0.8,
        direction: "contradicting",
      }),
    ],
  }).result;

if (
  strongestResult.explainability
    .strongestSupportingContributionId !==
  "support_high"
) {
  failures.push(
    "Expected support_high strongest supporting contribution."
  );
}

if (
  strongestResult.explainability
    .strongestContradictingContributionId !==
  "contradict_high"
) {
  failures.push(
    "Expected contradict_high strongest contradicting contribution."
  );
}

/*
 * Scenario K — Immutabilità
 */
const immutableDefinition =
  strongDefinition;

const immutableContributions = [
  createContribution({
    contributionId: "immutable_a",
    sourceMeasureId: "measure_a",
    contributionValue: 0.9,
  }),

  createContribution({
    contributionId: "immutable_b",
    sourceMeasureId: "measure_b",
    contributionValue: 0.9,
  }),

  createContribution({
    contributionId: "immutable_c",
    sourceMeasureId: "measure_c",
    contributionValue: 0.9,
  }),
];

const immutableMatch =
  buildCapabilityContributionMatch({
    definition:
      immutableDefinition,

    contributions:
      immutableContributions,
  });

const immutableContext =
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

const matchBefore =
  JSON.stringify(
    immutableMatch
  );

const contextBefore =
  JSON.stringify(
    immutableContext
  );

buildCapabilityResult({
  definition:
    immutableDefinition,

  match:
    immutableMatch,

  aggregationContext:
    immutableContext,
});

const definitionAfter =
  JSON.stringify(
    immutableDefinition
  );

const matchAfter =
  JSON.stringify(
    immutableMatch
  );

const contextAfter =
  JSON.stringify(
    immutableContext
  );

if (
  definitionBefore !== definitionAfter
) {
  failures.push(
    "Expected definition immutability."
  );
}

if (matchBefore !== matchAfter) {
  failures.push(
    "Expected match immutability."
  );
}

if (contextBefore !== contextAfter) {
  failures.push(
    "Expected aggregation context immutability."
  );
}

const output = {
  test:
    "Capability Result Foundation",

  status:
    failures.length === 0
      ? "PASS"
      : "FAIL",

  strong: {
    resultStatus:
      strongResult.resultStatus,

    strength:
      strongResult.strength,

    capabilityBand:
      strongResult.capabilityBand,

    manifestationStatus:
      strongResult.manifestationStatus,

    coverage:
      strongResult.coverage,
  },

  mixed: {
    strength:
      mixedResult.strength,

    dominantDirection:
      mixedResult.explainability
        .dominantDirection,

    limitations:
      mixedResult.limitations,
  },

  contradictionDominant: {
    strength:
      contradictionDominantResult.strength,

    dominantDirection:
      contradictionDominantResult
        .explainability
        .dominantDirection,

    capabilityBand:
      contradictionDominantResult
        .capabilityBand,
  },

  partialAllowed: {
    resultStatus:
      partialAllowedResult.resultStatus,

    coverage:
      partialAllowedResult.coverage,

    manifestationStatus:
      partialAllowedResult
        .manifestationStatus,
  },

  partialDenied: {
    resultStatus:
      partialDeniedResult.resultStatus,
  },

  lowInference: {
    inferenceSupport:
      lowInferenceResult.inferenceSupport,

    limitations:
      lowInferenceResult.limitations,
  },

  noContribution: {
    resultStatus:
      noContributionResult.resultStatus,

    manifestationStatus:
      noContributionResult
        .manifestationStatus,

    dominantDirection:
      noContributionResult
        .explainability
        .dominantDirection,
  },

  neutral: {
    strength:
      neutralResult.strength,

    contributions:
      neutralResult.contributions.neutral,
  },

  mismatch: {
    resultStatus:
      mismatchResult.resultStatus,

    strength:
      mismatchResult.strength,

    limitations:
      mismatchResult.limitations,
  },

  strongest: {
    supporting:
      strongestResult.explainability
        .strongestSupportingContributionId,

    contradicting:
      strongestResult.explainability
        .strongestContradictingContributionId,
  },

  immutable: {
    definitionUnchanged:
      definitionBefore === definitionAfter,

    matchUnchanged:
      matchBefore === matchAfter,

    contextUnchanged:
      contextBefore === contextAfter,
  },
};

console.log(
  JSON.stringify(output, null, 2)
);

if (failures.length > 0) {
  console.error("FAIL");

  console.error(
    JSON.stringify(failures, null, 2)
  );

  process.exit(1);
}

console.log("PASS");

console.log(
  "test_build_capability_result PASS"
);