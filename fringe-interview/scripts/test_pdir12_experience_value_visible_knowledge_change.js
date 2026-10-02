import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';
import {createPrivateBetaUiServer} from '../src/app/privateBetaUiServer.js';
import {startDirectionPeopleResponsibilityAcquisition} from '../src/app/careerDirection/directionKnowledgeAcquisition.js';

const sessionRef='direction:pdir12:value';
const peopleOps={id:'condition:people:ops',reason:'people_responsibility_scope',roleRequirementRef:'req:people:ops'};
const budget={id:'condition:budget',reason:'broader_resource_budget_scope',roleRequirementRef:'req:budget'};
const peopleProd={id:'condition:people:prod',reason:'people_responsibility_scope',roleRequirementRef:'req:people:prod'};
const planning={id:'condition:planning',reason:'production_planning_scope',roleRequirementRef:'req:planning'};
const source={sourceRef:'roleSource:onet:11-1021.00:2026',displayName:'O*NET — General and Operations Managers',sourceTitle:'General and Operations Managers',publisher:'O*NET',sourceClass:'external_role_reference',observedAt:'2026-09-01'};
const evaluation={hypotheses:[
 {id:'direction:ops',directionRef:'operations_management',whyWorthExploring:'broader_operational_coordination_and_decision_contexts',supportBasis:[],conditionsToVerify:[peopleOps,budget],metadata:{roleLabel:'Operations Manager',roleRequirementSemanticKeys:{'req:people:ops':'people_responsibility','req:budget':'budget_resource_scope'},roleRequirementSources:{'req:people:ops':[source],'req:budget':[source]},personSupportKinds:[]}},
 {id:'direction:prod',directionRef:'industrial_production_management',whyWorthExploring:'manufacturing_role_continuity_and_production_results',supportBasis:[],conditionsToVerify:[peopleProd,planning],metadata:{roleLabel:'Industrial Production Manager',roleFamilyRef:'industrial_production_management',roleRequirementSemanticKeys:{'req:people:prod':'people_responsibility','req:planning':'production_planning_scope'},roleRequirementSources:{'req:people:prod':[source],'req:planning':[source]},personSupportKinds:[]}}
]};
const resolutions=[
 {careerDirectionHypothesisRef:'direction:ops',conditionRef:peopleOps.id,resolutionState:'resolved_by_current_authorised_state'},
 {careerDirectionHypothesisRef:'direction:prod',conditionRef:peopleProd.id,resolutionState:'resolved_by_current_authorised_state'}
];
const feedback={semanticDetail:{responsibilityPresence:'supported',continuity:'continuing',responsibilityMode:'informal_operational',responsibilityKinds:['work_assignment_or_priority_setting','workload_shift_or_schedule_coordination','performance_follow_up_or_feedback'],peopleScope:{kind:'exact',value:10},professionalContext:{description:'reparto produttivo'},eventTime:{description:'Da circa due anni'}},affectedDirectionRefs:['direction:ops','direction:prod'],affectedDirectionLabels:['Operations Manager','Responsabile della produzione industriale']};
const html=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'purpose_direction_explore',sessionRef,preInterview:{careerDirectionEvaluation:evaluation,directionResolutions:resolutions,directionKnowledgeFeedback:feedback}}});
assert.match(html,/Cosa abbiamo capito meglio/);
assert.match(html,/informazione professionale supportata e riutilizzabile/);
assert.match(html,/responsabilità continuativa sulle persone/);
assert.match(html,/circa 10 persone/);
assert.match(html,/reparto produttivo/);
assert.match(html,/priorità o assegnazione del lavoro/);
assert.match(html,/carichi di lavoro, turni o programmazione/);
assert.match(html,/follow-up delle prestazioni o feedback/);
assert.match(html,/Operations Manager, Responsabile della produzione industriale/);
assert.match(html,/non è una valutazione di idoneità, preparazione o capacità/);
assert.doesNotMatch(html,/Hai già avuto responsabilità continuativa sulle persone, oltre al coordinamento operativo\?/);
assert.match(html,/Chiarisci la tua esperienza diretta nella gestione di risorse o budget su un perimetro operativo più ampio/);
assert.match(html,/Chiarisci il tuo livello di responsabilità diretta sulla pianificazione e programmazione della produzione/);
assert.doesNotMatch(html,/roleSource:onet:11-1021\.00:2026/);
assert.match(html,/O\*NET — General and Operations Managers/);
const operationsArticle=(html.split('<article class="career-direction">')[1]||'').split('</article>')[0];assert.equal((operationsArticle.match(/Il ruolo può includere responsabilità su budget, risorse, pianificazione o vincoli operativi\./g)||[]).length,1,'duplicate Operations Manager rationale must be presentation-deduplicated within the selected direction content');

