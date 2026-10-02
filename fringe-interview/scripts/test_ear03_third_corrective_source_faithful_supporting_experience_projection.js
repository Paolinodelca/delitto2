import assert from 'node:assert/strict';
import { buildPrivateBetaSourceGroundedProjection } from '../src/app/buildPrivateBetaSourceGroundedProjection.js';
import { buildTargetIndependentProfessionalRepresentation } from '../src/app/buildTargetIndependentProfessionalRepresentation.js';
import { TARGET_INDEPENDENT_REPRESENTATION_RECIPE, buildTargetIndependentRepresentationSnapshotState, materializeTargetIndependentRepresentationSnapshot, attachRepresentationSnapshotToProfessionalIdentity, findReusableTargetIndependentRepresentationSnapshot } from '../src/app/privateBetaProfessionalRepresentationSnapshots.js';

const sources=[
 {id:'current',sourceRole:'current_cv',content:'Production Supervisor. Operations / Manufacturing. Circa 12 anni. Coordinamento operativo, monitoraggio performance e priorità di produzione.',provenance:{label:'CV attuale'}},
 {id:'previous',sourceRole:'previous_cv',content:'Industrialization Engineer. Esperienza in industrializzazione e start-up. Ha partecipato al lancio di una nuova linea produttiva in Germania, collaborando con engineering, produzione e qualità.',provenance:{label:'CV precedente'}},
 {id:'atlas',sourceRole:'professional_declaration',content:'Nel progetto Atlas ho coordinato il ramp-up fornitore con supply chain, qualità e produzione per un problema di continuità.',provenance:{label:'Esperienza aggiunta'}},
 {id:'delta',sourceRole:'professional_declaration',content:'Ho iniziato a coordinare le attività tra produzione e manutenzione durante interventi pianificati con l’obiettivo di ridurre le interruzioni. Non ho ancora risultati quantitativi consolidati.',provenance:{label:'Esperienza aggiunta'}}
];
const unsafeGermany='Lanciatore industriale di una nuova linea produttiva in Germania, coordinando engineering, produzione e qualità durante le fasi di installazione, avviamento e stabilizzazione del processo.';
const profiles=[
 {sourceId:'current',sourceRole:'current_cv',provenance:sources[0].provenance,candidateProfile:{summary:'Operations / Manufacturing',currentPositioning:'Production Supervisor con coordinamento operativo, monitoraggio performance e priorità di produzione',experienceSignals:{highlights:['Partecipazione a progetti di miglioramento'],supportExcerpts:['Coordinamento operativo, monitoraggio performance e priorità di produzione.']}}},
 {sourceId:'previous',sourceRole:'previous_cv',provenance:sources[1].provenance,candidateProfile:{summary:'Industrialization Engineer con esperienza in industrializzazione e start-up',currentPositioning:'Industrialization Engineer',experienceSignals:{highlights:[unsafeGermany],supportExcerpts:['Ha partecipato al lancio di una nuova linea produttiva in Germania, collaborando con engineering, produzione e qualità.']}}},
 {sourceId:'atlas',sourceRole:'professional_declaration',provenance:sources[2].provenance,candidateProfile:{summary:'Ramp-up fornitore Atlas',experienceSignals:{highlights:['Coordinamento Atlas'],supportExcerpts:['Nel progetto Atlas ho coordinato il ramp-up fornitore con supply chain, qualità e produzione per un problema di continuità.']}}},
 {sourceId:'delta',sourceRole:'professional_declaration',provenance:sources[3].provenance,candidateProfile:{summary:'Produzione e manutenzione',experienceSignals:{highlights:['Coordinamento produzione-manutenzione'],supportExcerpts:['Ho iniziato a coordinare le attività tra produzione e manutenzione durante interventi pianificati con l’obiettivo di ridurre le interruzioni.','Non ho ancora risultati quantitativi consolidati.']}}}
];
const projection=buildPrivateBetaSourceGroundedProjection({candidateSourceProfiles:profiles,professionalSources:sources});
const previous=projection.find(x=>x.sourceId==='previous');assert.deepEqual(previous.sourceFaithfulExperienceExcerpts,[profiles[1].candidateProfile.experienceSignals.supportExcerpts[0]]);assert(previous.experienceHighlights.includes(unsafeGermany));
// A fabricated/non-verbatim excerpt must not gain source authority.
const poisoned=structuredClone(profiles);poisoned[1].candidateProfile.experienceSignals.supportExcerpts.unshift('Ho gestito installazione, avviamento e stabilizzazione del processo.');
const poisonedProjection=buildPrivateBetaSourceGroundedProjection({candidateSourceProfiles:poisoned,professionalSources:sources});assert(!poisonedProjection.find(x=>x.sourceId==='previous').sourceFaithfulExperienceExcerpts.some(x=>/gestito installazione/i.test(x)));
let calls=0;const realizer=async()=>{calls++;return {claims:[]}};
const rep=await buildTargetIndependentProfessionalRepresentation({professionalSources:sources,sourceGroundedProjection:projection,reusableKnowledgeResults:[],narrativeRealizer:realizer,useModel:false});
assert.deepEqual(rep.roleHistory.map(x=>x.role),['Industrialization Engineer','Production Supervisor']);
const germany=rep.supportingExperiences.find(x=>x.sourceId==='previous');assert(germany);assert.match(germany.summary,/partecipato.*lancio.*Germania.*collaborando/i);assert.doesNotMatch(germany.summary,/Lanciatore|coordinando engineering|gestendo|guidato|responsabile del lancio/i);assert.equal(germany.sourceRole,'previous_cv');
const atlas=rep.supportingExperiences.find(x=>x.sourceId==='atlas');assert.match(atlas.summary,/coordinato.*ramp-up.*supply chain.*qualità.*produzione/i);
const delta=rep.supportingExperiences.find(x=>x.sourceId==='delta');assert.match(delta.summary,/iniziato a coordinare.*produzione.*manutenzione/i);assert.doesNotMatch(delta.summary,/\b\d+%/);
assert(!rep.roleHistory.some(x=>x.sourceId==='atlas'||x.sourceId==='delta'));
const visible=rep.supportingExperiences.map(x=>x.summary).join(' | ');assert.doesNotMatch(visible,/Lanciatore industriale|coordinando engineering|gestendo installazione|gestendo avviamento|gestendo stabilizzazione/i);
assert.doesNotMatch(JSON.stringify(rep),/international competence|international leadership|Project Manager|launch manager|Supplier Manager|Maintenance Coordinator|Operations Manager readiness/i);
assert.equal(rep.target,null);
const pi={personRef:{type:'person',id:'ear03-third'},professionalIdentityRef:'pi-ear03-third',representationSnapshots:[]};
const oldState=buildTargetIndependentRepresentationSnapshotState({professionalIdentity:pi,professionalSources:sources,reusableKnowledgeResults:[],recipe:{...TARGET_INDEPENDENT_REPRESENTATION_RECIPE,version:'1.3'}});
const old=materializeTargetIndependentRepresentationSnapshot({professionalIdentity:pi,state:oldState,representation:rep,now:'2026-09-10T08:00:00Z'});const withOld=attachRepresentationSnapshotToProfessionalIdentity({professionalIdentity:pi,snapshot:old});
const currentState=buildTargetIndependentRepresentationSnapshotState({professionalIdentity:withOld,professionalSources:sources,reusableKnowledgeResults:[]});assert.equal(TARGET_INDEPENDENT_REPRESENTATION_RECIPE.version,'2.0');assert.equal(findReusableTargetIndependentRepresentationSnapshot({professionalIdentity:withOld,state:currentState}),null);
const fresh=materializeTargetIndependentRepresentationSnapshot({professionalIdentity:withOld,state:currentState,representation:rep,now:'2026-09-10T08:01:00Z'});assert.equal(fresh.changeCause,'representation_recipe_change');const withFresh=attachRepresentationSnapshotToProfessionalIdentity({professionalIdentity:withOld,snapshot:fresh});assert.equal(withFresh.representationSnapshots.length,2);assert.deepEqual(withFresh.representationSnapshots[0],old);assert.equal(findReusableTargetIndependentRepresentationSnapshot({professionalIdentity:withFresh,state:currentState}).snapshotId,fresh.snapshotId);assert.equal(attachRepresentationSnapshotToProfessionalIdentity({professionalIdentity:withFresh,snapshot:fresh}).representationSnapshots.length,2);
console.log('EAR-03 third corrective source-faithful supporting experience projection: PASS');
