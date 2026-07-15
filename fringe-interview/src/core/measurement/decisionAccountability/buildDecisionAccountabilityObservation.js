const ALLOWED_DECISION_AUTHORITIES = ["none", "recommendation", "shared", "final"];
const ALLOWED_CONSEQUENCE_SCOPES = ["individual_task", "team", "function", "site", "organization"];
const ALLOWED_ACCOUNTABILITY_EVIDENCE = ["claimed", "implicit", "explicit", "explicit_with_outcomes"];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeObservationId(value) {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function normalizeEnum(value, allowedValues, fallback) {
  return allowedValues.includes(value) ? value : fallback;
}

function normalizeNonNegativeNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
}

function normalizeUnitInterval(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 1);
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((item) => typeof item === "string" && item.trim().length > 0)));
}

function buildDecisionAccountabilityObservation(input = {}) {
  const source = isObject(input) ? input : {};
  const decisionAuthority = normalizeEnum(source.decisionAuthority, ALLOWED_DECISION_AUTHORITIES, "none");
  const consequenceScope = normalizeEnum(source.consequenceScope, ALLOWED_CONSEQUENCE_SCOPES, "individual_task");
  const accountabilityEvidence = normalizeEnum(source.accountabilityEvidence, ALLOWED_ACCOUNTABILITY_EVIDENCE, "claimed");
  const responsibilityContinuityMonths = normalizeNonNegativeNumber(source.responsibilityContinuityMonths);
  const evidenceIds = normalizeStringArray(source.evidenceIds);
  const inference = isObject(source.inferenceSupportInputs) ? source.inferenceSupportInputs : {};
  const metadata = isObject(source.metadata) ? source.metadata : {};

  return {
    observationId: normalizeObservationId(source.observationId),
    observationType: "decision_accountability",
    observationStatus:
      decisionAuthority === "none" &&
      responsibilityContinuityMonths === 0 &&
      evidenceIds.length === 0
        ? "not_observed"
        : "observed",
    decisionAuthority,
    consequenceScope,
    accountabilityEvidence,
    responsibilityContinuityMonths,
    context: isObject(source.context) ? { ...source.context } : {},
    evidenceIds,
    inferenceSupportInputs: {
      evidenceQuality: normalizeUnitInterval(inference.evidenceQuality),
      sourceConvergence: normalizeUnitInterval(inference.sourceConvergence),
      consistency: normalizeUnitInterval(inference.consistency),
      coverage: normalizeUnitInterval(inference.coverage),
    },
    limitations: normalizeStringArray(source.limitations),
    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
      ...metadata,
    },
    extensions: isObject(source.extensions) ? { ...source.extensions } : {},
  };
}

module.exports = { buildDecisionAccountabilityObservation };
