const { execFileSync } = require('child_process');
execFileSync(process.execPath, ['scripts/test_knowledge_acquisition_boundary_freeze.js'], { stdio: 'pipe' });
console.log('Knowledge Acquisition Boundary health PASSED');
