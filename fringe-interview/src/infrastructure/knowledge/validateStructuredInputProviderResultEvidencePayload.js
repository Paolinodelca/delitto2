const PAYLOAD_PROPERTIES = ['schemaVersion', 'format', 'records'];
const RECORD_PROPERTIES = ['recordId', 'type', 'description', 'content', 'source', 'extractedAt'];
const SOURCE_PROPERTIES = ['id', 'type', 'role'];

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasExactProperties(value, allowed, required, path, errors) {
  for (const property of required) if (!(property in value)) errors.push(`${path}.${property} is required.`);
  for (const property of Reflect.ownKeys(value)) {
    if (typeof property !== 'string' || !allowed.includes(property)) {
      errors.push(`${path} contains an unsupported property.`);
      continue;
    }
    const descriptor = Object.getOwnPropertyDescriptor(value, property);
    if (!descriptor.enumerable || !Object.prototype.hasOwnProperty.call(descriptor, 'value')) {
      errors.push(`${path}.${property} must be an enumerable data property.`);
    }
  }
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateStructuredInputProviderResultEvidencePayload(payload) {
  const errors = [];
  const warnings = [];
  if (!isPlainObject(payload)) return { valid: false, errors: ['providerPayload must be an object.'], warnings };
  hasExactProperties(payload, PAYLOAD_PROPERTIES, PAYLOAD_PROPERTIES, 'providerPayload', errors);
  if (payload.schemaVersion !== '1.0') errors.push('providerPayload.schemaVersion is invalid.');
  if (payload.format !== 'structured_input') errors.push('providerPayload.format is invalid.');
  if (!Array.isArray(payload.records)) errors.push('providerPayload.records must be an array.');
  else {
    const ids = new Set();
    payload.records.forEach((record, index) => {
      const path = `providerPayload.records[${index}]`;
      if (!isPlainObject(record)) { errors.push(`${path} must be an object.`); return; }
      hasExactProperties(record, RECORD_PROPERTIES, ['recordId', 'type', 'content', 'source', 'extractedAt'], path, errors);
      if (!isNonEmptyString(record.recordId)) errors.push(`${path}.recordId is invalid.`);
      else if (ids.has(record.recordId)) errors.push(`${path}.recordId must be unique.`);
      else ids.add(record.recordId);
      if (!isNonEmptyString(record.type)) errors.push(`${path}.type is invalid.`);
      if ('description' in record && record.description !== null && !isNonEmptyString(record.description)) errors.push(`${path}.description is invalid.`);
      if (record.content === null || record.content === '' || typeof record.content === 'undefined') errors.push(`${path}.content is required.`);
      if (!isPlainObject(record.source)) errors.push(`${path}.source must be an object.`);
      else {
        hasExactProperties(record.source, SOURCE_PROPERTIES, ['id', 'type', 'role'], `${path}.source`, errors);
        for (const property of SOURCE_PROPERTIES) if (!isNonEmptyString(record.source[property])) errors.push(`${path}.source.${property} is invalid.`);
      }
      if (!isNonEmptyString(record.extractedAt) || !Number.isFinite(Date.parse(record.extractedAt))) errors.push(`${path}.extractedAt is invalid.`);
    });
  }
  return { valid: errors.length === 0, errors, warnings };
}

module.exports = { validateStructuredInputProviderResultEvidencePayload };
