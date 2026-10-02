import assert from 'node:assert/strict';
import { buildTargetIndependentProfessionalRepresentation } from '../src/app/buildTargetIndependentProfessionalRepresentation.js';
import { deriveRepresentationInformationalContribution } from '../src/app/representationInformationalContribution.js';
import { renderPrivateBetaUiJourneyHtml } from '../src/app/renderPrivateBetaUiJourneyHtml.js';
import { TARGET_INDEPENDENT_REPRESENTATION_RECIPE, buildTargetIndependentRepresentationSnapshotState } from '../src/app/privateBetaProfessionalRepresentationSnapshots.js';
const germany={id:'previous',sourceRole:'previous_cv',content:'Industrialization Engineer. He participated in the launch of a new production line in Germany, working with engineering, production and quality during installation, start-up and stabilization.',provenance:{label:'Previous CV'}};
const current={id:'current',sourceRole:'current_cv',content:'Production Supervisor. Coordinates daily work with engineering, production and quality on cross-functional production issues.',provenance:{label:'Current CV'}};
const projection=[
 {sourceId:'previous',sourceRole:'previous_cv',facts:['Industrialization Engineer'],roleDescriptionFacts:[],domainSignals:['Manufacturing'],experienceHighlights:['launch'],sourceFaithfulExperienceExcerpts:[germany.content],activitySemantics:[{kind:'cross_functional_coordination',supportExcerpt:'working with engineering, production and quality'}]},
 {sourceId:'current',sourceRole:'current_cv',facts:['Production Supervisor'],roleDescriptionFacts:[],domainSignals:['Manufacturing'],experienceHighlights:[],sourceFaithfulExperienceExcerpts:[current.content],activitySemantics:[{kind:'cross_functional_coordination',supportExcerpt:'engineering, production and quality'}]}
];
const rep=await buildTargetIndependentProfessionalRepresentation({professionalSources:[germany,current],sourceGroundedProjection:projection,reusableKnowledgeResults:[]});
assert.equal(rep.version,'1.4');assert.equal(TARGET_INDEPENDENT_REPRESENTATION_RECIPE.version,'2.0');assert.equal(rep.episodeMeanings.length,1);
const c=rep.professionalMeaning.informationalContributions[0];assert(c);assert.equal(c.semanticallyExhausted,false);
const units=new Map(rep.professionalMeaning.episodeInformationalUnits.map(x=>[x.unitId,x]));const statuses=new Map(c.relations.map(x=>[units.get(x.unitRef)?.label,x.status]));
assert.equal(statuses.get('engineering / production / quality collaboration in Germany'),'supporting_already_represented');
for(const label of ['production-line launch','new production line','installation','start-up','stabilization'])assert.equal(statuses.get(label),'adds_distinct_supported_information');
assert.equal(rep.episodeMeanings[0].participation,'participated');assert(!JSON.stringify(rep).match(/start-up capability|launch ownership|project-management capability|international capability|readiness for Operations Manager/i));
assert.equal(rep.professionalMeaning.knowledgeContribution.length,0);assert.equal(rep.professionalMeaning.selectedEpisodeContributions.length,1);
const html=renderPrivateBetaUiJourneyHtml({result:{phase:'purpose_understand',preInterview:{targetIndependentProfessionalRepresentation:rep,sourceGroundedProjection:[]}},locale:'it'});assert.match(html,/lancio di una nuova linea produttiva in Germania/i);assert.match(html,/installazione, avviamento e stabilizzazione/i);assert.doesNotMatch(html,/production-line launch|supporting analysis|selected contribution|informational contribution/i);assert.equal(html.includes('Important Episode Meanings'),false);
const noPattern=deriveRepresentationInformationalContribution({episodeMeaning:rep.episodeMeanings[0],professionalMeaning:{supportedPatterns:[]}});assert(noPattern.relations.every(x=>x.status==='adds_distinct_supported_information'));
const healthcare={id:'health',sourceRole:'professional_declaration',content:'Contributed to validation activities for a diagnostic instrument, working with system, verification and quality functions during a defined validation phase.'};
const hp=[{sourceId:'health',sourceRole:'professional_declaration',facts:['Contributed to validation activities for a diagnostic instrument'],roleDescriptionFacts:[],domainSignals:['Biomedical'],experienceHighlights:[],sourceFaithfulExperienceExcerpts:[healthcare.content],activitySemantics:[]}];
const hr=await buildTargetIndependentProfessionalRepresentation({professionalSources:[healthcare],sourceGroundedProjection:hp,reusableKnowledgeResults:[]});assert(hr.professionalMeaning.informationalContributions.length===1);assert(hr.professionalMeaning.informationalContributions[0].distinctUnitRefs.length>0);assert(!JSON.stringify(hr).match(/validation capability|biomedical expertise|readiness/i));
const analysisSource={id:'analysis',sourceRole:'current_cv',content:'Contributo di analisi e dati a supporto di interventi o investimenti.'};
const ap=[{sourceId:'analysis',sourceRole:'current_cv',facts:['Analisi e dati a supporto di interventi o investimenti'],roleDescriptionFacts:[],domainSignals:['Manufacturing'],experienceHighlights:[],sourceFaithfulExperienceExcerpts:[analysisSource.content],activitySemantics:[]}];
const ar=await buildTargetIndependentProfessionalRepresentation({professionalSources:[analysisSource],sourceGroundedProjection:ap,reusableKnowledgeResults:[]});
const analysisHtml=renderPrivateBetaUiJourneyHtml({result:{phase:'purpose_understand',preInterview:{targetIndependentProfessionalRepresentation:ar,sourceGroundedProjection:[]}},locale:'it'});assert.match(analysisHtml,/analisi e dati a supporto di interventi o investimenti/i);assert.doesNotMatch(analysisHtml,/supporting analysis/i);
const enHtml=renderPrivateBetaUiJourneyHtml({result:{phase:'purpose_understand',preInterview:{targetIndependentProfessionalRepresentation:rep,sourceGroundedProjection:[]}},locale:'en'});assert.doesNotMatch(enHtml,/production-line launch|selected contribution|informational contribution/i);
const state=buildTargetIndependentRepresentationSnapshotState({professionalIdentity:{personRef:{id:'p'},professionalIdentityRef:'pi'},professionalSources:[germany,current],reusableKnowledgeResults:[]});assert.equal(state.recipe.version,'2.0');
const corrected=buildTargetIndependentRepresentationSnapshotState({professionalIdentity:{personRef:{id:'p'},professionalIdentityRef:'pi'},professionalSources:[current],reusableKnowledgeResults:[]});assert.notEqual(corrected.sourceStateFingerprint,state.sourceStateFingerprint);
console.log('BV05-EXP-E Germany informational contribution: PASS');

