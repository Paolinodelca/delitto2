import assert from 'node:assert/strict';
import { renderPrivateBetaUiJourneyHtml } from '../src/app/renderPrivateBetaUiJourneyHtml.js';

const pattern={kind:'documented_cross_functional_coordination_recurrence',sourceRefs:['atlas','maintenance'],episodeRefs:['episode-a','episode-b'],episodeBasis:'distinct_source_grounded_experiences',supportCount:2,traitInference:false,supports:[
 {episodeKey:'episode-a',sourceId:'atlas',sourceRole:'professional_declaration',supportExcerpt:'Ho coordinato il ramp-up con supply chain, qualità e produzione.'},
 {episodeKey:'episode-b',sourceId:'maintenance',sourceRole:'professional_declaration',supportExcerpt:'Ho coordinato produzione e manutenzione durante interventi programmati.'}
]};
const representation={professionalMeaning:{professionalSynthesis:{currentRole:'Production Supervisor',previousRoles:['Industrialization Engineer'],domains:['Produzione'],supportingExperienceCount:2},supportedPatterns:[pattern],knowledgeContribution:[]},roleHistory:[],supportingExperiences:[],assets:[
 {supportClass:'source_grounded',sourceId:'atlas',sourceRole:'professional_declaration',sourceLabel:'Esperienza Atlas',formalRole:null},
 {supportClass:'source_grounded',sourceId:'maintenance',sourceRole:'professional_declaration',sourceLabel:'Esperienza manutenzione',formalRole:null}
]};
const render=(locale='it',rep=representation)=>renderPrivateBetaUiJourneyHtml({locale,result:{phase:'purpose_understand',sessionRef:'bv02',preInterview:{targetIndependentProfessionalRepresentation:rep,professionalIdentityContinuity:{recovered:true,reusedKnowledgeCount:0}}}});
const it=render('it');
assert.match(it,/Da dove emerge/);assert.match(it,/coordinamento tra funzioni ricorre/);assert.match(it,/Ho coordinato il ramp-up con supply chain, qualità e produzione/);
assert.match(it,/Esperienza Atlas/);assert.match(it,/Esperienza manutenzione/);assert.match(it,/Ho coordinato il ramp-up/);assert.match(it,/Ho coordinato produzione e manutenzione/);
assert.doesNotMatch(it,/episode-a|episode-b|source:atlas|source:maintenance/);
assert.match(it,/non estende automaticamente responsabilità, risultati o capacità oltre ciò che è supportato/i);assert.doesNotMatch(it,/fit|readiness/i);
const en=render('en');assert.match(en,/coordination between functions recurs/);assert.match(en,/Where this comes from/);assert.match(en,/coordination between functions recurs/);
const one={...representation,professionalMeaning:{...representation.professionalMeaning,supportedPatterns:[{...pattern,supportCount:1,episodeRefs:['episode-a'],supports:[pattern.supports[0]]}]}};
assert.doesNotMatch(render('it',one),/Ho coordinato il ramp-up con supply chain, qualità e produzione/);
const domain={...representation,professionalMeaning:{...representation.professionalMeaning,supportedPatterns:[{kind:'documented_domain_continuity',domain:'Produzione',sourceRefs:['old','current'],roleRefs:['Industrialization Engineer','Production Supervisor'],episodeRefs:['formal_role:Industrialization Engineer','formal_role:Production Supervisor'],episodeBasis:'distinct_formal_roles',supportCount:2,traitInference:false}]},assets:[{supportClass:'source_grounded',sourceId:'old',sourceRole:'previous_cv',sourceLabel:'CV precedente',formalRole:'Industrialization Engineer'},{supportClass:'source_grounded',sourceId:'current',sourceRole:'current_cv',sourceLabel:'CV attuale',formalRole:'Production Supervisor'}]};
const domainHtml=render('it',domain);assert.match(domainHtml,/L’ambito Produzione accompagna/);assert.match(domainHtml,/CV precedente/);assert.doesNotMatch(domainHtml,/Ho coordinato il ramp-up con supply chain, qualità e produzione/);
console.log('BETA-VALUE-02 supported Pattern explainability and Connection: PASS');
