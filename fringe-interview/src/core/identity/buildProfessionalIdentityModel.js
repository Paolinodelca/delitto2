function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function getEvidenceCoverage(professionalIdentityDraft) {
  const confidence = asObject(professionalIdentityDraft.confidence);
  return typeof confidence.evidenceCoverage === "number"
    ? confidence.evidenceCoverage
    : 0;
}

function buildProfessionalIdentityModel({
  professionalIdentityDraft = {},
} = {}) {
  const coverage = asObject(professionalIdentityDraft.coverage);
  const evidenceCoverage = getEvidenceCoverage(professionalIdentityDraft);

  return {
    modelStatus: "draft",

    sourceDraft: professionalIdentityDraft,

    technicalProfile: {
      evidenceCoverage,
      populatedAreas: asArray(coverage.populatedAreas),
      missingAreas: asArray(coverage.missingAreas),
      observedAreaCount:
        typeof coverage.observedAreaCount === "number"
          ? coverage.observedAreaCount
          : 0,
      gaps: asArray(professionalIdentityDraft.gaps),
    },

    readiness: {
      canGenerateNarrative: evidenceCoverage >= 0.4,
      canGenerateCV: evidenceCoverage >= 0.5,
      needsMoreEvidence: evidenceCoverage < 0.5,
    },

    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },

    extensions: {},
  };
}

module.exports = {
  buildProfessionalIdentityModel,
};