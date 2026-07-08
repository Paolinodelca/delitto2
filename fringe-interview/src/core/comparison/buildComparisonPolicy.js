function buildRepresentationGapPolicy() {
  return {
    policyId: "representation_gap",

    label: "Representation Gap",

    dimensions: ["required_vs_observed"],

    matching: {
      mode: "exact",
      caseSensitive: false,
    },

    scoring: {
      coverageRatio: true,
    },

    weights: {
      default: 1,
      byValue: {},
    },

    resultMapping: {
      matched: "opportunities",
      missing: "priorities",
      unexpected: "unexpected",
    },

    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },

    extensions: {},
  };
}

function buildUnknownPolicy(policyId) {
  return {
    policyId,

    label: "Unknown Policy",

    dimensions: [],

    matching: {
      mode: "exact",
      caseSensitive: false,
    },

    scoring: {
      coverageRatio: true,
    },

    weights: {
      default: 1,
      byValue: {},
    },

    resultMapping: {},

    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },

    extensions: {},
  };
}

function buildComparisonPolicy(policyId) {
  if (policyId === "representation_gap") {
    return buildRepresentationGapPolicy();
  }

  return buildUnknownPolicy(policyId);
}

module.exports = {
  buildComparisonPolicy,
};;