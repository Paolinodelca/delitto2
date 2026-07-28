const { buildKnowledgeCoverage } = require('./buildKnowledgeCoverage');

function evaluateKnowledgeCoverage(personKnowledgeMatrix, personKnowledgeQuery, options = {}) {
  return buildKnowledgeCoverage({
    personKnowledgeMatrix,
    query: personKnowledgeQuery === undefined ? null : personKnowledgeQuery,
    extensions: options.extensions,
  });
}

module.exports = { evaluateKnowledgeCoverage };
