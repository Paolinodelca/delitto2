import assert from 'node:assert/strict';
import { buildPrivateBetaSourceGroundedProjection } from '../src/app/buildPrivateBetaSourceGroundedProjection.js';
import { buildTargetIndependentProfessionalRepresentation } from '../src/app/buildTargetIndependentProfessionalRepresentation.js';
import { renderPrivateBetaUiJourneyHtml } from '../src/app/renderPrivateBetaUiJourneyHtml.js';
import { TARGET_INDEPENDENT_REPRESENTATION_RECIPE, buildTargetIndependentRepresentationSnapshotState, materializeTargetIndependentRepresentationSnapshot, attachRepresentationSnapshotToProfessionalIdentity, findReusableTargetIndependentRepresentationSnapshot } from '../src/app/privateBetaProfessionalRepresentationSnapshots.js';

const sources=[
 {id:'current',sourceRole:'current_cv',content:'Marco Bianchi. Operations / Manufacturing, circa 12 anni. Production Supervisor. Coordinamento produzione, performance, priorità, process improvement.',provenance:{label:'current_cv'}},
 {id:'previous',sourceRole:'previous_cv',content:'Industrialization Engineer. Industrializzazione e start-up. Lancio di una nuova linea produttiva in Germany con engineering, production e quality.',provenance:{label:'previous_cv'}},
 {id:'atlas',sourceRole:'professional_declaration',content:'Nel progetto Atlas ho coordinato attività di ramp-up fornitore con supply chain, qualità e produzione, definendo priorità e bilanciando continuità, qualità e tempi di recupero.',provenance:{label:'professional_declaration'}},
 {id:'delta',sourceRole:'professional_declaration',content:'Negli ultimi mesi ho iniziato a seguire anche il coordinamento delle attività tra produzione e manutenzione durante interventi programmati. Non dispongo ancora di risultati quantitativi consolidati.',provenance:{label:'professional_declaration'}}
];
const candidateSourceProfiles=[
 {sourceId:'current',sourceRole:'current_cv',provenance:sources[0].provenance,candidateProfile:{summary:'Professionista Operations/Manufacturing con circa 12 anni di esperienza in contesti industriali',currentPositioning:'Production Supervisor in azienda manifatturiera',domainSignals:['Operations','Manufacturing'],careerSignals:{crossFunctionalCollaboration:'partial'},experienceSignals:{highlights:['Coordinamento operativo e miglioramento dei processi'],supportExcerpts:['Production Supervisor. Coordinamento produzione, performance, priorità, process improvement.'],yearsDetected:'circa 12 anni'}}},
 {sourceId:'previous',sourceRole:'previous_cv',provenance:sources[1].provenance,candidateProfile:{summary:'Ingegnere di industrializzazione con esperienza in progetti di avviamento produttivo e analisi dei processi',currentPositioning:'Industrialization Engineer',domainSignals:['Industrialization','Manufacturing'],experienceSignals:{highlights:['Partecipazione al lancio di una nuova linea produttiva in Germany con engineering, production e quality'],supportExcerpts:['Lancio di una nuova linea produttiva in Germany con engineering, production e quality.']}}},
 {sourceId:'atlas',sourceRole:'professional_declaration',provenance:sources[2].provenance,candidateProfile:{summary:'Attività nel ramp-up fornitore con supply chain, qualità e produzione',careerSignals:{crossFunctionalCollaboration:'strong'},experienceSignals:{highlights:['Coordinamento di azioni e priorità nel progetto Atlas'],supportExcerpts:['Nel progetto Atlas ho coordinato attività di ramp-up fornitore con supply chain, qualità e produzione, definendo priorità e bilanciando continuità, qualità e tempi di recupero.']}}},
 {sourceId:'delta',sourceRole:'professional_declaration',provenance:sources[3].provenance,candidateProfile:{summary:'Attività tra produzione e manutenzione durante interventi programmati',careerSignals:{crossFunctionalCollaboration:'strong'},experienceSignals:{highlights:['Coordinamento operativo tra produzione e manutenzione senza risultati quantitativi consolidati'],supportExcerpts:['Negli ultimi mesi ho iniziato a seguire anche il coordinamento delle attività tra produzione e manutenzione durante interventi programmati.']}}}
];
const knowledge=[
 {semanticType:'decision_accountability',semanticPolicyRef:'professional_semantic_policy:decision_accountability:v1',knowledgeRef:'ks-da',knowledgeSnapshot:{id:'ks-da'},observation:{observationType:'decision_accountability',observationStatus:'observed',observationId:'o-da',evidenceIds:['e-da'],decisionAuthority:'shared',consequenceScope:'team',accountabilityEvidence:'explicit_with_outcomes',context:{decision:'Definire le priorità e coordinare le azioni durante la stabilizzazione del progetto Atlas',responsibility:'Coordinamento operativo e gestione di problemi inter-funzionali nel ramp-up del nuovo fornitore',consequence:'Stabilizzazione della linea di produzione e miglioramento delle performance del nuovo fornitore'},limitations:[]}},
 {semanticType:'quantified_outcome',semanticPolicyRef:'professional_semantic_policy:quantified_outcome:v1',knowledgeRef:'ks-qo',knowledgeSnapshot:{id:'ks-qo'},observation:{observationType:'quantified_outcome',observationId:'o-qo',evidenceIds:['e-qo'],measurableOutcome:'miglioramento operativo',quantitativeValue:{value:20,unit:'percent',approximate:true,direction:'increase'},contributionRelationship:'contributed',causalityBoundary:'contribution_only',context:{event:'progetto Atlas'},limitations:['contribution only']}}
];
const projection=buildPrivateBetaSourceGroundedProjection({candidateSourceProfiles,professionalSources:sources});
assert(projection.find(x=>x.sourceId==='previous').facts.some(x=>/Germany/i.test(x)),'material historical highlight must survive bounded projection');


