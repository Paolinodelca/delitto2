import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';
import {TARGET_INDEPENDENT_REPRESENTATION_RECIPE} from '../src/app/privateBetaProfessionalRepresentationSnapshots.js';

const coordination={kind:'documented_cross_functional_coordination_recurrence',sourceRefs:['a','b'],episodeRefs:['ea','eb'],supportCount:2,traitInference:false,supports:[
 {sourceId:'a',sourceRole:'professional_declaration',supportExcerpt:'Ho coordinato qualità e produzione nel ramp-up.'},
 {sourceId:'b',sourceRole:'professional_declaration',supportExcerpt:'Ho coordinato produzione e manutenzione negli interventi programmati.'}
]};
const da={semanticType:'decision_accountability',primaryProfessionalMeaning:{kind:'bounded_decision_accountability',observedContext:'progetto Atlas',personContribution:'definire le priorità operative',sharedAuthority:true},explanation:'La decisione è documentata nel progetto Atlas.',limitations:['Responsabilità condivisa nel contesto osservato.'],supportingEvidence:[{summary:'Nel progetto Atlas la responsabilità era condivisa.'}]};
const qo={semanticType:'quantified_outcome',primaryProfessionalMeaning:{kind:'bounded_measurable_outcome_contribution',quantification:'20%',personContribution:'contributo al miglioramento'},explanation:'Il risultato misurabile è collegato al contributo osservato.',limitations:['Contributo osservato; causalità esclusiva non attribuita.'],supportingEvidence:[{summary:'Risultato del 20% collegato al contributo osservato.'}]};
const base={professionalMeaning:{professionalSynthesis:{currentRole:'Production Supervisor',previousRoles:['Industrialization Engineer'],domains:['Produzione'],supportingExperienceCount:2},supportedPatterns:[coordination],knowledgeContribution:[da,qo]},roleHistory:[{role:'Industrialization Engineer',status:'previous'},{role:'Production Supervisor',status:'current'}],supportingExperiences:[{summary:'Ramp-up Atlas'},{summary:'Interventi programmati'}],assets:[
 {supportClass:'source_grounded',sourceId:'a',sourceRole:'professional_declaration',sourceLabel:'Esperienza Atlas',summary:'Ramp-up Atlas'},
 {supportClass:'source_grounded',sourceId:'b',sourceRole:'professional_declaration',sourceLabel:'Esperienza manutenzione',summary:'Interventi programmati'},
 {supportClass:'canonical_knowledge',semanticType:'decision_accountability',summary:'Decision accountability'},
 {supportClass:'canonical_knowledge',semanticType:'quantified_outcome',summary:'Quantified outcome'}
]};
const render=(rep=base,locale='it')=>renderPrivateBetaUiJourneyHtml({locale,result:{phase:'purpose_understand',sessionRef:'bv02b',preInterview:{targetIndependentProfessionalRepresentation:rep,professionalIdentityContinuity:{recovered:true,reusedKnowledgeCount:2}}}});
const html=render();
assert.match(html,/Quello che vale la pena notare/);
assert.equal((html.match(/coordinamento tra funzioni ricorre in più esperienze professionali distinte/g)||[]).length,1);
assert.match(html,/Da dove emerge/);assert.match(html,/Ho coordinato qualità e produzione nel ramp-up/);assert.match(html,/Esperienza Atlas/);
assert.match(html,/20%/);assert.match(html,/responsabilità era condivisa/i);
assert.doesNotMatch(html,/Il quadro che emerge dal tuo percorso|Cosa diventa più visibile|Esperienze che rendono il quadro più concreto/);
assert.doesNotMatch(html,/sourceId|episodeRefs|>ea<|>eb</);
const noPattern={...base,professionalMeaning:{...base.professionalMeaning,supportedPatterns:[]}};const noPatternHtml=render(noPattern);assert.match(noPatternHtml,/progetto Atlas|20%/);
const en=render(base,'en');assert.match(en,/What is worth noticing/);assert.match(en,/Where this comes from/);
const source=await readFile(new URL('../src/app/renderPrivateBetaUiJourneyHtml.js',import.meta.url),'utf8');assert.equal(source.includes('Il quadro professionale'),false);
assert.equal(TARGET_INDEPENDENT_REPRESENTATION_RECIPE.version,'2.0');
console.log('BETA-VALUE-02B Professional Representation narrative composition: PASS');
