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

const failures = [];

function hasWarningContaining(validation, text) {
  return validation.warnings.some((warning) =>
    warning.includes(text)
  );
}

function hasErrorContaining(validation, text) {
  return validation.errors.some((error) =>
    error.includes(text)
  );
}

/*
 * Scenario A — Definition completa
 */
const completeDefinition =
  buildCapabilityDefinition({
    capabilityId: "leadership",

    label: "Leadership",

    description:
      "Describes the ability to guide people toward shared organizational results.",

    purpose:
      "Support future inference of observed leadership manifestation.",

    requiredContributions: [
      {
        contributionKey: "management_scope",
        sourceMeasureId: "management_scope",
        weight: 0.3,
        minimumContribution: 0.4,
      },

      {
        contributionKey:
          "decision_accountability",
        sourceMeasureId:
          "decision_accountability",
        weight: 0.25,
        minimumContribution: 0.35,
      },
    ],

    optionalContributions: [
      {
        contributionKey:
          "context_relevance",
        sourceMeasureId:
          "context_relevance",
        weight: 0.15,
        minimumContribution: null,
      },

      {
        contributionKey:
          "organizational_influence",
        sourceMeasureId:
          "organizational_influence",
        weight: 0.3,
        minimumContribution: null,
      },
    ],

    aggregationPolicy: {
      strategy:
        "weighted_contribution_balance",

      supportingDirection: "supporting",

      contradictingDirection:
        "contradicting",

      neutralDirection: "neutral",

      normalizeWeights: true,
    },

    coveragePolicy: {
      minimumRequiredCoverage: 0.5,
      minimumTotalCoverage: 0.6,
      allowPartialResult: true,
    },

    thresholds: {
      weak: 0.3,
      moderate: 0.5,
      strong: 0.7,
      veryStrong: 0.85,
    },

    rationale:
      "Leadership is treated as a capability emerging from multiple independent contributions.",
  });

const completeValidation =
  validateCapabilityDefinition(
    completeDefinition
  );

if (!completeValidation.isValid) {
  failures.push(
    `Complete definition invalid: ${completeValidation.errors.join(
      "; "
    )}`
  );
}

if (
  completeDefinition.capabilityId !==
  "leadership"
) {
  failures.push(
    'Expected capabilityId === "leadership".'
  );
}

if (
  completeDefinition.definitionStatus !==
  "draft"
) {
  failures.push(
    'Expected definitionStatus === "draft".'
  );
}

if (
  completeDefinition.requiredContributions
    .length !== 2
) {
  failures.push(
    "Expected two required contributions."
  );
}

if (
  completeDefinition.optionalContributions
    .length !== 2
) {
  failures.push(
    "Expected two optional contributions."
  );
}

if (
  completeDefinition.aggregationPolicy
    .strategy !==
  "weighted_contribution_balance"
) {
  failures.push(
    "Expected weighted_contribution_balance strategy."
  );
}

if (
  completeDefinition.metadata.version !==
  "1.0"
) {
  failures.push(
    'Expected metadata.version === "1.0".'
  );
}

if (
  hasWarningContaining(
    completeValidation,
    "total contribution weight"
  )
) {
  failures.push(
    "Expected no total-weight warning for weights summing to 1."
  );
}

/*
 * Scenario B — Definition minimale
 */
const minimalDefinition =
  buildCapabilityDefinition({
    capabilityId: "leadership",
  });

const minimalValidation =
  validateCapabilityDefinition(
    minimalDefinition
  );

if (!minimalValidation.isValid) {
  failures.push(
    `Minimal definition should be valid: ${minimalValidation.errors.join(
      "; "
    )}`
  );
}

if (
  minimalDefinition.label !==
  "Unnamed Capability"
) {
  failures.push(
    'Expected label === "Unnamed Capability".'
  );
}

if (
  minimalDefinition.requiredContributions
    .length !== 0
) {
  failures.push(
    "Expected no required contributions."
  );
}

if (
  minimalDefinition.optionalContributions
    .length !== 0
) {
  failures.push(
    "Expected no optional contributions."
  );
}

if (minimalValidation.warnings.length === 0) {
  failures.push(
    "Expected warnings for minimal definition."
  );
}

/*
 * Scenario C — Normalizzazione requisiti
 */
