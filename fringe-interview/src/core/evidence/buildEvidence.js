function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function buildEvidence(input = {}) {
  const now = new Date().toISOString();
  const metadataInput = asObject(input.metadata);

  return {
    id: input.id || `evidence_${Date.now()}`,
    type: input.type || "unknown",
    description: input.description ?? null,
    content: input.content ?? null,
    sourceId: input.sourceId ?? null,
    sourceType: input.sourceType ?? null,
    sourceRole: input.sourceRole ?? null,
    confidence: input.confidence ?? null,
    extractedBy: input.extractedBy ?? null,
    extractedAt: input.extractedAt || now,
    metadata: {
      version: metadataInput.version || "1.0",
      createdAt: metadataInput.createdAt || now,
      updatedAt: metadataInput.updatedAt || now,
    },
    extensions: asObject(input.extensions),
  };
}

module.exports = {
  buildEvidence,
};