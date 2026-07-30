const { validateKnowledgeAcquisitionSolutionDecision } = require('./validateKnowledgeAcquisitionSolutionDecision');
const { validateKnowledgeAcquisitionCapabilityCompositionDesign } = require('./validateKnowledgeAcquisitionCapabilityCompositionDesign');
const { validateKnowledgeAcquisitionCapabilityConfiguration } = require('./validateKnowledgeAcquisitionCapabilityConfiguration');
const { stableStringify } = require('./knowledgeAcquisitionCapabilityConfigurationIdentity');

const VALUE_TYPES = ['string','number','boolean','object','array','null'];
const CONSTRAINT_KEYS = ['minimum','maximum','minLength','maxLength','pattern','minItems','maxItems'];
const FORBIDDEN = new Set(['provider','adapter','registry','discovery','credentials','credential','secret','secretRef','environment','environmentVariable','endpoint','prompt','model','token','apiKey','plan','planning','steps','ordering','execution','runtime','retry','timeout','failurePolicy','invocation','recipe','result','satisfaction','knowledgeUpdate','persistence']);
function object(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
function string(v) { return typeof v === 'string' && v.trim().length > 0; }
function exact(v, keys) { return object(v) && Object.keys(v).every(k => keys.includes(k)) && keys.every(k => k in v); }
function forbidden(v) { if (Array.isArray(v)) return v.some(forbidden); if (!object(v)) return false; return Object.entries(v).some(([k,x]) => FORBIDDEN.has(k) || forbidden(x)); }
function valueType(value) { if (value === null) return 'null'; if (Array.isArray(value)) return 'array'; return typeof value; }
function constraintErrors(value, constraints, label) {
  const errors = [];
  if (!object(constraints) || Object.keys(constraints).some(k => !CONSTRAINT_KEYS.includes(k))) return [`${label} constraints are invalid.`];
  if ('minimum' in constraints && (typeof value !== 'number' || value < constraints.minimum)) errors.push(`${label} violates minimum.`);
  if ('maximum' in constraints && (typeof value !== 'number' || value > constraints.maximum)) errors.push(`${label} violates maximum.`);
  if ('minLength' in constraints && (typeof value !== 'string' || value.length < constraints.minLength)) errors.push(`${label} violates minLength.`);
  if ('maxLength' in constraints && (typeof value !== 'string' || value.length > constraints.maxLength)) errors.push(`${label} violates maxLength.`);
  if ('pattern' in constraints) { try { if (typeof value !== 'string' || !new RegExp(constraints.pattern).test(value)) errors.push(`${label} violates pattern.`); } catch { errors.push(`${label} pattern is invalid.`); } }
  if ('minItems' in constraints && (!Array.isArray(value) || value.length < constraints.minItems)) errors.push(`${label} violates minItems.`);
  if ('maxItems' in constraints && (!Array.isArray(value) || value.length > constraints.maxItems)) errors.push(`${label} violates maxItems.`);
  return errors;
}

function validateKnowledgeAcquisitionCapabilityConfigurationContext(input = {}) {
  const errors = [], warnings = [];
  const configuration = input.capabilityConfiguration;
  const decision = input.knowledgeAcquisitionSolutionDecision;
  const compositionDesign = input.capabilityCompositionDesign;
  const snapshots = input.selectedCapabilitySnapshots;
  const definition = input.configurationDefinition;
  const applicationInput = input.applicationConfigurationInput;
  const local = validateKnowledgeAcquisitionCapabilityConfiguration(configuration);
  const decisionValidation = validateKnowledgeAcquisitionSolutionDecision(decision);
  if (!local.valid) errors.push(...local.errors.map(x => `capabilityConfiguration: ${x}`));
  if (!decisionValidation.valid) errors.push(...decisionValidation.errors.map(x => `knowledgeAcquisitionSolutionDecision: ${x}`));
  if (errors.length) return { valid:false, errors, warnings };
  const decisionRef = `knowledgeAcquisitionSolutionDecision:${decision.id}`;
  if (configuration.sourceSolutionDecisionRef !== decisionRef) errors.push('sourceSolutionDecisionRef does not match the supplied Solution Decision.');
  if (configuration.decisionMode !== decision.decisionMode || !['single','composed'].includes(decision.decisionMode)) errors.push('decisionMode does not match an applicable Solution Decision.');
  if (stableStringify(configuration.selectedCapabilityRefs) !== stableStringify(decision.selectedCapabilityRefs)) errors.push('selectedCapabilityRefs do not exactly match the Solution Decision.');
  if (decision.decisionMode === 'single' && compositionDesign !== undefined && compositionDesign !== null) errors.push('single mode must not supply a Composition Design.');
  if (decision.decisionMode === 'composed') {
    const compositionValidation = validateKnowledgeAcquisitionCapabilityCompositionDesign(compositionDesign);
    if (!compositionValidation.valid) errors.push(...compositionValidation.errors.map(x => `capabilityCompositionDesign: ${x}`));
    else {
      const compositionRef = `knowledgeAcquisitionCapabilityCompositionDesign:${compositionDesign.id}`;
      if (configuration.sourceCompositionDesignRef !== compositionRef || compositionDesign.sourceSolutionDecisionRef !== decisionRef || stableStringify(compositionDesign.selectedCapabilityRefs) !== stableStringify(decision.selectedCapabilityRefs)) errors.push('Composition Design does not exactly match the Configuration and Solution Decision.');
    }
  }
  if (!Array.isArray(snapshots)) errors.push('selectedCapabilitySnapshots must be an array.');
  else {
    const refs = snapshots.map(x => object(x) ? x.capabilityRef : undefined);
    if (refs.some(x => !string(x)) || new Set(refs).size !== refs.length || stableStringify([...refs].sort()) !== stableStringify(decision.selectedCapabilityRefs)) errors.push('selectedCapabilitySnapshots do not exactly cover selected capabilities.');
    if (forbidden(snapshots)) errors.push('selectedCapabilitySnapshots contain forbidden operational structure.');
  }
  const definitions = new Map();
  if (!exact(definition, ['configurationDefinitionRef','capabilityDefinitions']) || !string(definition.configurationDefinitionRef) || !Array.isArray(definition.capabilityDefinitions)) errors.push('Configuration Definition is invalid.');
  else {
    if (configuration.configurationDefinitionRef !== definition.configurationDefinitionRef) errors.push('configurationDefinitionRef does not match the supplied Configuration Definition.');
    for (const [ci, capability] of definition.capabilityDefinitions.entries()) {
      if (!exact(capability, ['capabilityRef','parameters']) || !decision.selectedCapabilityRefs.includes(capability.capabilityRef) || !Array.isArray(capability.parameters) || definitions.has(capability.capabilityRef)) { errors.push(`capabilityDefinitions[${ci}] is invalid.`); continue; }
      const parameters = new Map(); definitions.set(capability.capabilityRef, parameters);
      for (const [pi, parameter] of capability.parameters.entries()) {
        if (!exact(parameter, ['parameterRef','required','valueType','allowedValues','constraints']) || !string(parameter.parameterRef) || typeof parameter.required !== 'boolean' || !VALUE_TYPES.includes(parameter.valueType) || !Array.isArray(parameter.allowedValues) || !object(parameter.constraints) || parameters.has(parameter.parameterRef)) { errors.push(`capabilityDefinitions[${ci}].parameters[${pi}] is invalid.`); continue; }
        parameters.set(parameter.parameterRef, parameter);
      }
    }
    if (stableStringify([...definitions.keys()].sort()) !== stableStringify(decision.selectedCapabilityRefs)) errors.push('Configuration Definition must cover exactly the selected capabilities.');
    if (forbidden(definition)) errors.push('Configuration Definition contains forbidden operational structure.');
  }
  if (!exact(applicationInput, ['applicationConfigurationInputRef','configurationItems']) || !string(applicationInput.applicationConfigurationInputRef) || !Array.isArray(applicationInput.configurationItems)) errors.push('Application Configuration Input is invalid.');
  else {
    if (configuration.applicationConfigurationInputRef !== applicationInput.applicationConfigurationInputRef) errors.push('applicationConfigurationInputRef does not match the supplied Application Configuration Input.');
    if (forbidden(applicationInput)) errors.push('Application Configuration Input contains forbidden operational structure.');
    const supplied = new Set();
    for (const [index, item] of applicationInput.configurationItems.entries()) {
      if (!exact(item, ['capabilityRef','parameterRef','value'])) { errors.push(`applicationConfigurationInput.configurationItems[${index}] is invalid.`); continue; }
      const key = `${item.capabilityRef}\u0000${item.parameterRef}`;
      if (supplied.has(key)) errors.push(`Duplicate parameter ${item.parameterRef} for ${item.capabilityRef}.`);
      supplied.add(key);
      const parameter = definitions.get(item.capabilityRef)?.get(item.parameterRef);
      if (!parameter) { errors.push(`Unknown parameter ${item.parameterRef} for ${item.capabilityRef}.`); continue; }
      if (valueType(item.value) !== parameter.valueType) errors.push(`${item.parameterRef} has an invalid value type.`);
      if (parameter.allowedValues.length && !parameter.allowedValues.some(value => stableStringify(value) === stableStringify(item.value))) errors.push(`${item.parameterRef} is not in the allowlist.`);
      errors.push(...constraintErrors(item.value, parameter.constraints, item.parameterRef));
    }
    for (const [capabilityRef, parameters] of definitions) for (const [parameterRef, parameter] of parameters) if (parameter.required && !supplied.has(`${capabilityRef}\u0000${parameterRef}`)) errors.push(`Required parameter ${parameterRef} is missing for ${capabilityRef}.`);
    const canonicalInputItems = applicationInput.configurationItems.map(x => ({ capabilityRef:x.capabilityRef, parameterRef:x.parameterRef, value:x.value })).sort((a,b) => String(a.capabilityRef).localeCompare(String(b.capabilityRef)) || String(a.parameterRef).localeCompare(String(b.parameterRef)));
    if (stableStringify(configuration.configurationItems) !== stableStringify(canonicalInputItems)) errors.push('configurationItems do not exactly preserve the Application Configuration Input.');
  }
  return { valid:errors.length === 0, errors, warnings };
}

module.exports = { validateKnowledgeAcquisitionCapabilityConfigurationContext };
