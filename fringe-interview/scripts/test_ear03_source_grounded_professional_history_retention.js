import assert from 'node:assert/strict';
import { buildCandidateProfilePrompt } from '../src/parser/buildCandidateProfilePrompt.js';
import { buildPrivateBetaSourceGroundedProjection } from '../src/app/buildPrivateBetaSourceGroundedProjection.js';
import { buildTargetIndependentProfessionalRepresentation } from '../src/app/buildTargetIndependentProfessionalRepresentation.js';
import { TARGET_INDEPENDENT_REPRESENTATION_RECIPE, buildTargetIndependentRepresentationSnapshotState, materializeTargetIndependentRepresentationSnapshot, attachRepresentationSnapshotToProfessionalIdentity, findReusableTargetIndependentRepresentationSnapshot } from '../src/app/privateBetaProfessionalRepresentationSnapshots.js';
import prompts from '../config/parser_prompts.json' with { type:'json' };
import schema from '../config/parser_schema.json' with { type:'json' };

assert.deepEqual(schema.candidateProfile.experienceSignals.highlights,['string']);
const prompt=buildCandidateProfilePrompt({cvText:'Industrialization Engineer. Industrializzazione/start-up. Lancio di una nuova linea produttiva in Germany con engineering, production e quality.',prompts,schema});
assert.match(prompt.modelInput.system,/Preserve explicitly supported major projects, launches, start-ups/i,'CandidateProfile extraction must preserve major historical experiences');
assert.match(prompt.modelInput.system,/"highlights"/,'CandidateProfile schema must carry bounded historical experience highlights');

const sources=[
 {id:'current',sourceRole:'current_cv',content:'Production Supervisor. Operations Manufacturing. circa 12 anni.',provenance:{label:'current_cv'}},
 {id:'previous',sourceRole:'previous_cv',content:'Industrialization Engineer. Industrializzazione/start-up. Lancio di una nuova linea produttiva in Germany con engineering, production e quality.',provenance:{label:'previous_cv'}},
 {id:'atlas',sourceRole:'professional_declaration',content:'Atlas supplier ramp-up con supply chain, qualità e produzione.',provenance:{label:'professional_declaration'}},
 {id:'delta',sourceRole:'professional_declaration',content:'Coordinamento tra produzione e manutenzione durante interventi pianificati, senza risultato quantitativo consolidato.',provenance:{label:'professional_declaration'}}
];
const profiles=[
 {sourceId:'current',sourceRole:'current_cv',candidateProfile:{summary:'Operations / Manufacturing',currentPositioning:'Production Supervisor',domainSignals:['Operations','Manufacturing'],experienceSignals:{yearsDetected:'circa 12 anni',highlights:['Coordinamento produzione, performance e priorità'],supportExcerpts:['Production Supervisor. Operations Manufacturing. circa 12 anni.']}}},
 {sourceId:'previous',sourceRole:'previous_cv',candidateProfile:{summary:'Esperienza di industrializzazione e start-up',currentPositioning:'Industrialization Engineer',domainSignals:['Industrialization','Manufacturing'],experienceSignals:{highlights:['Partecipazione al lancio di una nuova linea produttiva in Germany con engineering, production e quality'],supportExcerpts:['Lancio di una nuova linea produttiva in Germany con engineering, production e quality.']}}},
 {sourceId:'atlas',sourceRole:'professional_declaration',candidateProfile:{summary:'Supplier ramp-up Atlas',experienceSignals:{highlights:['Attività cross-functional con supply chain, qualità e produzione'],supportExcerpts:['Atlas supplier ramp-up con supply chain, qualità e produzione.']}}},
 {sourceId:'delta',sourceRole:'professional_declaration',candidateProfile:{summary:'Attività produzione-manutenzione',experienceSignals:{highlights:['Coordinamento operativo durante interventi pianificati senza risultato quantitativo consolidato'],supportExcerpts:['Coordinamento tra produzione e manutenzione durante interventi pianificati, senza risultato quantitativo consolidato.']}}}
];
const projection=buildPrivateBetaSourceGroundedProjection({candidateSourceProfiles:profiles,professionalSources:sources});
const previous=projection.find(x=>x.sourceId==='previous'); assert(previous.experienceHighlights.some(x=>/Germany/i.test(x))); assert(previous.facts.some(x=>/Germany/i.test(x)));
const knowledge=[
 {semanticType:'decision_accountability',semanticPolicyRef:'professional_semantic_policy:decision_accountability:v1',knowledgeRef:'ks-da',knowledgeSnapshot:{id:'ks-da'},observation:{observationType:'decision_accountability',observationStatus:'observed',observationId:'o-da',evidenceIds:['e-da'],decisionAuthority:'shared',consequenceScope:'team',accountabilityEvidence:'explicit_with_outcomes',context:{decision:'priorità Atlas',responsibility:'coordinamento operativo',consequence:'continuità'},limitations:[]}},
 {semanticType:'quantified_outcome',semanticPolicyRef:'professional_semantic_policy:quantified_outcome:v1',knowledgeRef:'ks-qo',knowledgeSnapshot:{id:'ks-qo'},observation:{observationType:'quantified_outcome',observationId:'o-qo',evidenceIds:['e-qo'],measurableOutcome:'miglioramento',quantitativeValue:{value:20,unit:'percent',approximate:true,direction:'increase'},contributionRelationship:'contributed',causalityBoundary:'contribution_only',context:{event:'Atlas'},limitations:['contribution only']}}
];
const rep=await buildTargetIndependentProfessionalRepresentation({professionalSources:sources,sourceGroundedProjection:projection,reusableKnowledgeResults:knowledge,locale:'it',useModel:false});
assert.deepEqual(rep.roleHistory.map(x=>x.role),['Industrialization Engineer','Production Supervisor']);
assert(rep.supportingExperiences.some(x=>x.sourceId==='previous'&&x.experienceHighlights.some(h=>/Germany/i.test(h)))); assert(!rep.roleHistory.some(x=>/Germany/i.test(x.role)));
assert(rep.supportingExperiences.some(x=>x.sourceId==='atlas')); assert(rep.supportingExperiences.some(x=>x.sourceId==='delta'));
const all=JSON.stringify(rep); assert.doesNotMatch(all,/international competence|international leadership|Project Manager|Supplier Manager|Maintenance Coordinator|Operations Manager readiness|people management/i); assert.doesNotMatch(all,/20%[^}]{0,160}manutenzione/i);
assert(rep.assets.some(x=>x.semanticType==='decision_accountability')); assert(rep.assets.some(x=>x.semanticType==='quantified_outcome'));
assert.equal(rep.target,null); assert.equal(rep.persistent,false);

