import assert from 'assert/strict';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';

const basePeople={
 semanticType:'continuing_people_responsibility',
 sourceRuntimeActionRef:'interviewQuestion:people_responsibility_scope',
 sourceExecutionRef:'knowledgeAcquisitionExecution:people-1',
 sourceEvidenceRef:'evidence:people-1',
 observation:{observationStatus:'observed',evidenceIds:['evidence:people-1'],limitations:[]},
 specializedMeasurementResult:{semanticDetail:{continuity:'continuing',peopleScope:{kind:'exact',value:5},professionalContext:{description:'officina'},responsibilityKinds:['work_assignment_or_priority_setting']},context:{description:'officina'},limitations:[]}
};
const identitySummary={professionalSources:[{id:'cv1',sourceRole:'current_cv',content:'Production Supervisor'}],sourceAssets:[],reusableKnowledgeResults:[basePeople],knowledgeCount:1,careerPreferenceContext:{},activePurpose:'professional_representation_understand'};

const profile=renderPrivateBetaUiJourneyHtml({locale:'it',identityAvailable:true,identitySummary,result:{phase:'profile'}});
assert.match(profile,/Hai coordinato continuativamente il lavoro di 5 persone/i);
assert.match(profile,/Origine dell'informazione/);
assert.match(profile,/Da un approfondimento richiesto da IMAGO/i);
assert.doesNotMatch(profile,/L’informazione confermata riguarda il coordinamento/i,'provenance must not restate the final fact');
assert.doesNotMatch(profile,/evidence:people-1|knowledgeAcquisitionExecution|interviewQuestion:/);

for(const [sourceRole,expected] of [
 ['current_cv','Dal tuo CV attuale.'],
 ['previous_cv','Da un CV precedente.'],
 ['professional_declaration','Da una dichiarazione professionale che hai fornito.']
]){
 const k={...basePeople,sourceRuntimeActionRef:'',sourceExecutionRef:'',sourceEvidenceRef:'',sourceRole};
 const html=renderPrivateBetaUiJourneyHtml({locale:'it',identityAvailable:true,identitySummary:{...identitySummary,reusableKnowledgeResults:[k]},result:{phase:'profile'}});
 assert.match(html,new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
}

const weak={...basePeople,sourceRuntimeActionRef:'',sourceExecutionRef:'',sourceEvidenceRef:'',sourceRole:'',observation:{},specializedMeasurementResult:{semanticDetail:{continuity:'continuing',peopleScope:{kind:'exact',value:5},professionalContext:{description:'officina'},responsibilityKinds:['work_assignment_or_priority_setting']},context:{description:'officina'}}};
const weakHtml=renderPrivateBetaUiJourneyHtml({locale:'it',identityAvailable:true,identitySummary:{...identitySummary,reusableKnowledgeResults:[weak]},result:{phase:'profile'}});
assert.doesNotMatch(weakHtml,/profile-knowledge-detail/,'weak/unknown origin must not create a provenance expander');

const rep={phase:'purpose_understand',preInterview:{sourceGroundedProjection:[],targetIndependentProfessionalRepresentation:{professionalMeaning:{selectedProfessionalThreads:[]},supportingExperiences:[],roleHistory:[],assets:[]}},sessionRef:'s1'};
const repHtml=renderPrivateBetaUiJourneyHtml({locale:'it',identityAvailable:true,identitySummary,result:rep});
assert.doesNotMatch(repHtml,/Non serve iniziare una nuova intervista per vedere questa rappresentazione corrente/);
assert.doesNotMatch(repHtml,/Torna alle possibilità della tua Professional Identity/);

const en=renderPrivateBetaUiJourneyHtml({locale:'en',identityAvailable:true,identitySummary,result:{phase:'profile'}});
assert.match(en,/Information origin/);
assert.match(en,/From a clarification requested by IMAGO/i);

console.log('PD-093 Second Corrective Representation Footer / Knowledge Provenance Origin: PASS');
