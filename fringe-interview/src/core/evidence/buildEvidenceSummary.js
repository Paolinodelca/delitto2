function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function incrementCounter(counter, key) {
  const normalizedKey = key || "unknown";
  counter[normalizedKey] = (counter[normalizedKey] || 0) + 1;
}

function buildEvidenceSummary(evidenceStore = {}) {
  const evidence = asArray(evidenceStore.evidence);
  const sourceIds = new Set();

  const summary = {
    totalEvidence: evidence.length,
    byType: {},
    bySourceRole: {},
    byExtractedBy: {},
    sourceIds: [],
    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },
    extensions: {},
  };

  evidence.forEach((item) => {
    incrementCounter(summary.byType, item.type);
    incrementCounter(summary.bySourceRole, item.sourceRole);
    incrementCounter(summary.byExtractedBy, item.extractedBy);

    if (item.sourceId) {
      sourceIds.add(item.sourceId);
    }
  });

  summary.sourceIds = Array.from(sourceIds);

  return summary;
}

module.exports = {
  buildEvidenceSummary,
};