module.exports = {
  "templateId": "measurement.validateMeasureResult",
  "templateVersion": "1.0",
  "outputType": "javascript",
  "targetCategory": "source",
  "requiredPlaceholders": [
    "MEASURE_ID",
    "PASCAL_NAME"
  ],
  "optionalPlaceholders": [],
  "content": "const ALLOWED_RESULT_STATUSES = [\n  \"draft\",\n  \"observed\",\n  \"not_observed\",\n  \"configuration_required\",\n  \"invalid\",\n];\n\nfunction validate{{PASCAL_NAME}}MeasureResult(result = {}) {\n  const errors = [];\n  const warnings = [];\n\n  if (result.measureId !== \"{{MEASURE_ID}}\") {\n    errors.push(\"measureId is invalid.\");\n  }\n\n  if (!ALLOWED_RESULT_STATUSES.includes(result.resultStatus)) {\n    errors.push(\"resultStatus is invalid.\");\n  }\n\n  if (typeof result.score !== \"number\" || result.score < 0 || result.score > 1) {\n    errors.push(\"score must be between 0 and 1.\");\n  }\n\n  if (result.resultStatus === \"configuration_required\") {\n    warnings.push(\"Measurement module requires semantic configuration.\");\n  }\n\n  return { isValid: errors.length === 0, errors, warnings };\n}\n\nmodule.exports = {\n  validate{{PASCAL_NAME}}MeasureResult,\n};",
  "metadata": {},
  "extensions": {}
};