const r=await buildTargetIndependentProfessionalRepresentation({professionalSources:sources,sourceGroundedProjection:projection,reusableKnowledgeResults:knowledge,locale:'it',useModel:false});
assert.equal(r.version,'1.4');
assert(r.professionalMeaning,'meaning must live in structured Representation');
const m=r.professionalMeaning;
assert.equal(m.kind,'target_independent_professional_meaning');
assert.equal(m.professionalSynthesis.currentRole,'Production Supervisor');
assert.deepEqual(m.professionalSynthesis.previousRoles,['Industrialization Engineer']);
assert.equal(m.professionalSynthesis.hasDocumentedRoleContinuity,true);
assert(m.credibilityBasis.sourceRefs.includes('current')&&m.credibilityBasis.sourceRefs.includes('previous'));
assert.equal(m.knowledgeContribution.length,2);
assert(m.knowledgeContribution.some(x=>x.semanticType==='decision_accountability'));
assert(m.knowledgeContribution.some(x=>x.semanticType==='quantified_outcome'));
assert(m.knowledgeContribution.every(x=>x.sourceRef));
assert.deepEqual(m.insufficientObservability,[],'do not manufacture gaps without canonical authority');
assert.deepEqual(m.progressiveExplanation.primary,['professional_synthesis','supported_patterns','knowledge_contribution','insufficient_observability']);
assert(m.supportedPatterns.every(x=>x.traitInference===false));
for(const p of m.supportedPatterns){assert(p.sourceRefs.length>=2);assert(p.episodeRefs.length>=2);if(p.kind==='documented_domain_continuity'){assert.equal(p.episodeBasis,'distinct_formal_roles');assert(p.roleRefs.length>=2);}else assert.equal(p.episodeBasis,'distinct_source_grounded_experiences');}
// Duplicate material for the same formal role must not create a stronger independent pattern.
const duplicateSources=[...sources,{...sources[1],id:'previous-copy'}];
const duplicateProfiles=[...candidateSourceProfiles,{...candidateSourceProfiles[1],sourceId:'previous-copy'}];
const dupProjection=buildPrivateBetaSourceGroundedProjection({candidateSourceProfiles:duplicateProfiles,professionalSources:duplicateSources});
const dup=await buildTargetIndependentProfessionalRepresentation({professionalSources:duplicateSources,sourceGroundedProjection:dupProjection,reusableKnowledgeResults:knowledge,useModel:false});
assert.equal(dup.professionalMeaning.supportedPatterns.length,m.supportedPatterns.length,'source multiplicity must not strengthen patterns');
const structured=JSON.stringify(r);
assert.doesNotMatch(structured,/stable leadership|stable coordination|strategic trait|problem.solving trait|result orientation|competence score|employability score|readiness|target suitability|competence growth|exclusive ownership|exclusive causality/i);
assert.equal(r.target,null);assert.equal(knowledge.length,2);
// EAR-03 source faithfulness remains.
const germany=r.supportingExperiences.find(x=>x.sourceId==='previous');assert(germany);assert.match(germany.summary,/Germany/i);assert.doesNotMatch(germany.summary,/Lanciatore industriale|gestendo installazione|coordinando engineering/i);
// Renderer consumes structured meaning; primary path is plain language, detail is progressive.
const html=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'purpose_understand',preInterview:{targetIndependentProfessionalRepresentation:r,sourceGroundedProjection:projection,professionalIdentityContinuity:{recovered:true,reusedKnowledgeCount:2}}}});
assert.match(html,/Quello che vale la pena notare/i);assert.match(html,/Germany|Manufacturing/i);assert.match(html,/Production Supervisor/i);assert.match(html,/Nel tuo percorso il coordinamento tra funzioni ricorre/i);assert.match(html,/Da dove emerge/i);assert.match(html,/Vedi fonti e dettagli/i);assert.doesNotMatch(html,/Stato epistemico|semantic authority|ownership exclusivity/i);
// Current recipe invalidation and exact reuse.
assert.equal(TARGET_INDEPENDENT_REPRESENTATION_RECIPE.version,'2.0');
const pi={personRef:{type:'person',id:'pr05'},professionalIdentityRef:'pi-pr05',revision:7,representationSnapshots:[]};
const oldState=buildTargetIndependentRepresentationSnapshotState({professionalIdentity:pi,professionalSources:sources,reusableKnowledgeResults:knowledge,recipe:{...TARGET_INDEPENDENT_REPRESENTATION_RECIPE,version:'1.5'}});
const old=materializeTargetIndependentRepresentationSnapshot({professionalIdentity:pi,state:oldState,representation:r,now:'2026-09-10T09:00:00Z'});const withOld=attachRepresentationSnapshotToProfessionalIdentity({professionalIdentity:pi,snapshot:old});
const currentState=buildTargetIndependentRepresentationSnapshotState({professionalIdentity:withOld,professionalSources:sources,reusableKnowledgeResults:knowledge});assert.equal(findReusableTargetIndependentRepresentationSnapshot({professionalIdentity:withOld,state:currentState}),null);
const fresh=materializeTargetIndependentRepresentationSnapshot({professionalIdentity:withOld,state:currentState,representation:r,now:'2026-09-10T09:01:00Z'});assert.equal(fresh.changeCause,'representation_recipe_change');const withFresh=attachRepresentationSnapshotToProfessionalIdentity({professionalIdentity:withOld,snapshot:fresh});assert.deepEqual(withFresh.representationSnapshots[0],old);assert.equal(findReusableTargetIndependentRepresentationSnapshot({professionalIdentity:withFresh,state:currentState}).snapshotId,fresh.snapshotId);assert.equal(attachRepresentationSnapshotToProfessionalIdentity({professionalIdentity:withFresh,snapshot:fresh}).representationSnapshots.length,2);assert.equal(withFresh.revision,7);
console.log('PR-05 Professional Representation meaning and progressive explanation: PASS');
