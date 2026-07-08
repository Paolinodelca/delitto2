const { buildInputBundle } = require("../input/buildInputBundle");
const { buildEvidenceStore } = require("./buildEvidenceStore");
const { validateEvidenceStore } = require("./validateEvidenceStore");

function healthBuildEvidenceStore() {
  const inputBundle = buildInputBundle({
    sources: [
      {
        id: "source_cv_demo",
        type: "document",
        label: "Demo CV",
        content: "Demo CV content",
        language: "it",
        sourceRole: "cv",
      },
    ],
  });

  const evidenceStore = buildEvidenceStore(inputBundle);
  const validation = validateEvidenceStore(evidenceStore);

  return {
    module: "Evidence Store",
    status: validation.isValid ? "PASS" : "FAIL",
    statistics: {
      totalEvidence: evidenceStore.statistics.totalEvidence,
      sourceCount: evidenceStore.statistics.sourceCount,
    },
    validation,
  };
}

module.exports = {
  healthBuildEvidenceStore,
};