const {
  buildComparisonResult,
} = require("../comparison/buildComparisonResult");

const DEFAULT_TARGET_AREAS = [
  "experiences",
  "skills",
  "achievements",
  "motivations",
  "targetDirections",
];

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildProfessionalVisibilityComparison({
  professionalIdentityModel = {},
  targetAreas,
} = {}) {
  const technicalProfile = asObject(professionalIdentityModel.technicalProfile);

  const observedAreas = asArray(technicalProfile.populatedAreas);
  const normalizedTargetAreas = Array.isArray(targetAreas)
    ? targetAreas
    : DEFAULT_TARGET_AREAS;

  const comparisonResult = buildComparisonResult({
    observed: observedAreas,
    reference: normalizedTargetAreas,
    policy: "representation_gap",
    perspective: "professional_visibility",
    constraints: {
      noLLM: true,
      noNarrative: true,
      noJudgement: true,
    },
  });

  return {
    visibilityStatus: "draft",

    observedAreas,
    targetAreas: normalizedTargetAreas,

    comparisonResult,

    visibilityMetrics: {
      coverageRatio: comparisonResult.metrics.coverageRatio,
      weightedCoverageRatio: comparisonResult.metrics.weightedCoverageRatio,
      matchedCount: comparisonResult.metrics.matchedCount,
      missingCount: comparisonResult.metrics.missingCount,
      unexpectedCount: comparisonResult.metrics.unexpectedCount,
    },

    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },

    extensions: {},
  };
}

module.exports = {
  buildProfessionalVisibilityComparison,
};