import assert from 'node:assert/strict';
import fs from 'node:fs';
import {evaluateCareerDirections} from '../src/app/careerDirection/evaluateCareerDirections.js';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';

const representation={type:'target_independent_professional_representation',version:'1.2',persistent:false,target:null,professionalMeaning:{supportedPatterns:[{kind:'documented_cross_functional_coordination_recurrence',sourceRefs:['a','b'],episodeRefs:['ea','eb'],episodeBasis:'distinct_source_grounded_experiences',supportCount:2,traitInference:false}],professionalSynthesis:{currentRole:'Production Supervisor',previousRoles:['Industrialization Engineer'],domains:['manufacturing'],hasDocumentedRoleContinuity:true,supportedPatternKinds:['documented_cross_functional_coordination_recurrence']},knowledgeContribution:[{semanticType:'decision_accountability',primaryProfessionalMeaning:{kind:'bounded_decision_accountability'}}],insufficientObservability:[]},roleHistory:[{role:'Industrialization Engineer'},{role:'Production Supervisor'}],supportingExperiences:[],assets:[],limitations:[],provenance:{sourceIds:['current_cv'],knowledgeRefs:[]}};
const evaluation=evaluateCareerDirections({professionalRepresentation:representation,professionalRepresentationRef:'representationSnapshot:pd076',now:'2026-09-29T15:00:00.000Z'});
const resolutions=[];
for(const h of evaluation.hypotheses) for(const c of h.conditionsToVerify||[]) if(c.reason==='people_responsibility_scope') resolutions.push({conditionRef:c.id,resolutionState:'resolved_by_current_authorised_state'});
const first=evaluation.hypotheses[0], second=evaluation.hypotheses[1];
const firstRef=first.id||first.directionRef, secondRef=second.id||second.directionRef;

const overview=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'purpose_direction_explore',sessionRef:'pd076',preInterview:{careerDirectionEvaluation:evaluation,directionResolutions:resolutions}}});
assert.match(overview,/direction-overview-state/);
assert.equal((overview.match(/Esplora questa direzione/g)||[]).length,2);
assert.ok(overview.indexOf('direction-summary-grid') < overview.indexOf('Come leggere questa pagina') || overview.includes('direction-page-help'));
assert.match(overview,/Cosa comporta questo ruolo/);
assert.match(overview,/class="imago-nav-link active"[^>]*aria-current="page"[^>]*>Direzioni</);
assert.equal((overview.match(/class="direction-nav-tab selected"[^>]*aria-current="page"/g)||[]).length,0);

const detail=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'purpose_direction_explore',sessionRef:'pd076',preInterview:{careerDirectionEvaluation:evaluation,directionResolutions:resolutions,selectedDirectionRef:firstRef}}});
assert.match(detail,/direction-detail-state/);
assert.match(detail,/direction-navigation/);
assert.equal((detail.match(/class="direction-nav-tab selected"[^>]*aria-current="page"/g)||[]).length,1);
assert.match(detail,/Torna alla panoramica/);
assert.match(detail,/Cosa comporta questo ruolo/);
assert.match(detail,/Perché può valere la pena esplorarla/);
assert.equal((detail.match(/<details class="direction-traceability">/g)||[]).length,1);
assert.equal(/<details class="direction-traceability" open/.test(detail),false);
assert.equal(detail.includes('Approfondisci questo aspetto'),true); // PD-086 exposes the authorised bounded clarification action.

const detail2=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'purpose_direction_explore',sessionRef:'pd076',preInterview:{careerDirectionEvaluation:evaluation,directionResolutions:resolutions,selectedDirectionRef:secondRef}}});
assert.equal((detail2.match(/class="direction-nav-tab selected"[^>]*aria-current="page"/g)||[]).length,1);
assert.notEqual(detail,detail2);

const server=fs.readFileSync('src/app/privateBetaUiServer.js','utf8');
assert.match(server,/\/private-beta\/direction\/view/);
assert.match(server,/selectedDirectionRef/);
for(const lang of ['it','en']){const m=JSON.parse(fs.readFileSync(`config/private_beta_ui.${lang}.json`,'utf8'));for(const k of ['directionNavigationLabel','directionRoleDescriptionTitle','directionExploreDirectionAction','directionReturnOverviewAction','directionHowToReadTitle'])assert.ok(m[k]);}
console.log('PD-076 Career Direction overview/detail navigation tests passed.');
