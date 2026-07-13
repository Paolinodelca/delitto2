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
  validateCapabilityContributionMatch,
} = require("../src/core/capability/validateCapabilityContributionMatch");

const failures = [];

function createDefinition({
  requiredCoverage = 1,
  totalCoverage = 1,
  allowPartialResult = true,
} = {}) {
  return buildCapabilityDefinition({
    capabilityId: "leadership",

    label: "Leadership",

    description:
      "Capability used only for deterministic matching tests.",

    purpose:
      "Test capability contribution matching.",

    requiredContributions: [
      {
        contributionKey:
          "management_scope",

        sourceMeasureId:
          "management_scope",

        weight: 0.4,

        minimumContribution: 0.5,

        allowedDirections: [
          "supporting",
        ],
      },

      {
        contributionKey:
          "decision_accountability",

        sourceMeasureId:
          "decision_accountability",

        weight: 0.35,

        minimumContribution: 0.5,

        allowedDirections: [
          "supporting",
        ],
      },
    ],

    optionalContributions: [
      {
        contributionKey:
          "context_relevance",

        sourceMeasureId:
          "context_relevance",

        weight: 0.25,

        minimumContribution: 0.4,

        allowedDirections: [
          "supporting",
        ],
      },
    ],

    coveragePolicy: {
      minimumRequiredCoverage:
        requiredCoverage,

      minimumTotalCoverage:
        totalCoverage,

      allowPartialResult,
    },

    rationale:
      "Matching test definition.",
  });
}

function createContribution({
  contributionId,
  capabilityId = "leadership",
  sourceMeasureId,
  sourceMeasureValue = 0.8,
  relevance = 0.8,
  inferenceSupport = 0.8,
  direction = "supporting",
}) {
  return buildCapabilityContribution({
    contributionId,
    capabilityId,
    sourceMeasureId,
    sourceMeasureValue,
    direction,
    relevance,
    inferenceSupport,
    evidenceIds: [
      `ev_${contributionId}`,
    ],
    rationale:
      "Explicit matching test contribution.",
  });
}

function getMatchBySource(
  match,
  sourceMeasureId
) {
  return [
    ...match.requiredMatches,
    ...match.optionalMatches,
  ].find(
    (requirementMatch) =>
      requirementMatch.sourceMeasureId ===
      sourceMeasureId
  );
}

/*
 * Scenario A — Matching completo
 */
const completeDefinition =
  createDefinition();

const completeContributions = [
  createContribution({
    contributionId:
      "contribution_management",
    sourceMeasureId:
      "management_scope",
    sourceMeasureValue: 0.8,
    relevance: 0.8,
  }),

  createContribution({
    contributionId:
      "contribution_decision",
    sourceMeasureId:
      "decision_accountability",
    sourceMeasureValue: 0.9,
    relevance: 0.8,
  }),

  createContribution({
    contributionId:
      "contribution_context",
    sourceMeasureId:
      "context_relevance",
    sourceMeasureValue: 0.8,
    relevance: 0.8,
  }),
];

const completeMatch =
  buildCapabilityContributionMatch({
    definition: completeDefinition,
    contributions:
      completeContributions,
  });

const completeValidation =
  validateCapabilityContributionMatch(
    completeMatch
  );

if (!completeValidation.isValid) {
  failures.push(
    `Complete match invalid: ${completeValidation.errors.join(
      "; "
    )}`
  );
}

if (
  completeMatch.coverage.required !==
  1
) {
  failures.push(
    "Expected complete required coverage === 1."
  );
}

if (
  completeMatch.coverage.optional !==
  1
) {
  failures.push(
    "Expected complete optional coverage === 1."
  );
}

if (
  completeMatch.coverage.total !== 1
) {
  failures.push(
    "Expected complete total coverage === 1."
  );
}

if (
  [
    ...completeMatch.requiredMatches,
    ...completeMatch.optionalMatches,
  ].some(
    (requirementMatch) =>
      requirementMatch.status !==
      "satisfied"
  )
) {
  failures.push(
    "Expected all complete match statuses satisfied."
  );
}

if (
  completeMatch.limitations.length !==
  0
) {
  failures.push(
    "Expected complete limitations.length === 0."
  );
}

/*
 * Scenario B — Required mancante
 */
const missingDefinition =
  createDefinition({
    requiredCoverage: 0.75,
    totalCoverage: 0.5,
  });

const missingContributions = [
  createContribution({
    contributionId:
      "missing_management",
    sourceMeasureId:
      "management_scope",
  }),

  createContribution({
    contributionId:
      "missing_context",
    sourceMeasureId:
      "context_relevance",
  }),
];