const normalizedDefinition =
  buildCapabilityDefinition({
    capabilityId: "leadership",

    requiredContributions: [
      {
        contributionKey:
          "management_scope",

        sourceMeasureId:
          "management_scope",

        weight: -2,

        minimumContribution: 1.4,

        allowedDirections: [
          "supporting",
          "supporting",
          "invalid",
        ],
      },
    ],
  });

const normalizedValidation =
  validateCapabilityDefinition(
    normalizedDefinition
  );

const normalizedRequirement =
  normalizedDefinition
    .requiredContributions[0];

if (normalizedRequirement.weight !== 0) {
  failures.push(
    "Expected normalized weight === 0."
  );
}

if (
  normalizedRequirement.minimumContribution !==
  null
) {
  failures.push(
    "Expected normalized minimumContribution === null."
  );
}

if (
  normalizedRequirement.allowedDirections.length !==
    1 ||
  normalizedRequirement.allowedDirections[0] !==
    "supporting"
) {
  failures.push(
    "Expected only supporting in allowedDirections."
  );
}

if (!normalizedValidation.isValid) {
  failures.push(
    `Normalized definition should remain valid: ${normalizedValidation.errors.join(
      "; "
    )}`
  );
}

if (
  normalizedValidation.warnings.length === 0
) {
  failures.push(
    "Expected normalized definition warnings."
  );
}

/*
 * Scenario D — Duplicati
 */
const duplicateDefinition =
  buildCapabilityDefinition({
    capabilityId: "leadership",

    requiredContributions: [
      {
        contributionKey:
          "management_scope",
        sourceMeasureId:
          "management_scope",
        weight: 0.5,
        minimumContribution: 0.4,
      },

      {
        contributionKey:
          "management_scope",
        sourceMeasureId:
          "management_scope_duplicate",
        weight: 0.2,
        minimumContribution: 0.3,
      },
    ],

    optionalContributions: [
      {
        contributionKey:
          "management_scope",
        sourceMeasureId:
          "management_scope",
        weight: 0.2,
      },

      {
        contributionKey:
          "context_relevance",
        sourceMeasureId:
          "context_relevance",
        weight: 0.5,
      },
    ],
  });

if (
  duplicateDefinition.requiredContributions
    .filter(
      (requirement) =>
        requirement.contributionKey ===
        "management_scope"
    ).length !== 1
) {
  failures.push(
    "Expected one required management_scope requirement."
  );
}

if (
  duplicateDefinition.optionalContributions.some(
    (requirement) =>
      requirement.contributionKey ===
      "management_scope"
  )
) {
  failures.push(
    "Expected management_scope removed from optional contributions."
  );
}

/*
 * Scenario E — Soglie incoerenti
 */
const incoherentThresholdDefinition =
  buildCapabilityDefinition({
    capabilityId: "leadership",

    thresholds: {
      weak: 0.6,
      moderate: 0.5,
      strong: 0.7,
      veryStrong: 0.85,
    },
  });

const incoherentThresholdValidation =
  validateCapabilityDefinition(
    incoherentThresholdDefinition
  );

if (
  incoherentThresholdValidation.isValid !==
  false
) {
  failures.push(
    "Expected incoherent thresholds to be invalid."
  );
}

if (
  !hasErrorContaining(
    incoherentThresholdValidation,
    "weak < moderate < strong < veryStrong"
  )
) {
  failures.push(
    "Expected threshold-order error."
  );
}

/*
 * Scenario F — Definition invalida
 */
const invalidDefinition =
  buildCapabilityDefinition({});

const invalidValidation =
  validateCapabilityDefinition(
    invalidDefinition
  );

if (
  invalidDefinition.capabilityId !== null
) {
  failures.push(
    "Expected capabilityId === null."
  );
}

if (invalidValidation.isValid !== false) {
  failures.push(
    "Expected empty definition to be invalid."
  );
}

if (
  !hasErrorContaining(
    invalidValidation,
    "capabilityId"
  )
) {
  failures.push(
    "Expected capabilityId validation error."
  );
}

/*
 * Scenario G — Weight warning
 */
