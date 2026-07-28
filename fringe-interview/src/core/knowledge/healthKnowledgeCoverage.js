const { evaluateKnowledgeCoverage } = require('./evaluateKnowledgeCoverage');
const { validateKnowledgeCoverage } = require('./validateKnowledgeCoverage');

function healthKnowledgeCoverage(personKnowledgeMatrix) {
  const coverage = evaluateKnowledgeCoverage(personKnowledgeMatrix);
  const validation = validateKnowledgeCoverage(coverage);
  if (!validation.valid) throw new Error(validation.errors.join(' | '));
  if (coverage.summary.dimensionCount < 1 || coverage.overallCoverage.totalStateCount < 1) throw new Error('Knowledge Coverage health requires populated knowledge.');
  return { ok: true, coverage };
}

module.exports = { healthKnowledgeCoverage };
