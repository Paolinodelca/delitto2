function buildMetadata() {
  return {
    version: "1.0",
    createdAt: new Date().toISOString(),
  };
}

function buildTeamSizeDefinition() {
  return {
    factorId: "teamSize",

    label: "Team Size",

    description:
      "Measures the scale of the managed team relative to a reference team size.",

    supportedDimensions: ["management_scope"],

    inputField: "teamSize",

    valueType: "number",

    scoring: {
      strategy: "ratio_to_benchmark",

      parameters: {
        benchmarkField: "teamSize",
        minimum: 0,
        maximum: 1,
      },
    },

    defaultWeight: 0.35,

    metadata: buildMetadata(),

    extensions: {},
  };
}

function buildDurationYearsDefinition() {
  return {
    factorId: "durationYears",

    label: "Management Duration",

    description:
      "Measures the duration of management experience relative to the reference duration.",

    supportedDimensions: ["management_scope"],

    inputField: "durationYears",

    valueType: "number",

    scoring: {
      strategy: "ratio_to_benchmark",

      parameters: {
        benchmarkField: "durationYears",
        minimum: 0,
        maximum: 1,
      },
    },

    defaultWeight: 0.3,

    metadata: buildMetadata(),

    extensions: {},
  };
}

function buildResponsibilityTypeDefinition() {
  return {
    factorId: "responsibilityType",

    label: "Responsibility Type",

    description:
      "Measures whether management responsibility was direct, shared or indirect.",

    supportedDimensions: ["management_scope"],

    inputField: "responsibilityType",

    valueType: "enum",

    scoring: {
      strategy: "enum_map",

      parameters: {
        values: {
          direct: 1,
          shared: 0.7,
          indirect: 0.4,
          unknown: 0,
        },
      },
    },

    defaultWeight: 0.2,

    metadata: buildMetadata(),

    extensions: {},
  };
}

function buildManagementLayerDefinition() {
  return {
    factorId: "managementLayer",

    label: "Management Layer",

    description:
      "Measures whether responsibility included one or multiple organizational layers.",

    supportedDimensions: ["management_scope"],

    inputField: "managementLayer",

    valueType: "enum",

    scoring: {
      strategy: "enum_map",

      parameters: {
        values: {
          multi_layer: 1,
          single_layer: 0.6,
          unknown: 0,
        },
      },
    },

    defaultWeight: 0.15,

    metadata: buildMetadata(),

    extensions: {},
  };
}

function buildContextRelevanceDefinition() {
  return {
    factorId: "contextRelevance",

    label: "Context Relevance",

    description:
      "Measures how similar the observed management context is to the target management context.",

    supportedDimensions: ["management_scope"],

    inputField: "contextRelevance",

    valueType: "number",

    scoring: {
      strategy: "normalized_value",

      parameters: {
        minimum: 0,
        maximum: 1,
      },
    },

    defaultWeight: 0.15,

    metadata: buildMetadata(),

    extensions: {},
  };
}

function buildUnknownDefinition(factorId) {
  return {
    factorId,

    label: "Unknown Measurement Factor",

    description: null,

    supportedDimensions: [],

    inputField: null,

    valueType: "unknown",

    scoring: {
      strategy: "unsupported",
      parameters: {},
    },

    defaultWeight: 0,

    metadata: buildMetadata(),

    extensions: {},
  };
}

function buildMeasurementFactorDefinition(factorId) {
  switch (factorId) {
    case "teamSize":
      return buildTeamSizeDefinition();

    case "durationYears":
      return buildDurationYearsDefinition();

    case "responsibilityType":
      return buildResponsibilityTypeDefinition();

    case "managementLayer":
      return buildManagementLayerDefinition();

    case "contextRelevance":
      return buildContextRelevanceDefinition();

    default:
      return buildUnknownDefinition(factorId);
  }
}

module.exports = {
  buildMeasurementFactorDefinition,
};