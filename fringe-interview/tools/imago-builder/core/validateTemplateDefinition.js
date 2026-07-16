const ALLOWED_OUTPUT_TYPES = ["javascript", "json", "text"];
const ALLOWED_TARGET_CATEGORIES = [
  "source", "test", "health", "regression", "manifest", "other",
];
const PLACEHOLDER_PATTERN = /\{\{([A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*)\}\}/g;
const PLACEHOLDER_NAME_PATTERN = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/;

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function extractTemplatePlaceholders(content) {
  if (typeof content !== "string") return [];
  const result = [];
  const seen = new Set();
  PLACEHOLDER_PATTERN.lastIndex = 0;
  let match;
  while ((match = PLACEHOLDER_PATTERN.exec(content)) !== null) {
    const placeholder = match[1];
    if (!seen.has(placeholder)) {
      seen.add(placeholder);
      result.push(placeholder);
    }
  }
  return result;
}

function findInvalidPlaceholderSequences(content) {
  if (typeof content !== "string") return [];
  const invalid = [];
  const candidatePattern = /\{\{([\s\S]*?)\}\}/g;
  let match;
  while ((match = candidatePattern.exec(content)) !== null) {
    if (!PLACEHOLDER_NAME_PATTERN.test(match[1])) invalid.push(match[0]);
  }
  return invalid;
}

function hasUnbalancedPlaceholderBraces(content) {
  if (typeof content !== "string") return false;
  const openingCount = (content.match(/\{\{/g) || []).length;
  const closingCount = (content.match(/\}\}/g) || []).length;
  return openingCount !== closingCount;
}

function validateDeclaredPlaceholders({ values, fieldName, errors }) {
  if (!Array.isArray(values)) {
    errors.push(`${fieldName} must be an array.`);
    return [];
  }
  const normalized = [];
  const seen = new Set();
  values.forEach((value, index) => {
    if (typeof value !== "string" || value.trim().length === 0) {
      errors.push(`${fieldName}[${index}] must be a non-empty string.`);
      return;
    }
    if (!PLACEHOLDER_NAME_PATTERN.test(value)) {
      errors.push(`${fieldName}[${index}] must be UPPER_SNAKE_CASE.`);
    }
    if (seen.has(value)) {
      errors.push(`${fieldName} contains duplicate placeholder: ${value}.`);
      return;
    }
    seen.add(value);
    normalized.push(value);
  });
  return normalized;
}

function validateTemplateDefinition(template = {}) {
  const errors = [];
  const warnings = [];
  if (!isObject(template)) {
    return { isValid: false, errors: ["TemplateDefinition must be an object."], warnings: [] };
  }
  if (typeof template.templateId !== "string" || template.templateId.trim().length === 0) {
    errors.push("templateId must be a non-empty string.");
  }
  if (template.templateVersion !== "1.0") errors.push('templateVersion must be "1.0".');
  if (!ALLOWED_OUTPUT_TYPES.includes(template.outputType)) errors.push("outputType is not allowed.");
  if (!ALLOWED_TARGET_CATEGORIES.includes(template.targetCategory)) errors.push("targetCategory is not allowed.");

  const requiredPlaceholders = validateDeclaredPlaceholders({
    values: template.requiredPlaceholders,
    fieldName: "requiredPlaceholders",
    errors,
  });
  const optionalPlaceholders = validateDeclaredPlaceholders({
    values: template.optionalPlaceholders,
    fieldName: "optionalPlaceholders",
    errors,
  });
  const requiredSet = new Set(requiredPlaceholders);
  optionalPlaceholders.forEach((placeholder) => {
    if (requiredSet.has(placeholder)) {
      errors.push(`Placeholder declared as both required and optional: ${placeholder}.`);
    }
  });

  if (typeof template.content !== "string") {
    errors.push("content must be a string.");
  } else {
    if (hasUnbalancedPlaceholderBraces(template.content)) {
      errors.push("content contains unbalanced placeholder braces.");
    }
    findInvalidPlaceholderSequences(template.content).forEach((sequence) => {
      errors.push(`content contains invalid placeholder syntax: ${sequence}.`);
    });
    const contentPlaceholders = extractTemplatePlaceholders(template.content);
    const declaredSet = new Set([...requiredPlaceholders, ...optionalPlaceholders]);
    contentPlaceholders.forEach((placeholder) => {
      if (!declaredSet.has(placeholder)) {
        errors.push(`Placeholder used in content but not declared: ${placeholder}.`);
      }
    });
    requiredPlaceholders.forEach((placeholder) => {
      if (!contentPlaceholders.includes(placeholder)) {
        errors.push(`Required placeholder not present in content: ${placeholder}.`);
      }
    });
    optionalPlaceholders.forEach((placeholder) => {
      if (!contentPlaceholders.includes(placeholder)) {
        warnings.push(`Optional placeholder not present in content: ${placeholder}.`);
      }
    });
  }

  if (!isObject(template.metadata)) errors.push("metadata must be an object.");
  if (!isObject(template.extensions)) errors.push("extensions must be an object.");
  return { isValid: errors.length === 0, errors, warnings: Array.from(new Set(warnings)) };
}

module.exports = { validateTemplateDefinition };
