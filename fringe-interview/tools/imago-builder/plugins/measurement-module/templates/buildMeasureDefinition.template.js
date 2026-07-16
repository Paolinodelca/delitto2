module.exports = {
  "templateId": "measurement.buildMeasureDefinition",
  "templateVersion": "1.0",
  "outputType": "javascript",
  "targetCategory": "source",
  "requiredPlaceholders": [
    "MEASURE_ID",
    "LABEL_JSON",
    "DESCRIPTION_JSON",
    "PASCAL_NAME",
    "FACTOR_DEFINITION_ENTRIES",
    "THRESHOLDS_JSON",
    "BENCHMARK_REFERENCE_JSON",
    "INFERENCE_SUPPORT_FIELDS_JSON",
    "INFERENCE_SUPPORT_WEIGHTS_JSON",
    "PROVENANCE_JSON",
    "IMPLEMENTATION_STATUS"
  ],
  "optionalPlaceholders": [],
  "content": "function build{{PASCAL_NAME}}MeasureDefinition() {\n  return {\n    dimensionId: \"{{MEASURE_ID}}\",\n    label: {{LABEL_JSON}},\n    description: {{DESCRIPTION_JSON}},\n    implementationStatus: \"{{IMPLEMENTATION_STATUS}}\",\n    factors: {\n{{FACTOR_DEFINITION_ENTRIES}}\n    },\n    thresholds: {{THRESHOLDS_JSON}},\n    benchmark: {\n      reference: {{BENCHMARK_REFERENCE_JSON}},\n    },\n    inferenceSupport: {\n      fields: {{INFERENCE_SUPPORT_FIELDS_JSON}},\n      weights: {{INFERENCE_SUPPORT_WEIGHTS_JSON}},\n    },\n    provenance: {{PROVENANCE_JSON}},\n    metadata: {\n      version: \"1.0\",\n      createdAt: new Date().toISOString(),\n    },\n    extensions: {},\n  };\n}\n\nmodule.exports = {\n  build{{PASCAL_NAME}}MeasureDefinition,\n};",
  "metadata": {},
  "extensions": {}
};
