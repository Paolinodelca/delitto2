const { validateMeasurement } = require('./validateMeasurement');
const { validateObservation } = require('./validateObservation');
const { validateRegisteredObservationMeasurementResultNormalizationContext } = require('./validateRegisteredObservationMeasurementResultNormalizationContext');
const { isObject, cleanString, unknownKeys } = require('./shared');

const INPUT_KEYS = ['measurement', 'observations', 'characteristicId', 'normalization'];

function validateRegisteredObservationMeasurementResultNormalization(input = {}) {
  const errors = [], warnings = [];
  if (!isObject(input)) return { valid: false, errors: ['Normalization input must be an object.'], warnings };
  unknownKeys(input, INPUT_KEYS, 'input', errors);
  for (const key of INPUT_KEYS) if (!Object.prototype.hasOwnProperty.call(input, key)) errors.push(`${key} is required.`);
  const measurement = validateMeasurement(input.measurement);
  if (!measurement.valid) errors.push(...measurement.errors.map(error => `measurement: ${error}`));
  if (!cleanString(input.characteristicId)) errors.push('characteristicId is required.');
  else if (isObject(input.measurement) && Array.isArray(input.measurement.targetIds) && !input.measurement.targetIds.includes(input.characteristicId)) errors.push('characteristicId must be explicitly targeted by Measurement.');
  if (!Array.isArray(input.observations)) errors.push('observations must be an array.');
  else {
    const ids = new Set();
    input.observations.forEach((observation, index) => {
      const result = validateObservation(observation);
      if (!result.valid) errors.push(...result.errors.map(error => `observations[${index}]: ${error}`));
      if (isObject(observation)) {
        if (ids.has(observation.id)) errors.push(`observations[${index}]: duplicate Observation id ${observation.id}.`);
        ids.add(observation.id);
        if (isObject(input.measurement) && observation.measurementId !== input.measurement.id) errors.push(`observations[${index}]: measurementId mismatch.`);
        if (cleanString(input.characteristicId) && observation.characteristicId !== input.characteristicId) errors.push(`observations[${index}]: characteristicId mismatch.`);
      }
    });
  }
  const context = validateRegisteredObservationMeasurementResultNormalizationContext(input.normalization);
  if (!context.valid) errors.push(...context.errors);
  return { valid: errors.length === 0, errors, warnings };
}

module.exports = { validateRegisteredObservationMeasurementResultNormalization };
