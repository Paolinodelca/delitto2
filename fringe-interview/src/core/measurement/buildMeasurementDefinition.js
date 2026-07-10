function buildMeasurementDefinition(dimensionId) {
  if (dimensionId !== "management_scope") {
    return null;
  }

  return {
    dimensionId: "management_scope",

    label: "Management Scope",

    description:
      "Measures the breadth and solidity of observed people-management experience. It does not measure leadership quality.",

    inputSignals: [
      "team_size",
      "management_duration_years",
      "responsibility_type",
      "management_layer",
      "context_type",
    ],

    scale: {
      minimum: 0,
      maximum: 1,
    },

    benchmark: {
      benchmarkId: "management_scope_v1",

      reference: {
        teamSize: 100,
        durationYears: 10,
        responsibilityType: "direct",
        managementLayer: "multi_layer",
      },
    },

    aggregation: {
      mode: "weighted_sum",

      weights: {
        teamSize: 0.35,
        durationYears: 0.3,
        responsibilityType: 0.2,
        managementLayer: 0.15,
      },
    },

    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },

    extensions: {},
  };
}

module.exports = {
  buildMeasurementDefinition,
};