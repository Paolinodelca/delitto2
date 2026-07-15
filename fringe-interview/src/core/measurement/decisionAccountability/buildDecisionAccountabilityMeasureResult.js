const {
  buildDecisionAccountabilityMeasureDefinition,
} = require("./buildDecisionAccountabilityMeasureDefinition");

const {
  validateDecisionAccountabilityObservation,
} = require("./validateDecisionAccountabilityObservation");

const {
  validateMeasurementDefinition,
} = require("../validateMeasurementDefinition");

const DECISION_AUTHORITY_SCORES = {
  none: 0,
  recommendation: 0.3,
  shared: 0.7,
  final: 1,
};

const CONSEQUENCE_SCOPE_SCORES = {
  individual_task: 0.15,
  team: 0.4,
  function: 0.65,
  site: 0.85,
  organization: 1,
};

const ACCOUNTABILITY_EVIDENCE_SCORES = {
  claimed: 0.15,
  implicit: 0.4,
  explicit: 0.75,
  explicit_with_outcomes: 1,
};

const COMPONENT_ORDER = [
  "decisionAuthority",
  "consequenceScope",
  "accountabilityEvidence",
  "responsibilityContinuity",
];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function roundToFourDecimals(value) {
  return Math.round(value * 10000) / 10000;
}

function addUnique(list, message) {
  if (!list.includes(message)) list.push(message);
}

function getMeasureBand(score, thresholds) {
  if (score < thresholds.weak) return "not_supported";
  if (score < thresholds.moderate) return "weak";
  if (score < thresholds.strong) return "moderate";
  if (score < thresholds.veryStrong) return "strong";
  return "very_strong";
}

function getInferenceSupportBand(value) {
  if (value === 0) return "none";
  if (value < 0.4) return "low";
  if (value < 0.6) return "moderate";
  if (value < 0.8) return "high";
  return "very_high";
}

function getStrongestComponent(components) {
  return COMPONENT_ORDER.reduce((best, componentId) => {
    if (best === null || components[componentId] > components[best]) {
      return componentId;
    }
    return best;
  }, null);
}

function getWeakestComponent(components) {
  return COMPONENT_ORDER.reduce((weakest, componentId) => {
    if (weakest === null || components[componentId] < components[weakest]) {
      return componentId;
    }
    return weakest;
  }, null);
}

