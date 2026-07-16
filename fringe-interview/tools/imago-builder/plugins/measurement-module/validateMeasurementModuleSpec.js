const {
  buildMeasurementModuleNaming,
} = require("./buildMeasurementModuleNaming");

const SPEC_STATUSES = [
  "draft",
  "configuration_required",
  "ready",
];

const DIRECTIONS = [
  "positive",
  "inverse",
];

const SCORING_STATUSES = [
  "configuration_required",
  "configured",
];

const PROVENANCE_STATUSES = [
  "hypothesis",
  "project_reviewed",
  "expert_reviewed",
  "document_supported",
  "empirically_validated",
  "deprecated",
];

const GENERATION_FIELDS = [
  "includeObservationBuilder",
  "includeObservationValidator",
  "includeMeasureDefinition",
  "includeMeasureResultBuilder",
  "includeMeasureResultValidator",
  "includeIndex",
  "includeHealth",
  "includeObservationTest",
  "includeMeasureResultTest",
  "includeHealthTest",
  "includeRegression",
  "includeManifest",
];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isCamelCase(value) {
  return typeof value === "string" && /^[a-z][A-Za-z0-9]*$/.test(value);
}

function isPascalCase(value) {
  return typeof value === "string" && /^[A-Z][A-Za-z0-9]*$/.test(value);
}

function isSnakeCase(value) {
  return typeof value === "string" && /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/.test(value);
}

function isUpperSnakeCase(value) {
  return typeof value === "string" && /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/.test(value);
}

