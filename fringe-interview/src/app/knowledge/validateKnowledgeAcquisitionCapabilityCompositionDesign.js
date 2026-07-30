const { calculateKnowledgeAcquisitionCapabilityCompositionDesignId, stableStringify } = require('./knowledgeAcquisitionCapabilityCompositionDesignIdentity');

const ROLES = ['composition_integrator', 'contribution_provider', 'prerequisite_provider', 'traceability_preserver'];
const KINDS = ['final_knowledge_output', 'intermediate_knowledge_contribution'];
const REQUIREMENTS = ['primary_knowledge_contribution', 'derived_knowledge_output'];
const OBLIGATIONS = ['must_preserve_source_traceability', 'must_produce_elementary_contribution', 'must_produce_derived_output', 'must_support_prerequisite_composition'];
const TOP = ['id', 'compositionDesignVersion', 'type', 'sourceSolutionDecisionRef', 'sourceDesignRef', 'selectedCapabilityRefs', 'capabilityRoleAssignments', 'contributions', 'logicalDependencies', 'compositionConditions', 'solutionShapeSatisfaction', 'traceability', 'provenance', 'dependencyRefs', 'metadata', 'extensions'];
const FORBIDDEN = new Set(['provider', 'adapter', 'registry', 'configuration', 'credentials', 'environment', 'endpoint', 'request', 'response', 'payload', 'prompt', 'llm', 'model', 'token', 'apiKey', 'plan', 'steps', 'stepOrder', 'sequence', 'execution', 'runtime', 'orchestration', 'schedule', 'scheduling', 'retry', 'timeout', 'failureHandling', 'observation', 'result', 'satisfaction', 'satisfactionState', 'knowledgeUpdate', 'recipe', 'invocation', 'service', 'persistence', 'networking']);

