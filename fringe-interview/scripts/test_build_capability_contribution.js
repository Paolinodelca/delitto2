const {
  buildCapabilityContribution,
} = require("../src/core/capability/buildCapabilityContribution");

const {
  validateCapabilityContribution,
} = require("../src/core/capability/validateCapabilityContribution");

const {
  buildMeasurementDefinition,
} = require("../src/core/measurement/buildMeasurementDefinition");

const {
  buildManagementObservation,
} = require("../src/core/measurement/buildManagementObservation");

const {
  buildMeasureResult,
} = require("../src/core/measurement/buildMeasureResult");

const {
  validateMeasureResult,
} = require("../src/core/measurement/validateMeasureResult");

const failures = [];

/*
 * Scenario A — Supporting contribution
 */
const supportingContribution =
  buildCapabilityContribution({
    contributionId:
      "contribution_supporting_001",

    capabilityId: "leadership",

    sourceMeasureId:
      "management_scope",

    sourceMeasureValue: 0.75,

    direction: "supporting",

    relevance: 0.8,

    inferenceSupport: 0.9,

    context: {
      contextType:
        "production_management",

      targetContextType:
        "production_management",
    },

    evidenceIds: ["ev_001"],

    rationale:
      "Management scope is relevant to the target leadership context.",
  });

const supportingValidation =
  validateCapabilityContribution(
    supportingContribution
  );

if (!supportingValidation.isValid) {
  failures.push(
    `Supporting contribution invalid: ${supportingValidation.errors.join(
      "; "
    )}`
  );
}

if (
  supportingContribution.direction !==
  "supporting"
) {
  failures.push(
    'Expected direction === "supporting".'
  );
}

if (
  supportingContribution.strength
    .contributionValue !== 0.6
) {
  failures.push(
    "Expected supporting contributionValue === 0.6."
  );
}

if (
  supportingContribution.inferenceSupport !==
  0.9
) {
  failures.push(
    "Expected inferenceSupport === 0.9."
  );
}

if (
  supportingContribution.limitations.length !==
  0
) {
  failures.push(
    "Expected supporting limitations.length === 0."
  );
}

/*
 * Scenario B — Contradicting contribution
 */
const contradictingContribution =
  buildCapabilityContribution({
    contributionId:
      "contribution_contradicting_001",

    capabilityId: "leadership",

    sourceMeasureId:
      "conflict_handling",

    sourceMeasureValue: 0.7,

    direction: "contradicting",

    relevance: 0.9,

    inferenceSupport: 0.8,

    evidenceIds: ["ev_002"],
  });

const contradictingValidation =
  validateCapabilityContribution(
    contradictingContribution
  );

if (!contradictingValidation.isValid) {
  failures.push(
    `Contradicting contribution invalid: ${contradictingValidation.errors.join(
      "; "
    )}`
  );
}

if (
  contradictingContribution.direction !==
  "contradicting"
) {
  failures.push(
    'Expected direction === "contradicting".'
  );
}

if (
  contradictingContribution.strength
    .contributionValue !== 0.63
) {
  failures.push(
    "Expected contradicting contributionValue === 0.63."
  );
}

if (
  contradictingContribution.strength
    .contributionValue < 0
) {
  failures.push(
    "Expected contradicting contributionValue to remain positive."
  );
}

/*
 * Scenario C — Supporto inferenziale debole
 */
const weakInferenceContribution =
  buildCapabilityContribution({
    contributionId:
      "contribution_weak_inference_001",

    capabilityId: "leadership",

    sourceMeasureId:
      "management_scope",

    sourceMeasureValue: 0.7,

    direction: "supporting",

    relevance: 0.8,

    inferenceSupport: 0.3,

    evidenceIds: ["ev_003"],

    rationale:
      "Explicit test rationale.",
  });

const weakInferenceValidation =
  validateCapabilityContribution(
    weakInferenceContribution
  );

if (!weakInferenceValidation.isValid) {
  failures.push(
    "Expected weak-inference contribution to remain valid."
  );
}

