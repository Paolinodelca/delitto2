import assert from 'node:assert/strict';
import { createProfessionalMaterialRelevanceRelation } from '../src/app/professionalMaterialRelevance.js';
import { evaluateCareerDirections } from '../src/app/careerDirection/evaluateCareerDirections.js';
import { renderPrivateBetaUiJourneyHtml } from '../src/app/renderPrivateBetaUiJourneyHtml.js';

assert.throws(()=>createProfessionalMaterialRelevanceRelation({id:'x',purpose:'opportunity_application',personMaterialRef:'p',contextRef:'d',externalRequirementRef:'r',relationType:'supported_relevance',explanationBasis:'x',provenance:{personSupport:{},externalSupport:[{}]}}),/PURPOSE_INVALID/);
assert.throws(()=>createProfessionalMaterialRelevanceRelation({id:'x',purpose:'professional_direction_explore',personMaterialRef:'p',contextRef:'d',externalRequirementRef:'r',relationType:'keyword_match',explanationBasis:'x',provenance:{personSupport:{},externalSupport:[{}]}}),/TYPE_INVALID/);
assert.throws(()=>createProfessionalMaterialRelevanceRelation({id:'x',purpose:'professional_direction_explore',personMaterialRef:'p',contextRef:'d',externalRequirementRef:'r',relationType:'supported_relevance',explanationBasis:'x',provenance:{personSupport:{},externalSupport:[{}]},fitScore:90}),/SCORE_FORBIDDEN/);

const people={kind:'bounded_continuing_people_responsibility',continuity:'continuing',peopleScope:'circa 10 persone',professionalContext:'reparto produttivo',responsibilityKinds:['work_assignment_or_priority_setting','workload_shift_or_schedule_coordination','performance_follow_up_or_feedback']};
const rep={professionalMeaning:{supportedPatterns:[{kind:'documented_cross_functional_coordination_recurrence',sourceRefs:['atlas','maintenance'],episodeRefs:['a','m'],traitInference:false}],professionalSynthesis:{hasDocumentedRoleContinuity:true,currentRole:'Production Supervisor',previousRoles:['Industrialization Engineer'],domains:['manufacturing']},knowledgeContribution:[{semanticType:'decision_accountability',primaryProfessionalMeaning:{kind:'bounded_decision_accountability',observedContext:'Atlas',personContribution:'shared bounded decision'}},{semanticType:'quantified_outcome',primaryProfessionalMeaning:{kind:'bounded_measurable_outcome_contribution',quantification:'circa 20%',personContribution:'bounded contribution'}},{semanticType:'continuing_people_responsibility',primaryProfessionalMeaning:people}]}};
const before=JSON.stringify(rep);
const ev=evaluateCareerDirections({professionalRepresentation:rep,professionalRepresentationRef:'representationSnapshot:marco',now:'2026-09-15T07:00:00.000Z'});
assert.equal(JSON.stringify(rep),before,'purpose-relative relevance must not mutate Person material');
assert.equal(ev.hypotheses.length,2);
for(const h of ev.hypotheses){
 const rels=h.supportBasis.filter(x=>x.type==='professional_material_relevance_relation');
 assert(rels.length>=2);
 assert(rels.every(x=>x.purpose==='professional_direction_explore'&&x.contextRef===h.directionRef&&x.relationType==='supported_relevance'));
 assert(rels.every(x=>x.personMaterialRef&&x.externalRequirementRef&&x.provenance.personSupport&&x.provenance.externalSupport.length));
 assert(rels.every(x=>!('fitScore'in x)&&!('readinessScore'in x)&&!('matchScore'in x)));
 assert(rels.some(x=>x.metadata.personMeaningKind==='bounded_continuing_people_responsibility'),'same canonical PD-056 meaning should support each independently grounded people requirement');
}
const peopleRefs=ev.hypotheses.map(h=>h.supportBasis.find(x=>x.metadata.personMeaningKind==='bounded_continuing_people_responsibility').personMaterialRef);
assert.equal(new Set(peopleRefs).size,1,'same Person Knowledge-derived material must be reused, not duplicated');
const peopleRequirementRefs=ev.hypotheses.map(h=>h.supportBasis.find(x=>x.metadata.personMeaningKind==='bounded_continuing_people_responsibility').externalRequirementRef);
assert.equal(new Set(peopleRequirementRefs).size,2,'relevance remains direction/requirement-relative');

const html=renderPrivateBetaUiJourneyHtml({locale:'it',identityAvailable:true,result:{phase:'purpose_direction_explore',sessionRef:'s',preInterview:{careerDirectionEvaluation:ev,directionResolutions:[]}}});
assert.match(html,/Vedi quali parti del tuo percorso sostengono questa ipotesi/);
assert.match(html,/Responsabilità continuativa documentata sul lavoro delle persone/);
assert.match(html,/Per questa direzione è rilevante perché il ruolo richiede/);
assert.match(html,/Perché questa relazione è credibile/);
assert.match(html,/O\*NET — General and Operations Managers/);
assert.match(html,/U\.S\. Bureau of Labor Statistics — Industrial Production Managers/);
for(const unsafe of [/supported_relevance/,/semanticKey/,/fit score/i,/match score/i,/sei pronto/i,/possiedi la capacità/i,/leadership capability/i])assert.doesNotMatch(html,unsafe);

const unrelated=evaluateCareerDirections({professionalRepresentation:{professionalMeaning:{supportedPatterns:[{kind:'unmapped_professional_pattern'}]}},professionalRepresentationRef:'other'});
assert.equal(unrelated.hypotheses.length,0,'unmapped material must fail closed without free semantic matching');

console.log('BETA-VALUE-05A Career Direction purpose-relative professional material relevance: PASS');