const missingMatch =
  buildCapabilityContributionMatch({
    definition: missingDefinition,
    contributions:
      missingContributions,
  });

const missingRequirement =
  getMatchBySource(
    missingMatch,
    "decision_accountability"
  );

if (
  !missingRequirement ||
  missingRequirement.status !==
    "missing"
) {
  failures.push(
    "Expected decision_accountability missing."
  );
}

if (
  missingMatch.coverage.required !==
  0.5
) {
  failures.push(
    "Expected missing required coverage === 0.5."
  );
}

if (
  !missingMatch.limitations.includes(
    "Required contribution coverage is below the configured minimum."
  )
) {
  failures.push(
    "Expected required coverage limitation."
  );
}

/*
 * Scenario C — Contribution sotto soglia
 */
const partialDefinition =
  createDefinition();

const partialContribution =
  createContribution({
    contributionId:
      "partial_management",
    sourceMeasureId:
      "management_scope",
    sourceMeasureValue: 0.4,
    relevance: 0.5,
  });

const partialMatch =
  buildCapabilityContributionMatch({
    definition: partialDefinition,
    contributions: [
      partialContribution,
    ],
  });

const partialRequirement =
  getMatchBySource(
    partialMatch,
    "management_scope"
  );

if (
  partialRequirement.status !==
  "partially_satisfied"
) {
  failures.push(
    "Expected management_scope partially_satisfied."
  );
}

if (
  partialRequirement.bestContributionId !==
  "partial_management"
) {
  failures.push(
    "Expected partial bestContributionId."
  );
}

if (
  partialRequirement.bestContributionValue !==
  0.2
) {
  failures.push(
    "Expected partial bestContributionValue === 0.2."
  );
}

if (
  !partialRequirement.limitations.includes(
    "Best contribution did not reach the minimum required value."
  )
) {
  failures.push(
    "Expected partial requirement limitation."
  );
}

/*
 * Scenario D — Direction incompatibile
 */
const incompatibleContribution =
  createContribution({
    contributionId:
      "incompatible_management",
    sourceMeasureId:
      "management_scope",
    direction: "contradicting",
  });

const incompatibleMatch =
  buildCapabilityContributionMatch({
    definition: createDefinition(),
    contributions: [
      incompatibleContribution,
    ],
  });

const incompatibleRequirement =
  getMatchBySource(
    incompatibleMatch,
    "management_scope"
  );

if (
  incompatibleRequirement.status !==
  "incompatible"
) {
  failures.push(
    "Expected incompatible requirement status."
  );
}

if (
  !incompatibleRequirement
    .incompatibleContributionIds.includes(
      "incompatible_management"
    )
) {
  failures.push(
    "Expected incompatible contribution ID."
  );
}

if (
  !incompatibleMatch
    .unmatchedContributions.some(
      (item) =>
        item.contributionId ===
          "incompatible_management" &&
        item.reason ===
          "direction_not_allowed"
    )
) {
  failures.push(
    "Expected direction_not_allowed unmatched reason."
  );
}

/*
 * Scenario E — Più contribution compatibili
 */
const multipleContributions = [
  createContribution({
    contributionId:
      "multiple_first",
    sourceMeasureId:
      "management_scope",
    sourceMeasureValue: 0.8,
    relevance: 0.8,
    inferenceSupport: 0.7,
  }),

  createContribution({
    contributionId:
      "multiple_second",
    sourceMeasureId:
      "management_scope",
    sourceMeasureValue: 0.9,
    relevance: 0.8,
    inferenceSupport: 0.6,
  }),

  createContribution({
    contributionId:
      "multiple_third",
    sourceMeasureId:
      "management_scope",
    sourceMeasureValue: 0.9,
    relevance: 0.8,
    inferenceSupport: 0.9,
  }),
];

const multipleMatch =
  buildCapabilityContributionMatch({
    definition: createDefinition(),
    contributions:
      multipleContributions,
  });

const multipleRequirement =
  getMatchBySource(
    multipleMatch,
    "management_scope"
  );

if (
  multipleRequirement
    .compatibleContributionIds.length !==
  3
) {
  failures.push(
    "Expected three compatible contributions."
  );
}

if (
  multipleRequirement.bestContributionId !==
  "multiple_third"
) {
  failures.push(
    "Expected multiple_third as best contribution."
  );
}

if (
  multipleMatch.unmatchedContributions.some(
    (item) =>
      [
        "multiple_first",
        "multiple_second",
        "multiple_third",
      ].includes(item.contributionId)
  )
) {
  failures.push(
    "Expected compatible contributions not to be unmatched."
  );
}