if (
  weakInferenceValidation.warnings.length === 0
) {
  failures.push(
    "Expected weak-inference warnings."
  );
}

if (
  !weakInferenceContribution.limitations.includes(
    "Contribution inference support is limited."
  )
) {
  failures.push(
    "Expected limited inference-support limitation."
  );
}

/*
 * Scenario D — Nessuna evidenza
 */
const noEvidenceContribution =
  buildCapabilityContribution({
    contributionId:
      "contribution_no_evidence_001",

    capabilityId: "leadership",

    sourceMeasureId:
      "management_scope",

    sourceMeasureValue: 0.6,

    direction: "supporting",

    relevance: 0.7,

    inferenceSupport: 0.8,

    evidenceIds: [],

    rationale:
      "Contribution deliberately has no evidence.",
  });

const noEvidenceValidation =
  validateCapabilityContribution(
    noEvidenceContribution
  );

if (!noEvidenceValidation.isValid) {
  failures.push(
    "Expected no-evidence contribution to remain valid."
  );
}

if (
  noEvidenceValidation.warnings.length === 0
) {
  failures.push(
    "Expected no-evidence warnings."
  );
}

if (
  !noEvidenceContribution.limitations.includes(
    "Contribution has no linked evidence."
  )
) {
  failures.push(
    "Expected no-linked-evidence limitation."
  );
}

/*
 * Scenario E — Normalizzazione
 */
const normalizedContribution =
  buildCapabilityContribution({
    contributionId:
      "contribution_normalized_001",

    capabilityId: "leadership",

    sourceMeasureId:
      "management_scope",

    sourceMeasureValue: 1.4,

    direction: "invalid",

    relevance: -0.2,

    inferenceSupport: 2,
  });

const normalizedValidation =
  validateCapabilityContribution(
    normalizedContribution
  );

if (!normalizedValidation.isValid) {
  failures.push(
    `Normalized contribution invalid: ${normalizedValidation.errors.join(
      "; "
    )}`
  );
}

if (
  normalizedContribution.source.measureValue !==
  1
) {
  failures.push(
    "Expected source.measureValue === 1."
  );
}

if (
  normalizedContribution.direction !==
  "neutral"
) {
  failures.push(
    'Expected direction === "neutral".'
  );
}

if (
  normalizedContribution.strength.relevance !==
  0
) {
  failures.push(
    "Expected strength.relevance === 0."
  );
}

if (
  normalizedContribution.strength
    .contributionValue !== 0
) {
  failures.push(
    "Expected strength.contributionValue === 0."
  );
}

if (
  normalizedContribution.inferenceSupport !==
  1
) {
  failures.push(
    "Expected inferenceSupport === 1."
  );
}

if (
  normalizedValidation.warnings.length === 0
) {
  failures.push(
    "Expected normalized contribution warnings."
  );
}

/*
 * Scenario F — ID mancanti
 */
const missingIdsContribution =
  buildCapabilityContribution({});

const missingIdsValidation =
  validateCapabilityContribution(
    missingIdsContribution
  );

if (
  missingIdsContribution.contributionId !==
  null
) {
  failures.push(
    "Expected contributionId === null."
  );
}

if (
  missingIdsContribution.capabilityId !==
  null
) {
  failures.push(
    "Expected capabilityId === null."
  );
}

if (
  missingIdsValidation.isValid !== false
) {
  failures.push(
    "Expected missing-IDs contribution to be invalid."
  );
}

if (
  !missingIdsValidation.errors.some(
    (error) =>
      error.includes("contributionId")
  )
) {
  failures.push(
    "Expected errors to contain contributionId."
  );
}

if (
  !missingIdsValidation.errors.some(
    (error) =>
      error.includes("capabilityId")
  )
) {
  failures.push(
    "Expected errors to contain capabilityId."
  );
}

/*
 * Compatibilità esplicita con MeasureResult
 */
const definition =
  buildMeasurementDefinition(
    "management_scope"
  );

