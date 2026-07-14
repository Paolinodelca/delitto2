const COMPONENT_TYPES = ["measurement", "capability"];
const ROLES = ["core", "optional"];
const DIRECTIONS = ["supporting", "contradicting"];
const DRIVER_TYPES = ["role","role_scope","organization","situation","team_context","objective","priority","constraint","assumption","other"];
const INACTIVE_REASONS = ["explicitly_inactive", "not_configured"];
const PROVENANCE = ["hypothesis","stakeholder_confirmed","expert_reviewed","document_supported","empirically_validated","deprecated"];

function isObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function validString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function stringOrNull(v) {
  return v === null || typeof v === "string";
}

function primitiveOrNull(v) {
  return (
    v === null ||
    typeof v === "string" ||
    typeof v === "number" ||
    typeof v === "boolean"
  );
}

function unit(v) {
  return (
    typeof v === "number" &&
    Number.isFinite(v) &&
    v >= 0 &&
    v <= 1
  );
}

function nonNegative(v) {
  return (
    typeof v === "number" &&
    Number.isFinite(v) &&
    v >= 0
  );
}

function nonNegativeInteger(v) {
  return Number.isInteger(v) && v >= 0;
}

function validateDriver(driver, path, errors, warnings) {
  if (!isObject(driver)) {
    errors.push(`${path} must be an object.`);
    return;
  }

  if (!DRIVER_TYPES.includes(driver.driverType)) {
    errors.push(`${path}.driverType is invalid.`);
  }

  if (!stringOrNull(driver.driverPath)) {
    errors.push(`${path}.driverPath must be a string or null.`);
  }

  if (!primitiveOrNull(driver.observedValue)) {
    errors.push(`${path}.observedValue must be primitive or null.`);
  }

  if (!stringOrNull(driver.rationale)) {
    errors.push(`${path}.rationale must be a string or null.`);
  }

  if (!isObject(driver.metadata)) {
    errors.push(`${path}.metadata must be an object.`);
  }

  if (!isObject(driver.extensions)) {
    errors.push(`${path}.extensions must be an object.`);
  }

  if (driver.driverPath === null) {
    warnings.push(`${path}.driverPath is null.`);
  }

  if (driver.rationale === null) {
    warnings.push(`${path}.rationale is null.`);
  }
}

function validateComponent(component, path, errors, warnings) {
  if (!isObject(component)) {
    errors.push(`${path} must be an object.`);
    return;
  }

  if (!validString(component.componentId)) {
    errors.push(`${path}.componentId is required.`);
  }

  if (!COMPONENT_TYPES.includes(component.sourceComponentType)) {
    errors.push(`${path}.sourceComponentType is invalid.`);
  }

  if (!ROLES.includes(component.sourceRole)) {
    errors.push(`${path}.sourceRole is invalid.`);
  }

  if (component.activationStatus !== "active") {
    errors.push(`${path}.activationStatus must be "active".`);
  }

  if (!ROLES.includes(component.projectedRole)) {
    errors.push(`${path}.projectedRole is invalid.`);
  }

  if (!nonNegative(component.weight)) {
    errors.push(`${path}.weight must be a non-negative number.`);
  }

  if (
    component.minimumContribution !== null &&
    !unit(component.minimumContribution)
  ) {
    errors.push(
      `${path}.minimumContribution must be between 0 and 1 or null.`
    );
  }

  if (
    !Array.isArray(component.allowedDirections) ||
    component.allowedDirections.length === 0
  ) {
    errors.push(`${path}.allowedDirections must be a non-empty array.`);
  } else {
    component.allowedDirections.forEach((direction, index) => {
      if (!DIRECTIONS.includes(direction)) {
        errors.push(`${path}.allowedDirections[${index}] is invalid.`);
      }
    });
  }

  if (!Array.isArray(component.targetDrivers)) {
    errors.push(`${path}.targetDrivers must be an array.`);
  } else {
    component.targetDrivers.forEach((driver, index) => {
      validateDriver(
        driver,
        `${path}.targetDrivers[${index}]`,
        errors,
        warnings
      );
    });
  }

  if (!stringOrNull(component.rationale)) {
    errors.push(`${path}.rationale must be a string or null.`);
  }

  if (!isObject(component.metadata)) {
    errors.push(`${path}.metadata must be an object.`);
  }

  if (!isObject(component.extensions)) {
    errors.push(`${path}.extensions must be an object.`);
  }

  if (component.weight === 0) {
    warnings.push(`${path}.weight is 0.`);
  }

  if (
    Array.isArray(component.targetDrivers) &&
    component.targetDrivers.length === 0
  ) {
    warnings.push(`${path}.targetDrivers is empty.`);
  }
}

