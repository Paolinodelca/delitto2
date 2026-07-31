const assert = require('assert');
const names = [
  'createStructuredInputKnowledgeAcquisitionInvocationAdapter',
  'validateStructuredInputKnowledgeAcquisitionProvider',
  'healthStructuredInputKnowledgeAcquisitionInvocationAdapter'
];
const infrastructure = require('../src/infrastructure/knowledge');

for (const name of names) assert.equal(typeof infrastructure[name], 'function', name);
for (const name of names) assert(!Object.prototype.hasOwnProperty.call(require('../src/app/knowledge'), name));

import('../src/infrastructure/knowledge/publicApi.js')
  .then(knowledgeApi => import('../src/infrastructure/index.js').then(infrastructureApi => {
    for (const name of names) {
      assert.equal(typeof knowledgeApi[name], 'function', `knowledge Infrastructure ESM ${name}`);
      assert.equal(typeof infrastructureApi[name], 'function', `Infrastructure ESM ${name}`);
    }
    console.log('Structured Input Knowledge Acquisition Invocation Adapter public API tests PASSED');
  }))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
