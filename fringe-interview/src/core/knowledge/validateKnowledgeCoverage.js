const { validatePersonKnowledgeQuery } = require('./validatePersonKnowledgeQuery');

const TOP_FIELDS = [
  'id', 'coverageVersion', 'sourceMatrixRef', 'appliedQuery', 'overallCoverage',
  'dimensionCoverage', 'capabilityCoverage', 'summary', 'provenance',
  'dependencyRefs', 'metadata', 'extensions',
];
const OVERALL_FIELDS = ['state', 'elementaryStateCount', 'derivedStateCount', 'totalStateCount', 'dimensionCount', 'capabilityCount'];
const DIMENSION_FIELDS = [
  'dimensionId', 'coverageState', 'elementaryStateCount', 'derivedStateCount',
  'totalStateCount', 'observedStateCount', 'knownDerivedStateCount',
  'elementaryCoverage', 'derivedStateRefs', 'capabilityIds', 'recipeRefs',
];
const CAPABILITY_FIELDS = [
  'capabilityId', 'coverageState', 'derivedStateCount', 'dimensionCount',
  'recipeCount', 'dimensionIds', 'recipeRefs', 'stateRefs',
];
const SUMMARY_FIELDS = ['dimensionCount', 'capabilityCount', 'coveredDimensions', 'coveredCapabilities', 'overallCoverageState'];
const MATRIX_STATES = ['empty', 'elementary_only', 'derived_only', 'composed'];

