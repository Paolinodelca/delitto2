module.exports = {
  "templateId": "measurement.testHealth",
  "templateVersion": "1.0",
  "outputType": "javascript",
  "targetCategory": "test",
  "requiredPlaceholders": [
    "PASCAL_NAME",
    "MODULE_DIRECTORY"
  ],
  "optionalPlaceholders": [],
  "content": "const {\n  health{{PASCAL_NAME}}Measurement,\n} = require(\"../src/core/measurement/{{MODULE_DIRECTORY}}/health{{PASCAL_NAME}}Measurement\");\n\nconst health = health{{PASCAL_NAME}}Measurement();\n\nif (\n  health.healthy !== false ||\n  health.readyForSemanticImplementation !== true\n) {\n  throw new Error(\"Generated measurement health test failed.\");\n}\n\nconsole.log(\"{{PASCAL_NAME}} Health Test: PASS\");",
  "metadata": {},
  "extensions": {}
};