// SECOND CORRECTIVE: reproduce the real-browser persisted-snapshot regression.
// A BV05-EXP-E 2.0 snapshot may contain selected contribution identities created
// before the FIRST CORRECTIVE projection carried description/sourceRole. Human
// realization must bridge the selected identity back to the authorised Episode
// Meaning rather than dropping it or rendering the semantic key.
const legacyHumanRealizationRep=JSON.parse(JSON.stringify(rep));
legacyHumanRealizationRep.professionalMeaning.selectedEpisodeContributions=legacyHumanRealizationRep.professionalMeaning.selectedEpisodeContributions.map(({description,sourceRole,...selected})=>selected);
const legacyHumanHtml=renderPrivateBetaUiJourneyHtml({result:{phase:'purpose_understand',preInterview:{targetIndependentProfessionalRepresentation:legacyHumanRealizationRep,sourceGroundedProjection:[]}},locale:'it'});
assert.match(legacyHumanHtml,/lancio di una nuova linea produttiva in Germania/i);
assert.match(legacyHumanHtml,/installazione, avviamento e stabilizzazione/i);
assert.doesNotMatch(legacyHumanHtml,/production-line launch|supporting analysis|selected contribution|informational contribution/i);
assert.match(legacyHumanHtml,/partecipazione al lancio/i);
assert.doesNotMatch(legacyHumanHtml,/gestione del lancio|coordinamento del lancio|capacit\u00e0 di avviamento|expertise di industrializzazione/i);
const legacyAnalysisRep=JSON.parse(JSON.stringify(ar));
legacyAnalysisRep.professionalMeaning.selectedEpisodeContributions=legacyAnalysisRep.professionalMeaning.selectedEpisodeContributions.map(({description,sourceRole,...selected})=>selected);
const legacyAnalysisHtml=renderPrivateBetaUiJourneyHtml({result:{phase:'purpose_understand',preInterview:{targetIndependentProfessionalRepresentation:legacyAnalysisRep,sourceGroundedProjection:[]}},locale:'it'});
assert.match(legacyAnalysisHtml,/analisi e dati a supporto di interventi o investimenti/i);
assert.doesNotMatch(legacyAnalysisHtml,/supporting analysis/i);
const legacyEnHtml=renderPrivateBetaUiJourneyHtml({result:{phase:'purpose_understand',preInterview:{targetIndependentProfessionalRepresentation:legacyHumanRealizationRep,sourceGroundedProjection:[]}},locale:'en'});
assert.match(legacyEnHtml,/lancio di una nuova linea produttiva in Germania/i);
assert.doesNotMatch(legacyEnHtml,/production-line launch|supporting analysis|selected contribution|informational contribution/i);
