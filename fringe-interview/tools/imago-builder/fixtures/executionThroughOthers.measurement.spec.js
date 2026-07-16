const {
  buildMeasurementModuleSpec,
} = require("../plugins/measurement-module/buildMeasurementModuleSpec");

function buildExecutionThroughOthersMeasurementSpec() {
  return buildMeasurementModuleSpec({
    measureId:
      "execution_through_others",

    label:
      "Execution Through Others",

    description:
      "Measures the observed ability to produce collective results through coordinated action by other people.",

    factors: [
      {
        factorId:
          "delegatedExecutionScope",

        label:
          "Delegated Execution Scope",

        description:
          "Observed scope of work entrusted to other people.",

        allowedValues: [
          "none",
          "task",
          "team",
          "multi_team",
          "multi_layer",
        ],

        defaultValue:
          "none",

        weight:
          0.3,
      },

      {
        factorId:
          "collectiveDeliveryEvidence",

        label:
          "Collective Delivery Evidence",

        description:
          "Strength of evidence that outcomes were delivered through coordinated collective work.",

        allowedValues: [
          "none",
          "claimed",
          "described",
          "quantified",
          "repeated_quantified",
        ],

        defaultValue:
          "none",

        weight:
          0.3,
      },

      {
        factorId:
          "managerialLayerUse",

        label:
          "Managerial Layer Use",

        description:
          "Observed use of supervisory or managerial layers to organize execution.",

        allowedValues: [
          "none",
          "direct_only",
          "single_layer",
          "multi_layer",
        ],

        defaultValue:
          "none",

        weight:
          0.2,
      },

      {
        factorId:
          "personalInterventionDependence",

        label:
          "Personal Intervention Dependence",

        description:
          "Observed dependence of collective delivery on the candidate's direct personal intervention.",

        allowedValues: [
          "unknown",
          "high",
          "moderate",
          "low",
        ],

        defaultValue:
          "unknown",

        weight:
          0.2,

        direction:
          "inverse",
      },
    ],

    benchmarkReference: {},

    observation: {
      notObservedPolicy: {
        requireEmptyEvidenceIds:
          true,

        zeroFields: [
          "delegatedExecutionScope",
          "collectiveDeliveryEvidence",
          "managerialLayerUse",
        ],

        zeroInferenceSupport:
          true,
      },
    },

    provenance: {
      status:
        "hypothesis",

      sources: [
        {
          sourceType:
            "project_design",

          sourceId:
            "imago_execution_through_others_spec_v1",
        },
      ],
    },

    rationale:
      "Initial specification used to validate the Measurement Module Generator without yet defining semantic scoring.",

    metadata: {
      domain:
        "recruiting",
    },

    extensions: {},
  });
}

module.exports = {
  buildExecutionThroughOthersMeasurementSpec,
};
