const { buildInputSource } = require("./buildInputSource");

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function buildInputBundle(input = {}) {
  const now = new Date().toISOString();

  const professionalHistoryInput = asObject(input.professionalHistory);
  const discoveryInput = asObject(input.discovery);
  const contextInput = asObject(input.context);
  const metadataInput = asObject(input.metadata);

  return {
    sources: asArray(input.sources).map((source) => buildInputSource(source)),

    professionalHistory: {
      experiences: asArray(professionalHistoryInput.experiences),
      education: asArray(professionalHistoryInput.education),
      skills: asArray(professionalHistoryInput.skills),
      achievements: asArray(professionalHistoryInput.achievements),
      motivations: asArray(professionalHistoryInput.motivations),
      preferences: asArray(professionalHistoryInput.preferences),
      constraints: asArray(professionalHistoryInput.constraints),
      targetDirections: asArray(professionalHistoryInput.targetDirections),
      openNotes: asArray(professionalHistoryInput.openNotes),
    },

    discovery: {
      questions: asArray(discoveryInput.questions),
      answers: asArray(discoveryInput.answers),
      status: discoveryInput.status || "not_started",
    },

    updates: asArray(input.updates),

    context: {
      domain: contextInput.domain ?? null,
      application: contextInput.application ?? null,
      locale: contextInput.locale ?? null,
    },

    metadata: {
      version: metadataInput.version || "1.0",
      createdAt: metadataInput.createdAt || now,
      updatedAt: metadataInput.updatedAt || now,
    },

    extensions: asObject(input.extensions),
  };
}

module.exports = {
  buildInputBundle,
};