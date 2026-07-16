module.exports = {
  "templateId": "measurement.health",
  "templateVersion": "1.0",
  "outputType": "javascript",
  "targetCategory": "health",
  "requiredPlaceholders": [
    "MEASURE_ID",
    "PASCAL_NAME",
    "IMPLEMENTATION_STATUS"
  ],
  "optionalPlaceholders": [],
  "content": "function health{{PASCAL_NAME}}Measurement() {\n  return {\n    module: \"{{MEASURE_ID}}\",\n    healthy: false,\n    readyForSemanticImplementation: true,\n    implementationStatus: \"{{IMPLEMENTATION_STATUS}}\",\n    errors: [],\n    warnings: [\n      \"Measurement module requires semantic scoring configuration.\",\n    ],\n    metadata: {\n      version: \"1.0\",\n      createdAt: new Date().toISOString(),\n    },\n  };\n}\n\nmodule.exports = {\n  health{{PASCAL_NAME}}Measurement,\n};",
  "metadata": {},
  "extensions": {}
};
