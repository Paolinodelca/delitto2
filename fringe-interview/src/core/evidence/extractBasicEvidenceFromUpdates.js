const { buildEvidence } = require("./buildEvidence");

function extractBasicEvidenceFromUpdates(updates = []) {
  if (!Array.isArray(updates)) {
    return [];
  }

  return updates.map((update, index) =>
    buildEvidence({
      id: `evidence_update_${index + 1}`,
      type: "input_update",
      description: update && update.type ? update.type : "input_update",
      content: update,
      sourceId: "updates",
      sourceType: "structured_input",
      sourceRole: "updates",
      extractedBy: "updates_basic_extractor",
    })
  );
}

module.exports = {
  extractBasicEvidenceFromUpdates,
};