function isUnitInterval(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

function approximatelyEqual(first, second, tolerance = 0.000001) {
  return typeof first === "number" &&
    typeof second === "number" &&
    Math.abs(first - second) <= tolerance;
}

function hasDuplicates(values) {
  return new Set(values).size !== values.length;
}

function addDuplicateErrors(values, label, errors, skipNull = false) {
  const counts = new Map();

  values.forEach((value) => {
    if (skipNull && value === null) {
      return;
    }

    counts.set(value, (counts.get(value) || 0) + 1);
  });

  counts.forEach((count, value) => {
    if (count > 1) {
      errors.push(`Duplicate ${label}: ${String(value)}.`);
    }
  });
}

function scoringMapIsComplete(factor) {
  if (!isObject(factor) || factor.scoringStatus !== "configured") {
    return false;
  }

  if (!Array.isArray(factor.allowedValues) || !isObject(factor.scoringMap)) {
    return false;
  }

  const keys = Object.keys(factor.scoringMap);

  return (
    factor.allowedValues.length > 0 &&
    keys.length === factor.allowedValues.length &&
    factor.allowedValues.every((allowedValue) => {
      const value = factor.scoringMap[allowedValue];

      return Object.prototype.hasOwnProperty.call(factor.scoringMap, allowedValue) &&
        isUnitInterval(value);
    })
  );
}

function generationDependenciesAreCoherent(generation) {
  return !(
    (generation.includeObservationValidator && !generation.includeObservationBuilder) ||
    (generation.includeMeasureResultBuilder && !generation.includeMeasureDefinition) ||
    (generation.includeMeasureResultValidator && !generation.includeMeasureResultBuilder) ||
    (generation.includeObservationTest && !generation.includeObservationBuilder) ||
    (generation.includeMeasureResultTest && !generation.includeMeasureResultBuilder) ||
    (generation.includeHealthTest && !generation.includeHealth) ||
    (generation.includeRegression && !generation.includeMeasureResultBuilder)
  );
}

function benchmarkIsSerializable(value) {
  const seen = new Set();

  function visit(item) {
    const type = typeof item;

    if (type === "undefined" || type === "function" || type === "symbol" || type === "bigint") {
      return false;
    }

    if (item === null || type !== "object") {
      return true;
    }

    if (seen.has(item)) {
      return false;
    }

    seen.add(item);

    const values = Array.isArray(item)
      ? item
      : Object.values(item);

    const valid = values.every(visit);
    seen.delete(item);
    return valid;
  }

  return visit(value);
}

function computeSemanticCompletion(spec) {
  const factors = Array.isArray(spec.factors) ? spec.factors : [];
  const scoringConfigured =
    factors.length > 0 &&
    factors.every(scoringMapIsComplete);
  const explainabilityConfigured =
    factors.length > 0 &&
    factors.every((factor) => isNonEmptyString(factor.explainabilityKey)) &&
    isObject(spec.extensions) &&
    isObject(spec.extensions.explainabilityConfiguration) &&
    Object.keys(spec.extensions.explainabilityConfiguration).length > 0;
  const benchmarkConfigured =
    isObject(spec.benchmarkReference) &&
    Object.keys(spec.benchmarkReference).length > 0;
  const naming = isObject(spec.naming) ? spec.naming : {};
  const namingAvailable =
    isNonEmptyString(naming.moduleDirectory) &&
    isNonEmptyString(naming.pascalName) &&
    isNonEmptyString(naming.camelName) &&
    isNonEmptyString(naming.snakeName) &&
    isNonEmptyString(naming.constantName);
  const generationCoherent =
    isObject(spec.generation) &&
    generationDependenciesAreCoherent(spec.generation);
  const readyForGeneration =
    isNonEmptyString(spec.measureId) &&
    namingAvailable &&
    factors.length > 0 &&
    generationCoherent;
  const missingItems = [];

  if (!scoringConfigured) {
    missingItems.push("scoring_configuration");
  }

  if (!explainabilityConfigured) {
    missingItems.push("explainability_configuration");
  }

  if (!benchmarkConfigured) {
    missingItems.push("benchmark_configuration");
  }

  return {
    scoringConfigured,
    explainabilityConfigured,
    benchmarkConfigured,
    readyForGeneration,
    missingItems,
  };
}

function deriveSpecStatus(spec, semanticCompletion) {
  const naming = isObject(spec.naming) ? spec.naming : {};
  const namingEssential =
    isNonEmptyString(naming.moduleDirectory) &&
    isNonEmptyString(naming.pascalName) &&
    isNonEmptyString(naming.camelName) &&
    isNonEmptyString(naming.snakeName) &&
    isNonEmptyString(naming.constantName);
  const factors = Array.isArray(spec.factors) ? spec.factors : [];

  if (!isNonEmptyString(spec.measureId) || factors.length === 0 || !namingEssential) {
    return "draft";
  }

  if (
    semanticCompletion.scoringConfigured &&
    semanticCompletion.explainabilityConfigured &&
    semanticCompletion.benchmarkConfigured &&
    semanticCompletion.readyForGeneration
  ) {
    return "ready";
  }

  return "configuration_required";
}

function validateMeasurementModuleSpec(spec = {}) {
  const errors = [];
  const warnings = [];

  if (!isObject(spec)) {
    return {
      isValid: false,
      errors: ["MeasurementModuleSpec must be an object."],
      warnings: [],
    };
  }

  if (!isNonEmptyString(spec.specId)) {
    errors.push("specId must be a non-empty string.");
  }

  if (spec.specVersion !== "1.0") {
    errors.push('specVersion must be "1.0".');
  }

  if (!SPEC_STATUSES.includes(spec.specStatus)) {
    errors.push("specStatus is not allowed.");
  }

  if (spec.moduleType !== "measurement") {
    errors.push('moduleType must be "measurement".');
  }

  if (!isSnakeCase(spec.measureId)) {
    errors.push("measureId must be a non-empty snake_case string.");
  }

  if (!isNonEmptyString(spec.label)) {
    errors.push("label must be a non-empty string.");
  }

  if (spec.description !== null && !isNonEmptyString(spec.description)) {
    errors.push("description must be a non-empty string or null.");
  }

  if (!isObject(spec.naming)) {
    errors.push("naming must be an object.");
  } else if (isSnakeCase(spec.measureId)) {
    const canonicalNaming = buildMeasurementModuleNaming({
      measureId: spec.measureId,
    });

    if (!isCamelCase(spec.naming.moduleDirectory)) {
      errors.push("naming.moduleDirectory must be camelCase.");
    }

    if (!isPascalCase(spec.naming.pascalName)) {
      errors.push("naming.pascalName must be PascalCase.");
    }

    if (!isCamelCase(spec.naming.camelName)) {
      errors.push("naming.camelName must be camelCase.");
    }

    if (!isSnakeCase(spec.naming.snakeName)) {
      errors.push("naming.snakeName must be snake_case.");
    }

    if (!isUpperSnakeCase(spec.naming.constantName)) {
      errors.push("naming.constantName must be UPPER_SNAKE_CASE.");
    }

    if (spec.naming.snakeName !== spec.measureId) {
      errors.push("naming.snakeName must equal measureId.");
    }

    Object.entries(canonicalNaming).forEach(([key, value]) => {
      if (spec.naming[key] !== value) {
        errors.push(`naming.${key} must match the canonical derivation from measureId.`);
      }
    });
  }

  if (!Array.isArray(spec.factors)) {
    errors.push("factors must be an array.");
  } else if (spec.factors.length === 0) {
    errors.push("factors must not be empty.");
  }

  if (Array.isArray(spec.factors)) {
    const factorIds = [];
    const observationFields = [];
    const explainabilityKeys = [];
    let totalWeight = 0;

    spec.factors.forEach((factor, index) => {
      if (!isObject(factor)) {
        errors.push(`factors[${index}] must be an object.`);
        return;
      }

      if (!isCamelCase(factor.factorId)) {
        errors.push(`factors[${index}].factorId must be camelCase.`);
      } else {
        factorIds.push(factor.factorId);
      }

      if (!isNonEmptyString(factor.label)) {
        errors.push(`factors[${index}].label must be a non-empty string.`);
      }

      if (factor.description !== null && !isNonEmptyString(factor.description)) {
        errors.push(`factors[${index}].description must be a non-empty string or null.`);
      }

      if (!isCamelCase(factor.observationField)) {
        errors.push(`factors[${index}].observationField must be camelCase.`);
      } else {
        observationFields.push(factor.observationField);
      }

      if (factor.valueType !== "enum") {
        errors.push(`factors[${index}].valueType must be enum.`);
      }

      if (!Array.isArray(factor.allowedValues) || factor.allowedValues.length === 0) {
        errors.push(`factors[${index}].allowedValues must be a non-empty array.`);
      } else {
        if (hasDuplicates(factor.allowedValues)) {
          errors.push(`factors[${index}].allowedValues must not contain duplicates.`);
        }

        factor.allowedValues.forEach((allowedValue) => {
          if (!isSnakeCase(allowedValue)) {
            errors.push(`factors[${index}].allowedValues must contain only snake_case values.`);
          }
        });
      }

      if (
        typeof factor.defaultValue !== "string" ||
        !Array.isArray(factor.allowedValues) ||
        !factor.allowedValues.includes(factor.defaultValue)
      ) {
        errors.push(`factors[${index}].defaultValue must be an allowed enum value.`);
      }

      if (
        typeof factor.weight !== "number" ||
        !Number.isFinite(factor.weight) ||
        factor.weight < 0
      ) {
        errors.push(`factors[${index}].weight must be a non-negative finite number.`);
      } else {
        totalWeight += factor.weight;
      }

      if (!DIRECTIONS.includes(factor.direction)) {
        errors.push(`factors[${index}].direction is not allowed.`);
      } else if (factor.direction === "inverse") {
        warnings.push(`factors[${index}] uses inverse direction.`);
      }

      if (!SCORING_STATUSES.includes(factor.scoringStatus)) {
        errors.push(`factors[${index}].scoringStatus is not allowed.`);
      }

      if (!isObject(factor.scoringMap)) {
        errors.push(`factors[${index}].scoringMap must be an object.`);
      } else if (factor.scoringStatus === "configured") {
        const keys = Object.keys(factor.scoringMap);
        const allowedValues = Array.isArray(factor.allowedValues)
          ? factor.allowedValues
          : [];

        if (keys.length !== allowedValues.length) {
          errors.push(`factors[${index}].scoringMap must contain exactly all allowedValues.`);
        }

        keys.forEach((key) => {
          if (!allowedValues.includes(key)) {
            errors.push(`factors[${index}].scoringMap contains an unknown key: ${key}.`);
          }

          if (!isUnitInterval(factor.scoringMap[key])) {
            errors.push(`factors[${index}].scoringMap.${key} must be between 0 and 1.`);
          }
        });

        allowedValues.forEach((allowedValue) => {
          if (!Object.prototype.hasOwnProperty.call(factor.scoringMap, allowedValue)) {
            errors.push(`factors[${index}].scoringMap is missing ${allowedValue}.`);
          }
        });
      }

      if (factor.benchmarkKey !== null && !isNonEmptyString(factor.benchmarkKey)) {
        errors.push(`factors[${index}].benchmarkKey must be a string or null.`);
      }

      if (factor.explainabilityKey !== null && !isCamelCase(factor.explainabilityKey)) {
        errors.push(`factors[${index}].explainabilityKey must be camelCase or null.`);
      } else if (factor.explainabilityKey !== null) {
        explainabilityKeys.push(factor.explainabilityKey);
      }

      if (!isObject(factor.metadata)) {
        errors.push(`factors[${index}].metadata must be an object.`);
      }

      if (!isObject(factor.extensions)) {
        errors.push(`factors[${index}].extensions must be an object.`);
      }

      if (factor.scoringStatus === "configuration_required") {
        warnings.push(`factors[${index}] requires scoring configuration.`);
      }
    });

    addDuplicateErrors(factorIds, "factorId", errors);
    addDuplicateErrors(observationFields, "observationField", errors);
    addDuplicateErrors(explainabilityKeys, "explainabilityKey", errors, true);

    if (!approximatelyEqual(totalWeight, 1)) {
      errors.push("Factor weights must sum to 1.");
    }
  }

  if (!isObject(spec.benchmarkReference)) {
    errors.push("benchmarkReference must be an object.");
  } else if (!benchmarkIsSerializable(spec.benchmarkReference)) {
    errors.push("benchmarkReference must be JSON-serializable.");
  }

  if (!isObject(spec.thresholds)) {
    errors.push("thresholds must be an object.");
  } else {
    const { weak, moderate, strong, veryStrong } = spec.thresholds;

    if (
      !isUnitInterval(weak) ||
      !isUnitInterval(moderate) ||
      !isUnitInterval(strong) ||
      !isUnitInterval(veryStrong) ||
      !(weak < moderate && moderate < strong && strong < veryStrong)
    ) {
      errors.push("thresholds must satisfy 0 <= weak < moderate < strong < veryStrong <= 1.");
    }
  }

  if (!isObject(spec.inferenceSupport)) {
    errors.push("inferenceSupport must be an object.");
  } else {
    const fields = spec.inferenceSupport.fields;
    const weights = spec.inferenceSupport.weights;

    if (!Array.isArray(fields) || fields.length === 0) {
      errors.push("inferenceSupport.fields must be a non-empty array.");
    } else {
      if (hasDuplicates(fields)) {
        errors.push("inferenceSupport.fields must not contain duplicates.");
      }

      fields.forEach((field) => {
        if (!isCamelCase(field)) {
          errors.push("inferenceSupport.fields must contain only camelCase values.");
        }
      });
    }

    if (!isObject(weights)) {
      errors.push("inferenceSupport.weights must be an object.");
    } else if (Array.isArray(fields)) {
      const fieldSet = new Set(fields);
      const weightKeys = Object.keys(weights);

      if (
        weightKeys.length !== fields.length ||
        weightKeys.some((key) => !fieldSet.has(key)) ||
        fields.some((field) => !Object.prototype.hasOwnProperty.call(weights, field))
      ) {
        errors.push("inferenceSupport.weights keys must exactly match fields.");
      }

      let total = 0;
      weightKeys.forEach((key) => {
        const weight = weights[key];

        if (
          typeof weight !== "number" ||
          !Number.isFinite(weight) ||
          weight < 0
        ) {
          errors.push(`inferenceSupport.weights.${key} must be a non-negative finite number.`);
        } else {
          total += weight;
        }
      });

      if (!approximatelyEqual(total, 1)) {
        errors.push("inferenceSupport weights must sum to 1.");
      }
    }
  }

  if (!isObject(spec.observation)) {
    errors.push("observation must be an object.");
  } else {
    [
      "contextEnabled",
      "evidenceIdsEnabled",
      "limitationsEnabled",
    ].forEach((field) => {
      if (typeof spec.observation[field] !== "boolean") {
        errors.push(`observation.${field} must be a boolean.`);
      }
    });

    const policy = spec.observation.notObservedPolicy;

    if (!isObject(policy)) {
      errors.push("observation.notObservedPolicy must be an object.");
    } else {
      if (typeof policy.requireEmptyEvidenceIds !== "boolean") {
        errors.push("observation.notObservedPolicy.requireEmptyEvidenceIds must be a boolean.");
      }

      if (!Array.isArray(policy.zeroFields)) {
        errors.push("observation.notObservedPolicy.zeroFields must be an array.");
      } else {
        const observationFields = new Set(
          Array.isArray(spec.factors)
            ? spec.factors
                .filter(isObject)
                .map((factor) => factor.observationField)
            : []
        );

        policy.zeroFields.forEach((field) => {
          if (!observationFields.has(field)) {
            errors.push(`observation.notObservedPolicy.zeroFields contains unknown field: ${field}.`);
          }
        });
      }

      if (typeof policy.zeroInferenceSupport !== "boolean") {
        errors.push("observation.notObservedPolicy.zeroInferenceSupport must be a boolean.");
      }
    }
  }

  if (!isObject(spec.generation)) {
    errors.push("generation must be an object.");
  } else {
    GENERATION_FIELDS.forEach((field) => {
      if (typeof spec.generation[field] !== "boolean") {
        errors.push(`generation.${field} must be a boolean.`);
      }
    });

    if (spec.generation.includeObservationValidator && !spec.generation.includeObservationBuilder) {
      errors.push("includeObservationValidator requires includeObservationBuilder.");
    }

    if (spec.generation.includeMeasureResultBuilder && !spec.generation.includeMeasureDefinition) {
      errors.push("includeMeasureResultBuilder requires includeMeasureDefinition.");
    }

    if (spec.generation.includeMeasureResultValidator && !spec.generation.includeMeasureResultBuilder) {
      errors.push("includeMeasureResultValidator requires includeMeasureResultBuilder.");
    }

    if (spec.generation.includeObservationTest && !spec.generation.includeObservationBuilder) {
      errors.push("includeObservationTest requires includeObservationBuilder.");
    }

    if (spec.generation.includeMeasureResultTest && !spec.generation.includeMeasureResultBuilder) {
      errors.push("includeMeasureResultTest requires includeMeasureResultBuilder.");
    }

    if (spec.generation.includeHealthTest && !spec.generation.includeHealth) {
      errors.push("includeHealthTest requires includeHealth.");
    }

    if (spec.generation.includeRegression && !spec.generation.includeMeasureResultBuilder) {
      errors.push("includeRegression requires includeMeasureResultBuilder.");
    }

    if (GENERATION_FIELDS.some((field) => spec.generation[field] === false)) {
      warnings.push("One or more generation options are disabled.");
    }
  }

  if (!isObject(spec.semanticCompletion)) {
    errors.push("semanticCompletion must be an object.");
  } else {
    [
      "scoringConfigured",
      "explainabilityConfigured",
      "benchmarkConfigured",
      "readyForGeneration",
    ].forEach((field) => {
      if (typeof spec.semanticCompletion[field] !== "boolean") {
        errors.push(`semanticCompletion.${field} must be a boolean.`);
      }
    });

    if (
      !Array.isArray(spec.semanticCompletion.missingItems) ||
      !spec.semanticCompletion.missingItems.every(isNonEmptyString)
    ) {
      errors.push("semanticCompletion.missingItems must be an array of non-empty strings.");
    }

    const actualSemanticCompletion = computeSemanticCompletion(spec);

    [
      "scoringConfigured",
      "explainabilityConfigured",
      "benchmarkConfigured",
      "readyForGeneration",
    ].forEach((field) => {
      if (spec.semanticCompletion[field] !== actualSemanticCompletion[field]) {
        errors.push(`semanticCompletion.${field} is inconsistent with the specification.`);
      }
    });

    if (
      JSON.stringify(spec.semanticCompletion.missingItems) !==
      JSON.stringify(actualSemanticCompletion.missingItems)
    ) {
      errors.push("semanticCompletion.missingItems is inconsistent with the specification.");
    }

    const expectedStatus = deriveSpecStatus(spec, actualSemanticCompletion);

    if (spec.specStatus !== expectedStatus) {
      errors.push(`specStatus must be ${expectedStatus} for the current specification.`);
    }
  }

  if (!isObject(spec.provenance)) {
    errors.push("provenance must be an object.");
  } else {
    if (!PROVENANCE_STATUSES.includes(spec.provenance.status)) {
      errors.push("provenance.status is not allowed.");
    }

    if (!Array.isArray(spec.provenance.sources)) {
      errors.push("provenance.sources must be an array.");
    } else {
      spec.provenance.sources.forEach((source, index) => {
        if (!isObject(source)) {
          errors.push(`provenance.sources[${index}] must be an object.`);
          return;
        }

        if (source.sourceType !== null && !isNonEmptyString(source.sourceType)) {
          errors.push(`provenance.sources[${index}].sourceType must be a string or null.`);
        }

        if (source.sourceId !== null && !isNonEmptyString(source.sourceId)) {
          errors.push(`provenance.sources[${index}].sourceId must be a string or null.`);
        }
      });
    }
  }

  if (spec.rationale !== null && !isNonEmptyString(spec.rationale)) {
    errors.push("rationale must be a non-empty string or null.");
  }

  if (!isObject(spec.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!spec.metadata.version) {
      errors.push("metadata.version is required.");
    }

    if (!spec.metadata.createdAt) {
      errors.push("metadata.createdAt is required.");
    }
  }

  if (!isObject(spec.extensions)) {
    errors.push("extensions must be an object.");
  }

  if (spec.label === "Unnamed Measurement") {
    warnings.push("label is Unnamed Measurement.");
  }

  if (spec.rationale === null) {
    warnings.push("rationale is null.");
  }

  if (spec.description === null) {
    warnings.push("description is null.");
  }

  if (Array.isArray(spec.factors) && spec.factors.length < 2) {
    warnings.push("Specification contains fewer than 2 factors.");
  }

  if (Array.isArray(spec.factors) && spec.factors.length > 6) {
    warnings.push("Specification contains more than 6 factors.");
  }

  if (isObject(spec.benchmarkReference) && Object.keys(spec.benchmarkReference).length === 0) {
    warnings.push("benchmarkReference is empty.");
  }

  if (isObject(spec.semanticCompletion)) {
    if (spec.semanticCompletion.scoringConfigured === false) {
      warnings.push("Semantic scoring configuration is incomplete.");
    }

    if (spec.semanticCompletion.explainabilityConfigured === false) {
      warnings.push("Semantic explainability configuration is incomplete.");
    }

    if (spec.semanticCompletion.benchmarkConfigured === false) {
      warnings.push("Semantic benchmark configuration is incomplete.");
    }
  }

  if (spec.specStatus === "configuration_required") {
    warnings.push("specStatus is configuration_required.");
  }

  if (isObject(spec.provenance)) {
    if (spec.provenance.status === "hypothesis") {
      warnings.push("provenance.status is hypothesis.");
    }

    if (Array.isArray(spec.provenance.sources) && spec.provenance.sources.length === 0) {
      warnings.push("provenance.sources is empty.");
    }
  }

  if (isObject(spec.extensions) && Object.keys(spec.extensions).length > 0) {
    warnings.push("extensions is not empty.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: Array.from(new Set(warnings)),
  };
}

module.exports = {
  validateMeasurementModuleSpec,
};
