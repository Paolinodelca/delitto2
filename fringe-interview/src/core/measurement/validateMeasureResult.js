function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isStringArray(value) {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "string" &&
        item.trim().length > 0
    )
  );
}

function validateMeasureResult(measureResult = {}) {
  const errors = [];

  if (!isObject(measureResult)) {
    return {
      isValid: false,
      errors: ["MeasureResult must be an object."],
    };
  }

  if (!measureResult.measureStatus) {
    errors.push("measureStatus is required.");
  }

  if (!measureResult.dimensionId) {
    errors.push("dimensionId is required.");
  }

  if (
    typeof measureResult.value !== "number" ||
    measureResult.value < 0 ||
    measureResult.value > 1
  ) {
    errors.push(
      "value must be a number between 0 and 1."
    );
  }

  if (!isObject(measureResult.measurementContext)) {
    errors.push(
      "measurementContext must be an object."
    );
  } else {
    if (
      !measureResult.measurementContext
        .baseDefinitionId
    ) {
      errors.push(
        "measurementContext.baseDefinitionId is required."
      );
    }

    if (
      typeof measureResult.measurementContext
        .profileApplied !== "boolean"
    ) {
      errors.push(
        "measurementContext.profileApplied must be a boolean."
      );
    }

    if (
      measureResult.measurementContext.profileId !==
        null &&
      typeof measureResult.measurementContext
        .profileId !== "string"
    ) {
      errors.push(
        "measurementContext.profileId must be a string or null."
      );
    }

    if (
      measureResult.measurementContext
        .effectiveModelId !== null &&
      typeof measureResult.measurementContext
        .effectiveModelId !== "string"
    ) {
      errors.push(
        "measurementContext.effectiveModelId must be a string or null."
      );
    }

    if (
      !isStringArray(
        measureResult.measurementContext
          .activeFactors
      )
    ) {
      errors.push(
        "measurementContext.activeFactors must be an array of non-empty strings."
      );
    }

    if (
      !isStringArray(
        measureResult.measurementContext
          .disabledFactors
      )
    ) {
      errors.push(
        "measurementContext.disabledFactors must be an array of non-empty strings."
      );
    }

    if (
      !isStringArray(
        measureResult.measurementContext
          .addedFactors
      )
    ) {
      errors.push(
        "measurementContext.addedFactors must be an array of non-empty strings."
      );
    }
  }

  if (
    !["observed", "inferred", "unknown"].includes(
      measureResult.observationStatus
    )
  ) {
    errors.push(
      "observationStatus must be observed, inferred, or unknown."
    );
  }

  if (
    typeof measureResult.confidence !== "number" ||
    measureResult.confidence < 0 ||
    measureResult.confidence > 1
  ) {
    errors.push(
      "confidence must be a number between 0 and 1."
    );
  }

  if (!measureResult.benchmarkId) {
    errors.push("benchmarkId is required.");
  }

  if (!Array.isArray(measureResult.observationResults)) {
    errors.push(
      "observationResults must be an array."
    );
  } else {
    measureResult.observationResults.forEach(
      (observationResult, index) => {
        if (!isObject(observationResult)) {
          errors.push(
            `observationResults[${index}] must be an object.`
          );
          return;
        }

        if (!isObject(observationResult.components)) {
          errors.push(
            `observationResults[${index}].components must be an object.`
          );
        } else {
          Object.entries(
            observationResult.components
          ).forEach(
            ([factorId, component]) => {
              if (!isObject(component)) {
                errors.push(
                  `observationResults[${index}].components.${factorId} must be an object.`
                );
                return;
              }

              if (
                component.factorId !== factorId
              ) {
                errors.push(
                  `observationResults[${index}].components.${factorId}.factorId must match the component key.`
                );
              }

              if (
                typeof component.normalizedValue !==
                  "number" ||
                component.normalizedValue < 0 ||
                component.normalizedValue > 1
              ) {
                errors.push(
                  `observationResults[${index}].components.${factorId}.normalizedValue must be between 0 and 1.`
                );
              }

              if (
                typeof component.weight !==
                  "number" ||
                component.weight < 0 ||
                component.weight > 1
              ) {
                errors.push(
                  `observationResults[${index}].components.${factorId}.weight must be between 0 and 1.`
                );
              }

              if (
                typeof component.weightedScore !==
                "number"
              ) {
                errors.push(
                  `observationResults[${index}].components.${factorId}.weightedScore must be a number.`
                );
              }
            }
          );
        }

        if (!isObject(observationResult.factorUsage)) {
          errors.push(
            `observationResults[${index}].factorUsage must be an object.`
          );
          return;
        }

        if (
          !isStringArray(
            observationResult.factorUsage
              .activeFactors
          )
        ) {
          errors.push(
            `observationResults[${index}].factorUsage.activeFactors must be an array of non-empty strings.`
          );
        }

        if (
          !isStringArray(
            observationResult.factorUsage
              .disabledFactors
          )
        ) {
          errors.push(
            `observationResults[${index}].factorUsage.disabledFactors must be an array of non-empty strings.`
          );
        }

        if (
          !isStringArray(
            observationResult.factorUsage
              .unavailableFactors
          )
        ) {
          errors.push(
            `observationResults[${index}].factorUsage.unavailableFactors must be an array of non-empty strings.`
          );
        }
      }
    );
  }

  if (!Array.isArray(measureResult.evidenceIds)) {
    errors.push("evidenceIds must be an array.");
  }

  if (!Array.isArray(measureResult.limitations)) {
    errors.push("limitations must be an array.");
  }

  if (!isObject(measureResult.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!measureResult.metadata.version) {
      errors.push("metadata.version is required.");
    }

    if (!measureResult.metadata.createdAt) {
      errors.push("metadata.createdAt is required.");
    }
  }

  if (!isObject(measureResult.extensions)) {
    errors.push("extensions must be an object.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateMeasureResult,
};