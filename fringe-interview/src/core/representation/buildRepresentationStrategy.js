function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function getRequiredEvidenceAreas(representationType) {
  if (representationType === "cv") {
    return ["experiences", "skills", "achievements", "targetDirections"];
  }

  if (representationType === "narrative") {
    return ["experiences", "motivations", "targetDirections", "discovery"];
  }

  return [];
}

function getCanGenerate({ representationType, representationReadiness }) {
  const canGenerate = asObject(representationReadiness.canGenerate);

  if (representationType === "cv") {
    return canGenerate.cv === true;
  }

  if (representationType === "narrative") {
    return canGenerate.narrative === true;
  }

  return false;
}

function buildRepresentationStrategy({
  professionalIdentityModel = {},
  representationReadiness = {},
  targetContext = null,
} = {}) {
  const normalizedTargetContext = targetContext || null;
  const representationType =
    normalizedTargetContext?.representationType || "cv";

  const technicalProfile = asObject(
    professionalIdentityModel.technicalProfile
  );

  const populatedAreas = asArray(technicalProfile.populatedAreas);
  const requiredEvidenceAreas = getRequiredEvidenceAreas(representationType);

  const recommendedFocusAreas = requiredEvidenceAreas.filter((area) =>
    populatedAreas.includes(area)
  );

  return {
    strategyStatus: "draft",

    representationType,

    targetContext: normalizedTargetContext,

    readiness: {
      canGenerate: getCanGenerate({
        representationType,
        representationReadiness,
      }),
      blockers: asArray(representationReadiness.blockers),
      warnings: asArray(representationReadiness.warnings),
    },

    requiredEvidenceAreas,

    recommendedFocusAreas,

    technicalProfile:
      professionalIdentityModel.technicalProfile || null,

    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },

    extensions: {},
  };
}

module.exports = {
  buildRepresentationStrategy,
};