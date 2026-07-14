const {
  validateCapabilityProjection,
} = require("./validateCapabilityProjection");

const {
  buildCapabilityDefinition,
} = require("./buildCapabilityDefinition");

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isValidString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isUnitInterval(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

function isValidComponentProjection(component) {
  return (
    isObject(component) &&
    isValidString(component.componentId) &&
    ["core", "optional"].includes(component.projectedRole) &&
    typeof component.weight === "number" &&
    Number.isFinite(component.weight) &&
    component.weight >= 0 &&
    (component.minimumContribution === null || isUnitInterval(component.minimumContribution)) &&
    Array.isArray(component.allowedDirections) &&
    component.allowedDirections.length > 0
  );
}

function cloneArray(value) {
  return Array.isArray(value)
    ? value.map((item) => (isObject(item) ? { ...item } : item))
    : [];
}

function cloneTargetDrivers(value) {
  return Array.isArray(value)
    ? value.map((driver) =>
        isObject(driver)
          ? {
              ...driver,
              metadata: isObject(driver.metadata) ? { ...driver.metadata } : {},
              extensions: isObject(driver.extensions) ? { ...driver.extensions } : {},
            }
          : driver
      )
    : [];
}

function buildRequirement({ componentProjection, projectionId }) {
  return {
    contributionKey: componentProjection.componentId,
    sourceMeasureId: componentProjection.componentId,
    weight: componentProjection.weight,
    minimumContribution: componentProjection.minimumContribution,
    allowedDirections: [...componentProjection.allowedDirections],
    metadata: {
      sourceComponentType: componentProjection.sourceComponentType,
      sourceRole: componentProjection.sourceRole,
      projectedRole: componentProjection.projectedRole,
      projectionId,
    },
    extensions: {
      targetDrivers: cloneTargetDrivers(componentProjection.targetDrivers),
      projectionRationale: isValidString(componentProjection.rationale)
        ? componentProjection.rationale
        : null,
    },
  };
}

function buildCapabilityDefinitionFromProjection({ projection = {} } = {}) {
  const sourceProjection = isObject(projection) ? projection : {};
  const projectionValidation = validateCapabilityProjection(sourceProjection);

  const requiredContributions = [];
  const optionalContributions = [];
  const skippedComponents = [];
  const seenContributionKeys = new Set();

  const componentProjections = Array.isArray(sourceProjection.componentProjections)
    ? sourceProjection.componentProjections
    : [];

  componentProjections.forEach((componentProjection) => {
    const componentId =
      isObject(componentProjection) && isValidString(componentProjection.componentId)
        ? componentProjection.componentId
        : null;

    if (!isValidComponentProjection(componentProjection)) {
      skippedComponents.push({
        componentId,
        reason: "invalid_component_projection",
      });
      return;
    }

    if (seenContributionKeys.has(componentProjection.componentId)) {
      skippedComponents.push({
        componentId: componentProjection.componentId,
        reason: "duplicate_component_projection",
      });
      return;
    }

    seenContributionKeys.add(componentProjection.componentId);

    const requirement = buildRequirement({
      componentProjection,
      projectionId: isValidString(sourceProjection.projectionId)
        ? sourceProjection.projectionId
        : null,
    });

    if (componentProjection.projectedRole === "core") {
      requiredContributions.push(requirement);
    } else {
      optionalContributions.push(requirement);
    }
  });

  const traceabilityLimitations = cloneArray(sourceProjection.limitations);

  if (projectionValidation.isValid !== true) {
    traceabilityLimitations.push(
      "Capability definition was built from an invalid projection."
    );
  }

  const executionPolicy = isObject(sourceProjection.executionPolicy)
    ? sourceProjection.executionPolicy
    : {};

  const thresholds = isObject(sourceProjection.thresholds)
    ? sourceProjection.thresholds
    : {};

  const projectionId = isValidString(sourceProjection.projectionId)
    ? sourceProjection.projectionId
    : null;

  const designId = isValidString(sourceProjection.designId)
    ? sourceProjection.designId
    : null;

  const targetId = isValidString(sourceProjection.targetId)
    ? sourceProjection.targetId
    : null;

  return buildCapabilityDefinition({
    capabilityId: isValidString(sourceProjection.capabilityId)
      ? sourceProjection.capabilityId
      : null,

    label:
      isValidString(sourceProjection.label) &&
      sourceProjection.label !== "Unnamed Capability Projection"
        ? sourceProjection.label
        : "Unnamed Capability",

    description: isValidString(sourceProjection.description)
      ? sourceProjection.description
      : null,

    purpose: projectionId
      ? `Execute capability configuration derived from projection ${projectionId}.`
      : null,

    requiredContributions,
    optionalContributions,

    aggregationPolicy: {
      strategy: executionPolicy.aggregationStrategy,
      supportingDirection: "supporting",
      contradictingDirection: "contradicting",
      neutralDirection: "neutral",
      normalizeWeights: executionPolicy.normalizeWeights,
    },

    coveragePolicy: {
      minimumRequiredCoverage: executionPolicy.minimumRequiredCoverage,
      minimumTotalCoverage: executionPolicy.minimumTotalCoverage,
      allowPartialResult: executionPolicy.allowPartialResult,
    },

    thresholds: {
      weak: thresholds.weak,
      moderate: thresholds.moderate,
      strong: thresholds.strong,
      veryStrong: thresholds.veryStrong,
    },

    rationale: isValidString(sourceProjection.rationale)
      ? sourceProjection.rationale
      : null,

    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
      projectionId,
      designId,
      targetId,
      sourceType: "capability_projection",
    },

    extensions: {
      projectionTraceability: {
        projectionId,
        designId,
        targetId,
        provenanceStatus:
          isObject(sourceProjection.provenance) &&
          isValidString(sourceProjection.provenance.status)
            ? sourceProjection.provenance.status
            : null,
        assumptions: cloneArray(sourceProjection.assumptions),
        limitations: traceabilityLimitations,
        inactiveComponents: cloneArray(sourceProjection.inactiveComponents),
        unmappedComponents: cloneArray(sourceProjection.unmappedComponents),
        skippedComponents,
      },
      projectionMetadata: isObject(sourceProjection.metadata)
        ? { ...sourceProjection.metadata }
        : {},
    },
  });
}

module.exports = {
  buildCapabilityDefinitionFromProjection,
};
