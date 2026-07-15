const ALLOWED_DECISION_AUTHORITIES = ["none", "recommendation", "shared", "final"];
const ALLOWED_CONSEQUENCE_SCOPES = ["individual_task", "team", "function", "site", "organization"];
const ALLOWED_ACCOUNTABILITY_EVIDENCE = ["claimed", "implicit", "explicit", "explicit_with_outcomes"];
const ALLOWED_OBSERVATION_STATUSES = ["not_observed", "observed"];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isUnitInterval(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

function validateDecisionAccountabilityObservation(observation = {}) {
  const errors = [];
  const warnings = [];

  if (!isObject(observation)) {
    return { isValid: false, errors: ["DecisionAccountabilityObservation must be an object."], warnings: [] };
  }

  if (typeof observation.observationId !== "string" || observation.observationId.trim().length === 0) {
    errors.push("observationId must be a non-empty string.");
  }
  if (observation.observationType !== "decision_accountability") {
    errors.push('observationType must be "decision_accountability".');
  }
  if (!ALLOWED_OBSERVATION_STATUSES.includes(observation.observationStatus)) {
    errors.push("observationStatus is not allowed.");
  }
  if (!ALLOWED_DECISION_AUTHORITIES.includes(observation.decisionAuthority)) {
    errors.push("decisionAuthority is not allowed.");
  }
  if (!ALLOWED_CONSEQUENCE_SCOPES.includes(observation.consequenceScope)) {
    errors.push("consequenceScope is not allowed.");
  }
  if (!ALLOWED_ACCOUNTABILITY_EVIDENCE.includes(observation.accountabilityEvidence)) {
    errors.push("accountabilityEvidence is not allowed.");
  }
  if (typeof observation.responsibilityContinuityMonths !== "number" || !Number.isFinite(observation.responsibilityContinuityMonths) || observation.responsibilityContinuityMonths < 0) {
    errors.push("responsibilityContinuityMonths must be a non-negative finite number.");
  }
  if (!isObject(observation.context)) errors.push("context must be an object.");
  if (!Array.isArray(observation.evidenceIds)) errors.push("evidenceIds must be an array.");

  if (!isObject(observation.inferenceSupportInputs)) {
    errors.push("inferenceSupportInputs must be an object.");
  } else {
    ["evidenceQuality", "sourceConvergence", "consistency", "coverage"].forEach((field) => {
      if (!isUnitInterval(observation.inferenceSupportInputs[field])) {
        errors.push(`inferenceSupportInputs.${field} must be between 0 and 1.`);
      }
    });
  }

  if (!Array.isArray(observation.limitations)) errors.push("limitations must be an array.");
  if (!isObject(observation.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    if (!observation.metadata.version) errors.push("metadata.version is required.");
    if (!observation.metadata.createdAt) errors.push("metadata.createdAt is required.");
  }
  if (!isObject(observation.extensions)) errors.push("extensions must be an object.");

  if (observation.observationStatus === "not_observed") warnings.push("observationStatus is not_observed.");
  if (Array.isArray(observation.evidenceIds) && observation.evidenceIds.length === 0) warnings.push("evidenceIds is empty.");
  if (observation.decisionAuthority === "none") warnings.push("decisionAuthority is none.");
  if (observation.accountabilityEvidence === "claimed") warnings.push("accountabilityEvidence is claimed.");
  if (observation.responsibilityContinuityMonths === 0) warnings.push("responsibilityContinuityMonths is 0.");

  if (isObject(observation.inferenceSupportInputs)) {
    ["evidenceQuality", "sourceConvergence", "consistency", "coverage"].forEach((field) => {
      if (typeof observation.inferenceSupportInputs[field] === "number" && observation.inferenceSupportInputs[field] < 0.5) {
        warnings.push(`inferenceSupportInputs.${field} is below 0.5.`);
      }
    });
  }

  if (Array.isArray(observation.limitations) && observation.limitations.length > 0) {
    warnings.push("limitations is not empty.");
  }

  return { isValid: errors.length === 0, errors, warnings };
}

module.exports = { validateDecisionAccountabilityObservation };
