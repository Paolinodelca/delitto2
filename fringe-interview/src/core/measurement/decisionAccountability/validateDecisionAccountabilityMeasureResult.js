const ALLOWED_RESULT_STATUSES = ["draft", "not_observed", "invalid"];
const ALLOWED_BANDS = ["not_supported", "weak", "moderate", "strong", "very_strong"];
const ALLOWED_INFERENCE_BANDS = ["none", "low", "moderate", "high", "very_high"];
const COMPONENT_FIELDS = [
  "decisionAuthorityScore",
  "consequenceScopeScore",
  "accountabilityEvidenceScore",
  "responsibilityContinuityScore",
];
const WEIGHT_FIELDS = [
  "decisionAuthority",
  "consequenceScope",
  "accountabilityEvidence",
  "responsibilityContinuity",
];
const INFERENCE_FIELDS = [
  "evidenceQuality",
  "sourceConvergence",
  "consistency",
  "coverage",
];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isUnitInterval(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

function validateDecisionAccountabilityMeasureResult(result = {}) {
  const errors = [];
  const warnings = [];

  if (!isObject(result)) {
    return { isValid: false, errors: ["DecisionAccountabilityMeasureResult must be an object."], warnings: [] };
  }

  if (result.measureId !== "decision_accountability") errors.push('measureId must be "decision_accountability".');
  if (!ALLOWED_RESULT_STATUSES.includes(result.resultStatus)) errors.push("resultStatus is not allowed.");
  if (typeof result.observationId !== "string" || result.observationId.trim().length === 0) errors.push("observationId must be a non-empty string.");
  if (!isUnitInterval(result.score)) errors.push("score must be between 0 and 1.");
  if (!ALLOWED_BANDS.includes(result.band)) errors.push("band is not allowed.");

  if (!isObject(result.components)) {
    errors.push("components must be an object.");
  } else {
    COMPONENT_FIELDS.forEach((field) => {
      if (!isUnitInterval(result.components[field])) errors.push(`components.${field} must be between 0 and 1.`);
    });
  }

  if (!isObject(result.weights)) {
    errors.push("weights must be an object.");
  } else {
    WEIGHT_FIELDS.forEach((field) => {
      const value = result.weights[field];
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
        errors.push(`weights.${field} must be a non-negative number.`);
      }
    });
  }

  if (!isObject(result.benchmarkReference)) {
    errors.push("benchmarkReference must be an object.");
  } else if (
    typeof result.benchmarkReference.responsibilityContinuityMonths !== "number" ||
    !Number.isFinite(result.benchmarkReference.responsibilityContinuityMonths) ||
    result.benchmarkReference.responsibilityContinuityMonths <= 0
  ) {
    errors.push("benchmarkReference.responsibilityContinuityMonths must be a positive number.");
  }

  if (!isObject(result.inferenceSupport)) {
    errors.push("inferenceSupport must be an object.");
  } else {
    if (!isUnitInterval(result.inferenceSupport.value)) errors.push("inferenceSupport.value must be between 0 and 1.");
    if (!ALLOWED_INFERENCE_BANDS.includes(result.inferenceSupport.band)) errors.push("inferenceSupport.band is not allowed.");
    if (!isObject(result.inferenceSupport.components)) {
      errors.push("inferenceSupport.components must be an object.");
    } else {
      INFERENCE_FIELDS.forEach((field) => {
        if (!isUnitInterval(result.inferenceSupport.components[field])) {
          errors.push(`inferenceSupport.components.${field} must be between 0 and 1.`);
        }
      });
    }
  }

  if (!Array.isArray(result.evidenceIds)) errors.push("evidenceIds must be an array.");
  if (!isObject(result.context)) errors.push("context must be an object.");

  if (!isObject(result.explainability)) {
    errors.push("explainability must be an object.");
  } else {
    if (result.explainability.strongestComponent !== null && typeof result.explainability.strongestComponent !== "string") {
      errors.push("explainability.strongestComponent must be a string or null.");
    }
    if (result.explainability.weakestComponent !== null && typeof result.explainability.weakestComponent !== "string") {
      errors.push("explainability.weakestComponent must be a string or null.");
    }
    if (!Array.isArray(result.explainability.notes)) errors.push("explainability.notes must be an array.");
  }

  if (!Array.isArray(result.limitations)) errors.push("limitations must be an array.");

  if (!isObject(result.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!result.metadata.version) errors.push("metadata.version is required.");
    if (!result.metadata.createdAt) errors.push("metadata.createdAt is required.");
  }

  if (!isObject(result.extensions)) errors.push("extensions must be an object.");

  if (result.resultStatus !== "draft") warnings.push("resultStatus is not draft.");
  if (typeof result.score === "number" && result.score < 0.5) warnings.push("score is below 0.5.");
  if (["not_supported", "weak"].includes(result.band)) warnings.push("band indicates limited measured strength.");
  if (isObject(result.inferenceSupport) && typeof result.inferenceSupport.value === "number" && result.inferenceSupport.value < 0.5) warnings.push("inferenceSupport.value is below 0.5.");
  if (Array.isArray(result.evidenceIds) && result.evidenceIds.length === 0) warnings.push("evidenceIds is empty.");
  if (Array.isArray(result.limitations) && result.limitations.length > 0) warnings.push("limitations is not empty.");

  if (isObject(result.weights)) {
    const total = WEIGHT_FIELDS.reduce((sum, field) => sum + (typeof result.weights[field] === "number" ? result.weights[field] : 0), 0);
    if (Math.abs(total - 1) > 0.0001) warnings.push("weights total differs from 1.");
  }

  return { isValid: errors.length === 0, errors, warnings };
}

module.exports = { validateDecisionAccountabilityMeasureResult };
