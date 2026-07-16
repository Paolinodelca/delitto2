module.exports = {
  "templateId": "measurement.validateObservation",
  "templateVersion": "1.0",
  "outputType": "javascript",
  "targetCategory": "source",
  "requiredPlaceholders": [
    "MEASURE_ID",
    "PASCAL_NAME",
    "FACTOR_VALIDATION_LINES",
    "FACTOR_IDS_JSON"
  ],
  "optionalPlaceholders": [],
  "content": "const FACTOR_IDS = {{FACTOR_IDS_JSON}};\n\nfunction isObject(value) {\n  return value !== null && typeof value === \"object\" && !Array.isArray(value);\n}\n\nfunction validate{{PASCAL_NAME}}Observation(observation = {}) {\n  const errors = [];\n  const warnings = [];\n\n  if (!isObject(observation)) {\n    return { isValid: false, errors: [\"Observation must be an object.\"], warnings: [] };\n  }\n\n  if (observation.observationType !== \"{{MEASURE_ID}}\") {\n    errors.push(\"observationType is invalid.\");\n  }\n\n{{FACTOR_VALIDATION_LINES}}\n\n  if (!Array.isArray(observation.evidenceIds)) {\n    errors.push(\"evidenceIds must be an array.\");\n  }\n\n  if (observation.observationStatus === \"not_observed\") {\n    warnings.push(\"Observation is not observed.\");\n  }\n\n  if (FACTOR_IDS.length === 0) {\n    warnings.push(\"No factors are configured.\");\n  }\n\n  return { isValid: errors.length === 0, errors, warnings };\n}\n\nmodule.exports = {\n  validate{{PASCAL_NAME}}Observation,\n};",
  "metadata": {},
  "extensions": {}
};
