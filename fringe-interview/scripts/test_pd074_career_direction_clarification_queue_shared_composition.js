import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildCareerDirectionClarificationQueue} from '../src/app/careerDirection/buildCareerDirectionClarificationQueue.js';
const evaluation={hypotheses:[
 {id:'ops',directionRef:'ops',metadata:{roleLabel:'Operations Manager',roleRequirementSemanticKeys:{rp1:'people_responsibility',rb:'budget_resource_scope'}},conditionsToVerify:[{id:'cp1',reason:'people_responsibility_scope',roleRequirementRef:'rp1'},{id:'cb',reason:'broader_resource_budget_scope',roleRequirementRef:'rb'}]},
 {id:'prod',directionRef:'prod',metadata:{roleLabel:'Industrial Production Manager',roleRequirementSemanticKeys:{rp2:'people_responsibility',rpp:'production_planning_resource_scope'}},conditionsToVerify:[{id:'cp2',reason:'people_responsibility_scope',roleRequirementRef:'rp2'},{id:'cpp',reason:'production_planning_scope',roleRequirementRef:'rpp'}]}
]};
let q=buildCareerDirectionClarificationQueue({careerDirectionEvaluation:evaluation,directionResolutions:[]});
assert.equal(q.length,3);
const people=q.find(x=>x.conditionReason==='people_responsibility_scope');assert.ok(people);assert.equal(people.actionability,'actionable_now');assert.equal(people.acquisitionActionRef,'people_responsibility_scope_probe');assert.equal(people.affectedDirections.length,2);
for(const x of q.filter(x=>x!==people)){assert.equal(x.actionability,'informational_only');assert.equal(x.acquisitionActionRef,null)}
q=buildCareerDirectionClarificationQueue({careerDirectionEvaluation:evaluation,directionResolutions:[{conditionRef:'cp1',resolutionState:'resolved_by_current_authorised_state'},{conditionRef:'cp2',resolutionState:'resolved_by_current_authorised_state'}]});
assert.equal(q.some(x=>x.conditionReason==='people_responsibility_scope'),false);assert.equal(q.length,2);
const ui=fs.readFileSync('src/app/renderPrivateBetaUiJourneyHtml.js','utf8');const it=JSON.parse(fs.readFileSync('config/private_beta_ui.it.json','utf8'));const en=JSON.parse(fs.readFileSync('config/private_beta_ui.en.json','utf8'));
assert.match(ui,/buildCareerDirectionClarificationQueue/);assert.match(ui,/item\.actionability==='actionable_now'/);assert.match(ui,/directionSharedSupportTitle/);assert.match(ui,/sharedSupportKinds/);assert.match(ui,/directionClarificationActionableStatus/);assert.doesNotMatch(ui,/c\.reason==='people_responsibility_scope'\?`<form/);
for(const k of ['directionClarificationQueueTitle','directionClarificationQueueIntro','directionClarificationRelevantFor','directionClarificationInformationalOnly','directionClarificationUseQueue','directionSharedSupportTitle','directionSharedSupportIntro']){assert.ok(it[k]);assert.ok(en[k])}
assert.match(it.directionClarificationQueueTitle,/chiarire/i);assert.doesNotMatch(it.directionClarificationInformationalOnly,/autorità|semantica/i);
console.log('PD-074 Career Direction clarification queue and shared composition tests passed.');
