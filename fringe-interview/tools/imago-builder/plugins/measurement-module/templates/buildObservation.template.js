module.exports = {
  "templateId": "measurement.buildObservation",
  "templateVersion": "1.0",
  "outputType": "javascript",
  "targetCategory": "source",
  "requiredPlaceholders": [
    "MEASURE_ID",
    "PASCAL_NAME",
    "CONSTANT_NAME",
    "FACTOR_DEFAULT_FIELDS",
    "FACTOR_IDS_JSON"
  ],
  "optionalPlaceholders": [],
  "content": "const MEASUREMENT_CONSTANT_NAME = \"{{CONSTANT_NAME}}\";\n\nconst FACTOR_IDS = {{FACTOR_IDS_JSON}};\n\nfunction isObject(value) {\n  return value !== null && typeof value === \"object\" && !Array.isArray(value);\n}\n\nfunction normalizeEnum(value, allowedValues, fallback) {\n  return allowedValues.includes(value) ? value : fallback;\n}\n\nfunction normalizeEvidenceIds(value) {\n  return Array.isArray(value)\n    ? Array.from(new Set(value.filter((item) => typeof item === \"string\" && item.trim().length > 0)))\n    : [];\n}\n\nfunction build{{PASCAL_NAME}}Observation(input = {}) {\n  const source = isObject(input) ? input : {};\n  const observation = {\n    observationId:\n      typeof source.observationId === \"string\" && source.observationId.trim().length > 0\n        ? source.observationId\n        : null,\n    observationType: \"{{MEASURE_ID}}\",\n{{FACTOR_DEFAULT_FIELDS}}\n    context: isObject(source.context) ? { ...source.context } : {},\n    evidenceIds: normalizeEvidenceIds(source.evidenceIds),\n    inferenceSupportInputs: isObject(source.inferenceSupportInputs)\n      ? { ...source.inferenceSupportInputs }\n      : {},\n    limitations: Array.isArray(source.limitations) ? [...source.limitations] : [],\n    metadata: {\n      version: \"1.0\",\n      createdAt: new Date().toISOString(),\n      ...(isObject(source.metadata) ? source.metadata : {}),\n    },\n    extensions: isObject(source.extensions) ? { ...source.extensions } : {},\n  };\n\n  observation.observationStatus = FACTOR_IDS.every(\n    (factorId) => observation[factorId] === undefined || observation[factorId] === null || observation[factorId] === \"none\"\n  ) && observation.evidenceIds.length === 0\n    ? \"not_observed\"\n    : \"observed\";\n\n  return observation;\n}\n\nmodule.exports = {\n  build{{PASCAL_NAME}}Observation,\n};",
  "metadata": {},
  "extensions": {}
};
