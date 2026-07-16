module.exports = {
  "templateId": "measurement.testRegression",
  "templateVersion": "1.0",
  "outputType": "javascript",
  "targetCategory": "regression",
  "requiredPlaceholders": [
    "PASCAL_NAME",
    "MODULE_DIRECTORY"
  ],
  "optionalPlaceholders": [],
  "content": "const {\n  build{{PASCAL_NAME}}MeasureResult,\n} = require(\"../src/core/measurement/{{MODULE_DIRECTORY}}/build{{PASCAL_NAME}}MeasureResult\");\n\nfunction sanitize(value) {\n  return {\n    measureId: value.measureId,\n    resultStatus: value.resultStatus,\n    score: value.score,\n    band: value.band,\n    components: value.components,\n  };\n}\n\nconst first = sanitize(build{{PASCAL_NAME}}MeasureResult());\nconst second = sanitize(build{{PASCAL_NAME}}MeasureResult());\n\nif (JSON.stringify(first) !== JSON.stringify(second)) {\n  throw new Error(\"Generated measurement regression test failed.\");\n}\n\nconsole.log(\"{{PASCAL_NAME}} Regression Test: PASS\");",
  "metadata": {},
  "extensions": {}
};