function obj(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
function str(v) { return typeof v === 'string' && v.trim().length > 0; }
function sorted(v) { return Array.isArray(v) && v.every(str) && new Set(v).size === v.length && stableStringify(v) === stableStringify([...v].sort()); }
function forbidden(v) { if (Array.isArray(v)) return v.some(forbidden); if (!obj(v)) return false; return Object.entries(v).some(([k, x]) => FORBIDDEN.has(k) || forbidden(x)); }
function exact(v, keys) { return obj(v) && Object.keys(v).every(k => keys.includes(k)) && keys.every(k => k in v); }

function hasCycle(nodes, edges) {
  const visiting = new Set(), visited = new Set();
  function visit(node) {
    if (visiting.has(node)) return true;
    if (visited.has(node)) return false;
    visiting.add(node);
    for (const next of edges.get(node) || []) if (visit(next)) return true;
    visiting.delete(node); visited.add(node); return false;
  }
  return nodes.some(visit);
}

function validateKnowledgeAcquisitionCapabilityCompositionDesign(d) {
  const errors = [], warnings = [];
  if (!obj(d)) return { valid: false, errors: ['KnowledgeAcquisitionCapabilityCompositionDesign must be an object.'], warnings };
  for (const k of TOP) if (!(k in d)) errors.push(`Missing property: ${k}.`);
  for (const k of Object.keys(d)) if (!TOP.includes(k)) errors.push(`knowledgeAcquisitionCapabilityCompositionDesign.${k} is not allowed.`);
  if (!str(d.id) || !d.id.startsWith('knowledgeAcquisitionCapabilityCompositionDesign_')) errors.push('id is invalid.');
  if (d.compositionDesignVersion !== '1.0') errors.push('compositionDesignVersion is invalid.');
  if (d.type !== 'knowledge_acquisition_capability_composition_design') errors.push('type is invalid.');
  if (!str(d.sourceSolutionDecisionRef) || !d.sourceSolutionDecisionRef.startsWith('knowledgeAcquisitionSolutionDecision:')) errors.push('sourceSolutionDecisionRef is invalid.');
  if (!str(d.sourceDesignRef) || !d.sourceDesignRef.startsWith('knowledgeAcquisitionDesign:')) errors.push('sourceDesignRef is invalid.');
  if (!sorted(d.selectedCapabilityRefs) || d.selectedCapabilityRefs.length < 2) errors.push('selectedCapabilityRefs are invalid.');
  const selected = new Set(Array.isArray(d.selectedCapabilityRefs) ? d.selectedCapabilityRefs : []);

  const assignments = Array.isArray(d.capabilityRoleAssignments) ? d.capabilityRoleAssignments : [];
  const assigned = new Set();
  if (assignments.length !== selected.size) errors.push('capabilityRoleAssignments must cover every selected capability exactly once.');
  for (const [i, x] of assignments.entries()) {
    if (!exact(x, ['capabilityRef', 'semanticRoles', 'contributionRefs', 'capabilityObligations'])) { errors.push(`capabilityRoleAssignments[${i}] is invalid.`); continue; }
    if (!selected.has(x.capabilityRef) || assigned.has(x.capabilityRef)) errors.push(`capabilityRoleAssignments[${i}].capabilityRef is invalid.`);
    assigned.add(x.capabilityRef);
    if (!sorted(x.semanticRoles) || !x.semanticRoles.length || !x.semanticRoles.every(v => ROLES.includes(v))) errors.push(`capabilityRoleAssignments[${i}].semanticRoles are invalid.`);
    if (!sorted(x.contributionRefs) || !x.contributionRefs.length) errors.push(`capabilityRoleAssignments[${i}].contributionRefs are invalid.`);
    if (!sorted(x.capabilityObligations) || !x.capabilityObligations.length || !x.capabilityObligations.every(v => OBLIGATIONS.includes(v))) errors.push(`capabilityRoleAssignments[${i}].capabilityObligations are invalid.`);
  }
  if ([...selected].some(x => !assigned.has(x))) errors.push('capabilityRoleAssignments do not cover selectedCapabilityRefs.');
  const integrators = assignments.filter(x => x.semanticRoles?.includes('composition_integrator'));
  if (integrators.length !== 1) errors.push('Exactly one composition_integrator is required.');

  const contributions = Array.isArray(d.contributions) ? d.contributions : [];
  const contributionRefs = new Set(), contributionByRef = new Map();
  if (!contributions.length) errors.push('contributions must be a non-empty array.');
  for (const [i, x] of contributions.entries()) {
    if (!exact(x, ['contributionRef', 'contributionKind', 'producerCapabilityRef', 'consumerCapabilityRefs', 'requiredKnowledgeUnitRefs', 'satisfiesRequirementType'])) { errors.push(`contributions[${i}] is invalid.`); continue; }
    if (!str(x.contributionRef) || contributionRefs.has(x.contributionRef)) errors.push(`contributions[${i}].contributionRef is invalid.`);
    contributionRefs.add(x.contributionRef); contributionByRef.set(x.contributionRef, x);
    if (!KINDS.includes(x.contributionKind)) errors.push(`contributions[${i}].contributionKind is invalid.`);
    if (!selected.has(x.producerCapabilityRef)) errors.push(`contributions[${i}].producerCapabilityRef is invalid.`);
    if (!sorted(x.consumerCapabilityRefs) || !x.consumerCapabilityRefs.every(v => selected.has(v)) || x.consumerCapabilityRefs.includes(x.producerCapabilityRef)) errors.push(`contributions[${i}].consumerCapabilityRefs are invalid.`);
    if (!sorted(x.requiredKnowledgeUnitRefs)) errors.push(`contributions[${i}].requiredKnowledgeUnitRefs are invalid.`);
    if (x.satisfiesRequirementType !== null && !REQUIREMENTS.includes(x.satisfiesRequirementType)) errors.push(`contributions[${i}].satisfiesRequirementType is invalid.`);
  }
  const finals = contributions.filter(x => x.contributionKind === 'final_knowledge_output');
  if (finals.length !== 1) errors.push('Exactly one final_knowledge_output contribution is required.');
  if (finals.length === 1 && integrators.length === 1 && finals[0].producerCapabilityRef !== integrators[0].capabilityRef) errors.push('The final_knowledge_output must be produced by the composition_integrator.');
  if (finals.length === 1 && !REQUIREMENTS.includes(finals[0].satisfiesRequirementType)) errors.push('The final_knowledge_output must satisfy an allowed requirement type.');
  for (const [i, x] of assignments.entries()) {
    if (Array.isArray(x.contributionRefs) && x.contributionRefs.some(ref => !contributionRefs.has(ref) || contributionByRef.get(ref)?.producerCapabilityRef !== x.capabilityRef)) errors.push(`capabilityRoleAssignments[${i}].contributionRefs are inconsistent.`);
  }
  for (const x of contributions) if (!assignments.some(a => a.capabilityRef === x.producerCapabilityRef && a.contributionRefs?.includes(x.contributionRef))) errors.push(`Contribution ${x.contributionRef} is not referenced by its producer assignment.`);

  const dependencies = Array.isArray(d.logicalDependencies) ? d.logicalDependencies : [];
  const records = new Set(), edges = new Map(), prerequisiteUses = new Set();
  for (const [i, x] of dependencies.entries()) {
    const semanticKey = stableStringify(x);
    if (records.has(semanticKey)) errors.push(`logicalDependencies[${i}] duplicates an existing dependency.`);
    records.add(semanticKey);
    if (!exact(x, ['dependentContributionRef', 'prerequisiteContributionRefs', 'dependencyMode']) || !contributionRefs.has(x.dependentContributionRef) || !sorted(x.prerequisiteContributionRefs) || !x.prerequisiteContributionRefs.length || x.prerequisiteContributionRefs.includes(x.dependentContributionRef) || !x.prerequisiteContributionRefs.every(v => contributionRefs.has(v)) || !['all_required', 'any_required'].includes(x.dependencyMode)) { errors.push(`logicalDependencies[${i}] is invalid.`); continue; }
    edges.set(x.dependentContributionRef, [...(edges.get(x.dependentContributionRef) || []), ...x.prerequisiteContributionRefs]);
    for (const ref of x.prerequisiteContributionRefs) {
      prerequisiteUses.add(ref);
      const prerequisite = contributionByRef.get(ref), dependent = contributionByRef.get(x.dependentContributionRef);
      if (prerequisite && dependent && !prerequisite.consumerCapabilityRefs.includes(dependent.producerCapabilityRef)) errors.push(`logicalDependencies[${i}] is inconsistent with consumerCapabilityRefs.`);
    }
  }
  if (hasCycle([...contributionRefs], edges)) errors.push('logicalDependencies contain a cycle.');
  for (const x of contributions) {
    for (const consumer of x.consumerCapabilityRefs || []) if (!dependencies.some(dep => dep.prerequisiteContributionRefs?.includes(x.contributionRef) && contributionByRef.get(dep.dependentContributionRef)?.producerCapabilityRef === consumer)) errors.push(`Contribution ${x.contributionRef} has a consumer without a logical dependency.`);
    if (x.contributionKind === 'intermediate_knowledge_contribution' && !prerequisiteUses.has(x.contributionRef)) errors.push(`Intermediate contribution ${x.contributionRef} is orphaned.`);
  }
  if (finals.length === 1 && contributions.some(x => x.contributionKind === 'intermediate_knowledge_contribution') && !dependencies.some(x => x.dependentContributionRef === finals[0].contributionRef)) errors.push('The final output is not connected to intermediate contributions.');

  const allowedSubjects = new Set([d.sourceSolutionDecisionRef, d.sourceDesignRef, ...selected, ...contributionRefs, ...OBLIGATIONS, ...(Array.isArray(d.dependencyRefs) ? d.dependencyRefs : []), ...contributions.flatMap(x => Array.isArray(x.requiredKnowledgeUnitRefs) ? x.requiredKnowledgeUnitRefs : [])]);
  if (!Array.isArray(d.compositionConditions) || !d.compositionConditions.length) errors.push('compositionConditions are invalid.');
  else for (const [i, x] of d.compositionConditions.entries()) if (!exact(x, ['conditionCode', 'conditionType', 'subjectRefs']) || !str(x.conditionCode) || !['required', 'constraint'].includes(x.conditionType) || !sorted(x.subjectRefs) || !x.subjectRefs.length || !x.subjectRefs.every(ref => allowedSubjects.has(ref))) errors.push(`compositionConditions[${i}] is invalid.`);

  const s = d.solutionShapeSatisfaction;
  if (!exact(s, ['outputTopology', 'contributionRequirements', 'prerequisiteTopology', 'capabilityObligationCoverage']) || !str(s.outputTopology) || !Array.isArray(s.contributionRequirements) || !s.contributionRequirements.length || !obj(s.prerequisiteTopology) || !Array.isArray(s.capabilityObligationCoverage)) errors.push('solutionShapeSatisfaction is invalid.');
  else {
    const covered = new Set();
    for (const [i, x] of s.capabilityObligationCoverage.entries()) {
      if (!exact(x, ['obligation', 'capabilityRefs']) || !OBLIGATIONS.includes(x.obligation) || covered.has(x.obligation) || !sorted(x.capabilityRefs) || !x.capabilityRefs.length || !x.capabilityRefs.every(v => selected.has(v))) errors.push(`capabilityObligationCoverage[${i}] is invalid.`);
      covered.add(x.obligation);
      for (const capabilityRef of x.capabilityRefs || []) if (!assignments.some(a => a.capabilityRef === capabilityRef && a.capabilityObligations?.includes(x.obligation))) errors.push('capabilityObligationCoverage is inconsistent with role assignments.');
    }
    for (const x of assignments) for (const obligation of x.capabilityObligations || []) if (!s.capabilityObligationCoverage.some(c => c.obligation === obligation && c.capabilityRefs.includes(x.capabilityRef))) errors.push('capabilityObligationCoverage is inconsistent with role assignments.');
  }
  if (!obj(d.traceability) || !exact(d.traceability, ['sourceRequirementRef', 'sourceStrategyRef', 'sourceNeedRef', 'sourceOpportunityRef', 'sourceCoverageRef', 'sourcePersonKnowledgeMatrixRef']) || !Object.values(d.traceability).every(str)) errors.push('traceability is invalid.');
  if (!obj(d.provenance) || !exact(d.provenance, ['type', 'producerVersion', 'deterministic', 'interpretive']) || d.provenance.type !== 'knowledge_acquisition_capability_composition_design_derivation' || d.provenance.producerVersion !== '1.0' || d.provenance.deterministic !== true || d.provenance.interpretive !== false) errors.push('provenance is invalid.');
  if (!sorted(d.dependencyRefs) || ![d.sourceSolutionDecisionRef, d.sourceDesignRef, ...(d.selectedCapabilityRefs || [])].every(x => d.dependencyRefs.includes(x))) errors.push('dependencyRefs are invalid.');
  if (!exact(d.metadata, ['contractVersion', 'compositionDesignStrategyVersion', 'readOnly']) || d.metadata.contractVersion !== '1.0' || d.metadata.compositionDesignStrategyVersion !== '1.0' || d.metadata.readOnly !== true) errors.push('metadata is invalid.');
  if (!obj(d.extensions)) errors.push('extensions must be an object.');
  if (forbidden(d)) errors.push('Composition Design contains forbidden operational structure.');
  try { JSON.stringify(d); } catch { errors.push('KnowledgeAcquisitionCapabilityCompositionDesign must be serializable.'); }
  if (TOP.every(k => k in d) && str(d.id)) {
    try { if (d.id !== calculateKnowledgeAcquisitionCapabilityCompositionDesignId(d)) errors.push('id does not match the deterministic content fingerprint.'); } catch { errors.push('id fingerprint cannot be calculated.'); }
  }
  return { valid: errors.length === 0, errors, warnings };
}

module.exports = { validateKnowledgeAcquisitionCapabilityCompositionDesign, COMPOSITION_ROLES: ROLES };
