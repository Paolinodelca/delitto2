module.exports = {
  "templateId": "measurement.testObservation",
  "templateVersion": "1.0",
  "outputType": "javascript",
  "targetCategory": "test",
  "requiredPlaceholders": [
    "PASCAL_NAME",
    "MODULE_DIRECTORY"
  ],
  "optionalPlaceholders": [],
  "content": "const {\n  build{{PASCAL_NAME}}Observation,\n} = require(\"../src/core/measurement/{{MODULE_DIRECTORY}}/build{{PASCAL_NAME}}Observation\");\n\nconst observation = build{{PASCAL_NAME}}Observation({\n  observationId: \"generated_observation_test\",\n});\n\nif (!observation || observation.observationId !== \"generated_observation_test\") {\n  throw new Error(\"Generated observation builder test failed.\");\n}\n\nconsole.log(\"{{PASCAL_NAME}} Observation Test: PASS\");",
  "metadata": {},
  "extensions": {}
};
