const CONTRIBUTION_TYPES = ["supporting", "contradicting"];

const TOP_LEVEL_FIELDS = [
  "id",
  "measurementId",
  "dimensionId",
  "contributionType",
  "contributionValue",
  "confidence",
  "provenance",
  "metadata",
  "extensions",
];
const PROVENANCE_FIELDS = ["measurementResultRef", "sourceRefs"];
const METADATA_FIELDS = ["version", "createdAt", "updatedAt"];
const RAW_PAYLOAD_FIELDS = new Set([
  "content", "rawContent", "sourceContent", "transcript", "prompt", "fullText", "answerText", "cv",
]);

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function validString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
function validUnit(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}
function validIso(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString() === value;
}
function unknownKeys(value, allowed, path, errors) {
  if (!isObject(value)) return;
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) errors.push(`${path}.${key} is not allowed.`);
  }
}
function validateRefArray(value, path, errors) {
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array.`);
    return;
  }
  const seen = new Set();
  value.forEach((ref, index) => {
    if (!validString(ref)) errors.push(`${path}[${index}] must be a non-empty string.`);
    else if (seen.has(ref)) errors.push(`${path} must not contain duplicate references.`);
    else seen.add(ref);
  });
}
function containsRawPayload(value) {
  if (Array.isArray(value)) return value.some(containsRawPayload);
  if (!isObject(value)) return false;
  for (const [key, item] of Object.entries(value)) {
    if (RAW_PAYLOAD_FIELDS.has(key)) return true;
    if (containsRawPayload(item)) return true;
  }
  return false;
}

function validateDimensionContribution(contribution = {}) {
  const errors = [];
  const warnings = [];

  if (!isObject(contribution)) {
    return { valid: false, errors: ["DimensionContribution must be an object."], warnings };
  }

  unknownKeys(contribution, TOP_LEVEL_FIELDS, "dimensionContribution", errors);

  for (const field of ["id", "measurementId", "dimensionId"]) {
    if (!validString(contribution[field])) errors.push(`${field} must be a non-empty string.`);
  }

  if (!CONTRIBUTION_TYPES.includes(contribution.contributionType)) {
    errors.push("contributionType must be supporting or contradicting.");
  }
  if (!validUnit(contribution.contributionValue)) {
    errors.push("contributionValue must be a finite number between 0 and 1.");
  }
  if (!validUnit(contribution.confidence)) {
    errors.push("confidence must be a finite number between 0 and 1.");
  }

  if (!isObject(contribution.provenance)) {
    errors.push("provenance must be an object.");
  } else {
    unknownKeys(contribution.provenance, PROVENANCE_FIELDS, "provenance", errors);
    if (!validString(contribution.provenance.measurementResultRef)) {
      errors.push("provenance.measurementResultRef must be a non-empty string.");
    }
    validateRefArray(contribution.provenance.sourceRefs, "provenance.sourceRefs", errors);
  }

  if (!isObject(contribution.metadata)) {
    errors.push("metadata must be an object.");
  } else {
    unknownKeys(contribution.metadata, METADATA_FIELDS, "metadata", errors);
    if (contribution.metadata.version !== "1.0") errors.push('metadata.version must be "1.0".');
    if (!validIso(contribution.metadata.createdAt)) errors.push("metadata.createdAt must be a valid ISO timestamp.");
    if (!validIso(contribution.metadata.updatedAt)) errors.push("metadata.updatedAt must be a valid ISO timestamp.");
    if (validIso(contribution.metadata.createdAt) && validIso(contribution.metadata.updatedAt) && contribution.metadata.updatedAt < contribution.metadata.createdAt) {
      errors.push("metadata.updatedAt must not precede metadata.createdAt.");
    }
  }

  if (!isObject(contribution.extensions)) errors.push("extensions must be an object.");
  if (containsRawPayload(contribution)) errors.push("DimensionContribution must not contain raw source payloads.");

  if (contribution.contributionValue === 0) warnings.push("contributionValue is 0.");
  if (typeof contribution.confidence === "number" && contribution.confidence < 0.5) warnings.push("confidence is below 0.5.");
  if (isObject(contribution.provenance) && contribution.provenance.sourceRefs.length === 0) warnings.push("provenance.sourceRefs is empty.");

  return { valid: errors.length === 0, errors, warnings };
}

module.exports = { validateDimensionContribution };
