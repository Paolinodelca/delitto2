function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildRepresentationReadiness({
  professionalIdentityModel = {},
} = {}) {
  const readiness = asObject(professionalIdentityModel.readiness);
  const technicalProfile = asObject(professionalIdentityModel.technicalProfile);

  const evidenceCoverage =
    typeof technicalProfile.evidenceCoverage === "number"
      ? technicalProfile.evidenceCoverage
      : 0;

  const missingAreas = asArray(technicalProfile.missingAreas);
  const populatedAreas = asArray(technicalProfile.populatedAreas);

  const blockers = [];

  if (readiness.needsMoreEvidence === true) {
    blockers.push({
      type: "needs_more_evidence",
      message:
        "Professional identity needs more evidence before reliable representation.",
    });
  }

  const warnings = missingAreas.map((area) => ({
    type: "missing_area",
    area,
    message: `${area} has no observed evidence yet`,
  }));

  return {
    status: "draft",

    canGenerate: {
      narrative: readiness.canGenerateNarrative === true,
      cv: readiness.canGenerateCV === true,
      linkedin: false,
      interviewPreparation: false,
    },

    blockers,

    warnings,

    evidenceCoverage,

    missingAreas,

    populatedAreas,

    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },

    extensions: {},
  };
}

module.exports = {
  buildRepresentationReadiness,
};