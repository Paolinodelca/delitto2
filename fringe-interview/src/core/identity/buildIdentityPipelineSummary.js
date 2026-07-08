function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function buildIdentityPipelineSummary(identityPipelineResult = {}) {
  const evidenceSummary = asObject(identityPipelineResult.evidenceSummary);
  const professionalIdentityDraft = asObject(
    identityPipelineResult.professionalIdentityDraft
  );
  const professionalIdentityModel = asObject(
    identityPipelineResult.professionalIdentityModel
  );
  const representationReadiness = asObject(
    identityPipelineResult.representationReadiness
  );

  const representationStrategy =
    identityPipelineResult.representationStrategy || null;

  const coverage = asObject(professionalIdentityDraft.coverage);
  const confidence = asObject(professionalIdentityDraft.confidence);

  return {
    status: identityPipelineResult.status || "FAIL",

    evidence: {
      total: evidenceSummary.totalEvidence || 0,
      byType: asObject(evidenceSummary.byType),
      bySourceRole: asObject(evidenceSummary.bySourceRole),
    },

    identity: {
      status: professionalIdentityDraft.identityStatus || null,
      evidenceCoverage:
        typeof confidence.evidenceCoverage === "number"
          ? confidence.evidenceCoverage
          : null,
      populatedAreas: asArray(coverage.populatedAreas),
      missingAreas: asArray(coverage.missingAreas),
      gaps: asArray(professionalIdentityDraft.gaps),
    },

    model: {
      status: professionalIdentityModel.modelStatus || null,
      readiness: asObject(professionalIdentityModel.readiness),
      technicalProfile: asObject(professionalIdentityModel.technicalProfile),
    },

    representation: {
      readinessStatus: representationReadiness.status || null,
      canGenerate: asObject(representationReadiness.canGenerate),
      blockers: asArray(representationReadiness.blockers),
      warnings: asArray(representationReadiness.warnings),
    },

    strategy: representationStrategy
      ? {
          representationType: representationStrategy.representationType,
          canGenerate: representationStrategy.readiness.canGenerate,
          requiredEvidenceAreas: representationStrategy.requiredEvidenceAreas,
          recommendedFocusAreas: representationStrategy.recommendedFocusAreas,
          blockerCount: representationStrategy.readiness.blockers.length,
          warningCount: representationStrategy.readiness.warnings.length,
        }
      : null,

    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },

    extensions: {},
  };
}

module.exports = {
  buildIdentityPipelineSummary,
};