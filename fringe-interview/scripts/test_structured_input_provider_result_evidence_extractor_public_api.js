const assert = require('assert');
const names = ['extractEvidenceFromStructuredInputProviderResult', 'validateStructuredInputProviderResultEvidencePayload', 'validateStructuredInputProviderResultEvidenceContext', 'calculateStructuredInputEvidenceIdentity', 'healthStructuredInputProviderResultEvidenceExtractor'];
for (const name of names) assert.strictEqual(typeof require('../src/infrastructure/knowledge')[name], 'function');
for (const name of names) {
  assert(!Object.prototype.hasOwnProperty.call(require('../src/app/knowledge'), name));
  assert(!Object.prototype.hasOwnProperty.call(require('../src/core/knowledge'), name));
}
Promise.all([import('../src/infrastructure/knowledge/publicApi.js'), import('../src/infrastructure/index.js')]).then(apis => {
  for (const api of apis) for (const name of names) assert.strictEqual(typeof api[name], 'function');
  console.log('Structured Input Provider Result Evidence Extractor public API tests PASSED');
}).catch(error => { console.error(error); process.exitCode = 1; });
