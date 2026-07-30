const { calculateKnowledgeAcquisitionCapabilityConfigurationId, stableStringify } = require('./knowledgeAcquisitionCapabilityConfigurationIdentity');

const TOP = ['id', 'configurationVersion', 'type', 'sourceSolutionDecisionRef', 'sourceCompositionDesignRef', 'decisionMode', 'selectedCapabilityRefs', 'configurationDefinitionRef', 'applicationConfigurationInputRef', 'configurationItems', 'provenance', 'dependencyRefs', 'metadata', 'extensions'];
const ITEM = ['capabilityRef', 'parameterRef', 'value'];
const FORBIDDEN = new Set(['provider','adapter','registry','discovery','credentials','credential','secret','secretRef','environment','environmentVariable','endpoint','request','response','payload','prompt','llm','model','token','apiKey','plan','planning','steps','stepOrder','ordering','sequence','execution','runtime','orchestration','schedule','retry','timeout','failurePolicy','failureHandling','invocation','recipe','result','satisfaction','knowledgeUpdate','persistence']);
function object(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
function string(v) { return typeof v === 'string' && v.trim().length > 0; }
function exact(v, keys) { return object(v) && Object.keys(v).every(k => keys.includes(k)) && keys.every(k => k in v); }
function sortedUnique(v) { return Array.isArray(v) && v.every(string) && new Set(v).size === v.length && stableStringify(v) === stableStringify([...v].sort()); }
function serializableValue(v) {
  if (v === null || typeof v === 'string' || typeof v === 'boolean') return true;
  if (typeof v === 'number') return Number.isFinite(v);
  if (Array.isArray(v)) return v.every(serializableValue);
  return object(v) && Object.values(v).every(serializableValue);
}
function forbidden(v) {
  if (Array.isArray(v)) return v.some(forbidden);
  if (!object(v)) return false;
  return Object.entries(v).some(([key, value]) => FORBIDDEN.has(key) || forbidden(value));
}

function validateKnowledgeAcquisitionCapabilityConfiguration(configuration) {
  const errors = [], warnings = [];
  if (!object(configuration)) return { valid: false, errors: ['KnowledgeAcquisitionCapabilityConfiguration must be an object.'], warnings };
  for (const key of TOP) if (!(key in configuration)) errors.push(`Missing property: ${key}.`);
  for (const key of Object.keys(configuration)) if (!TOP.includes(key)) errors.push(`knowledgeAcquisitionCapabilityConfiguration.${key} is not allowed.`);
  if (!string(configuration.id) || !configuration.id.startsWith('knowledgeAcquisitionCapabilityConfiguration_')) errors.push('id is invalid.');
  if (configuration.configurationVersion !== '1.0') errors.push('configurationVersion is invalid.');
  if (configuration.type !== 'knowledge_acquisition_capability_configuration') errors.push('type is invalid.');
  if (!string(configuration.sourceSolutionDecisionRef) || !configuration.sourceSolutionDecisionRef.startsWith('knowledgeAcquisitionSolutionDecision:')) errors.push('sourceSolutionDecisionRef is invalid.');
  if (!['single', 'composed'].includes(configuration.decisionMode)) errors.push('decisionMode must be single or composed.');
  if (configuration.decisionMode === 'single' && configuration.sourceCompositionDesignRef !== null) errors.push('sourceCompositionDesignRef must be absent for single mode.');
  if (configuration.decisionMode === 'composed' && (!string(configuration.sourceCompositionDesignRef) || !configuration.sourceCompositionDesignRef.startsWith('knowledgeAcquisitionCapabilityCompositionDesign:'))) errors.push('sourceCompositionDesignRef is required for composed mode.');
  if (!sortedUnique(configuration.selectedCapabilityRefs) || (configuration.decisionMode === 'single' && configuration.selectedCapabilityRefs?.length !== 1) || (configuration.decisionMode === 'composed' && configuration.selectedCapabilityRefs?.length < 2)) errors.push('selectedCapabilityRefs are invalid.');
  if (!string(configuration.configurationDefinitionRef)) errors.push('configurationDefinitionRef is invalid.');
  if (!string(configuration.applicationConfigurationInputRef)) errors.push('applicationConfigurationInputRef is invalid.');
  const selected = new Set(Array.isArray(configuration.selectedCapabilityRefs) ? configuration.selectedCapabilityRefs : []);
  const items = Array.isArray(configuration.configurationItems) ? configuration.configurationItems : [];
  const keys = new Set();
  for (const [index, item] of items.entries()) {
    if (!exact(item, ITEM) || !selected.has(item.capabilityRef) || !string(item.parameterRef) || !serializableValue(item.value)) { errors.push(`configurationItems[${index}] is invalid.`); continue; }
    const key = `${item.capabilityRef}\u0000${item.parameterRef}`;
    if (keys.has(key)) errors.push(`configurationItems[${index}] duplicates a capability/parameter pair.`);
    keys.add(key);
  }
  if (stableStringify(items) !== stableStringify([...items].sort((a,b) => a.capabilityRef.localeCompare(b.capabilityRef) || a.parameterRef.localeCompare(b.parameterRef)))) errors.push('configurationItems are not canonically ordered.');
  if (!exact(configuration.provenance, ['type','producerVersion','deterministic','interpretive']) || configuration.provenance.type !== 'knowledge_acquisition_capability_configuration_derivation' || configuration.provenance.producerVersion !== '1.0' || configuration.provenance.deterministic !== true || configuration.provenance.interpretive !== false) errors.push('provenance is invalid.');
  const causal = [configuration.sourceSolutionDecisionRef, ...(configuration.sourceCompositionDesignRef ? [configuration.sourceCompositionDesignRef] : []), ...(configuration.selectedCapabilityRefs || []), configuration.configurationDefinitionRef, configuration.applicationConfigurationInputRef];
  if (!sortedUnique(configuration.dependencyRefs) || !causal.every(ref => configuration.dependencyRefs.includes(ref))) errors.push('dependencyRefs are invalid.');
  if (!exact(configuration.metadata, ['contractVersion','configurationStrategyVersion','readOnly']) || configuration.metadata.contractVersion !== '1.0' || configuration.metadata.configurationStrategyVersion !== '1.0' || configuration.metadata.readOnly !== true) errors.push('metadata is invalid.');
  if (!object(configuration.extensions)) errors.push('extensions must be an object.');
  if (forbidden(configuration)) errors.push('Configuration contains forbidden operational structure.');
  try { JSON.stringify(configuration); } catch { errors.push('KnowledgeAcquisitionCapabilityConfiguration must be serializable.'); }
  if (TOP.every(key => key in configuration) && string(configuration.id)) {
    try { if (configuration.id !== calculateKnowledgeAcquisitionCapabilityConfigurationId(configuration)) errors.push('id does not match the deterministic content fingerprint.'); } catch { errors.push('id fingerprint cannot be calculated.'); }
  }
  return { valid: errors.length === 0, errors, warnings };
}

module.exports = { validateKnowledgeAcquisitionCapabilityConfiguration };
