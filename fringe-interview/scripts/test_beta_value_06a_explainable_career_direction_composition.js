import assert from 'node:assert/strict';
import { evaluateCareerDirections } from '../src/app/careerDirection/evaluateCareerDirections.js';
import { renderPrivateBetaUiJourneyHtml } from '../src/app/renderPrivateBetaUiJourneyHtml.js';

const people={kind:'bounded_continuing_people_responsibility',continuity:'continuing',peopleScope:'circa 10 persone',professionalContext:'reparto produttivo',responsibilityKinds:['work_assignment_or_priority_setting','workload_shift_or_schedule_coordination','performance_follow_up_or_feedback']};
const rep={professionalMeaning:{supportedPatterns:[{kind:'documented_cross_functional_coordination_recurrence',sourceRefs:['atlas','maintenance'],episodeRefs:['a','m'],traitInference:false}],professionalSynthesis:{hasDocumentedRoleContinuity:true,currentRole:'Production Supervisor',previousRoles:['Industrialization Engineer'],domains:['manufacturing']},knowledgeContribution:[{semanticType:'decision_accountability',primaryProfessionalMeaning:{kind:'bounded_decision_accountability',observedContext:'Atlas',personContribution:'shared bounded decision'}},{semanticType:'quantified_outcome',primaryProfessionalMeaning:{kind:'bounded_measurable_outcome_contribution',quantification:'circa 20%',personContribution:'bounded contribution'}},{semanticType:'continuing_people_responsibility',primaryProfessionalMeaning:people}]},episodeMeanings:[{description:'Partecipazione al lancio di una nuova linea produttiva in Germania'},{description:'Contributo di analisi e dati a supporto di interventi o investimenti'}]};
const ev=evaluateCareerDirections({professionalRepresentation:rep,professionalRepresentationRef:'representationSnapshot:marco',now:'2026-09-15T19:00:00.000Z'});
assert.equal(ev.hypotheses.length,2);
const operations=ev.hypotheses.find(h=>h.metadata.roleFamilyRef==='operations_management');
const production=ev.hypotheses.find(h=>h.metadata.roleFamilyRef==='industrial_production_management');
assert.deepEqual(new Set(operations.supportBasis.map(r=>r.metadata.personMeaningKind)),new Set(['documented_cross_functional_coordination_recurrence','bounded_decision_accountability','bounded_continuing_people_responsibility']));
assert.deepEqual(new Set(production.supportBasis.map(r=>r.metadata.personMeaningKind)),new Set(['documented_cross_functional_coordination_recurrence','formal_role_continuity','bounded_measurable_outcome_contribution','bounded_continuing_people_responsibility']));
for(const h of ev.hypotheses) assert(h.supportBasis.every(r=>r.type==='professional_material_relevance_relation'&&r.relationType==='supported_relevance'));
for(const locale of ['it','en']){
 const html=renderPrivateBetaUiJourneyHtml({locale,identityAvailable:true,result:{phase:'purpose_direction_explore',sessionRef:'s',preInterview:{careerDirectionEvaluation:ev,directionResolutions:[]}}});
 assert.match(html,/direction-semantic-row-supported/);
 assert.match(html,/direction-professional-material-relevance/);
 assert.match(html,locale==='it'?/Vedi quali parti del tuo percorso sostengono questa ipotesi/:/See which parts of your history support this hypothesis/);
 assert.match(html,locale==='it'?/Cosa richiede questa direzione/:/What this direction requires/);assert.match(html,locale==='it'?/Da approfondire/:/Needs clarification/);
 assert.match(html,locale==='it'?/Coordinamento operativo\/interfunzionale ricorrente/:/Recurring operational\/cross-functional coordination/);
 assert.match(html,locale==='it'?/responsabilità decisionali|responsabilità decisionale/i:/decision responsibility/i);
 assert.match(html,locale==='it'?/Responsabilità continuativa documentata/:/Documented continuing responsibility/);
 assert.match(html,locale==='it'?/Industrialization Engineer/:/Industrialization Engineer/);
 assert.match(html,locale==='it'?/risultato operativo misurabile/:/measurable operational result/);
 assert.match(html,/O\*NET — General and Operations Managers/);
 assert.match(html,/U\.S\. Bureau of Labor Statistics — Industrial Production Managers/);
 for(const unsafe of [/production-line launch/i,/supporting analysis/i,/supported_relevance/,/semanticKey/,/DirectionSupportRelation/,/fit percentage/i,/readiness percentage/i,/sei pronto/i,/you are ready/i,/should become/i]) assert.doesNotMatch(html,unsafe);
 assert(!html.includes('Partecipazione al lancio di una nuova linea produttiva in Germania'));
 assert(!html.includes('Contributo di analisi e dati a supporto di interventi o investimenti'));
}
assert(rep.episodeMeanings.length===2,'Direction composition must not consume Germany/supporting-analysis without authorised mapping');
console.log('BETA-VALUE-06A Explainable Career Direction composition: PASS');