const personRef={type:'person',id:'ear03-marco'}; const pi={type:'private_beta_professional_identity_continuity',professionalIdentityRef:'professionalIdentity:ear03-marco',personRef,professionalSources:sources,reusableKnowledgeResults:knowledge,representationSnapshots:[]};
const oldState=buildTargetIndependentRepresentationSnapshotState({professionalIdentity:pi,professionalSources:sources,reusableKnowledgeResults:knowledge,authorizationState:'accepted',recipe:{id:TARGET_INDEPENDENT_REPRESENTATION_RECIPE.id,version:'1.3'}});
const oldSnap=materializeTargetIndependentRepresentationSnapshot({professionalIdentity:pi,state:oldState,representation:{...rep,version:'1.3'},now:'2026-09-10T06:00:00.000Z'}); const withOld=attachRepresentationSnapshotToProfessionalIdentity({professionalIdentity:pi,snapshot:oldSnap});
const newState=buildTargetIndependentRepresentationSnapshotState({professionalIdentity:withOld,professionalSources:sources,reusableKnowledgeResults:knowledge,authorizationState:'accepted',recipe:TARGET_INDEPENDENT_REPRESENTATION_RECIPE}); assert.equal(TARGET_INDEPENDENT_REPRESENTATION_RECIPE.version,'2.0'); assert.equal(findReusableTargetIndependentRepresentationSnapshot({professionalIdentity:withOld,state:newState}),null);
const newSnap=materializeTargetIndependentRepresentationSnapshot({professionalIdentity:withOld,state:newState,representation:rep,now:'2026-09-10T07:00:00.000Z'}); assert.equal(newSnap.changeCause,'representation_recipe_change'); const withNew=attachRepresentationSnapshotToProfessionalIdentity({professionalIdentity:withOld,snapshot:newSnap}); assert.equal(withNew.representationSnapshots.length,2); assert.deepEqual(withNew.representationSnapshots[0],oldSnap); assert.equal(findReusableTargetIndependentRepresentationSnapshot({professionalIdentity:withNew,state:newState}).snapshotId,newSnap.snapshotId);
console.log('EAR-03 source-grounded professional history retention: PASS');
