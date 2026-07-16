const { validateTemplateDefinition } = require("./validateTemplateDefinition");
const PLACEHOLDER_PATTERN = /\{\{([A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*)\}\}/g;

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

function normalizeNewlines(content) {
  return content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n*$/g, "") + "\n";
}

function normalizeContextValue(value) {
  if (value === null) return { valid: true, value: "" };
  if (typeof value === "string") return { valid: true, value };
  if (typeof value === "number" && Number.isFinite(value)) return { valid: true, value: String(value) };
  if (typeof value === "boolean") return { valid: true, value: value ? "true" : "false" };
  return { valid: false, value: "" };
}

function renderTemplate({ template, context = {}, strict = true } = {}) {
  const validation = validateTemplateDefinition(template);
  const result = {
    rendered: false,
    content: "",
    usedPlaceholders: [],
    unusedContextKeys: [],
    missingRequiredPlaceholders: [],
    unresolvedPlaceholders: [],
    warnings: [...validation.warnings],
    errors: [...validation.errors],
    metadata: {
      templateId: template && typeof template.templateId === "string" ? template.templateId : null,
      templateVersion: template && typeof template.templateVersion === "string" ? template.templateVersion : null,
    },
  };
  if (!validation.isValid) return result;
  if (!isObject(context)) {
    result.errors.push("context must be an object.");
    return result;
  }

  const declaredPlaceholders = [...template.requiredPlaceholders, ...template.optionalPlaceholders];
  const declaredSet = new Set(declaredPlaceholders);
  const originalPlaceholders = extractTemplatePlaceholders(template.content);
  result.usedPlaceholders = [...originalPlaceholders];
  result.unusedContextKeys = Object.keys(context).filter((key) => !declaredSet.has(key));
  if (strict && result.unusedContextKeys.length > 0) {
    result.warnings.push(`Unused context keys: ${result.unusedContextKeys.join(", ")}.`);
  }

  const normalizedValues = new Map();
  declaredPlaceholders.forEach((placeholder) => {
    if (!Object.prototype.hasOwnProperty.call(context, placeholder)) return;
    const normalized = normalizeContextValue(context[placeholder]);
    if (!normalized.valid) {
      result.errors.push(`Context value for ${placeholder} is not supported.`);
      return;
    }
    normalizedValues.set(placeholder, normalized.value);
  });

  template.requiredPlaceholders.forEach((placeholder) => {
    if (!Object.prototype.hasOwnProperty.call(context, placeholder)) {
      result.missingRequiredPlaceholders.push(placeholder);
    }
  });
  if (result.missingRequiredPlaceholders.length > 0) {
    result.errors.push(`Missing required placeholders: ${result.missingRequiredPlaceholders.join(", ")}.`);
  }
  if (result.errors.length > 0) return result;

  let renderedContent = template.content.replace(
    PLACEHOLDER_PATTERN,
    (fullMatch, placeholder) => {
      if (normalizedValues.has(placeholder)) return normalizedValues.get(placeholder);
      if (template.optionalPlaceholders.includes(placeholder)) {
        result.warnings.push(`Optional placeholder missing from context: ${placeholder}.`);
        return "";
      }
      return fullMatch;
    }
  );

  result.unresolvedPlaceholders = originalPlaceholders.filter(
    (placeholder) => template.requiredPlaceholders.includes(placeholder) && !normalizedValues.has(placeholder)
  );
  if (result.unresolvedPlaceholders.length > 0) {
    result.errors.push(`Unresolved placeholders: ${result.unresolvedPlaceholders.join(", ")}.`);
    return result;
  }

  result.rendered = true;
  result.content = normalizeNewlines(renderedContent);
  result.warnings = Array.from(new Set(result.warnings));
  return result;
}

module.exports = { renderTemplate };
