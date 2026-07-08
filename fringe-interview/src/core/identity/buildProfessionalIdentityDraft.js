const OBSERVED_AREA_FIELDS = [
  "experiences",
  "education",
  "skills",
  "achievements",
  "motivations",
  "preferences",
  "constraints",
  "targetDirections",
  "discovery",
  "sources",
];

const SOURCE_ROLES_TO_SOURCES = ["cv", "job_description", "linkedin", "notes"];

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function createObservedAreas() {
  return {
    experiences: [],
    education: [],
    skills: [],
    achievements: [],
    motivations: [],
    preferences: [],
    constraints: [],
    targetDirections: [],
    discovery: [],
    sources: [],
  };
}

function buildProfessionalIdentityDraft({
  evidenceStore = {},
  evidenceSummary = {},
} = {}) {
  const evidence = asArray(evidenceStore.evidence);
  const observedAreas = createObservedAreas();
  const unmappedEvidence = [];

  evidence.forEach((item) => {
    const sourceRole = item.sourceRole;

    if (OBSERVED_AREA_FIELDS.includes(sourceRole)) {
      observedAreas[sourceRole].push(item);
      return;
    }

    if (SOURCE_ROLES_TO_SOURCES.includes(sourceRole)) {
      observedAreas.sources.push(item);
      return;
    }

    unmappedEvidence.push(item);
  });

  const populatedAreas = OBSERVED_AREA_FIELDS.filter(
    (area) => observedAreas[area].length > 0
  );

  const missingAreas = OBSERVED_AREA_FIELDS.filter(
    (area) => observedAreas[area].length === 0
  );

  const coverage = {
    observedAreaCount: populatedAreas.length,
    missingAreas,
    populatedAreas,
  };

  const evidenceCoverage =
    Math.round((populatedAreas.length / OBSERVED_AREA_FIELDS.length) * 100) /
    100;

  const gaps = missingAreas.map((area) => ({
    type: "missing_observed_area",
    area,
    message: `${area} has no observed evidence yet`,
  }));

  return {
    identityStatus: "draft",

    evidenceSummary,

    observedAreas,

    coverage,

    gaps,

    confidence: {
      overall: null,
      evidenceCoverage,
    },

    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },

    extensions: {
      unmappedEvidence,
    },
  };
}

module.exports = {
  buildProfessionalIdentityDraft,
};