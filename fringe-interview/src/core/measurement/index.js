module.exports = {
  ...require("./buildMeasurementDefinition"),
  ...require("./validateMeasurementDefinition"),

  ...require("./buildMeasurementFactorDefinition"),
  ...require("./validateMeasurementFactorDefinition"),
  ...require("./getMeasurementFactorDefinition"),

  ...require("./buildManagementObservation"),
  ...require("./validateManagementObservation"),

  ...require("./buildMeasurementProfile"),
  ...require("./validateMeasurementProfile"),
  ...require("./applyMeasurementProfile"),

  ...require("./buildMeasureResult"),
  ...require("./validateMeasureResult"),
  ...require("./healthBuildMeasureResult"),
};
// Neutral measurement/observation foundation (Task 0100B-1).
Object.assign(module.exports, require("../observation"));
