const assert = require('assert');
const names = ['buildKnowledgeAcquisitionProviderResult', 'validateKnowledgeAcquisitionProviderResult', 'validateKnowledgeAcquisitionProviderResultContext', 'healthKnowledgeAcquisitionProviderResult'];
const infrastructure = require('../src/infrastructure/knowledge');
for (const name of names) assert.equal(typeof infrastructure[name], 'function', name);
for (const name of names) {
  assert(!Object.prototype.hasOwnProperty.call(require('../src/app/knowledge'), name));
  assert(!Object.prototype.hasOwnProperty.call(require('../src/core/knowledge'), name));
}
Promise.all([import('../src/infrastructure/knowledge/publicApi.js'), import('../src/infrastructure/index.js')]).then(apis => {
  for (const api of apis) for (const name of names) assert.equal(typeof api[name], 'function', name);
  console.log('Knowledge Acquisition Provider Result public API tests PASSED');
}).catch(error => { console.error(error); process.exitCode = 1; });