function buildDecisionAccountabilityMeasureResult({
  observation = {},
  definition = null,
} = {}) {
  const effectiveDefinition =
    definition === null || definition === undefined
      ? buildDecisionAccountabilityMeasureDefinition()
      : definition;

  const observationValidation =
    validateDecisionAccountabilityObservation(observation);

  const definitionValidation =
    validateMeasurementDefinition(effectiveDefinition);

  const definitionIsCompatible =
    definitionValidation.isValid === true &&
    effectiveDefinition.dimensionId === "decision_accountability" &&
    isObject(effectiveDefinition.thresholds) &&
    isObject(effectiveDefinition.provenance);

  const inputIsValid =
    observationValidation.isValid === true && definitionIsCompatible;

  const weights =
    isObject(effectiveDefinition.aggregation) &&
    isObject(effectiveDefinition.aggregation.weights)
      ? effectiveDefinition.aggregation.weights
      : {};

  const benchmarkReference =
    isObject(effectiveDefinition.benchmark) &&
    isObject(effectiveDefinition.benchmark.reference)
      ? effectiveDefinition.benchmark.reference
      : {};

  const thresholds = isObject(effectiveDefinition.thresholds)
    ? effectiveDefinition.thresholds
    : { weak: 0.3, moderate: 0.5, strong: 0.7, veryStrong: 0.85 };

  const decisionAuthorityScore =
    DECISION_AUTHORITY_SCORES[observation.decisionAuthority] || 0;

  const consequenceScopeScore =
    CONSEQUENCE_SCOPE_SCORES[observation.consequenceScope] || 0;

  const accountabilityEvidenceScore =
    ACCOUNTABILITY_EVIDENCE_SCORES[observation.accountabilityEvidence] || 0;

  const benchmarkMonths =
    typeof benchmarkReference.responsibilityContinuityMonths === "number" &&
    Number.isFinite(benchmarkReference.responsibilityContinuityMonths) &&
    benchmarkReference.responsibilityContinuityMonths > 0
      ? benchmarkReference.responsibilityContinuityMonths
      : 24;

  const continuityMonths =
    typeof observation.responsibilityContinuityMonths === "number" &&
    Number.isFinite(observation.responsibilityContinuityMonths) &&
    observation.responsibilityContinuityMonths >= 0
      ? observation.responsibilityContinuityMonths
      : 0;

  const responsibilityContinuityScore = Math.min(
    continuityMonths / benchmarkMonths,
    1
  );

  const components = {
    decisionAuthority: decisionAuthorityScore,
    consequenceScope: consequenceScopeScore,
    accountabilityEvidence: accountabilityEvidenceScore,
    responsibilityContinuity: responsibilityContinuityScore,
  };

  const calculatedScore = roundToFourDecimals(
    clamp(
      decisionAuthorityScore * (weights.decisionAuthority || 0) +
        consequenceScopeScore * (weights.consequenceScope || 0) +
        accountabilityEvidenceScore * (weights.accountabilityEvidence || 0) +
        responsibilityContinuityScore *
          (weights.responsibilityContinuity || 0),
      0,
      1
    )
  );

  const inferenceInputs = isObject(observation.inferenceSupportInputs)
    ? observation.inferenceSupportInputs
    : {};

  const inferenceSupportValue = roundToFourDecimals(
    clamp(
      (inferenceInputs.evidenceQuality || 0) * 0.3 +
        (inferenceInputs.sourceConvergence || 0) * 0.25 +
        (inferenceInputs.consistency || 0) * 0.25 +
        (inferenceInputs.coverage || 0) * 0.2,
      0,
      1
    )
  );

  const resultStatus = !inputIsValid
    ? "invalid"
    : observation.observationStatus === "not_observed"
      ? "not_observed"
      : "draft";

  const score = resultStatus === "not_observed"
    ? 0
    : calculatedScore;

  const notes = [];

  if (observation.decisionAuthority === "final") {
    notes.push("Final decision authority was observed.");
  }

  if (
    observation.consequenceScope === "site" ||
    observation.consequenceScope === "organization"
  ) {
    notes.push("Observed decisions affected a broad organizational scope.");
  }

  if (observation.accountabilityEvidence === "explicit_with_outcomes") {
    notes.push(
      "Decision responsibility was explicitly connected to observable outcomes."
    );
  }

  if (continuityMonths >= benchmarkMonths) {
    notes.push(
      "Observed responsibility continuity reached the configured benchmark."
    );
  }

  if (inferenceSupportValue < 0.5) {
    notes.push("Decision accountability inference support is limited.");
  }

  const limitations = Array.isArray(observation.limitations)
    ? Array.from(new Set(observation.limitations))
    : [];

  if (resultStatus === "not_observed") {
    addUnique(limitations, "Decision accountability was not observed.");
  }

  if (resultStatus === "invalid") {
    addUnique(
      limitations,
      "Decision accountability measure was built from invalid input."
    );
  }

  if (inferenceSupportValue < 0.5) {
    addUnique(
      limitations,
      "Decision accountability result has limited inference support."
    );
  }

  return {
    measureId: "decision_accountability",
    resultStatus,
    observationId:
      typeof observation.observationId === "string"
        ? observation.observationId
        : null,
    score,
    band: getMeasureBand(score, thresholds),
    components: {
      decisionAuthorityScore,
      consequenceScopeScore,
      accountabilityEvidenceScore,
      responsibilityContinuityScore,
    },
    weights: {
      decisionAuthority: weights.decisionAuthority || 0,
      consequenceScope: weights.consequenceScope || 0,
      accountabilityEvidence: weights.accountabilityEvidence || 0,
      responsibilityContinuity: weights.responsibilityContinuity || 0,
    },
    benchmarkReference: {
      responsibilityContinuityMonths: benchmarkMonths,
    },
    inferenceSupport: {
      value: inferenceSupportValue,
      band: getInferenceSupportBand(inferenceSupportValue),
      components: {
        evidenceQuality: inferenceInputs.evidenceQuality || 0,
        sourceConvergence: inferenceInputs.sourceConvergence || 0,
        consistency: inferenceInputs.consistency || 0,
        coverage: inferenceInputs.coverage || 0,
      },
    },
    evidenceIds: Array.isArray(observation.evidenceIds)
      ? [...observation.evidenceIds]
      : [],
    context: isObject(observation.context) ? { ...observation.context } : {},
    explainability: {
      strongestComponent:
        resultStatus === "invalid" ? null : getStrongestComponent(components),
      weakestComponent:
        resultStatus === "invalid" ? null : getWeakestComponent(components),
      notes,
    },
    limitations,
    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },
    extensions: {
      observationValidation,
      definitionValidation,
    },
  };
}

module.exports = { buildDecisionAccountabilityMeasureResult };
