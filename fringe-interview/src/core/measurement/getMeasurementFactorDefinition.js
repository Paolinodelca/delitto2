const {
  buildMeasurementFactorDefinition,
} = require("./buildMeasurementFactorDefinition");

function getMeasurementFactorDefinition(factorId) {
  return buildMeasurementFactorDefinition(factorId);
}

module.exports = {
  getMeasurementFactorDefinition,
};