function validateInactive(items, errors) {
  if (!Array.isArray(items)) {
    errors.push("inactiveComponents must be an array.");
    return;
  }

  items.forEach((item, index) => {
    const path = `inactiveComponents[${index}]`;

    if (!isObject(item)) {
      errors.push(`${path} must be an object.`);
      return;
    }

    if (!validString(item.componentId)) {
      errors.push(`${path}.componentId is required.`);
    }

    if (!INACTIVE_REASONS.includes(item.reason)) {
      errors.push(`${path}.reason is invalid.`);
    }
  });
}

function validateUnmapped(items, errors) {
  if (!Array.isArray(items)) {
    errors.push("unmappedComponents must be an array.");
    return;
  }

  items.forEach((item, index) => {
    const path = `unmappedComponents[${index}]`;

    if (!isObject(item)) {
      errors.push(`${path} must be an object.`);
      return;
    }

    if (item.componentId !== null && !validString(item.componentId)) {
      errors.push(`${path}.componentId must be a string or null.`);
    }

    if (item.reason !== "component_not_found_in_design") {
      errors.push(
        `${path}.reason must be "component_not_found_in_design".`
      );
    }
  });
}

function validatePolicy(policy, errors, warnings) {
  if (!isObject(policy)) {
    errors.push("executionPolicy must be an object.");
    return;
  }

  if (policy.aggregationStrategy !== "weighted_contribution_balance") {
    errors.push(
      'executionPolicy.aggregationStrategy must be "weighted_contribution_balance".'
    );
  }

  if (typeof policy.normalizeWeights !== "boolean") {
    errors.push("executionPolicy.normalizeWeights must be a boolean.");
  }

  if (!unit(policy.minimumRequiredCoverage)) {
    errors.push(
      "executionPolicy.minimumRequiredCoverage must be between 0 and 1."
    );
  }

  if (!unit(policy.minimumTotalCoverage)) {
    errors.push(
      "executionPolicy.minimumTotalCoverage must be between 0 and 1."
    );
  }

  if (typeof policy.allowPartialResult !== "boolean") {
    errors.push("executionPolicy.allowPartialResult must be a boolean.");
  }

  if (policy.minimumRequiredCoverage === 0) {
    warnings.push("executionPolicy.minimumRequiredCoverage is 0.");
  }

  if (policy.minimumTotalCoverage === 0) {
    warnings.push("executionPolicy.minimumTotalCoverage is 0.");
  }

  if (
    unit(policy.minimumRequiredCoverage) &&
    unit(policy.minimumTotalCoverage) &&
    policy.minimumRequiredCoverage > policy.minimumTotalCoverage
  ) {
    warnings.push(
      "executionPolicy.minimumRequiredCoverage is greater than minimumTotalCoverage."
    );
  }
}

function validateThresholds(thresholds, errors) {
  if (!isObject(thresholds)) {
    errors.push("thresholds must be an object.");
    return;
  }

  ["weak", "moderate", "strong", "veryStrong"].forEach((field) => {
    if (!unit(thresholds[field])) {
      errors.push(`thresholds.${field} must be between 0 and 1.`);
    }
  });

  if (
    unit(thresholds.weak) &&
    unit(thresholds.moderate) &&
    unit(thresholds.strong) &&
    unit(thresholds.veryStrong) &&
    !(
      thresholds.weak <
      thresholds.moderate &&
      thresholds.moderate <
      thresholds.strong &&
      thresholds.strong <
      thresholds.veryStrong
    )
  ) {
    errors.push(
      "thresholds must respect weak < moderate < strong < veryStrong."
    );
  }
}

function validateProvenance(provenance, errors, warnings) {
  if (!isObject(provenance)) {
    errors.push("provenance must be an object.");
    return;
  }

  if (!PROVENANCE.includes(provenance.status)) {
    errors.push("provenance.status is invalid.");
  }

  if (!Array.isArray(provenance.sources)) {
    errors.push("provenance.sources must be an array.");
  } else {
    provenance.sources.forEach((source, index) => {
      const path = `provenance.sources[${index}]`;

      if (!isObject(source)) {
        errors.push(`${path} must be an object.`);
        return;
      }

      if (!stringOrNull(source.sourceType)) {
        errors.push(`${path}.sourceType must be a string or null.`);
      }

      if (!stringOrNull(source.sourceId)) {
        errors.push(`${path}.sourceId must be a string or null.`);
      }
    });
  }

  if (provenance.status === "hypothesis") {
    warnings.push("provenance.status is hypothesis.");
  }

  if (
    Array.isArray(provenance.sources) &&
    provenance.sources.length === 0
  ) {
    warnings.push("provenance.sources is empty.");
  }
}