/*
 * Scenario F — Capability mismatch
 */
const capabilityMismatch =
  createContribution({
    contributionId:
      "capability_mismatch",
    capabilityId: "vision",
    sourceMeasureId:
      "management_scope",
  });

const capabilityMismatchMatch =
  buildCapabilityContributionMatch({
    definition: createDefinition(),
    contributions: [
      capabilityMismatch,
    ],
  });

if (
  !capabilityMismatchMatch
    .unmatchedContributions.some(
      (item) =>
        item.contributionId ===
          "capability_mismatch" &&
        item.reason ===
          "capability_mismatch"
    )
) {
  failures.push(
    "Expected capability_mismatch reason."
  );
}

/*
 * Scenario G — Source non richiesto
 */
const sourceNotRequired =
  createContribution({
    contributionId:
      "source_not_required",
    sourceMeasureId:
      "public_speaking",
  });

const sourceNotRequiredMatch =
  buildCapabilityContributionMatch({
    definition: createDefinition(),
    contributions: [
      sourceNotRequired,
    ],
  });

if (
  !sourceNotRequiredMatch
    .unmatchedContributions.some(
      (item) =>
        item.contributionId ===
          "source_not_required" &&
        item.reason ===
          "source_measure_not_required"
    )
) {
  failures.push(
    "Expected source_measure_not_required reason."
  );
}

/*
 * Scenario H — Contribution invalido
 */
const invalidContribution =
  createContribution({
    contributionId:
      "invalid_contribution",
    sourceMeasureId:
      "management_scope",
  });

delete invalidContribution.source.measureId;

const invalidContributionMatch =
  buildCapabilityContributionMatch({
    definition: createDefinition(),
    contributions: [
      invalidContribution,
    ],
  });

const invalidContributionValidation =
  validateCapabilityContributionMatch(
    invalidContributionMatch
  );

if (!invalidContributionValidation.isValid) {
  failures.push(
    "Expected match with invalid contribution to remain valid."
  );
}

if (
  !invalidContributionMatch
    .unmatchedContributions.some(
      (item) =>
        item.contributionId ===
          "invalid_contribution" &&
        item.reason ===
          "invalid_contribution"
    )
) {
  failures.push(
    "Expected invalid_contribution reason."
  );
}

/*
 * Scenario I — Definition senza requirement
 */
const emptyDefinition =
  buildCapabilityDefinition({
    capabilityId: "leadership",
  });

const emptyMatch =
  buildCapabilityContributionMatch({
    definition: emptyDefinition,
    contributions: [],
  });

if (
  emptyMatch.coverage.required !== 1 ||
  emptyMatch.coverage.optional !== 1 ||
  emptyMatch.coverage.total !== 1
) {
  failures.push(
    "Expected empty definition coverage === 1."
  );
}

if (
  !emptyMatch.limitations.includes(
    "Capability definition contains no contribution requirements."
  )
) {
  failures.push(
    "Expected no-requirements limitation."
  );
}

/*
 * Scenario J — Immutabilità
 */
const immutableDefinition =
  createDefinition();

const immutableContributions = [
  createContribution({
    contributionId:
      "immutable_management",
    sourceMeasureId:
      "management_scope",
  }),
];

const definitionBefore =
  JSON.stringify(
    immutableDefinition
  );

const contributionsBefore =
  JSON.stringify(
    immutableContributions
  );

buildCapabilityContributionMatch({
  definition: immutableDefinition,
  contributions:
    immutableContributions,
});

const definitionAfter =
  JSON.stringify(
    immutableDefinition
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
    "Capability Contribution Matching Foundation",

  status:
    failures.length === 0
      ? "PASS"
      : "FAIL",

  complete: {
    coverage:
      completeMatch.coverage,
    summary:
      completeMatch.summary,
  },

  missing: {
    coverage:
      missingMatch.coverage,
    requirement:
      missingRequirement,
    limitations:
      missingMatch.limitations,
  },

  partial:
    partialRequirement,

  incompatible: {
    requirement:
      incompatibleRequirement,
    unmatched:
      incompatibleMatch
        .unmatchedContributions,
  },

  multiple: {
    requirement:
      multipleRequirement,
    unmatched:
      multipleMatch
        .unmatchedContributions,
  },

  emptyDefinition: {
    coverage:
      emptyMatch.coverage,
    limitations:
      emptyMatch.limitations,
  },

  immutable: {
    definitionUnchanged:
      definitionBefore ===
      definitionAfter,

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
  "test_build_capability_contribution_match PASS"
);