import assert from 'node:assert/strict';
import fs from 'node:fs';
import {evaluateCareerDirections} from '../src/app/careerDirection/evaluateCareerDirections.js';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';

const representation={type:'target_independent_professional_representation',version:'1.2',persistent:false,target:null,professionalMeaning:{supportedPatterns:[{kind:'documented_cross_functional_coordination_recurrence',sourceRefs:['a','b'],episodeRefs:['ea','eb'],episodeBasis:'distinct_source_grounded_experiences',supportCount:2,traitInference:false}],professionalSynthesis:{currentRole:'Production Supervisor',previousRoles:['Industrialization Engineer'],domains:['manufacturing'],hasDocumentedRoleContinuity:true,supportedPatternKinds:['documented_cross_functional_coordination_recurrence']},knowledgeContribution:[{semanticType:'decision_accountability',primaryProfessionalMeaning:{kind:'bounded_decision_accountability'}}],insufficientObservability:[]},roleHistory:[{role:'Industrialization Engineer'},{role:'Production Supervisor'}],supportingExperiences:[],assets:[],limitations:[],provenance:{sourceIds:['current_cv'],knowledgeRefs:[]}};
const evaluation=evaluateCareerDirections({professionalRepresentation:representation,professionalRepresentationRef:'representationSnapshot:pd082',now:'2026-09-29T17:00:00.000Z'});
const resolutions=[];
for(const h of evaluation.hypotheses) for(const c of h.conditionsToVerify||[]) if(c.reason==='people_responsibility_scope') resolutions.push({conditionRef:c.id,resolutionState:'resolved_by_current_authorised_state'});
const [first,second]=evaluation.hypotheses; const firstRef=first.id||first.directionRef, secondRef=second.id||second.directionRef;
const render=(selectedDirectionRef='')=>renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'purpose_direction_explore',sessionRef:'pd082',preInterview:{careerDirectionEvaluation:evaluation,directionResolutions:resolutions,selectedDirectionRef}}});

const overview=render();
const pageAt=overview.indexOf('id="career-directions"');
const titleAt=overview.indexOf('Direzioni professionali da esplorare',pageAt);
const cardsAt=overview.indexOf('direction-primary-choices',pageAt);
assert.ok(titleAt>=0 && cardsAt>titleAt);
for(const later of ['direction-preferences-compact','direction-page-help']) assert.ok(overview.indexOf(later,pageAt)>cardsAt);
assert.equal(overview.slice(pageAt).includes('direction-shared-support'),false);
assert.equal(overview.slice(pageAt).includes('direction-clarification-queue'),true);
assert.match(overview,/Approfondisci questo aspetto/);
assert.equal((overview.match(/Esplora questa direzione/g)||[]).length,2);
assert.match(overview,/Perché IMAGO l'ha individuata/);

const detail=render(firstRef);
assert.match(detail,/direction-navigation/);
assert.equal((detail.match(/class="direction-nav-tab selected"[^>]*aria-current="page"/g)||[]).length,1);
assert.match(detail,/direction-semantic-row-supported/);
assert.match(detail,/direction-semantic-row-clarify/);
assert.equal(/direction-semantic-row[^>]* open/.test(detail),false);
assert.match(detail,/Cosa richiede questa direzione/);
assert.match(detail,/Da approfondire/);
assert.match(detail,/Da approfondire/);
assert.equal(detail.includes('Approfondisci questo aspetto'),true); // PD-086 exposes the bounded clarification action for the authorised unknown.
assert.equal((detail.match(/<details class="direction-traceability">/g)||[]).length,1);

const detail2=render(secondRef);
assert.notEqual(detail,detail2);
assert.equal((detail2.match(/class="direction-nav-tab selected"[^>]*aria-current="page"/g)||[]).length,1);

const source=fs.readFileSync('src/app/renderPrivateBetaUiJourneyHtml.js','utf8');
for(const token of ['--imago-surface-page','--imago-surface-expanded','--imago-nav-active-bg','--imago-status-supported-bg','--imago-status-clarify-bg','--imago-status-build-bg','--imago-grounding-bg']) assert.ok(source.includes(token),token);
assert.match(source,/\.direction-semantic-row\[open\]/);
assert.match(source,/\.direction-nav-tab\.selected/);

for(const lang of ['it','en']){const m=JSON.parse(fs.readFileSync(`config/private_beta_ui.${lang}.json`,'utf8'));for(const k of ['directionWhySurfacedLabel','directionOverviewSupportedCount','directionClarificationDetailIntro','directionClarificationActionableStatus','directionClarificationCurrentState','directionWhyItMattersTitle','directionWhatEmergesTitle','directionSupportedStatus','directionBuildStatus','directionRoleResourceBudget','directionRoleProductionPlanning'])assert.ok(m[k],`${lang}:${k}`);}
assert.match(detail,/direction-requirement-map/);
assert.match(detail,/direction-requirement-row/);
assert.match(detail,/Cosa richiede questa direzione/);
assert.doesNotMatch(detail,/SINGLE_GROUNDED_BASIS|INDEPENDENT_RECURRENT_BASIS|COMPOSED_HIGHER_ORDER_BASIS|SUSTAINED_REQUIREMENT_SUPPORT/);
assert.doesNotMatch(detail,/Già ben supportato/);
console.log('PD-082 Candidate-facing Requirement Map composition: PASS');
