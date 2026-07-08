function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function buildInputSource(input = {}) {
  const now = new Date().toISOString();

  const qualityInput = asObject(input.quality);
  const provenanceInput = asObject(input.provenance);
  const metadataInput = asObject(input.metadata);

  return {
    id: input.id || "",
    type: input.type || "text",
    label: input.label ?? null,
    content: input.content ?? null,
    language: input.language ?? null,
    sourceRole: input.sourceRole ?? null,

    quality: {
      completeness: qualityInput.completeness ?? null,
      reliability: qualityInput.reliability ?? null,
      freshness: qualityInput.freshness ?? null,
    },

    provenance: {
      origin: provenanceInput.origin ?? null,
      providedBy: provenanceInput.providedBy ?? null,
      collectedAt: provenanceInput.collectedAt ?? null,
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
  buildInputSource,
};