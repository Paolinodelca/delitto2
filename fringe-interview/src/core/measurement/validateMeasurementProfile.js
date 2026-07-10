const {
  getMeasurementFactorDefinition,
} = require("./getMeasurementFactorDefinition");

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isValidString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

const BASE_MANAGEMENT_SCOPE_FACTORS = [
  "teamSize",
  "durationYears",
  "responsibilityType",
  "managementLayer",
];

function validateMeasurementProfile(profile = {}) {
  const errors = [];
  const warnings = [];

  if (!isObject(profile)) {
    return {
      isValid: false,
      errors: ["MeasurementProfile must be an object."],
      warnings: [],
    };
  }

  if (!isValidString(profile.profileId)) {
    errors.push("profileId must be a non-empty string.");
  }

  if (!isValidString(profile.baseModelId)) {
    errors.push("baseModelId must be a non-empty string.");
  }

  if (!isObject(profile.overrides)) {
    errors.push("overrides must be an object.");
  } else {
    const weights = profile.overrides.weights;

    if (!isObject(weights)) {
      errors.push("overrides.weights must be an object.");
    } else {
      Object.entries(weights).forEach(([key, value]) => {
        if (
          typeof value !== "number" ||
          !Number.isFinite(value) ||
          value < 0
        ) {
          errors.push(
            `overrides.weights.${key} must be a non-negative number.`
          );
        }
      });
    }

    const thresholds = profile.overrides.thresholds;

    if (!isObject(thresholds)) {
      errors.push("overrides.thresholds must be an object.");
    } else {
      Object.entries(thresholds).forEach(([key, value]) => {
        if (
          typeof value !== "number" ||
          !Number.isFinite(value) ||
          value < 0 ||
          value > 1
        ) {
          errors.push(
            `overrides.thresholds.${key} must be between 0 and 1.`
          );
        }
      });
    }

    if (!isObject(profile.overrides.benchmark)) {
      errors.push("overrides.benchmark must be an object.");
    }
  }

  if (!Array.isArray(profile.disabledFactors)) {
    errors.push("disabledFactors must be an array.");
  }

  if (!Array.isArray(profile.addedFactors)) {
    errors.push("addedFactors must be an array.");
  } else {
    profile.addedFactors.forEach((factor, index) => {
      if (!isObject(factor)) {
        errors.push(
          `addedFactors[${index}] must be an object.`
        );
        return;
      }

      if (!isValidString(factor.factorId)) {
        errors.push(
          `addedFactors[${index}].factorId must be a non-empty string.`
        );
      }

      if (
        typeof factor.weight !== "number" ||
        !Number.isFinite(factor.weight) ||
        factor.weight < 0
      ) {
        errors.push(
          `addedFactors[${index}].weight must be a non-negative number.`
        );
      }

      if (
        factor.minimum !== null &&
        (
          typeof factor.minimum !== "number" ||
          !Number.isFinite(factor.minimum) ||
          factor.minimum < 0 ||
          factor.minimum > 1
        )
      ) {
        errors.push(
          `addedFactors[${index}].minimum must be between 0 and 1 or null.`
        );
      }

      if (!isObject(factor.configuration)) {
        errors.push(
          `addedFactors[${index}].configuration must be an object.`
        );
      }

      if (isValidString(factor.factorId)) {
        const factorDefinition =
          getMeasurementFactorDefinition(factor.factorId);

        if (
          factorDefinition.scoring.strategy === "unsupported"
        ) {
          warnings.push(
            `Added factor is not present in the catalog: ${factor.factorId}`
          );
        } else if (
          !factorDefinition.supportedDimensions.includes(
            "management_scope"
          )
        ) {
          warnings.push(
            `Added factor does not support management_scope: ${factor.factorId}`
          );
        }

        if (
          BASE_MANAGEMENT_SCOPE_FACTORS.includes(
            factor.factorId
          )
        ) {
          warnings.push(
            `Added factor already exists in the base definition: ${factor.factorId}`
          );
        }
      }

      if (factor.weight === 0) {
        warnings.push(
          `Added factor weight is 0: ${factor.factorId || index}`
        );
      }
    });
  }

  if (!isObject(profile.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!profile.metadata.version) {
      errors.push("metadata.version is required.");
    }

    if (!profile.metadata.createdAt) {
      errors.push("metadata.createdAt is required.");
    }
  }

  if (!isObject(profile.extensions)) {
    errors.push("extensions must be an object.");
  }

  if (profile.label === "Unnamed Measurement Profile") {
    warnings.push("label uses the default value.");
  }

  const hasOverrides =
    isObject(profile.overrides) &&
    (
      Object.keys(profile.overrides.weights || {}).length > 0 ||
      Object.keys(profile.overrides.thresholds || {}).length > 0 ||
      Object.keys(profile.overrides.benchmark || {}).length > 0
    );

  if (
    !hasOverrides &&
    (!Array.isArray(profile.disabledFactors) ||
      profile.disabledFactors.length === 0) &&
    (!Array.isArray(profile.addedFactors) ||
      profile.addedFactors.length === 0)
  ) {
    warnings.push(
      "No measurement overrides are configured."
    );
  }

  if (
    typeof profile.rationale !== "string" ||
    profile.rationale.trim().length === 0
  ) {
    warnings.push("rationale is missing.");
  }

  if (
    !isObject(profile.source) ||
    !isValidString(profile.source.type)
  ) {
    warnings.push("source.type is missing.");
  }

  if (
    isObject(profile.overrides) &&
    isObject(profile.overrides.weights) &&
    Object.keys(profile.overrides.weights).length > 0
  ) {
    const weightSum = Object.values(
      profile.overrides.weights
    ).reduce((sum, value) => sum + value, 0);

    const roundedWeightSum =
      Math.round(weightSum * 1000000) / 1000000;

    if (roundedWeightSum !== 1) {
      warnings.push(
        `Override weights sum is ${roundedWeightSum}, not 1.`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

module.exports = {
  validateMeasurementProfile,
};