import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createPrivateBetaUiServer } from '../src/app/privateBetaUiServer.js';
import { renderPrivateBetaUiJourneyHtml } from '../src/app/renderPrivateBetaUiJourneyHtml.js';

const sessionRef='direction:pdir12:test';
const peopleCondition={id:'condition:people',reason:'people_responsibility_scope',roleRequirementRef:'roleRequirement:people'};
const budgetCondition={id:'condition:budget',reason:'broader_resource_budget_scope',roleRequirementRef:'roleRequirement:budget'};
const evaluation={
  hypotheses:[{
    id:'direction:operations',
    directionRef:'operations_management',
    whyWorthExploring:'broader_operational_coordination_and_decision_contexts',
    supportBasis:[],
    conditionsToVerify:[peopleCondition,budgetCondition],
    metadata:{
      roleLabel:'Operations Manager',
      roleRequirementSemanticKeys:{'roleRequirement:people':'people_responsibility','roleRequirement:budget':'budget_resource_scope'},
      roleRequirementSources:{'roleRequirement:people':[],'roleRequirement:budget':[]},
      personSupportKinds:[]
    }
  }]
};
const resolutions=[{
  careerDirectionHypothesisRef:'direction:operations',
  conditionRef:peopleCondition.id,
  roleRequirementRef:peopleCondition.roleRequirementRef,
  resolutionState:'resolved_by_current_authorised_state',
  personKnowledgeRef:'knowledge:people'
}];
const resolvedAcquisition={status:'resolved',questionRequired:false,resolutions};
const stoppedAcquisition={status:'stopped_unresolved',questionRequired:false,resolutions:[]};
const retryableAcquisition={status:'awaiting_answer',questionRequired:true,resolutions:[],operationalFailure:{category:'provider_technical_failure'}};

const successIt=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'purpose_direction_acquisition',sessionRef,directionAcquisition:resolvedAcquisition}});
assert.match(successIt,/Questo aspetto ora è sufficientemente conosciuto e le direzioni interessate sono state rivalutate\./);
assert.match(successIt,/action="\/private-beta\/direction\/return"/);
assert.match(successIt,/Torna alle direzioni/);

const successEn=renderPrivateBetaUiJourneyHtml({locale:'en',result:{phase:'purpose_direction_acquisition',sessionRef,directionAcquisition:resolvedAcquisition}});
assert.match(successEn,/Return to directions/);

const stoppedHtml=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'purpose_direction_acquisition',sessionRef,directionAcquisition:stoppedAcquisition}});
assert.doesNotMatch(stoppedHtml,/\/private-beta\/direction\/return/);
assert.doesNotMatch(stoppedHtml,/Torna alle direzioni/);

const retryableHtml=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'purpose_direction_acquisition',sessionRef,directionAcquisition:retryableAcquisition}});
assert.match(retryableHtml,/Non sono riuscito a interpretare la risposta per un problema tecnico/);
assert.doesNotMatch(retryableHtml,/\/private-beta\/direction\/return/);
assert.doesNotMatch(retryableHtml,/Torna alle direzioni/);

const sessionStore=new Map([[sessionRef,{
  type:'direction_explore_state',
  sessionRef,
  careerDirectionEvaluation:evaluation,
  directionAcquisition:resolvedAcquisition
}]]);
const server=createPrivateBetaUiServer({locale:'it',sessionStore});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try{
  const base=`http://127.0.0.1:${server.address().port}`;
  const response=await fetch(`${base}/private-beta/direction/return`,{
    method:'POST',
    headers:{'content-type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({sessionRef})
  });
  const html=await response.text();
  assert.equal(response.status,200,html);
  assert.match(html,/id="career-directions"/);
  assert.match(html,/Operations Manager/);
  assert.doesNotMatch(html,/Hai già avuto responsabilità continuativa sulle persone, oltre al coordinamento operativo\?/i);
  assert.match(html,/Chiarisci la tua esperienza diretta nella gestione di risorse o budget su un perimetro operativo più ampio/i);
  assert.doesNotMatch(html,/action="\/private-beta\/direction\/deepen"[^>]*>[\s\S]*condition:people/);
} finally {
  await new Promise(resolve=>server.close(resolve));
}

const blockedSession='direction:pdir12:stopped';
const blockedStore=new Map([[blockedSession,{
  type:'direction_explore_state',
  sessionRef:blockedSession,
  careerDirectionEvaluation:evaluation,
  directionAcquisition:stoppedAcquisition
}]]);
const blockedServer=createPrivateBetaUiServer({locale:'it',sessionStore:blockedStore});
await new Promise(resolve=>blockedServer.listen(0,'127.0.0.1',resolve));
try{
  const base=`http://127.0.0.1:${blockedServer.address().port}`;
  const response=await fetch(`${base}/private-beta/direction/return`,{
    method:'POST',
    headers:{'content-type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({sessionRef:blockedSession})
  });
  assert.equal(response.status,422);
} finally {
  await new Promise(resolve=>blockedServer.close(resolve));
}

const rendererSource=await readFile(new URL('../src/app/renderPrivateBetaUiJourneyHtml.js',import.meta.url),'utf8');
const serverSource=await readFile(new URL('../src/app/privateBetaUiServer.js',import.meta.url),'utf8');
assert.equal(rendererSource.includes('Torna alle direzioni'),false);
assert.equal(rendererSource.includes('Return to directions'),false);
assert.equal(serverSource.includes('Torna alle direzioni'),false);
assert.equal(serverSource.includes('Return to directions'),false);

console.log('PDIR-12 post-acquisition return to directions UX corrective: PASS');
