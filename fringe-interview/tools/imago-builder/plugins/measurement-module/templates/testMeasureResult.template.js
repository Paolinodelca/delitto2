module.exports = {
  "templateId": "measurement.testMeasureResult",
  "templateVersion": "1.0",
  "outputType": "javascript",
  "targetCategory": "test",
  "requiredPlaceholders": [
    "PASCAL_NAME",
    "MODULE_DIRECTORY"
  ],
  "optionalPlaceholders": [],
  "content": "const {\n  build{{PASCAL_NAME}}MeasureResult,\n} = require(\"../src/core/measurement/{{MODULE_DIRECTORY}}/build{{PASCAL_NAME}}MeasureResult\");\n\nconst result = build{{PASCAL_NAME}}MeasureResult();\n\nif (\n  result.resultStatus !== \"configuration_required\" ||\n  result.score !== 0 ||\n  result.band !== \"not_supported\"\n) {\n  throw new Error(\"Generated measure result scaffold test failed.\");\n}\n\nconsole.log(\"{{PASCAL_NAME}} Measure Result Test: PASS\");",
  "metadata": {},
  "extensions": {}
};
