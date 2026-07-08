const { buildEvidence } = require("./buildEvidence");

function hasContent(value) {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

function extractBasicEvidenceFromSource(source = {}) {
  if (!source || typeof source !== "object" || !hasContent(source.content)) {
    return [];
  }

  return [
    buildEvidence({
      id: `evidence_${source.id || "source"}_content`,
      type: "source_content",
      description: source.label || source.sourceRole || source.type,
      content: source.content,
      sourceId: source.id,
      sourceType: source.type,
      sourceRole: source.sourceRole || null,
      confidence: null,
      extractedBy: "basic_extractor",
      extractedAt: new Date().toISOString(),
      metadata: {
        version: "1.0",
      },
      extensions: {},
    }),
  ];
}

module.exports = {
  extractBasicEvidenceFromSource,
};