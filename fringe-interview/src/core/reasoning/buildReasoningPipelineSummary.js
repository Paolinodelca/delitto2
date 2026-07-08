function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildReasoningPipelineSummary(reasoningPipeline = {}) {
  const reasoningContext = asObject(reasoningPipeline.reasoningContext);
  const representationGapReasoning = asObject(
    reasoningPipeline.representationGapReasoning
  );

  const reasoningScope = asObject(reasoningContext.reasoningScope);
  const readiness = asObject(representationGapReasoning.readiness);
  const metrics = asObject(representationGapReasoning.metrics);

  const gaps = asArray(representationGapReasoning.gaps);
  const opportunities = asArray(representationGapReasoning.opportunities);
  const priorities = asArray(representationGapReasoning.priorities);

  return {
    status: reasoningPipeline.status || "FAIL",
    reasoningStatus: reasoningPipeline.reasoningStatus || null,

    representation: {
      type: reasoningScope.representationType || null,
      canGenerate: readiness.canGenerate === true,
    },

    reasoning: {
      gapCount: gaps.length,
      opportunityCount: opportunities.length,
      priorityCount: priorities.length,
      coverageRatio:
        typeof metrics.coverageRatio === "number"
          ? metrics.coverageRatio
          : 0,
      weightedCoverageRatio:
        typeof metrics.weightedCoverageRatio === "number"
          ? metrics.weightedCoverageRatio
          : 0,
      gaps,
      opportunities,
      priorities,
    },

    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },

    extensions: {},
  };
}

module.exports = {
  buildReasoningPipelineSummary,
};