assert.doesNotMatch(html,/fit increased|readiness|più adatto|più capace|leadership capability/i);

const en=renderPrivateBetaUiJourneyHtml({locale:'en',result:{phase:'purpose_direction_explore',sessionRef,preInterview:{careerDirectionEvaluation:evaluation,directionResolutions:resolutions,directionKnowledgeFeedback:feedback}}});
assert.match(en,/What we understand better/);
assert.match(en,/supported, reusable professional information/);

const noFeedback=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'purpose_direction_explore',sessionRef,preInterview:{careerDirectionEvaluation:evaluation,directionResolutions:[]}}});
assert.doesNotMatch(noFeedback,/Cosa abbiamo capito meglio/);

const rendererSource=await readFile(new URL('../src/app/renderPrivateBetaUiJourneyHtml.js',import.meta.url),'utf8');
const serverSource=await readFile(new URL('../src/app/privateBetaUiServer.js',import.meta.url),'utf8');
assert.equal(rendererSource.includes('Cosa abbiamo capito meglio'),false);
assert.equal(rendererSource.includes('What we understand better'),false);
assert.match(serverSource,/resolvedDirectionAcquisition\(acquisition\)\?directionExploreOutcome/);
assert.match(serverSource,/specializedMeasurementResult\?\.semanticDetail/);
assert.doesNotMatch(serverSource,/history\.back|history\.go|window\.history/);

console.log('PDIR-12 experience value visible Knowledge change: PASS');

const startState=startDirectionPeopleResponsibilityAcquisition({
 careerDirectionEvaluation:evaluation,
 selectedDirectionRef:'direction:ops',
 userAction:'deepen_career_direction',
 professionalIdentity:{professionalSources:[],reusableKnowledgeResults:[]},
 subjectRef:{type:'person',id:'marco'},
 professionalRepresentationRef:'representation:marco',
 now:'2026-09-14T08:00:00.000Z'
});
const liveSession='direction:pdir12:value:auto';
const sessionStore=new Map([[liveSession,{type:'direction_explore_state',sessionRef:liveSession,careerDirectionEvaluation:evaluation,directionAcquisition:startState,personRef:{type:'person',id:'marco'},reusableProfessionalIdentity:{professionalSources:[],reusableKnowledgeResults:[]}}]]);
const semanticExecutor=async()=>({supported:true,candidate:{
 interpretationStatus:'SUPPORTED',
 responsibilityPresence:'supported',
 continuity:'continuing',
 responsibilityMode:'informal_operational',
 responsibilityKinds:['work_assignment_or_priority_setting','workload_shift_or_schedule_coordination','performance_follow_up_or_feedback'],
 peopleScope:{kind:'exact',value:10},
 professionalContext:{description:'reparto produttivo',current:true},
 eventTime:{description:'Da circa due anni'},
 support:{presence:'coordino stabilmente una decina di operatori',continuity:'Da circa due anni',mode:'coordino stabilmente',peopleScope:'una decina di operatori',professionalContext:'reparto produttivo',responsibilityKinds:['definire le priorità e distribuire le attività giornaliere','organizzo i turni','partecipo insieme al mio responsabile alle valutazioni periodiche delle persone']},
 limitations:['formal reporting authority not established']
}});
const server=createPrivateBetaUiServer({locale:'it',sessionStore,journeyOptions:{directionPeopleResponsibilitySemanticExecutor:semanticExecutor}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try{
 const base=`http://127.0.0.1:${server.address().port}`;
 const response=await fetch(`${base}/private-beta/direction/answer`,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({sessionRef:liveSession,answer:'Da circa due anni coordino stabilmente una decina di operatori nel reparto produttivo. Mi occupo di definire le priorità e distribuire le attività giornaliere, organizzo i turni e partecipo insieme al mio responsabile alle valutazioni periodiche delle persone.'})});
 const returned=await response.text();
 assert.equal(response.status,200,returned);
 assert.match(returned,/id="career-directions"/);
 assert.match(returned,/id="direction-knowledge-change"/);
 assert.doesNotMatch(returned,/id="direction-acquisition"/);
 assert.doesNotMatch(returned,/Torna alle direzioni/);
 assert.doesNotMatch(returned,/responsabilità continuativa sulle persone\.<\/li>/);
 assert.match(returned,/Chiarisci la tua esperienza diretta nella gestione di risorse o budget su un perimetro operativo più ampio/);
 assert.match(returned,/Chiarisci il tuo livello di responsabilità diretta sulla pianificazione e programmazione della produzione/);
} finally {await new Promise(resolve=>server.close(resolve));}

console.log('PDIR-12 automatic return production-backed UI path: PASS');

