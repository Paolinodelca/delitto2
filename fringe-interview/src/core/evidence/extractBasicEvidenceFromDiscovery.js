const { buildEvidence } = require("./buildEvidence");

function extractBasicEvidenceFromDiscovery(discovery = {}) {
  const answers = Array.isArray(discovery.answers) ? discovery.answers : [];

  return answers.map((answer, index) =>
    buildEvidence({
      id: `evidence_discovery_answer_${index + 1}`,
      type: "discovery_answer",
      description: answer && answer.questionId ? answer.questionId : "discovery_answer",
      content: answer,
      sourceId: "discovery",
      sourceType: "structured_input",
      sourceRole: "discovery",
      extractedBy: "discovery_basic_extractor",
    })
  );
}

module.exports = {
  extractBasicEvidenceFromDiscovery,
};