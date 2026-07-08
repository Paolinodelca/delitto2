const {
  extractBasicEvidenceFromSource,
} = require("./extractBasicEvidenceFromSource");

const {
  extractBasicEvidenceFromProfessionalHistory,
} = require("./extractBasicEvidenceFromProfessionalHistory");

const {
  extractBasicEvidenceFromDiscovery,
} = require("./extractBasicEvidenceFromDiscovery");

const {
  extractBasicEvidenceFromUpdates,
} = require("./extractBasicEvidenceFromUpdates");

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function buildEvidenceStore(input = {}) {
  const now = new Date().toISOString();

  const isLegacySourcesArray = Array.isArray(input);
  const inputBundle = isLegacySourcesArray ? {} : asObject(input);

  const sources = isLegacySourcesArray
    ? asArray(input)
    : asArray(inputBundle.sources);

  const sourceEvidence = sources.flatMap((source) =>
    extractBasicEvidenceFromSource(source)
  );

  const professionalHistoryEvidence = isLegacySourcesArray
    ? []
    : extractBasicEvidenceFromProfessionalHistory(
        inputBundle.professionalHistory || {}
      );

  const discoveryEvidence = isLegacySourcesArray
    ? []
    : extractBasicEvidenceFromDiscovery(inputBundle.discovery || {});

  const updatesEvidence = isLegacySourcesArray
    ? []
    : extractBasicEvidenceFromUpdates(inputBundle.updates || []);

  const evidence = [
    ...sourceEvidence,
    ...professionalHistoryEvidence,
    ...discoveryEvidence,
    ...updatesEvidence,
  ];

  return {
    evidence,
    sources,
    statistics: {
      totalEvidence: evidence.length,
      sourceCount: sources.length,
    },
    metadata: {
      version: "1.0",
      createdAt: now,
      inputBundleVersion:
        inputBundle.metadata && inputBundle.metadata.version
          ? inputBundle.metadata.version
          : null,
    },
    extensions: {},
  };
}

module.exports = {
  buildEvidenceStore,
};