function validateTraceability(traceability, errors) {
  if (!isObject(traceability)) {
    errors.push("traceability must be an object.");
    return;
  }

  [
    "designComponentCount",
    "configuredComponentCount",
    "activeComponentCount",
    "inactiveComponentCount",
    "unmappedComponentCount",
  ].forEach((field) => {
    if (!nonNegativeInteger(traceability[field])) {
      errors.push(
        `traceability.${field} must be a non-negative integer.`
      );
    }
  });

  ["configuredWeightTotal", "activeWeightTotal"].forEach((field) => {
    if (!nonNegative(traceability[field])) {
      errors.push(
        `traceability.${field} must be a non-negative finite number.`
      );
    }
  });
}

function validateCapabilityProjection(projection = {}) {
  const errors = [];
  const warnings = [];

  if (!isObject(projection)) {
    return {
      isValid: false,
      errors: ["CapabilityProjection must be an object."],
      warnings: [],
    };
  }

  if (!validString(projection.projectionId)) {
    errors.push("projectionId is required.");
  }

  if (projection.projectionStatus !== "draft") {
    errors.push('projectionStatus must be "draft".');
  }

  if (!validString(projection.capabilityId)) {
    errors.push("capabilityId is required.");
  }

  if (!validString(projection.designId)) {
    errors.push("designId is required.");
  }

  if (!validString(projection.targetId)) {
    errors.push("targetId is required.");
  }

  if (!validString(projection.label)) {
    errors.push("label must be a non-empty string.");
  }

  if (!Array.isArray(projection.componentProjections)) {
    errors.push("componentProjections must be an array.");
  } else {
    projection.componentProjections.forEach((component, index) => {
      validateComponent(
        component,
        `componentProjections[${index}]`,
        errors,
        warnings
      );
    });
  }

  validateInactive(projection.inactiveComponents, errors);
  validateUnmapped(projection.unmappedComponents, errors);
  validatePolicy(projection.executionPolicy, errors, warnings);
  validateThresholds(projection.thresholds, errors);

  if (!Array.isArray(projection.assumptions)) {
    errors.push("assumptions must be an array.");
  }

  validateProvenance(projection.provenance, errors, warnings);
  validateTraceability(projection.traceability, errors);

  if (!Array.isArray(projection.limitations)) {
    errors.push("limitations must be an array.");
  }

  if (!isObject(projection.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!projection.metadata.version) {
      errors.push("metadata.version is required.");
    }

    if (!projection.metadata.createdAt) {
      errors.push("metadata.createdAt is required.");
    }
  }

  if (!isObject(projection.extensions)) {
    errors.push("extensions must be an object.");
  }

  if (projection.label === "Unnamed Capability Projection") {
    warnings.push("label uses the default value.");
  }

  if (projection.description === null) {
    warnings.push("description is null.");
  }

  if (projection.rationale === null) {
    warnings.push("rationale is null.");
  }

  if (
    Array.isArray(projection.componentProjections) &&
    projection.componentProjections.length === 0
  ) {
    warnings.push("componentProjections is empty.");
  }

  if (
    Array.isArray(projection.inactiveComponents) &&
    projection.inactiveComponents.length > 0
  ) {
    warnings.push("inactiveComponents is not empty.");
  }

  if (
    Array.isArray(projection.unmappedComponents) &&
    projection.unmappedComponents.length > 0
  ) {
    warnings.push("unmappedComponents is not empty.");
  }

  if (
    isObject(projection.traceability) &&
    typeof projection.traceability.activeWeightTotal === "number" &&
    Math.abs(projection.traceability.activeWeightTotal - 1) > 0.0001
  ) {
    warnings.push("activeWeightTotal differs from 1.");
  }

  if (
    Array.isArray(projection.assumptions) &&
    projection.assumptions.length === 0
  ) {
    warnings.push("assumptions is empty.");
  }

  if (
    Array.isArray(projection.limitations) &&
    projection.limitations.length > 0
  ) {
    warnings.push("limitations is not empty.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

module.exports = {
  validateCapabilityProjection,
};
