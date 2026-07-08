const {
  buildComparisonResult,
} = require("../comparison/buildComparisonResult");

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildRepresentationGapReasoning({ reasoningContext = {} } = {}) {
  const inputs = asObject(reasoningContext.inputs);
  const reasoningScope = asObject(reasoningContext.reasoningScope);
  const constraints = asObject(reasoningContext.constraints);

  const representationStrategy = asObject(inputs.representationStrategy);
  const strategyReadiness = asObject(representationStrategy.readiness);

  const blockers = asArray(strategyReadiness.blockers);
  const warnings = asArray(strategyReadiness.warnings);

  const observed = asArray(representationStrategy.recommendedFocusAreas);
  const reference = asArray(representationStrategy.requiredEvidenceAreas);

  const comparisonResult = buildComparisonResult({
    observed,
    reference,
    policy: "representation_gap",
    perspective: reasoningScope.representationType || null,
    constraints,
  });

  const gaps = warnings.map((warning) => ({
    type: "representation_warning",
    source: "representation_strategy",
    message: warning && warning.message ? warning.message : "",
    area: warning && warning.area ? warning.area : null,
  }));

  const opportunities = comparisonResult.result.matched.map((area) => ({
    type: "focus_area_available",
    area,
    reason: "Area has observed evidence and can support representation.",
  }));

  const priorities = comparisonResult.result.missing.map((area) => ({
    type: "missing_required_area",
    area,
    priority: "high",
    reason: "Required area is not sufficiently supported by observed evidence.",
  }));

  const metrics = {
    coverageRatio: comparisonResult.metrics.coverageRatio,
    weightedCoverageRatio: comparisonResult.metrics.weightedCoverageRatio,
    matchedCount: comparisonResult.metrics.matchedCount,
    missingCount: comparisonResult.metrics.missingCount,
    priorityCount: priorities.length,
    opportunityCount: opportunities.length,
  };

  return {
    reasoningStatus: "draft",

    representationType: reasoningScope.representationType || null,

    readiness: {
      canGenerate: strategyReadiness.canGenerate === true,
      blockerCount: blockers.length,
      warningCount: warnings.length,
    },

    comparisonResult,

    metrics,

    gaps,

    opportunities,

    priorities,

    constraints,

    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },

    extensions: {},
  };
}

module.exports = {
  buildRepresentationGapReasoning,
};