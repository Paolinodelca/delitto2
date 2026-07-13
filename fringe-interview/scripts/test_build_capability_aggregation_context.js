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
  validateCapabilityAggregationContext,
} = require("../src/core/capability/validateCapabilityAggregationContext");

const failures = [];

function approximatelyEqual(
  first,
  second,
  tolerance = 0.0001
) {
  return (
    Math.abs(first - second) <=
    tolerance
  );
}

function createRequirement({
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

function createDefinition({
  requirements,
  normalizeWeights = true,
  allowPartialResult = true,
  minimumRequiredCoverage = 0,
  minimumTotalCoverage = 0,
}) {
  return buildCapabilityDefinition({
    capabilityId: "leadership",

    label: "Leadership",

    description:
      "Technical capability definition for aggregation-context tests.",

    purpose:
      "Prepare contributions without calculating final capability strength.",

    requiredContributions:
      requirements.required || [],

    optionalContributions:
      requirements.optional || [],

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

    rationale:
      "Aggregation context test definition.",
  });
}

function createContribution({
  contributionId,
  sourceMeasureId,
  contributionValue,
  inferenceSupport = 0.8,
  direction = "supporting",
}) {
  const sourceMeasureValue = 1;
  const relevance = contributionValue;

  return buildCapabilityContribution({
    contributionId,

    capabilityId: "leadership",

    sourceMeasureId,

    sourceMeasureValue,

    direction,

    relevance,

    inferenceSupport,

    evidenceIds: [
      `ev_${contributionId}`,
    ],

    context: {
      contextType:
        "observed_context",

      targetContextType:
        "target_context",
    },

    rationale:
      "Explicit aggregation context test contribution.",
  });
}

function buildContext({
  definition,
  contributions,
}) {
  const match =
    buildCapabilityContributionMatch({
      definition,
      contributions,
    });

  const context =
    buildCapabilityAggregationContext({
      definition,
      match,
      contributions,
    });

  return {
    match,
    context,
  };
}

/*
 * Scenario A — Solo supporting, matching completo
 */
const supportingDefinition =
  createDefinition({
    requirements: {
      required: [
        createRequirement({
          contributionKey:
            "management_scope",

          sourceMeasureId:
            "management_scope",

          weight: 0.4,
        }),

        createRequirement({
          contributionKey:
            "decision_accountability",

          sourceMeasureId:
            "decision_accountability",

          weight: 0.35,
        }),
      ],

      optional: [
        createRequirement({
          contributionKey:
            "context_relevance",

          sourceMeasureId:
            "context_relevance",

          weight: 0.25,
        }),
      ],
    },
  });

const supportingContributions = [
  createContribution({
    contributionId:
      "support_management",

    sourceMeasureId:
      "management_scope",

    contributionValue: 0.8,
  }),

  createContribution({
    contributionId:
      "support_decision",

    sourceMeasureId:
      "decision_accountability",

    contributionValue: 0.7,
  }),

  createContribution({
    contributionId:
      "support_context",

    sourceMeasureId:
      "context_relevance",

    contributionValue: 0.6,
  }),
];

const supportingResult =
  buildContext({
    definition:
      supportingDefinition,

    contributions:
      supportingContributions,
  });

const supportingContext =
  supportingResult.context;

const supportingValidation =
  validateCapabilityAggregationContext(
    supportingContext
  );

if (!supportingValidation.isValid) {
  failures.push(
    `Supporting context invalid: ${supportingValidation.errors.join(
      "; "
    )}`
  );
}

if (
  supportingContext.entries.length !==
  3
) {
  failures.push(
    "Expected three supporting aggregation entries."
  );
}

if (
  supportingContext.supportingEntries
    .length !== 3
) {
  failures.push(
    "Expected supportingEntries.length === 3."
  );
}

if (
  supportingContext.contradictingEntries
    .length !== 0
) {
  failures.push(
    "Expected no contradicting entries."
  );
}

if (
  !approximatelyEqual(
    supportingContext.preparation
      .effectiveWeightTotal,
    1
  )
) {
  failures.push(
    "Expected effectiveWeightTotal approximately 1."
  );
}

const supportingManagementEntry =
  supportingContext.entries.find(
    (entry) =>
      entry.sourceMeasureId ===
      "management_scope"
  );

if (
  !supportingManagementEntry ||
  !approximatelyEqual(
    supportingManagementEntry
      .weightedContributionValue,
    0.32
  )
) {
  failures.push(
    "Expected management weightedContributionValue === 0.32."
  );
}

if (
  supportingContext.limitations.length !==
  0
) {
  failures.push(
    "Expected no supporting-context limitations."
  );
}

/*
 * Scenario B — Supporting e contradicting
 */
const mixedDefinition =
  createDefinition({
    requirements: {
      required: [
        createRequirement({
          contributionKey:
            "management_scope",

          sourceMeasureId:
            "management_scope",

          weight: 0.5,

          allowedDirections: [
            "supporting",
          ],
        }),

        createRequirement({
          contributionKey:
            "conflict_handling",

          sourceMeasureId:
            "conflict_handling",

          weight: 0.5,

          allowedDirections: [
            "contradicting",
          ],
        }),
      ],
    },
  });

const mixedContributions = [
  createContribution({
    contributionId:
      "mixed_supporting",

    sourceMeasureId:
      "management_scope",

    contributionValue: 0.8,

    direction: "supporting",
  }),

  createContribution({
    contributionId:
      "mixed_contradicting",

    sourceMeasureId:
      "conflict_handling",

    contributionValue: 0.7,

    direction: "contradicting",
  }),
];

const mixedContext =
  buildContext({
    definition: mixedDefinition,
    contributions:
      mixedContributions,
  }).context;

if (
  mixedContext.supportingEntries.length !==
  1
) {
  failures.push(
    "Expected one supporting entry."
  );
}

if (
  mixedContext.contradictingEntries
    .length !== 1
) {
  failures.push(
    "Expected one contradicting entry."
  );
}

if (
  mixedContext.supportingEntries[0]
    .signedContributionValue <= 0
) {
  failures.push(
    "Expected positive supporting signed value."
  );
}

if (
  mixedContext.contradictingEntries[0]
    .signedContributionValue >= 0
) {
  failures.push(
    "Expected negative contradicting signed value."
  );
}

/*
 * Scenario C — Neutral
 */
const neutralDefinition =
  createDefinition({
    requirements: {
      required: [
        createRequirement({
          contributionKey:
            "neutral_signal",

          sourceMeasureId:
            "neutral_signal",

          weight: 1,

          allowedDirections: [
            "neutral",
          ],
        }),
      ],
    },
  });

const neutralContribution =
  createContribution({
    contributionId:
      "neutral_contribution",

    sourceMeasureId:
      "neutral_signal",

    contributionValue: 0.8,

    direction: "neutral",
  });

const neutralContext =
  buildContext({
    definition:
      neutralDefinition,

    contributions: [
      neutralContribution,
    ],
  }).context;

if (
  neutralContext.neutralEntries.length !==
  1
) {
  failures.push(
    "Expected one neutral entry."
  );
}

if (
  neutralContext.neutralEntries[0]
    .signedContributionValue !== 0
) {
  failures.push(
    "Expected neutral signedContributionValue === 0."
  );
}

if (
  neutralContext.neutralEntries[0]
    .weightedContributionValue !== 0
) {
  failures.push(
    "Expected neutral weightedContributionValue === 0."
  );
}

/*
 * Scenario D — Pesi rinormalizzati
 */
const normalizedDefinition =
  createDefinition({
    requirements: {
      required: [
        createRequirement({
          contributionKey: "measure_a",
          sourceMeasureId: "measure_a",
          weight: 0.4,
        }),

        createRequirement({
          contributionKey: "measure_b",
          sourceMeasureId: "measure_b",
          weight: 0.3,
        }),

        createRequirement({
          contributionKey: "measure_c",
          sourceMeasureId: "measure_c",
          weight: 0.2,
        }),

        createRequirement({
          contributionKey: "measure_d",
          sourceMeasureId: "measure_d",
          weight: 0.1,
        }),
      ],
    },

    normalizeWeights: true,
  });

const normalizedContributions = [
  createContribution({
    contributionId:
      "normalized_a",

    sourceMeasureId:
      "measure_a",

    contributionValue: 0.8,
  }),

  createContribution({
    contributionId:
      "normalized_b",

    sourceMeasureId:
      "measure_b",

    contributionValue: 0.7,
  }),
];

const normalizedContext =
  buildContext({
    definition:
      normalizedDefinition,

    contributions:
      normalizedContributions,
  }).context;

if (
  !(
    normalizedContext.preparation
      .availableWeightTotal <
    normalizedContext.preparation
      .declaredWeightTotal
  )
) {
  failures.push(
    "Expected availableWeightTotal below declaredWeightTotal."
  );
}

if (
  !approximatelyEqual(
    normalizedContext.preparation
      .effectiveWeightTotal,
    1
  )
) {
  failures.push(
    "Expected normalized effectiveWeightTotal approximately 1."
  );
}

const normalizedA =
  normalizedContext.entries.find(
    (entry) =>
      entry.sourceMeasureId ===
      "measure_a"
  );

const normalizedB =
  normalizedContext.entries.find(
    (entry) =>
      entry.sourceMeasureId ===
      "measure_b"
  );

if (
  !approximatelyEqual(
    normalizedA.effectiveWeight,
    0.5714
  )
) {
  failures.push(
    "Expected measure_a effectiveWeight approximately 0.5714."
  );
}

if (
  !approximatelyEqual(
    normalizedB.effectiveWeight,
    0.4286
  )
) {
  failures.push(
    "Expected measure_b effectiveWeight approximately 0.4286."
  );
}

/*
 * Scenario E — Pesi non rinormalizzati
 */
const nonNormalizedDefinition =
  createDefinition({
    requirements: {
      required: [
        createRequirement({
          contributionKey: "measure_a",
          sourceMeasureId: "measure_a",
          weight: 0.4,
        }),

        createRequirement({
          contributionKey: "measure_b",
          sourceMeasureId: "measure_b",
          weight: 0.3,
        }),

        createRequirement({
          contributionKey: "measure_c",
          sourceMeasureId: "measure_c",
          weight: 0.3,
        }),
      ],
    },

    normalizeWeights: false,
  });

const nonNormalizedContext =
  buildContext({
    definition:
      nonNormalizedDefinition,

    contributions: [
      createContribution({
        contributionId:
          "non_normalized_a",

        sourceMeasureId:
          "measure_a",

        contributionValue: 0.8,
      }),

      createContribution({
        contributionId:
          "non_normalized_b",

        sourceMeasureId:
          "measure_b",

        contributionValue: 0.7,
      }),
    ],
  }).context;

const nonNormalizedA =
  nonNormalizedContext.entries.find(
    (entry) =>
      entry.sourceMeasureId ===
      "measure_a"
  );

if (
  nonNormalizedA.effectiveWeight !==
  nonNormalizedA.requirementWeight
) {
  failures.push(
    "Expected non-normalized effectiveWeight to equal requirementWeight."
  );
}

if (
  !approximatelyEqual(
    nonNormalizedContext.preparation
      .effectiveWeightTotal,
    0.7
  )
) {
  failures.push(
    "Expected non-normalized effectiveWeightTotal === 0.7."
  );
}

/*
 * Scenario F — Contribution parziale consentito
 */
const partialAllowedDefinition =
  createDefinition({
    requirements: {
      required: [
        createRequirement({
          contributionKey:
            "partial_measure",

          sourceMeasureId:
            "partial_measure",

          weight: 1,

          minimumContribution: 0.8,
        }),
      ],
    },

    allowPartialResult: true,
  });

const partialAllowedContext =
  buildContext({
    definition:
      partialAllowedDefinition,

    contributions: [
      createContribution({
        contributionId:
          "partial_allowed",

        sourceMeasureId:
          "partial_measure",

        contributionValue: 0.5,
      }),
    ],
  }).context;

if (
  partialAllowedContext.entries.length !==
  1
) {
  failures.push(
    "Expected allowed partial contribution entry."
  );
}

if (
  !partialAllowedContext.entries[0]
    .limitations.includes(
      "Contribution did not reach the configured minimum."
    )
) {
  failures.push(
    "Expected partial contribution entry limitation."
  );
}

/*
 * Scenario G — Contribution parziale non consentito
 */
const partialDeniedDefinition =
  createDefinition({
    requirements: {
      required: [
        createRequirement({
          contributionKey:
            "partial_measure",

          sourceMeasureId:
            "partial_measure",

          weight: 1,

          minimumContribution: 0.8,
        }),
      ],
    },

    allowPartialResult: false,
  });

const partialDeniedContext =
  buildContext({
    definition:
      partialDeniedDefinition,

    contributions: [
      createContribution({
        contributionId:
          "partial_denied",

        sourceMeasureId:
          "partial_measure",

        contributionValue: 0.5,
      }),
    ],
  }).context;

if (
  partialDeniedContext.entries.length !==
  0
) {
  failures.push(
    "Expected denied partial contribution excluded."
  );
}

if (
  !partialDeniedContext
    .excludedRequirements.some(
      (excludedRequirement) =>
        excludedRequirement.reason ===
        "partial_not_allowed"
    )
) {
  failures.push(
    "Expected partial_not_allowed exclusion."
  );
}

if (
  !partialDeniedContext.limitations.includes(
    "Partial contributions were excluded by the capability definition."
  )
) {
  failures.push(
    "Expected partial-exclusion root limitation."
  );
}

/*
 * Scenario H — Best contribution non trovato
 */
const unresolvedDefinition =
  createDefinition({
    requirements: {
      required: [
        createRequirement({
          contributionKey:
            "unresolved_measure",

          sourceMeasureId:
            "unresolved_measure",

          weight: 1,
        }),
      ],
    },
  });

const unresolvedContributions = [
  createContribution({
    contributionId:
      "real_contribution",

    sourceMeasureId:
      "unresolved_measure",

    contributionValue: 0.8,
  }),
];

const unresolvedMatch =
  buildCapabilityContributionMatch({
    definition:
      unresolvedDefinition,

    contributions:
      unresolvedContributions,
  });

unresolvedMatch.requiredMatches[0]
  .bestContributionId =
  "missing_contribution";

const unresolvedContext =
  buildCapabilityAggregationContext({
    definition:
      unresolvedDefinition,

    match:
      unresolvedMatch,

    contributions:
      unresolvedContributions,
  });

const unresolvedValidation =
  validateCapabilityAggregationContext(
    unresolvedContext
  );

if (!unresolvedValidation.isValid) {
  failures.push(
    `Unresolved context should remain valid: ${unresolvedValidation.errors.join(
      "; "
    )}`
  );
}

if (
  !unresolvedContext
    .excludedRequirements.some(
      (excludedRequirement) =>
        excludedRequirement.reason ===
        "best_contribution_not_found"
    )
) {
  failures.push(
    "Expected best_contribution_not_found exclusion."
  );
}

if (
  !unresolvedContext.limitations.includes(
    "One or more matched contributions could not be resolved."
  )
) {
  failures.push(
    "Expected unresolved contribution root limitation."
  );
}

/*
 * Scenario I — Nessuna entry
 */
const emptyEntriesDefinition =
  createDefinition({
    requirements: {
      required: [
        createRequirement({
          contributionKey:
            "missing_measure",

          sourceMeasureId:
            "missing_measure",

          weight: 1,
        }),
      ],
    },
  });

const emptyEntriesContext =
  buildContext({
    definition:
      emptyEntriesDefinition,

    contributions: [],
  }).context;

if (
  emptyEntriesContext.entries.length !==
  0
) {
  failures.push(
    "Expected no aggregation entries."
  );
}

if (
  emptyEntriesContext.preparation
    .effectiveWeightTotal !== 0
) {
  failures.push(
    "Expected empty effectiveWeightTotal === 0."
  );
}

if (
  !emptyEntriesContext.limitations.includes(
    "No capability contributions were available for aggregation."
  )
) {
  failures.push(
    "Expected no-contributions root limitation."
  );
}

/*
 * Scenario J — Immutabilità
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

const definitionBefore =
  JSON.stringify(
    immutableDefinition
  );

const matchBefore =
  JSON.stringify(
    immutableMatch
  );

const contributionsBefore =
  JSON.stringify(
    immutableContributions
  );

buildCapabilityAggregationContext({
  definition:
    immutableDefinition,

  match:
    immutableMatch,

  contributions:
    immutableContributions,
});

const definitionAfter =
  JSON.stringify(
    immutableDefinition
  );

const matchAfter =
  JSON.stringify(
    immutableMatch
  );

const contributionsAfter =
  JSON.stringify(
    immutableContributions
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

if (
  contributionsBefore !==
  contributionsAfter
) {
  failures.push(
    "Expected contributions immutability."
  );
}

const output = {
  test:
    "Capability Aggregation Context Foundation",

  status:
    failures.length === 0
      ? "PASS"
      : "FAIL",

  supporting: {
    entryCount:
      supportingContext.entries.length,

    effectiveWeightTotal:
      supportingContext.preparation
        .effectiveWeightTotal,

    entries:
      supportingContext.entries,
  },

  mixedDirections: {
    supportingCount:
      mixedContext.supportingEntries
        .length,

    contradictingCount:
      mixedContext
        .contradictingEntries.length,
  },

  neutral: {
    entries:
      neutralContext.neutralEntries,
  },

  normalizedWeights: {
    declaredWeightTotal:
      normalizedContext.preparation
        .declaredWeightTotal,

    availableWeightTotal:
      normalizedContext.preparation
        .availableWeightTotal,

    effectiveWeightTotal:
      normalizedContext.preparation
        .effectiveWeightTotal,

    entries:
      normalizedContext.entries,
  },

  nonNormalizedWeights: {
    effectiveWeightTotal:
      nonNormalizedContext.preparation
        .effectiveWeightTotal,

    entries:
      nonNormalizedContext.entries,
  },

  partialAllowed: {
    entries:
      partialAllowedContext.entries,
  },

  partialDenied: {
    entries:
      partialDeniedContext.entries,

    excludedRequirements:
      partialDeniedContext
        .excludedRequirements,

    limitations:
      partialDeniedContext.limitations,
  },

  unresolved: {
    excludedRequirements:
      unresolvedContext
        .excludedRequirements,

    limitations:
      unresolvedContext.limitations,
  },

  emptyEntries: {
    preparation:
      emptyEntriesContext.preparation,

    limitations:
      emptyEntriesContext.limitations,
  },

  immutable: {
    definitionUnchanged:
      definitionBefore ===
      definitionAfter,

    matchUnchanged:
      matchBefore === matchAfter,

    contributionsUnchanged:
      contributionsBefore ===
      contributionsAfter,
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
  "test_build_capability_aggregation_context PASS"
);