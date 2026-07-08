module.exports = {
  ...require("./buildEvidence"),
  ...require("./validateEvidence"),
  ...require("./buildEvidenceStore"),
  ...require("./validateEvidenceStore"),
  ...require("./healthBuildEvidenceStore"),
  ...require("./extractBasicEvidenceFromSource"),
  ...require("./extractBasicEvidenceFromProfessionalHistory"),
  ...require("./extractBasicEvidenceFromDiscovery"),
  ...require("./extractBasicEvidenceFromUpdates"),
  ...require("./buildEvidenceSummary"),
};