const weightWarningDefinition =
  buildCapabilityDefinition({
    capabilityId: "leadership",

    requiredContributions: [
      {
        contributionKey:
          "management_scope",
        sourceMeasureId:
          "management_scope",
        weight: 0.5,
        minimumContribution: 0.4,
      },
    ],

    optionalContributions: [
      {
        contributionKey:
          "context_relevance",
        sourceMeasureId:
          "context_relevance",
        weight: 0.3,
      },
    ],
  });

const weightWarningValidation =
  validateCapabilityDefinition(
    weightWarningDefinition
  );

if (!weightWarningValidation.isValid) {
  failures.push(
    "Expected weight-warning definition to remain valid."
  );
}

if (
  !hasWarningContaining(
    weightWarningValidation,
    "not 1"
  )
) {
  failures.push(
    "Expected warning for total weight 0.8."
  );
}

/*
 * Scenario H — Coverage warning
 */
const coverageWarningDefinition =
  buildCapabilityDefinition({
    capabilityId: "leadership",

    coveragePolicy: {
      minimumRequiredCoverage: 0.8,
      minimumTotalCoverage: 0.6,
      allowPartialResult: true,
    },
  });

const coverageWarningValidation =
  validateCapabilityDefinition(
    coverageWarningDefinition
  );

if (!coverageWarningValidation.isValid) {
  failures.push(
    "Expected coverage-warning definition to remain valid."
  );
}

if (
  !hasWarningContaining(
    coverageWarningValidation,
    "greater than minimumTotalCoverage"
  )
) {
  failures.push(
    "Expected coverage policy warning."
  );
}

/*
 * Compatibilità manuale con CapabilityContribution
 */
const compatibleContribution =
  buildCapabilityContribution({
    contributionId:
      "contribution_management_scope_001",

    capabilityId: "leadership",

    sourceMeasureId:
      "management_scope",

    sourceMeasureValue: 0.75,

    direction: "supporting",

    relevance: 0.8,

    inferenceSupport: 0.9,

    evidenceIds: ["ev_001"],

    rationale:
      "Explicit compatibility test.",
  });

const compatibleContributionValidation =
  validateCapabilityContribution(
    compatibleContribution
  );

if (
  !compatibleContributionValidation.isValid
) {
  failures.push(
    `Compatible contribution invalid: ${compatibleContributionValidation.errors.join(
      "; "
    )}`
  );
}

if (
  compatibleContribution.capabilityId !==
  completeDefinition.capabilityId
) {
  failures.push(
    "Expected contribution and definition capabilityId to match."
  );
}

const matchingRequirement =
  completeDefinition.requiredContributions.find(
    (requirement) =>
      requirement.sourceMeasureId ===
      compatibleContribution.source.measureId
  );

if (!matchingRequirement) {
  failures.push(
    "Expected manual sourceMeasureId match."
  );
}

const output = {
  test:
    "Capability Definition Foundation",

  status:
    failures.length === 0
      ? "PASS"
      : "FAIL",

  complete: {
    capabilityId:
      completeDefinition.capabilityId,

    definitionStatus:
      completeDefinition.definitionStatus,

    requiredContributionCount:
      completeDefinition
        .requiredContributions.length,

    optionalContributionCount:
      completeDefinition
        .optionalContributions.length,

    warnings:
      completeValidation.warnings,
  },

  minimal: {
    label:
      minimalDefinition.label,

    warningCount:
      minimalValidation.warnings.length,
  },

  normalizedRequirement,

  duplicates: {
    requiredContributions:
      duplicateDefinition
        .requiredContributions,

    optionalContributions:
      duplicateDefinition
        .optionalContributions,
  },

  incoherentThresholds: {
    isValid:
      incoherentThresholdValidation.isValid,

    errors:
      incoherentThresholdValidation.errors,
  },

  invalid: {
    capabilityId:
      invalidDefinition.capabilityId,

    isValid:
      invalidValidation.isValid,

    errors:
      invalidValidation.errors,
  },

  weightWarning:
    weightWarningValidation.warnings,

  coverageWarning:
    coverageWarningValidation.warnings,

  manualCompatibility: {
    capabilityIdMatches:
      compatibleContribution.capabilityId ===
      completeDefinition.capabilityId,

    sourceMeasureMatch:
      Boolean(matchingRequirement),
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
  "test_build_capability_definition PASS"
);