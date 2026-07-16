module.exports = {
  "templateId": "measurement.index",
  "templateVersion": "1.0",
  "outputType": "javascript",
  "targetCategory": "source",
  "requiredPlaceholders": [
    "IMPORT_LINES",
    "EXPORT_LINES"
  ],
  "optionalPlaceholders": [],
  "content": "{{IMPORT_LINES}}\n\nmodule.exports = {\n{{EXPORT_LINES}}\n};",
  "metadata": {},
  "extensions": {}
};
