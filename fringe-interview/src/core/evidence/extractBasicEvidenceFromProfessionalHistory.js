const { buildEvidence } = require("./buildEvidence");

const PROFESSIONAL_HISTORY_FIELDS = [
  "experiences",
  "education",
  "skills",
  "achievements",
  "motivations",
  "preferences",
  "constraints",
  "targetDirections",
  "openNotes",
];

function extractBasicEvidenceFromProfessionalHistory(professionalHistory = {}) {
  const evidence = [];

  PROFESSIONAL_HISTORY_FIELDS.forEach((field) => {
    const items = Array.isArray(professionalHistory[field])
      ? professionalHistory[field]
      : [];

    items.forEach((item, index) => {
      evidence.push(
        buildEvidence({
          id: `evidence_professional_history_${field}_${index + 1}`,
          type: "professional_history_item",
          description: field,
          content: item,
          sourceId: "professional_history",
          sourceType: "structured_input",
          sourceRole: field,
          extractedBy: "professional_history_basic_extractor",
        })
      );
    });
  });

  return evidence;
}

module.exports = {
  extractBasicEvidenceFromProfessionalHistory,
};