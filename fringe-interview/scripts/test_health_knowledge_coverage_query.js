const assert=require('assert');const cp=require('child_process');const path=require('path');
// Reuse the focused fixture, then perform an independent minimal contract smoke via its successful process.
cp.execFileSync(process.execPath,[path.join(__dirname,'test_knowledge_coverage_query.js')],{stdio:'pipe'});assert.strictEqual(typeof require('../src/core/knowledge').healthKnowledgeCoverageQuery,'function');console.log('Knowledge Coverage Query health PASSED');
