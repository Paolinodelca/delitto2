const { validateKnowledgeAcquisitionSolutionDecision } = require('./validateKnowledgeAcquisitionSolutionDecision');
const { validateKnowledgeAcquisitionCapabilityCompositionDesign } = require('./validateKnowledgeAcquisitionCapabilityCompositionDesign');
const { validateKnowledgeAcquisitionCapabilityConfiguration } = require('./validateKnowledgeAcquisitionCapabilityConfiguration');
const { calculateKnowledgeAcquisitionCapabilityConfigurationId } = require('./knowledgeAcquisitionCapabilityConfigurationIdentity');
const { validateKnowledgeAcquisitionCapabilityConfigurationContext } = require('./validateKnowledgeAcquisitionCapabilityConfigurationContext');

function object(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
function string(v) { return typeof v === 'string' && v.trim().length > 0; }
function clone(v) { return v === undefined ? undefined : JSON.parse(JSON.stringify(v)); }
function fail(code, message, details) { const error = new Error(message); error.code = code; error.details = details; throw error; }
function uniqueSorted(values) { return [...new Set(values)].sort(); }

function buildKnowledgeAcquisitionCapabilityConfiguration(input = {}) {
  if (!object(input)) fail('INVALID_KNOWLEDGE_ACQUISITION_CAPABILITY_CONFIGURATION_INPUT', 'Input must be an object.');
  const decision = input.solutionDecision;
  const decisionValidation = validateKnowledgeAcquisitionSolutionDecision(decision);
  if (!decisionValidation.valid) fail('INVALID_KNOWLEDGE_ACQUISITION_SOLUTION_DECISION', decisionValidation.errors.join(' | '), decisionValidation);
  if (decision.decisionMode === 'none' || decision.decisionMode === 'deferred') fail('CAPABILITY_CONFIGURATION_NOT_APPLICABLE', `KnowledgeAcquisitionCapabilityConfiguration is not applicable to ${decision.decisionMode} decisions.`);
  if (!['single','composed'].includes(decision.decisionMode)) fail('INVALID_CONFIGURATION_DECISION_MODE', 'Decision mode must be single or composed.');
  const compositionDesign = input.compositionDesign;
  if (decision.decisionMode === 'single' && compositionDesign !== undefined && compositionDesign !== null) fail('UNEXPECTED_COMPOSITION_DESIGN', 'single mode must not supply a Composition Design.');
  if (decision.decisionMode === 'composed') {
    const validation = validateKnowledgeAcquisitionCapabilityCompositionDesign(compositionDesign);
    if (!validation.valid) fail('INVALID_CAPABILITY_COMPOSITION_DESIGN', validation.errors.join(' | '), validation);
    if (compositionDesign.sourceSolutionDecisionRef !== `knowledgeAcquisitionSolutionDecision:${decision.id}` || JSON.stringify(compositionDesign.selectedCapabilityRefs) !== JSON.stringify(decision.selectedCapabilityRefs)) fail('COMPOSITION_DESIGN_MISMATCH', 'Composition Design does not correspond to the supplied Decision.');
  }
  const snapshots = input.selectedCapabilitySnapshots;
  if (!Array.isArray(snapshots)) fail('INVALID_SELECTED_CAPABILITY_SNAPSHOTS', 'selectedCapabilitySnapshots must be an array.');
  const snapshotRefs = snapshots.map((snapshot, index) => {
    if (!object(snapshot) || !string(snapshot.capabilityRef)) fail('INVALID_SELECTED_CAPABILITY_SNAPSHOT', `selectedCapabilitySnapshots[${index}].capabilityRef is required.`);
    return snapshot.capabilityRef;
  });
  if (snapshotRefs.length !== new Set(snapshotRefs).size || JSON.stringify(uniqueSorted(snapshotRefs)) !== JSON.stringify(decision.selectedCapabilityRefs)) fail('SELECTED_CAPABILITY_SNAPSHOT_MISMATCH', 'Snapshots must represent exactly the capabilities selected by the Solution Decision.');
  const definition = input.configurationDefinition;
  if (!object(definition) || !string(definition.configurationDefinitionRef) || !Array.isArray(definition.capabilityDefinitions)) fail('INVALID_CONFIGURATION_DEFINITION', 'Configuration Definition is invalid.');
  const applicationInput = input.applicationConfigurationInput;
  if (!object(applicationInput) || !string(applicationInput.applicationConfigurationInputRef) || !Array.isArray(applicationInput.configurationItems)) fail('INVALID_APPLICATION_CONFIGURATION_INPUT', 'Application Configuration Input is invalid.');
  const items = applicationInput.configurationItems.map(item => clone(item)).sort((a,b) => String(a.capabilityRef).localeCompare(String(b.capabilityRef)) || String(a.parameterRef).localeCompare(String(b.parameterRef)));
  const sourceSolutionDecisionRef = `knowledgeAcquisitionSolutionDecision:${decision.id}`;
  const sourceCompositionDesignRef = compositionDesign ? `knowledgeAcquisitionCapabilityCompositionDesign:${compositionDesign.id}` : null;
  const semantic = {
    sourceSolutionDecisionRef, sourceCompositionDesignRef, decisionMode: decision.decisionMode,
    selectedCapabilityRefs: [...decision.selectedCapabilityRefs],
    configurationDefinitionRef: definition.configurationDefinitionRef,
    applicationConfigurationInputRef: applicationInput.applicationConfigurationInputRef,
    configurationItems: items,
    provenance: { type:'knowledge_acquisition_capability_configuration_derivation', producerVersion:'1.0', deterministic:true, interpretive:false },
    dependencyRefs: uniqueSorted([sourceSolutionDecisionRef, ...(sourceCompositionDesignRef ? [sourceCompositionDesignRef] : []), ...decision.selectedCapabilityRefs, definition.configurationDefinitionRef, applicationInput.applicationConfigurationInputRef]),
    metadata: { contractVersion:'1.0', configurationStrategyVersion:'1.0', readOnly:true },
    extensions: object(input.extensions) ? clone(input.extensions) : {},
  };
  const output = { id:'', configurationVersion:'1.0', type:'knowledge_acquisition_capability_configuration', ...semantic };
  output.id = calculateKnowledgeAcquisitionCapabilityConfigurationId(output);
  const validation = validateKnowledgeAcquisitionCapabilityConfiguration(output);
  if (!validation.valid) fail('INVALID_GENERATED_CAPABILITY_CONFIGURATION', validation.errors.join(' | '), validation);
  const contextValidation = validateKnowledgeAcquisitionCapabilityConfigurationContext({ capabilityConfiguration:output, knowledgeAcquisitionSolutionDecision:decision, capabilityCompositionDesign:compositionDesign, selectedCapabilitySnapshots:snapshots, configurationDefinition:definition, applicationConfigurationInput:applicationInput });
  if (!contextValidation.valid) fail('INVALID_CAPABILITY_CONFIGURATION_CONTEXT', contextValidation.errors.join(' | '), contextValidation);
  return output;
}

module.exports = { buildKnowledgeAcquisitionCapabilityConfiguration };
