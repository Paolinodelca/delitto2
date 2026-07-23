const crypto = require("crypto");
const { validateDimensionContribution } = require("./validateDimensionContribution");
const { buildDimensionKnowledgeState } = require("./buildDimensionKnowledgeState");
const { validateDimensionKnowledgeState } = require("./validateDimensionKnowledgeState");

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validIso(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString() === value;
}

function roundUnit(value) {
  return Math.round(Math.min(1, Math.max(0, value)) * 1e12) / 1e12;
}

function stableFingerprint(parts) {
  return crypto.createHash("sha256").update(parts.join("|")).digest("hex");
}

function fail(code, message, details) {
  const error = new Error(message);
  error.code = code;
  if (details !== undefined) error.details = details;
  throw error;
}

function aggregateDimensionContributions(dimensionId, contributions, options = {}) {
  const normalizedDimensionId = validString(dimensionId) ? dimensionId.trim() : null;
  if (!normalizedDimensionId) {
    fail("INVALID_DIMENSION_ID", "dimensionId must be a non-empty string.");
  }
  if (!Array.isArray(contributions)) {
    fail("INVALID_DIMENSION_CONTRIBUTIONS", "contributions must be an array.");
  }
  if (!isObject(options)) {
    fail("INVALID_DIMENSION_AGGREGATION_OPTIONS", "options must be an object.");
  }
  if (!validIso(options.now)) {
    fail("INVALID_DIMENSION_AGGREGATION_OPTIONS", "options.now must be a valid ISO timestamp.");
  }

  const seenIds = new Set();
  for (let index = 0; index < contributions.length; index += 1) {
    const contribution = contributions[index];
    const validation = validateDimensionContribution(contribution);
    if (!validation.valid) {
      fail(
        "INVALID_DIMENSION_CONTRIBUTION",
        `contributions[${index}] is invalid: ${validation.errors.join(" | ")}`,
        { index, validation },
      );
    }
    if (contribution.dimensionId !== normalizedDimensionId) {
      fail(
        "MIXED_DIMENSION_CONTRIBUTIONS",
        `contributions[${index}].dimensionId must equal ${normalizedDimensionId}.`,
        { index, actualDimensionId: contribution.dimensionId },
      );
    }
    if (seenIds.has(contribution.id)) {
      fail("DUPLICATE_DIMENSION_CONTRIBUTION", `Duplicate DimensionContribution id: ${contribution.id}.`);
    }
    seenIds.add(contribution.id);
  }

  const sorted = [...contributions].sort((left, right) => left.id.localeCompare(right.id));
  const contributionRefs = sorted.map((item) => `dimensionContribution:${item.id}`);
  const measurementResultRefs = [...new Set(sorted.map((item) => item.provenance.measurementResultRef))].sort();
  const measurementIds = [...new Set(sorted.map((item) => item.measurementId))].sort();

  if (sorted.length === 0) {
    const unknownState = buildDimensionKnowledgeState({
      dimensionId: normalizedDimensionId,
      dimensionType: "elementary",
      stateType: "unknown",
      measurementCount: 0,
      independentMeasurementCount: 0,
      resultCount: 0,
      sourceDiversity: 0,
      supportingMeasurementResultRefs: [],
      metadata: { version: "1.0", createdAt: options.now, updatedAt: options.now },
      extensions: {
        aggregation: {
          strategy: "confidence_weighted_signed_mean_v1",
          contributionRefs: [],
          fingerprint: stableFingerprint([normalizedDimensionId, "empty", "confidence_weighted_signed_mean_v1"]),
        },
      },
    }, { now: options.now });
    const validation = validateDimensionKnowledgeState(unknownState);
    if (!validation.valid) {
      fail("INVALID_GENERATED_DIMENSION_KNOWLEDGE_STATE", validation.errors.join(" | "), validation);
    }
    return unknownState;
  }

  let weightedSignedSum = 0;
  let confidenceSum = 0;
  let supportingWeight = 0;
  let contradictingWeight = 0;
  let confidenceTotal = 0;

  for (const contribution of sorted) {
    const sign = contribution.contributionType === "supporting" ? 1 : -1;
    const effectiveWeight = contribution.confidence;
    weightedSignedSum += sign * contribution.contributionValue * effectiveWeight;
    confidenceSum += effectiveWeight;
    confidenceTotal += contribution.confidence;
    if (sign > 0) supportingWeight += contribution.contributionValue * effectiveWeight;
    else contradictingWeight += contribution.contributionValue * effectiveWeight;
  }

  const signedEstimate = confidenceSum === 0 ? 0 : weightedSignedSum / confidenceSum;
  const estimate = roundUnit((signedEstimate + 1) / 2);
  const confidence = roundUnit(confidenceTotal / sorted.length);
  const totalDirectionalWeight = supportingWeight + contradictingWeight;
  const consistency = totalDirectionalWeight === 0
    ? 0
    : roundUnit(Math.abs(supportingWeight - contradictingWeight) / totalDirectionalWeight);
  const hasSupporting = sorted.some((item) => item.contributionType === "supporting" && item.contributionValue > 0);
  const hasContradicting = sorted.some((item) => item.contributionType === "contradicting" && item.contributionValue > 0);
  let direction;
  if (hasSupporting && hasContradicting) direction = "mixed";
  else if (signedEstimate < 0) direction = "contradicting";
  else direction = "supporting";

  // Foundation coverage is deliberately conservative: available contributions establish
  // partial observation, but their count alone never implies complete dimensional coverage.
  const coverage = 0.5;
  const fingerprint = stableFingerprint([
    normalizedDimensionId,
    "confidence_weighted_signed_mean_v1",
    ...sorted.map((item) => item.id),
  ]);

  const state = buildDimensionKnowledgeState({
    dimensionId: normalizedDimensionId,
    dimensionType: "elementary",
    stateType: "observed",
    estimate,
    direction,
    coverage,
    confidence,
    consistency,
    stability: null,
    evidenceQuality: null,
    sourceReliability: null,
    measurementCount: measurementIds.length,
    independentMeasurementCount: measurementIds.length,
    resultCount: sorted.length,
    sourceDiversity: measurementResultRefs.length,
    contextDistribution: [],
    contradictions: hasSupporting && hasContradicting ? [{
      id: `direction_conflict_${fingerprint.slice(0, 16)}`,
      type: "direction_conflict",
      description: "Supporting and contradicting DimensionContribution values coexist.",
      relatedRefs: contributionRefs,
      severity: consistency < 0.34 ? "high" : consistency < 0.67 ? "moderate" : "low",
      metadata: {},
    }] : [],
    supportingMeasurementResultRefs: measurementResultRefs,
    supportingCapabilityResultRefs: [],
    derivationTrace: null,
    metadata: { version: "1.0", createdAt: options.now, updatedAt: options.now },
    extensions: {
      aggregation: {
        strategy: "confidence_weighted_signed_mean_v1",
        signedEstimate: Math.round(signedEstimate * 1e12) / 1e12,
        zeroConfidenceBehavior: confidenceSum === 0 ? "neutral_midpoint" : "not_applied",
        coveragePolicy: "conservative_partial_fixed_v1",
        contributionRefs,
        fingerprint,
      },
    },
  }, { now: options.now });

  const validation = validateDimensionKnowledgeState(state);
  if (!validation.valid) {
    fail("INVALID_GENERATED_DIMENSION_KNOWLEDGE_STATE", validation.errors.join(" | "), validation);
  }
  return state;
}

module.exports = { aggregateDimensionContributions };
