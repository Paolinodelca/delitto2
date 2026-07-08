const { buildComparisonPolicy } = require("./buildComparisonPolicy");

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function uniqueArray(values) {
  return Array.from(new Set(values));
}

function roundToTwoDecimals(value) {
  return Math.round(value * 100) / 100;
}

function resolvePolicy(policy) {
  if (typeof policy === "string") {
    return buildComparisonPolicy(policy);
  }

  if (policy && typeof policy === "object" && !Array.isArray(policy)) {
    return policy;
  }

  return buildComparisonPolicy("unknown");
}

function normalizeForComparison(value, policy) {
  if (typeof value !== "string") {
    return value;
  }

  if (policy?.matching?.caseSensitive === false) {
    return value.toLowerCase();
  }

  return value;
}

function getWeightForValue(value, policy) {
  const weights = asObject(policy.weights);
  const byValue = asObject(weights.byValue);
  const defaultWeight =
    typeof weights.default === "number" ? weights.default : 1;

  if (Object.prototype.hasOwnProperty.call(byValue, value)) {
    return typeof byValue[value] === "number" ? byValue[value] : defaultWeight;
  }

  return defaultWeight;
}

function buildComparisonResult({
  observed,
  reference,
  policy,
  perspective,
  constraints,
} = {}) {
  const resolvedPolicy = resolvePolicy(policy);

  const observedItems = uniqueArray(asArray(observed));
  const referenceItems = uniqueArray(asArray(reference));

  const observedLookup = new Map(
    observedItems.map((item) => [
      normalizeForComparison(item, resolvedPolicy),
      item,
    ])
  );

  const referenceLookup = new Map(
    referenceItems.map((item) => [
      normalizeForComparison(item, resolvedPolicy),
      item,
    ])
  );

  const matched = referenceItems.filter((item) =>
    observedLookup.has(normalizeForComparison(item, resolvedPolicy))
  );

  const missing = referenceItems.filter(
    (item) => !observedLookup.has(normalizeForComparison(item, resolvedPolicy))
  );

  const unexpected = observedItems.filter(
    (item) => !referenceLookup.has(normalizeForComparison(item, resolvedPolicy))
  );

  const differences = [
    ...missing.map((value) => ({
      type: "missing",
      value,
    })),
    ...unexpected.map((value) => ({
      type: "unexpected",
      value,
    })),
  ];

  const observedCount = observedItems.length;
  const referenceCount = referenceItems.length;
  const matchedCount = matched.length;
  const missingCount = missing.length;
  const unexpectedCount = unexpected.length;

  const coverageRatio =
    referenceCount === 0
      ? 0
      : roundToTwoDecimals(matchedCount / referenceCount);

  const weightedReferenceTotal = referenceItems.reduce(
    (sum, item) => sum + getWeightForValue(item, resolvedPolicy),
    0
  );

  const weightedMatchedTotal = matched.reduce(
    (sum, item) => sum + getWeightForValue(item, resolvedPolicy),
    0
  );

  const weightedCoverageRatio =
    weightedReferenceTotal === 0
      ? 0
      : roundToTwoDecimals(weightedMatchedTotal / weightedReferenceTotal);

  return {
    comparisonStatus: "draft",

    policyId: resolvedPolicy.policyId,
    policy: resolvedPolicy,

    perspective: perspective || null,

    inputs: {
      observed: observedItems,
      reference: referenceItems,
    },

    result: {
      matched,
      missing,
      unexpected,
      differences,
    },

    metrics: {
      observedCount,
      referenceCount,
      matchedCount,
      missingCount,
      unexpectedCount,
      coverageRatio,
      weightedReferenceTotal,
      weightedMatchedTotal,
      weightedCoverageRatio,
    },

    constraints: asObject(constraints),

    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },

    extensions: {},
  };
}

module.exports = {
  buildComparisonResult,
};