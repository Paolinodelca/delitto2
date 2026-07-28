const assert = require('assert');
const fs = require('fs');
const path = require('path');
const know = require('../src/core/knowledge');

const expected = require('./fixtures/expected_knowledge_core_exports');
assert.deepStrictEqual(Object.keys(know).sort(), expected);
for (const name of expected) assert.strictEqual(typeof know[name], 'function');

for (const file of ['buildKnowledgeCoverage.js', 'validateKnowledgeCoverage.js', 'evaluateKnowledgeCoverage.js', 'healthKnowledgeCoverage.js']) {
  const text = fs.readFileSync(path.join(__dirname, '../src/core/knowledge', file), 'utf8');
  assert(!/\beval\s*\(|new Function/.test(text));
  assert(!/openai|groq|fetch\s*\(|https?:\/\//i.test(text));
  assert(!/require\(['"](?:fs|net|http|https|child_process)['"]\)/.test(text));
  assert(!/registry|singleton|callback/i.test(text));
}

const builder = fs.readFileSync(path.join(__dirname, '../src/core/knowledge/buildKnowledgeCoverage.js'), 'utf8');
assert(!/overallScore|personScore|professionalScore|employability|potentialScore|readiness|ranking|recommendation|priority|weight/.test(builder));
assert(builder.includes('validatePersonKnowledgeMatrix'));
assert(builder.includes('queryPersonKnowledgeMatrix'));
assert(!builder.includes('executeCapabilityRecipe'));
assert(!builder.includes('buildDerivedDimensionKnowledgeState'));
assert(!fs.readFileSync('src/core/dimension/index.js', 'utf8').includes('KnowledgeCoverage'));
assert(!fs.readFileSync('src/core/capability/index.js', 'utf8').includes('KnowledgeCoverage'));

console.log('Knowledge Coverage regression PASSED');
