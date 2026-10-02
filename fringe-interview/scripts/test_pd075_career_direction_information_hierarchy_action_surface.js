import assert from 'node:assert/strict';
import fs from 'node:fs';
import {evaluateCareerDirections} from '../src/app/careerDirection/evaluateCareerDirections.js';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';

const at='2026-09-29T14:00:00.000Z';
const representation={type:'target_independent_professional_representation',version:'1.2',persistent:false,target:null,professionalMeaning:{supportedPatterns:[{kind:'documented_cross_functional_coordination_recurrence',sourceRefs:['atlas','maintenance'],episodeRefs:['atlas-episode','maintenance-episode'],episodeBasis:'distinct_source_grounded_experiences',supportCount:2,traitInference:false}],professionalSynthesis:{currentRole:'Production Supervisor',previousRoles:['Industrialization Engineer'],domains:['manufacturing'],hasDocumentedRoleContinuity:true,supportedPatternKinds:['documented_cross_functional_coordination_recurrence']},knowledgeContribution:[{semanticType:'decision_accountability',primaryProfessionalMeaning:{kind:'bounded_decision_accountability'}},{semanticType:'quantified_outcome',primaryProfessionalMeaning:{kind:'bounded_measurable_outcome_contribution'}}],insufficientObservability:[]},roleHistory:[{role:'Industrialization Engineer'},{role:'Production Supervisor'}],supportingExperiences:[],assets:[],limitations:[],provenance:{sourceIds:['current_cv'],knowledgeRefs:[]}};
const evaluation=evaluateCareerDirections({professionalRepresentation:representation,professionalRepresentationRef:'representationSnapshot:pd075',now:at});
const people=[];
for(const h of evaluation.hypotheses){
  for(const c of h.conditionsToVerify||[]) if(c.reason==='people_responsibility_scope') people.push({conditionRef:c.id,resolutionState:'resolved_by_current_authorised_state'});
  // inject a presentation-empty traceability source; it must be filtered without touching semantic state.
  const refs=h.metadata?.roleRequirementSources||{};
  for(const ref of Object.keys(refs)) refs[ref]=[...(refs[ref]||[]),{sourceRef:'- \\',displayName:'- \\',sourceClass:'',observedAt:''}];
}
const html=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'purpose_direction_explore',sessionRef:'pd075',preInterview:{careerDirectionEvaluation:evaluation,directionResolutions:people}}});

// A/B — compact first view and early clarification action surface.
assert.equal(/class="career-direction direction-overview-card" open/.test(html),false);
const cardIndex=html.indexOf('class="career-direction direction-overview-card"');
assert(cardIndex>0);
assert.equal(html.includes('Aspetti ancora da chiarire'),true);
assert.match(html,/Approfondisci questo aspetto/);
assert.equal((html.match(/Esplora questa direzione/g)||[]).length,2);
assert.match(html,/direction-summary-grid/);

// C — clarification is not mechanically repeated again as generic next steps.
assert.equal((html.match(/Prossimi passi/g)||[]).length,0);
assert.equal((html.match(/Chiarisci la tua esperienza diretta nella gestione di risorse o budget/g)||[]).length,1);
assert.equal((html.match(/Chiarisci il tuo livello di responsabilità diretta sulla pianificazione e programmazione della produzione/g)||[]).length,1);

// D/E — detail remains available; grounding is present but collapsed by default.
assert.equal((html.match(/<details class="direction-traceability">/g)||[]).length,2);
assert.equal(/<details class="direction-traceability" open/.test(html),false);
assert.match(html,/Cosa richiede questa direzione/);assert.match(html,/Da approfondire/);

// F — structurally empty traceability item is not rendered.
assert.equal(html.includes('- \\'),false);
assert.doesNotMatch(html,/<li>\s*<\/li>/);

// G/H — PD-086 closes the two formerly informational-only responsibility authorities; no stale CPR action remains.
assert.equal((html.match(/1 aspetto resta da chiarire\./g)||[]).length,2);
assert.match(html,/risorse o budget su un perimetro operativo più ampio/i);
assert.match(html,/pianificazione e programmazione della produzione/i);
assert.equal((html.match(/Approfondisci questo aspetto/g)||[]).length,2);
assert.equal(html.includes('Hai già avuto responsabilità continuativa sulle persone, oltre al coordinamento operativo?'),false);
assert.equal((html.match(/direction-requirement-row-clarify/g)||[]).length>=2,true);

// I — new copy is localized in both resources and not hardcoded as renderer literals.
const ui=fs.readFileSync('src/app/renderPrivateBetaUiJourneyHtml.js','utf8');
const it=JSON.parse(fs.readFileSync('config/private_beta_ui.it.json','utf8'));
const en=JSON.parse(fs.readFileSync('config/private_beta_ui.en.json','utf8'));
for(const k of ['directionOpenDetailAction','directionRemainingUnderstandingTitle']){assert.ok(it[k]);assert.ok(en[k]);}
assert.equal(ui.includes('Apri dettaglio'),false);
assert.equal(ui.includes('Cosa resta da capire'),false);
console.log('PD-075 Career Direction information hierarchy and Candidate action surface tests passed.');
