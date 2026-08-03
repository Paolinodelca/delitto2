const assert = require('assert');
const names = ['selectRegisteredKnowledgeAcquisitionEvidence', 'validateRegisteredEvidenceSelection', 'validateRegisteredEvidenceSelectionContext', 'healthRegisteredEvidenceSelection'];
for (const name of names) assert.strictEqual(typeof require('../src/app/knowledge')[name], 'function');
for (const name of names) assert(!Object.prototype.hasOwnProperty.call(require('../src/core/evidence'), name));
Promise.all([import('../src/app/knowledge/publicApi.js'), import('../src/app/index.js')]).then(apis => {
  for (const api of apis) for (const name of names) assert.strictEqual(typeof api[name], 'function');
  console.log('Registered Evidence Selection public API tests PASSED');
}).catch(error => { console.error(error); process.exitCode = 1; });
