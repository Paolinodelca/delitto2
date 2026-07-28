const crypto = require('crypto');
const { validatePersonKnowledgeMatrix } = require('./validatePersonKnowledgeMatrix');
const { buildPersonKnowledgeQuery } = require('./buildPersonKnowledgeQuery');
const { queryPersonKnowledgeMatrix } = require('./queryPersonKnowledgeMatrix');
const { validateKnowledgeCoverage } = require('./validateKnowledgeCoverage');

function isObject(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (isObject(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
  return value;
}
function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (isObject(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
function hash(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function uniqueSorted(values) { return [...new Set(values.filter(Boolean))].sort(); }
function fail(code, message, details) { const error = new Error(message); error.code = code; if (details) error.details = details; throw error; }
function matrixState(elementaryCount, derivedCount) {
  if (elementaryCount && derivedCount) return 'composed';
  if (elementaryCount) return 'elementary_only';
  if (derivedCount) return 'derived_only';
  return 'empty';
}

function buildKnowledgeCoverage(input = {}) {
  const matrix = input.personKnowledgeMatrix;
  const matrixValidation = validatePersonKnowledgeMatrix(matrix);
  if (!matrixValidation.valid) fail('INVALID_PERSON_KNOWLEDGE_MATRIX', matrixValidation.errors.join(' | '), matrixValidation);

  let appliedQuery = null;
  let elementary = matrix.knowledgeLayers.elementary.map(clone);
  let derived = matrix.knowledgeLayers.derived.map(clone);
  if (input.query !== undefined && input.query !== null) {
    appliedQuery = buildPersonKnowledgeQuery(input.query);
    const queryResult = queryPersonKnowledgeMatrix(matrix, appliedQuery);
    elementary = queryResult.knowledgeLayers.elementary;
    derived = queryResult.knowledgeLayers.derived;
  }

  elementary.sort((a, b) => a.state.dimensionId.localeCompare(b.state.dimensionId) || a.stateId.localeCompare(b.stateId));
  derived.sort((a, b) => a.dimensionId.localeCompare(b.dimensionId) || a.capabilityId.localeCompare(b.capabilityId) || a.recipeRef.localeCompare(b.recipeRef) || a.recipeVersion.localeCompare(b.recipeVersion) || a.id.localeCompare(b.id));

  const dimensionIds = uniqueSorted([
    ...elementary.map((entry) => entry.state.dimensionId),
    ...derived.map((state) => state.dimensionId),
  ]);
  const dimensionCoverage = dimensionIds.map((dimensionId) => {
    const elementaryStates = elementary.filter((entry) => entry.state.dimensionId === dimensionId);
    const derivedStates = derived.filter((state) => state.dimensionId === dimensionId);
    return {
      dimensionId,
      coverageState: matrixState(elementaryStates.length, derivedStates.length),
      elementaryStateCount: elementaryStates.length,
      derivedStateCount: derivedStates.length,
      totalStateCount: elementaryStates.length + derivedStates.length,
      observedStateCount: elementaryStates.filter((entry) => entry.state.stateType === 'observed').length,
      knownDerivedStateCount: derivedStates.filter((state) => state.status === 'known').length,
      elementaryCoverage: elementaryStates.map((entry) => ({
        stateRef: `elementaryDimensionKnowledgeState:${entry.stateId}`,
        coverage: entry.state.coverage,
        confidence: entry.state.confidence,
      })),
      derivedStateRefs: derivedStates.map((state) => `derivedDimensionKnowledgeState:${state.id}`),
      capabilityIds: uniqueSorted(derivedStates.map((state) => state.capabilityId)),
      recipeRefs: uniqueSorted(derivedStates.map((state) => `${state.recipeRef}@${state.recipeVersion}`)),
    };
  });

  const capabilityIds = uniqueSorted(derived.map((state) => state.capabilityId));
  const capabilityCoverage = capabilityIds.map((capabilityId) => {
    const states = derived.filter((state) => state.capabilityId === capabilityId);
    return {
      capabilityId,
      coverageState: states.length ? 'available' : 'empty',
      derivedStateCount: states.length,
      dimensionCount: new Set(states.map((state) => state.dimensionId)).size,
      recipeCount: new Set(states.map((state) => `${state.recipeRef}@${state.recipeVersion}`)).size,
      dimensionIds: uniqueSorted(states.map((state) => state.dimensionId)),
      recipeRefs: uniqueSorted(states.map((state) => `${state.recipeRef}@${state.recipeVersion}`)),
      stateRefs: states.map((state) => `derivedDimensionKnowledgeState:${state.id}`).sort(),
    };
  });

  const elementaryCount = elementary.length;
  const derivedCount = derived.length;
  const overallCoverageState = matrixState(elementaryCount, derivedCount);
  const dependencyRefs = uniqueSorted([
    `personKnowledgeMatrix:${matrix.id}`,
    ...elementary.map((entry) => `elementaryDimensionKnowledgeState:${entry.stateId}`),
    ...derived.map((state) => `derivedDimensionKnowledgeState:${state.id}`),
  ]);
  const logicalIdentity = {
    sourceMatrixRef: `personKnowledgeMatrix:${matrix.id}`,
    appliedQuery,
    elementaryStateRefs: elementary.map((entry) => entry.stateId).sort(),
    derivedStateRefs: derived.map((state) => state.id).sort(),
    contractVersion: '1.0',
    evaluationStrategyVersion: '1.0',
  };

  const coverage = {
    id: `knowledgeCoverage_${hash(stable(logicalIdentity)).slice(0, 32)}`,
    coverageVersion: '1.0',
    sourceMatrixRef: `personKnowledgeMatrix:${matrix.id}`,
    appliedQuery: appliedQuery ? clone(appliedQuery) : null,
    overallCoverage: {
      state: overallCoverageState,
      elementaryStateCount: elementaryCount,
      derivedStateCount: derivedCount,
      totalStateCount: elementaryCount + derivedCount,
      dimensionCount: dimensionCoverage.length,
      capabilityCount: capabilityCoverage.length,
    },
    dimensionCoverage,
    capabilityCoverage,
    summary: {
      dimensionCount: dimensionCoverage.length,
      capabilityCount: capabilityCoverage.length,
      coveredDimensions: dimensionCoverage.filter((entry) => entry.totalStateCount > 0).length,
      coveredCapabilities: capabilityCoverage.filter((entry) => entry.derivedStateCount > 0).length,
      overallCoverageState,
    },
    provenance: {
      type: 'knowledge_coverage_evaluation',
      producerVersion: '1.0',
      deterministic: true,
      interpretive: false,
    },
    dependencyRefs,
    metadata: {
      contractVersion: '1.0',
      evaluationStrategyVersion: '1.0',
      readOnly: true,
    },
    extensions: isObject(input.extensions) ? clone(input.extensions) : {},
  };

  const validation = validateKnowledgeCoverage(coverage);
  if (!validation.valid) fail('INVALID_GENERATED_KNOWLEDGE_COVERAGE', validation.errors.join(' | '), validation);
  return coverage;
}

module.exports = { buildKnowledgeCoverage };