const managementObservation =
  buildManagementObservation({
    observationId:
      "management_for_contribution_001",

    teamSize: 20,

    durationYears: 4,

    responsibilityType: "direct",

    managementLayer: "single_layer",

    contextType:
      "technical_office",

    contextRelevance: 0.8,

    evidenceIds: [
      "ev_measure_001",
      "ev_measure_002",
    ],

    confidence: 0.85,
  });

const measureResult =
  buildMeasureResult({
    definition,
    observations: [
      managementObservation,
    ],
  });

const measureResultValidation =
  validateMeasureResult(measureResult);

if (!measureResultValidation.isValid) {
  failures.push(
    `MeasureResult invalid: ${measureResultValidation.errors.join(
      "; "
    )}`
  );
}

const mappedContribution =
  buildCapabilityContribution({
    contributionId:
      "contribution_from_measure_001",

    capabilityId: "leadership",

    sourceMeasureId:
      measureResult.dimensionId,

    sourceMeasureValue:
      measureResult.value,

    direction: "supporting",

    relevance: 0.8,

    inferenceSupport:
      measureResult.confidence,

    context: {
      contextType:
        managementObservation.contextType,

      targetContextType:
        "production_management",
    },

    evidenceIds:
      measureResult.evidenceIds,

    rationale:
      "Explicit test mapping from MeasureResult.",
  });

const mappedValidation =
  validateCapabilityContribution(
    mappedContribution
  );

if (!mappedValidation.isValid) {
  failures.push(
    `Mapped contribution invalid: ${mappedValidation.errors.join(
      "; "
    )}`
  );
}

if (
  mappedContribution.source.measureId !==
  "management_scope"
) {
  failures.push(
    'Expected mapped source.measureId === "management_scope".'
  );
}

if (
  mappedContribution.source.measureValue !==
  measureResult.value
) {
  failures.push(
    "Expected mapped measureValue to equal MeasureResult value."
  );
}

if (
  mappedContribution.inferenceSupport !==
  measureResult.confidence
) {
  failures.push(
    "Expected mapped inferenceSupport to equal MeasureResult confidence."
  );
}

if (
  JSON.stringify(
    mappedContribution.evidenceIds
  ) !==
  JSON.stringify(
    measureResult.evidenceIds
  )
) {
  failures.push(
    "Expected mapped evidenceIds to match MeasureResult evidenceIds."
  );
}

const output = {
  test:
    "Capability Contribution Contract Foundation",

  status:
    failures.length === 0
      ? "PASS"
      : "FAIL",

  supporting: {
    direction:
      supportingContribution.direction,

    contributionValue:
      supportingContribution.strength
        .contributionValue,

    inferenceSupport:
      supportingContribution.inferenceSupport,

    limitations:
      supportingContribution.limitations,
  },

  contradicting: {
    direction:
      contradictingContribution.direction,

    contributionValue:
      contradictingContribution.strength
        .contributionValue,
  },

  weakInference: {
    warnings:
      weakInferenceValidation.warnings,

    limitations:
      weakInferenceContribution.limitations,
  },

  noEvidence: {
    warnings:
      noEvidenceValidation.warnings,

    limitations:
      noEvidenceContribution.limitations,
  },

  normalized: {
    sourceMeasureValue:
      normalizedContribution.source
        .measureValue,

    direction:
      normalizedContribution.direction,

    relevance:
      normalizedContribution.strength
        .relevance,

    contributionValue:
      normalizedContribution.strength
        .contributionValue,

    inferenceSupport:
      normalizedContribution
        .inferenceSupport,

    warnings:
      normalizedValidation.warnings,
  },

  mappedFromMeasureResult: {
    measureId:
      mappedContribution.source.measureId,

    measureValue:
      mappedContribution.source
        .measureValue,

    inferenceSupport:
      mappedContribution
        .inferenceSupport,

    evidenceIds:
      mappedContribution.evidenceIds,
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
  "test_build_capability_contribution PASS"
);