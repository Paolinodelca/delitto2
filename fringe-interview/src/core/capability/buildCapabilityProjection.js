const { validateCapabilityDesign } = require("./validateCapabilityDesign");
const { validateTargetModel } = require("./validateTargetModel");

const DIRECTIONS = ["supporting", "contradicting"];
const DRIVER_TYPES = ["role","role_scope","organization","situation","team_context","objective","priority","constraint","assumption","other"];
const PROVENANCE = ["hypothesis","stakeholder_confirmed","expert_reviewed","document_supported","empirically_validated","deprecated"];
const THRESHOLD_DEFAULTS = { weak: 0.3, moderate: 0.5, strong: 0.7, veryStrong: 0.85 };

function isObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function stringOrNull(v) {
  return typeof v === "string" && v.trim() ? v : null;
}

function primitiveOrNull(v) {
  return v === null || ["string", "number", "boolean"].includes(typeof v)
    ? v
    : null;
}

function nonNegative(v) {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : 0;
}

function unitOrNull(v) {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1
    ? v
    : null;
}

function unitOrDefault(v, fallback) {
  return unitOrNull(v) === null ? fallback : v;
}

function boolOrDefault(v, fallback) {
  return typeof v === "boolean" ? v : fallback;
}

function round4(v) {
  return Math.round(v * 10000) / 10000;
}

function uniqueStrings(v) {
  if (!Array.isArray(v)) return [];
  return [...new Set(v.filter((x) => typeof x === "string" && x.trim()))];
}

function normalizeDriver(input = {}) {
  const source = isObject(input) ? input : {};
  return {
    driverType: DRIVER_TYPES.includes(source.driverType)
      ? source.driverType
      : "other",
    driverPath: stringOrNull(source.driverPath),
    observedValue: primitiveOrNull(source.observedValue),
    rationale: stringOrNull(source.rationale),
    metadata: isObject(source.metadata) ? { ...source.metadata } : {},
    extensions: isObject(source.extensions) ? { ...source.extensions } : {},
  };
}

function normalizeDrivers(value) {
  if (!Array.isArray(value)) return [];
  const result = [];
  const seen = new Set();

  for (const item of value) {
    const driver = normalizeDriver(item);
    const key = JSON.stringify([
      driver.driverType,
      driver.driverPath,
      driver.observedValue,
    ]);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(driver);
    }
  }
  return result;
}

function normalizeDirections(value, sourceDirections) {
  const allowedByDesign = Array.isArray(sourceDirections)
    ? sourceDirections.filter((x) => DIRECTIONS.includes(x))
    : [];

  if (!Array.isArray(value)) return [...allowedByDesign];

  const normalized = [...new Set(
    value.filter((x) => DIRECTIONS.includes(x) && allowedByDesign.includes(x))
  )];

  return normalized.length ? normalized : [...allowedByDesign];
}

function normalizeProvenance(value) {
  const source = isObject(value) ? value : {};
  const result = [];
  const seen = new Set();

  for (const raw of Array.isArray(source.sources) ? source.sources : []) {
    const item = isObject(raw) ? raw : {};
    const normalized = {
      sourceType: stringOrNull(item.sourceType),
      sourceId: stringOrNull(item.sourceId),
    };
    const key = JSON.stringify([normalized.sourceType, normalized.sourceId]);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(normalized);
    }
  }

  return {
    status: PROVENANCE.includes(source.status) ? source.status : "hypothesis",
    sources: result,
  };
}

function addOnce(list, message) {
  if (!list.includes(message)) list.push(message);
}

