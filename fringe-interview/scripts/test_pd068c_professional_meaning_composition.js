import assert from 'node:assert/strict';
import {composeProfessionalThreads,selectLevel1ProfessionalThreads} from '../src/app/professionalThreadComposition.js';
const pattern={kind:'documented_cross_functional_coordination_recurrence',sourceRefs:['s1','s2'],episodeRefs:['e1','e2'],supports:[{sourceId:'s1',supportExcerpt:'Coordinamento tra produzione e qualità.'},{sourceId:'s2',supportExcerpt:'Coordinamento tra produzione e manutenzione.'}],supportCount:2};
const threads=composeProfessionalThreads({professionalMeaning:{supportedPatterns:[pattern],selectedEpisodeContributions:[],knowledgeContribution:[]}});
assert.equal(threads[0].kind,'recurring_pattern');assert.equal(threads[0].relationshipBasis,'documented_cross_functional_coordination_recurrence');assert.equal(threads.some(x=>x.kind==='role_history_continuity'||x.kind==='shared_runtime_lineage'),false);assert.equal(selectLevel1ProfessionalThreads(threads)[0].kind,'recurring_pattern');assert.equal(threads.some(x=>x.capability||x.score||x.importanceScore),false);
console.log('PD-068C professional meaning composition: PASS');