function isObject(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function validString(value) { return typeof value === 'string' && value.trim().length > 0; }
function count(value) { return Number.isInteger(value) && value >= 0; }
function unit(value) { return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1; }
function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (isObject(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
function unknownKeys(value, allowed, path, errors) {
  if (!isObject(value)) return;
  for (const key of Object.keys(value)) if (!allowed.includes(key)) errors.push(`${path}.${key} is not allowed.`);
}
function sortedUniqueStrings(value) {
  return Array.isArray(value) && value.every(validString) && new Set(value).size === value.length && stable(value) === stable([...value].sort());
}
function expectedState(elementary, derived) {
  if (elementary && derived) return 'composed';
  if (elementary) return 'elementary_only';
  if (derived) return 'derived_only';
  return 'empty';
}
function forbidden(value) {
  const forbiddenKeys = new Set(['score', 'overallScore', 'personScore', 'ranking', 'recommendation', 'priority', 'weight', 'matching', 'readiness', 'employability', 'potentialScore']);
  if (Array.isArray(value)) return value.some(forbidden);
  if (!isObject(value)) return false;
  return Object.entries(value).some(([key, child]) => forbiddenKeys.has(key) || forbidden(child));
}

function validateKnowledgeCoverage(coverage = {}) {
  const errors = [];
  const warnings = [];
  if (!isObject(coverage)) return { valid: false, errors: ['KnowledgeCoverage must be an object.'], warnings };
  unknownKeys(coverage, TOP_FIELDS, 'knowledgeCoverage', errors);
  if (!validString(coverage.id) || !coverage.id.startsWith('knowledgeCoverage_')) errors.push('id is invalid.');
  if (coverage.coverageVersion !== '1.0') errors.push('coverageVersion must be 1.0.');
  if (!validString(coverage.sourceMatrixRef) || !coverage.sourceMatrixRef.startsWith('personKnowledgeMatrix:')) errors.push('sourceMatrixRef is invalid.');
  if (coverage.appliedQuery !== null) {
    const queryValidation = validatePersonKnowledgeQuery(coverage.appliedQuery);
    if (!queryValidation.valid) errors.push(`appliedQuery is invalid: ${queryValidation.errors.join(' | ')}`);
  }

  if (!isObject(coverage.overallCoverage)) errors.push('overallCoverage must be an object.');
  else {
    unknownKeys(coverage.overallCoverage, OVERALL_FIELDS, 'overallCoverage', errors);
    if (!MATRIX_STATES.includes(coverage.overallCoverage.state)) errors.push('overallCoverage.state is invalid.');
    for (const field of OVERALL_FIELDS.filter((field) => field !== 'state')) if (!count(coverage.overallCoverage[field])) errors.push(`overallCoverage.${field} must be a non-negative integer.`);
    if (count(coverage.overallCoverage.elementaryStateCount) && count(coverage.overallCoverage.derivedStateCount) && coverage.overallCoverage.totalStateCount !== coverage.overallCoverage.elementaryStateCount + coverage.overallCoverage.derivedStateCount) errors.push('overallCoverage.totalStateCount is inconsistent.');
    if (MATRIX_STATES.includes(coverage.overallCoverage.state) && coverage.overallCoverage.state !== expectedState(coverage.overallCoverage.elementaryStateCount, coverage.overallCoverage.derivedStateCount)) errors.push('overallCoverage.state is inconsistent.');
  }

  if (!Array.isArray(coverage.dimensionCoverage)) errors.push('dimensionCoverage must be an array.');
  else {
    const seen = new Set();
    coverage.dimensionCoverage.forEach((entry, index) => {
      const path = `dimensionCoverage[${index}]`;
      if (!isObject(entry)) { errors.push(`${path} must be an object.`); return; }
      unknownKeys(entry, DIMENSION_FIELDS, path, errors);
      if (!validString(entry.dimensionId)) errors.push(`${path}.dimensionId is invalid.`);
      else if (seen.has(entry.dimensionId)) errors.push('dimensionCoverage contains duplicate dimensionId values.'); else seen.add(entry.dimensionId);
      if (!MATRIX_STATES.includes(entry.coverageState)) errors.push(`${path}.coverageState is invalid.`);
      for (const field of ['elementaryStateCount', 'derivedStateCount', 'totalStateCount', 'observedStateCount', 'knownDerivedStateCount']) if (!count(entry[field])) errors.push(`${path}.${field} must be a non-negative integer.`);
      if (entry.totalStateCount !== entry.elementaryStateCount + entry.derivedStateCount) errors.push(`${path}.totalStateCount is inconsistent.`);
      if (entry.coverageState !== expectedState(entry.elementaryStateCount, entry.derivedStateCount)) errors.push(`${path}.coverageState is inconsistent.`);
      if (entry.observedStateCount > entry.elementaryStateCount) errors.push(`${path}.observedStateCount is inconsistent.`);
      if (entry.knownDerivedStateCount > entry.derivedStateCount) errors.push(`${path}.knownDerivedStateCount is inconsistent.`);
      if (!Array.isArray(entry.elementaryCoverage)) errors.push(`${path}.elementaryCoverage must be an array.`);
      else entry.elementaryCoverage.forEach((item, itemIndex) => {
        if (!isObject(item) || Object.keys(item).some((key) => !['stateRef', 'coverage', 'confidence'].includes(key)) || !validString(item.stateRef) || !item.stateRef.startsWith('elementaryDimensionKnowledgeState:') || !unit(item.coverage) || !unit(item.confidence)) errors.push(`${path}.elementaryCoverage[${itemIndex}] is invalid.`);
      });
      for (const field of ['derivedStateRefs', 'capabilityIds', 'recipeRefs']) if (!sortedUniqueStrings(entry[field])) errors.push(`${path}.${field} must be canonically ordered and deduplicated.`);
      if (Array.isArray(entry.elementaryCoverage) && entry.elementaryCoverage.length !== entry.elementaryStateCount) errors.push(`${path}.elementaryCoverage count is inconsistent.`);
      if (Array.isArray(entry.derivedStateRefs) && entry.derivedStateRefs.length !== entry.derivedStateCount) errors.push(`${path}.derivedStateRefs count is inconsistent.`);
    });
    if (stable(coverage.dimensionCoverage) !== stable([...coverage.dimensionCoverage].sort((a, b) => a.dimensionId.localeCompare(b.dimensionId)))) errors.push('dimensionCoverage is not canonically ordered.');
  }

  if (!Array.isArray(coverage.capabilityCoverage)) errors.push('capabilityCoverage must be an array.');
  else {
    const seen = new Set();
    coverage.capabilityCoverage.forEach((entry, index) => {
      const path = `capabilityCoverage[${index}]`;
      if (!isObject(entry)) { errors.push(`${path} must be an object.`); return; }
      unknownKeys(entry, CAPABILITY_FIELDS, path, errors);
      if (!validString(entry.capabilityId)) errors.push(`${path}.capabilityId is invalid.`);
      else if (seen.has(entry.capabilityId)) errors.push('capabilityCoverage contains duplicate capabilityId values.'); else seen.add(entry.capabilityId);
      if (!['empty', 'available'].includes(entry.coverageState)) errors.push(`${path}.coverageState is invalid.`);
      for (const field of ['derivedStateCount', 'dimensionCount', 'recipeCount']) if (!count(entry[field])) errors.push(`${path}.${field} must be a non-negative integer.`);
      for (const field of ['dimensionIds', 'recipeRefs', 'stateRefs']) if (!sortedUniqueStrings(entry[field])) errors.push(`${path}.${field} must be canonically ordered and deduplicated.`);
      if (Array.isArray(entry.stateRefs) && entry.stateRefs.length !== entry.derivedStateCount) errors.push(`${path}.stateRefs count is inconsistent.`);
      if (Array.isArray(entry.dimensionIds) && entry.dimensionIds.length !== entry.dimensionCount) errors.push(`${path}.dimensionCount is inconsistent.`);
      if (Array.isArray(entry.recipeRefs) && entry.recipeRefs.length !== entry.recipeCount) errors.push(`${path}.recipeCount is inconsistent.`);
      if (entry.coverageState !== (entry.derivedStateCount ? 'available' : 'empty')) errors.push(`${path}.coverageState is inconsistent.`);
    });
    if (stable(coverage.capabilityCoverage) !== stable([...coverage.capabilityCoverage].sort((a, b) => a.capabilityId.localeCompare(b.capabilityId)))) errors.push('capabilityCoverage is not canonically ordered.');
  }

  if (!isObject(coverage.summary)) errors.push('summary must be an object.');
  else {
    unknownKeys(coverage.summary, SUMMARY_FIELDS, 'summary', errors);
    for (const field of SUMMARY_FIELDS.filter((field) => field !== 'overallCoverageState')) if (!count(coverage.summary[field])) errors.push(`summary.${field} must be a non-negative integer.`);
    if (!MATRIX_STATES.includes(coverage.summary.overallCoverageState)) errors.push('summary.overallCoverageState is invalid.');
    const dimensions = Array.isArray(coverage.dimensionCoverage) ? coverage.dimensionCoverage : [];
    const capabilities = Array.isArray(coverage.capabilityCoverage) ? coverage.capabilityCoverage : [];
    if (coverage.summary.dimensionCount !== dimensions.length || coverage.summary.capabilityCount !== capabilities.length || coverage.summary.coveredDimensions !== dimensions.filter((entry) => entry.totalStateCount > 0).length || coverage.summary.coveredCapabilities !== capabilities.filter((entry) => entry.derivedStateCount > 0).length || coverage.summary.overallCoverageState !== coverage.overallCoverage?.state) errors.push('summary is inconsistent with coverage entries.');
  }

  if (coverage.overallCoverage?.dimensionCount !== coverage.dimensionCoverage?.length || coverage.overallCoverage?.capabilityCount !== coverage.capabilityCoverage?.length) errors.push('overallCoverage counts are inconsistent.');
  if (!isObject(coverage.provenance) || coverage.provenance.type !== 'knowledge_coverage_evaluation' || coverage.provenance.producerVersion !== '1.0' || coverage.provenance.deterministic !== true || coverage.provenance.interpretive !== false) errors.push('provenance is invalid.');
  if (!sortedUniqueStrings(coverage.dependencyRefs) || !coverage.dependencyRefs.includes(coverage.sourceMatrixRef)) errors.push('dependencyRefs are invalid.');
  if (!isObject(coverage.metadata) || coverage.metadata.contractVersion !== '1.0' || coverage.metadata.evaluationStrategyVersion !== '1.0' || coverage.metadata.readOnly !== true) errors.push('metadata is invalid.');
  if (!isObject(coverage.extensions)) errors.push('extensions must be an object.');
  if (forbidden(coverage)) errors.push('KnowledgeCoverage must not contain person scores, ranking, recommendation, priority, weight, matching, or readiness fields.');
  return { valid: errors.length === 0, errors, warnings };
}

module.exports = { validateKnowledgeCoverage };