function buildCapabilityProjection({ design = {}, target = {}, configuration = {} } = {}) {
  const d = isObject(design) ? design : {};
  const t = isObject(target) ? target : {};
  const c = isObject(configuration) ? configuration : {};

  const designValidation = validateCapabilityDesign(d);
  const targetValidation = validateTargetModel(t);
  const designComponents = Array.isArray(d.components) ? d.components : [];
  const byId = new Map(
    designComponents
      .filter((x) => x && typeof x.componentId === "string" && x.componentId.trim())
      .map((x) => [x.componentId, x])
  );

  const rawConfigurations = Array.isArray(c.componentConfigurations)
    ? c.componentConfigurations
    : [];

  const configurations = [];
  const seenConfigIds = new Set();

  for (const raw of rawConfigurations) {
    const item = isObject(raw) ? raw : {};
    const componentId = stringOrNull(item.componentId);

    if (componentId === null) {
      configurations.push(item);
      continue;
    }

    if (!seenConfigIds.has(componentId)) {
      seenConfigIds.add(componentId);
      configurations.push(item);
    }
  }

  const componentProjections = [];
  const inactiveComponents = [];
  const unmappedComponents = [];
  const limitations = [];
  let configuredWeightTotal = 0;

  for (const item of configurations) {
    const componentId = stringOrNull(item.componentId);

    if (componentId === null || !byId.has(componentId)) {
      unmappedComponents.push({
        componentId,
        reason: "component_not_found_in_design",
      });
      continue;
    }

    const source = byId.get(componentId);
    const activationStatus = ["active", "inactive"].includes(item.activationStatus)
      ? item.activationStatus
      : "inactive";
    const normalizedWeight = nonNegative(item.weight);
    configuredWeightTotal += normalizedWeight;

    if (activationStatus === "inactive") {
      inactiveComponents.push({
        componentId,
        reason: "explicitly_inactive",
      });
      continue;
    }

    componentProjections.push({
      componentId,
      sourceComponentType: source.componentType,
      sourceRole: source.role,
      activationStatus: "active",
      projectedRole: ["core", "optional"].includes(item.projectedRole)
        ? item.projectedRole
        : source.role,
      weight: normalizedWeight,
      minimumContribution: unitOrNull(item.minimumContribution),
      allowedDirections: normalizeDirections(
        item.allowedDirections,
        source.supportedDirections
      ),
      targetDrivers: normalizeDrivers(item.targetDrivers),
      rationale: stringOrNull(item.rationale),
      metadata: isObject(item.metadata) ? { ...item.metadata } : {},
      extensions: isObject(item.extensions) ? { ...item.extensions } : {},
    });
  }

  for (const component of designComponents) {
    if (
      component &&
      typeof component.componentId === "string" &&
      !seenConfigIds.has(component.componentId)
    ) {
      inactiveComponents.push({
        componentId: component.componentId,
        reason: "not_configured",
      });
    }
  }

  const inactiveDedup = [];
  const seenInactive = new Set();
  for (const item of inactiveComponents) {
    if (!seenInactive.has(item.componentId)) {
      seenInactive.add(item.componentId);
      inactiveDedup.push(item);
    }
  }

  if (!designValidation.isValid) {
    addOnce(limitations, "Capability design was invalid.");
  }
  if (!targetValidation.isValid) {
    addOnce(limitations, "Target model was invalid.");
  }
  if (unmappedComponents.length) {
    addOnce(
      limitations,
      "One or more component configurations did not match the capability design."
    );
  }

  const activeWeightTotal = round4(
    componentProjections.reduce((sum, item) => sum + item.weight, 0)
  );

  if (!componentProjections.length) {
    addOnce(
      limitations,
      "Capability projection contains no active components."
    );
  }
  if (activeWeightTotal === 0) {
    addOnce(
      limitations,
      "Active capability projection weights total zero."
    );
  }

  const policy = isObject(c.executionPolicy) ? c.executionPolicy : {};
  const thresholds = isObject(c.thresholds) ? c.thresholds : {};
  const metadata = isObject(c.metadata) ? c.metadata : {};

  return {
    projectionId: stringOrNull(c.projectionId),
    projectionStatus: "draft",
    capabilityId: stringOrNull(d.capabilityId),
    designId: stringOrNull(d.designId),
    targetId: stringOrNull(t.targetId),
    label: stringOrNull(c.label) || "Unnamed Capability Projection",
    description: stringOrNull(c.description),
    componentProjections,
    inactiveComponents: inactiveDedup,
    unmappedComponents,
    executionPolicy: {
      aggregationStrategy:
        policy.aggregationStrategy === "weighted_contribution_balance"
          ? policy.aggregationStrategy
          : "weighted_contribution_balance",
      normalizeWeights: boolOrDefault(policy.normalizeWeights, true),
      minimumRequiredCoverage: unitOrDefault(
        policy.minimumRequiredCoverage,
        0
      ),
      minimumTotalCoverage: unitOrDefault(policy.minimumTotalCoverage, 0),
      allowPartialResult: boolOrDefault(policy.allowPartialResult, true),
    },
    thresholds: {
      weak: unitOrDefault(thresholds.weak, THRESHOLD_DEFAULTS.weak),
      moderate: unitOrDefault(
        thresholds.moderate,
        THRESHOLD_DEFAULTS.moderate
      ),
      strong: unitOrDefault(thresholds.strong, THRESHOLD_DEFAULTS.strong),
      veryStrong: unitOrDefault(
        thresholds.veryStrong,
        THRESHOLD_DEFAULTS.veryStrong
      ),
    },
    assumptions: uniqueStrings(c.assumptions),
    rationale: stringOrNull(c.rationale),
    provenance: normalizeProvenance(c.provenance),
    traceability: {
      designComponentCount: designComponents.length,
      configuredComponentCount: configurations.length,
      activeComponentCount: componentProjections.length,
      inactiveComponentCount: inactiveDedup.length,
      unmappedComponentCount: unmappedComponents.length,
      configuredWeightTotal: round4(configuredWeightTotal),
      activeWeightTotal,
    },
    limitations,
    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
      ...metadata,
    },
    extensions: isObject(c.extensions) ? { ...c.extensions } : {},
  };
}

module.exports = {
  buildCapabilityProjection,
};
