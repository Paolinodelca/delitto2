const ALLOWED_DIRECTIONS = [
  "supporting",
  "contradicting",
  "neutral",
];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeOptionalString(value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  return value;
}

function normalizeDirection(value) {
  return ALLOWED_DIRECTIONS.includes(value)
    ? value
    : "neutral";
}

function normalizeUnitInterval(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  if (value < 0) {
    return 0;
  }

  if (value > 1) {
    return 1;
  }

  return value;
}

function roundToFourDecimals(value) {
  return Math.round(value * 10000) / 10000;
}

function normalizeEvidenceIds(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value.filter(
        (evidenceId) =>
          typeof evidenceId === "string" &&
          evidenceId.trim().length > 0
      )
    )
  );
}

function normalizeContext(value) {
  const context = isObject(value) ? value : {};

  return {
    contextType: normalizeOptionalString(context.contextType),
    targetContextType: normalizeOptionalString(
      context.targetContextType
    ),
  };
}

function buildCapabilityContribution(input = {}) {
  const sourceInput = isObject(input) ? input : {};

  const contributionId = normalizeOptionalString(
    sourceInput.contributionId
  );

  const capabilityId = normalizeOptionalString(
    sourceInput.capabilityId
  );

  const sourceMeasureId = normalizeOptionalString(
    sourceInput.sourceMeasureId
  );

  const sourceMeasureValue = normalizeUnitInterval(
    sourceInput.sourceMeasureValue
  );

  const relevance = normalizeUnitInterval(sourceInput.relevance);

  const inferenceSupport = normalizeUnitInterval(
    sourceInput.inferenceSupport
  );

  const direction = normalizeDirection(sourceInput.direction);

  const evidenceIds = normalizeEvidenceIds(
    sourceInput.evidenceIds
  );

  const context = normalizeContext(sourceInput.context);

  const rationale = normalizeOptionalString(
    sourceInput.rationale
  );

  const contributionValue = roundToFourDecimals(
    sourceMeasureValue * relevance
  );

  const limitations = [];

  if (sourceMeasureValue === 0) {
    limitations.push(
      "Source measure did not provide positive strength."
    );
  }

  if (relevance === 0) {
    limitations.push(
      "Contribution relevance was not established."
    );
  }

  if (inferenceSupport < 0.5) {
    limitations.push(
      "Contribution inference support is limited."
    );
  }

  if (evidenceIds.length === 0) {
    limitations.push(
      "Contribution has no linked evidence."
    );
  }

  const inputMetadata = isObject(sourceInput.metadata)
    ? sourceInput.metadata
    : {};

  return {
    contributionId,

    contributionStatus: "draft",

    capabilityId,

    source: {
      type: "measure_result",
      measureId: sourceMeasureId,
      measureValue: sourceMeasureValue,
    },

    direction,

    strength: {
      rawValue: sourceMeasureValue,
      relevance,
      contributionValue,
    },

    inferenceSupport,

    context,

    evidenceIds,

    rationale,

    limitations,

    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
      ...inputMetadata,
    },

    extensions: isObject(sourceInput.extensions)
      ? sourceInput.extensions
      : {},
  };
}

module.exports = {
  buildCapabilityContribution,
};