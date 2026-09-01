const {
  buildCapabilityContribution,
} = require("../buildCapabilityContribution");

const {
  validateCapabilityContribution,
} = require("../validateCapabilityContribution");

const {
  validateCapabilityProjection,
} = require("../validateCapabilityProjection");

const {
  validateDecisionAccountabilityMeasureResult,
} = require("../../measurement/decisionAccountability/validateDecisionAccountabilityMeasureResult");

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function cloneArray(value) {
  return Array.isArray(value)
    ? value.map((item) => (isObject(item) ? { ...item } : item))
    : [];
}

function uniqueStrings(value) {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value.filter(
        (item) => typeof item === "string" && item.trim().length > 0
      )
    )
  );
}

function buildDecisionAccountabilityLeadershipContribution({
  measureResult = {},
  projection = {},
  contributionId,
  rationale = null,
  metadata = {},
  extensions = {},
} = {}) {
  const sourceMeasureResult = isObject(measureResult) ? measureResult : {};
  const sourceProjection = isObject(projection) ? projection : {};
  const inputMetadata = isObject(metadata) ? metadata : {};
  const inputExtensions = isObject(extensions) ? extensions : {};

  const measureValidation =
    validateDecisionAccountabilityMeasureResult(sourceMeasureResult);

  const projectionValidation =
    validateCapabilityProjection(sourceProjection);

  const componentProjection =
    projectionValidation.isValid === true &&
    Array.isArray(sourceProjection.componentProjections)
      ? sourceProjection.componentProjections.find(
          (component) =>
            component &&
            component.componentId === "decision_accountability" &&
            component.activationStatus === "active"
        ) || null
      : null;

  const projectionUsable =
    projectionValidation.isValid === true && componentProjection !== null;

  const measureInvalid =
    measureValidation.isValid !== true ||
    sourceMeasureResult.resultStatus === "invalid";

  const measureNotObserved =
    !measureInvalid && sourceMeasureResult.resultStatus !== "draft";

  let derivationStatus = "derived";
  let sourceMeasureValue = sourceMeasureResult.score;
  let inferenceSupport =
    sourceMeasureResult.inferenceSupport &&
    typeof sourceMeasureResult.inferenceSupport.value === "number"
      ? sourceMeasureResult.inferenceSupport.value
      : 0;

  // The CapabilityContribution builder already computes measureValue × relevance.
  // The aggregation context then applies requirementWeight. Relevance therefore
  // stays at 1 to ensure the projection weight is applied exactly once.
  let relevance = 1;
  let direction = "supporting";
  const derivationLimitations = [];

  if (!projectionUsable) {
    derivationStatus = "invalid_projection";
    sourceMeasureValue = 0;
    relevance = 0;
    inferenceSupport = 0;
    derivationLimitations.push(
      "Decision accountability could not be mapped to an active Leadership projection component."
    );
  } else if (measureInvalid) {
    derivationStatus = "invalid_source_measure";
    sourceMeasureValue = 0;
    inferenceSupport = 0;
    derivationLimitations.push(
      "Decision accountability contribution was built from an invalid measure result."
    );
  } else if (measureNotObserved) {
    derivationStatus = sourceMeasureResult.resultStatus;
    sourceMeasureValue = 0;
    inferenceSupport = 0;
  }

  const requestedDirection = inputExtensions.directionOverride;
  let directionOverrideApplied = null;

  if (
    projectionUsable &&
    ["supporting", "contradicting"].includes(requestedDirection) &&
    Array.isArray(componentProjection.allowedDirections) &&
    componentProjection.allowedDirections.includes(requestedDirection)
  ) {
    direction = requestedDirection;
    directionOverrideApplied = requestedDirection;
  }

  const effectiveContributionId = validString(contributionId)
    ? contributionId
    : "decision_accountability_leadership_contribution";

  const sourceContext = isObject(sourceMeasureResult.context)
    ? sourceMeasureResult.context
    : {};

  const measureLimitations = Array.isArray(sourceMeasureResult.limitations)
    ? [...sourceMeasureResult.limitations]
    : [];

  const canonicalMetadata = {
    sourceType: "measure_result",
    adapterId: "decision_accountability_to_leadership_v1",
    measureId: sourceMeasureResult.measureId || "decision_accountability",
    measureResultStatus: sourceMeasureResult.resultStatus || null,
    measureBand: sourceMeasureResult.band || null,
    projectionId: sourceProjection.projectionId || null,
    targetId: sourceProjection.targetId || null,
    sourceMode: "deterministic_measure_adapter",
    derivationStatus,
  };

  const canonicalExtensions = {
    sourceTraceability: {
      measureId: sourceMeasureResult.measureId || "decision_accountability",
      observationId: sourceMeasureResult.observationId || null,
      measureScore:
        typeof sourceMeasureResult.score === "number"
          ? sourceMeasureResult.score
          : 0,
      measureBand: sourceMeasureResult.band || null,
      inferenceSupport: isObject(sourceMeasureResult.inferenceSupport)
        ? {
            ...sourceMeasureResult.inferenceSupport,
            components: isObject(sourceMeasureResult.inferenceSupport.components)
              ? { ...sourceMeasureResult.inferenceSupport.components }
              : {},
          }
        : { value: 0, band: "none", components: {} },
      benchmarkReference: isObject(sourceMeasureResult.benchmarkReference)
        ? { ...sourceMeasureResult.benchmarkReference }
        : {},
      componentScores: isObject(sourceMeasureResult.components)
        ? { ...sourceMeasureResult.components }
        : {},
      measureLimitations,
    },

    projectionTraceability: projectionUsable
      ? {
          projectionId: sourceProjection.projectionId,
          designId: sourceProjection.designId,
          targetId: sourceProjection.targetId,
          componentId: "decision_accountability",
          projectedRole: componentProjection.projectedRole,
          configuredWeight: componentProjection.weight,
          minimumContribution: componentProjection.minimumContribution,
          allowedDirections: cloneArray(componentProjection.allowedDirections),
          targetDrivers: cloneArray(componentProjection.targetDrivers),
        }
      : {
          projectionId: sourceProjection.projectionId || null,
          designId: sourceProjection.designId || null,
          targetId: sourceProjection.targetId || null,
          componentId: "decision_accountability",
          projectedRole: null,
          configuredWeight: null,
          minimumContribution: null,
          allowedDirections: [],
          targetDrivers: [],
        },

    derivation: {
      derivationType: "single_measure_result",
      sourceMeasureIds: ["decision_accountability"],
      patternId: null,
      directionOverrideApplied,
      derivationStatus,
    },

    derivationLimitations,
  };

  const contribution = buildCapabilityContribution({
    contributionId: effectiveContributionId,
    capabilityId: projectionUsable
      ? sourceProjection.capabilityId
      : sourceProjection.capabilityId || null,
    sourceMeasureId:
      sourceMeasureResult.measureId || "decision_accountability",
    sourceMeasureValue,
    direction,
    relevance,
    inferenceSupport,
    context: {
      ...sourceContext,
      targetId: sourceProjection.targetId || null,
      projectionId: sourceProjection.projectionId || null,
      targetContextType: "plant_manager_corporate_transformation",
    },
    evidenceIds: uniqueStrings(sourceMeasureResult.evidenceIds),
    rationale: validString(rationale)
      ? rationale
      : "Decision accountability measure contributes to Leadership according to the active Plant Manager capability projection.",
    metadata: {
      ...inputMetadata,
      ...canonicalMetadata,
    },
    extensions: {
      ...inputExtensions,
      ...canonicalExtensions,
    },
  });

  return {
    ...contribution,

    extensions: {
      ...contribution.extensions,

      adapterValidation: {
        measureResult:
          measureValidation,

        projection:
          projectionValidation,

        contribution:
          validateCapabilityContribution(
            contribution
          ),
      },
    },
  };
}

module.exports = {
  buildDecisionAccountabilityLeadershipContribution,
};
