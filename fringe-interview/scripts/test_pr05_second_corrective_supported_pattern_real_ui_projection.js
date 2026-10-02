import assert from 'node:assert/strict';
import { createPrivateBetaUiServer } from '../src/app/privateBetaUiServer.js';
import { createMemoryPrivateBetaProfessionalIdentityStore, privateBetaPersonRefFromContext } from '../src/app/privateBetaProfessionalIdentityContinuity.js';
import { TARGET_INDEPENDENT_REPRESENTATION_RECIPE } from '../src/app/privateBetaProfessionalRepresentationSnapshots.js';

const contextId='pr05-second-corrective-real-ui';
const personRef=privateBetaPersonRefFromContext(contextId);
const at='2026-09-10T12:00:00.000Z';
const src=(id,sourceRole,content)=>({id,type:'text',label:sourceRole,content,language:null,sourceRole,quality:null,provenance:{origin:sourceRole==='professional_declaration'?'user_declaration':sourceRole,providedBy:'user',collectedAt:at},metadata:{createdAt:at,updatedAt:at}});
const sources=[
 src('current_cv','current_cv','Production Supervisor. Produzione industriale. Coordino le priorità di produzione e il monitoraggio delle performance operative.'),
 src('previous_cv','previous_cv','Industrialization Engineer. Industrializzazione e start-up. Ho partecipato al lancio di una nuova linea produttiva in Germany collaborando con engineering, produzione e qualità.'),
 src('professional_declaration','professional_declaration','Nel progetto Atlas ho coordinato attività di ramp-up del fornitore con supply chain, qualità e produzione, definendo priorità durante la stabilizzazione.'),
 src('professional_declaration:2','professional_declaration','Ho iniziato a coordinare le attività tra produzione e manutenzione durante interventi programmati, con l’obiettivo di ridurre le interruzioni. Non ho ancora un risultato quantitativo consolidato.')
];
const knowledge=[
 {semanticType:'decision_accountability',semanticPolicyRef:'professional_semantic_policy:decision_accountability:v1',knowledgeRef:'ks-da',knowledgeSnapshot:{id:'ks-da'},observation:{observationType:'decision_accountability',observationStatus:'observed',observationId:'o-da',evidenceIds:['e-da'],decisionAuthority:'shared',consequenceScope:'team',accountabilityEvidence:'explicit_with_outcomes',context:{decision:'Definire le priorità e coordinare le azioni durante la stabilizzazione del progetto Atlas',responsibility:'Coordinamento operativo e gestione di problemi inter-funzionali nel ramp-up del nuovo fornitore',consequence:'stabilizzazione operativa'},limitations:[]}},
 {semanticType:'quantified_outcome',semanticPolicyRef:'professional_semantic_policy:quantified_outcome:v1',knowledgeRef:'ks-qo',knowledgeSnapshot:{id:'ks-qo'},observation:{observationType:'quantified_outcome',observationId:'o-qo',evidenceIds:['e-qo'],measurableOutcome:'miglioramento operativo',quantitativeValue:{value:20,unit:'percent',approximate:true},contributionRelationship:'contributed',causalityBoundary:'contribution_only',context:{event:'Atlas'},limitations:['contribution only']}}
];
const record={version:'1.0',type:'private_beta_professional_identity_continuity',professionalIdentityRef:`professionalIdentity:${personRef.id}`,personRef,owner:'person',authorizedMaterials:{cvText:sources[0].content,userNotes:''},professionalSources:sources,reusableKnowledgeResults:knowledge,knowledgeRefs:['ks-da','ks-qo'],revision:5,createdAt:at,updatedAt:at,lastEnrichedBySessionRef:'human-marco',representationSnapshots:[],currentRepresentationSnapshotRefs:{}};

const baseProfile=()=>({summary:'',currentPositioning:'',senioritySignal:'unclear',experienceSignals:{yearsDetected:'',leadershipExposure:'unclear',ownershipLevel:'unclear',autonomyLevel:'unclear',scopeLevel:'unclear',highlights:[],supportExcerpts:[],activityModes:[]},skills:{technical:[],tools:[],methodologies:[],soft:[],languages:[]},domainSignals:[],responsibilitySignals:[],careerSignals:{stakeholderManagement:'unclear',crossFunctionalCollaboration:'unclear',deliveryOwnership:'unclear',peopleLeadership:'unclear',clientExposure:'unclear',analyticalRigour:'unclear',communicationClarity:'unclear'},evidence:{overallEvidenceLevel:'medium',evidenceRichAreas:[],weaklySupportedAreas:[],quantifiedAchievementsPresent:false},education:[],certifications:[],strengthAreas:[],riskAreas:[],ambiguities:[]});
function responseFor(user){
 const p=baseProfile();
 if(user.includes('[SOURCE id=')){p.summary='Profilo industriale con esperienze di industrializzazione e supervisione della produzione.';p.currentPositioning='Production Supervisor';p.domainSignals=['Produzione','Industrializzazione'];return {candidateProfile:p};}
 if(user.includes('progetto Atlas')){const excerpt='Nel progetto Atlas ho coordinato attività di ramp-up del fornitore con supply chain, qualità e produzione, definendo priorità durante la stabilizzazione.';p.summary='Ramp-up fornitore Atlas';p.experienceSignals.highlights=['Ramp-up fornitore Atlas'];p.experienceSignals.supportExcerpts=[excerpt];p.experienceSignals.activityModes=[{kind:'cross_functional_coordination',supportExcerpt:excerpt}];p.careerSignals.crossFunctionalCollaboration='strong';return {candidateProfile:p};}
 if(user.includes('produzione e manutenzione')){const excerpt='Ho iniziato a coordinare le attività tra produzione e manutenzione durante interventi programmati, con l’obiettivo di ridurre le interruzioni.';p.summary='Coordinamento produzione/manutenzione';p.experienceSignals.highlights=['Interventi programmati produzione/manutenzione'];p.experienceSignals.supportExcerpts=[excerpt];p.experienceSignals.activityModes=[{kind:'cross_functional_coordination',supportExcerpt:excerpt}];p.careerSignals.crossFunctionalCollaboration='strong';p.domainSignals=['Produzione','Manutenzione'];return {candidateProfile:p};}
 if(user.includes('Germany')){const excerpt='Ho partecipato al lancio di una nuova linea produttiva in Germany collaborando con engineering, produzione e qualità.';p.summary='Industrializzazione e start-up';p.currentPositioning='Industrialization Engineer';p.experienceSignals.highlights=['Partecipazione al lancio di una linea in Germany'];p.experienceSignals.supportExcerpts=[excerpt];p.domainSignals=['Industrializzazione','Produzione'];return {candidateProfile:p};}
 p.summary='Produzione industriale';p.currentPositioning='Production Supervisor';p.domainSignals=['Produzione'];p.responsibilitySignals=['priorità di produzione','monitoraggio performance'];return {candidateProfile:p};
}
let candidateCalls=0;
const adapter=async({task,user})=>{assert.equal(task,'candidateProfile','Understand must stay outside interview preparation');candidateCalls++;return JSON.stringify(responseFor(user));};

const store=createMemoryPrivateBetaProfessionalIdentityStore();await store.save({record});
const server=createPrivateBetaUiServer({locale:'it',professionalIdentityStore:store,contextIdFactory:()=>contextId,journeyOptions:{modelAdapter:adapter}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
async function understand(){
 const body=new URLSearchParams({identityAction:'recover',workingMode:'independent',productPurpose:'professional_representation_understand',consentDecision:'accept',targetRole:'',cvText:'',previousCvText:'',professionalDeclaration:'',userNotes:'',jdText:'',uiLocale:'it',sessionLocale:'it'});
 const res=await fetch(base+'/private-beta/journey',{method:'POST',headers:{cookie:`imago_beta_repeat_context=${contextId}`,'content-type':'application/x-www-form-urlencoded'},body});
 const html=await res.text();assert.equal(res.status,200,html);return html;
}
const html1=await understand();
const saved1=await store.load({personRef});
const currentRef=saved1.currentRepresentationSnapshotRefs?.professional_representation_understand;
const snapshot1=saved1.representationSnapshots.find(x=>x.snapshotId===currentRef)||saved1.representationSnapshots.at(-1);
assert(snapshot1,'real flow must persist current Representation snapshot');
const rep=snapshot1.representation,meaning=rep.professionalMeaning;
const pattern=meaning.supportedPatterns.find(x=>x.kind==='documented_cross_functional_coordination_recurrence');
assert(pattern,'real restored Marco-equivalent state must materialize supported recurrence');
assert(pattern.supportCount>=2);assert.equal(new Set(pattern.episodeRefs).size,pattern.episodeRefs.length);assert.equal(pattern.traitInference,false);
assert(meaning.professionalSynthesis.supportedPatternKinds.includes(pattern.kind),'structured synthesis must consume recurrence');
assert.match(html1,/coordinamento tra funzioni ricorre in più esperienze professionali distinte/i,'real UI must expose recurrence as professional meaning');
assert.match(html1,/Industrialization Engineer/i);assert.match(html1,/Production Supervisor/i);assert.match(html1,/Definire le priorità/i);assert.match(html1,/20%/);
assert.doesNotMatch(html1,/leader operativo|forte capacità di coordinamento|pronto per|Operations Manager/i);
const germany=rep.supportingExperiences.find(x=>x.sourceId==='previous_cv');assert.match(germany.summary,/Germany/i);assert.doesNotMatch(germany.summary,/gestito|coordinato il lancio|responsabile del lancio/i);
assert.deepEqual(meaning.insufficientObservability,[]);assert.equal(rep.target,null);
assert.equal(TARGET_INDEPENDENT_REPRESENTATION_RECIPE.version,'2.0');
const snapshotsAfterFirst=saved1.representationSnapshots.length;
const callsAfterFirst=candidateCalls;
const html2=await understand();
const saved2=await store.load({personRef});
assert.equal(saved2.representationSnapshots.length,snapshotsAfterFirst,'unchanged Understand must not duplicate snapshot');
assert.equal(saved2.revision,record.revision,'Understand must not increment PI revision');
assert.match(html2,/coordinamento tra funzioni ricorre in più esperienze professionali distinte/i);
assert(candidateCalls>callsAfterFirst,'CandidateProfile/source projection remains current pre-snapshot work; Representation snapshot reuse is still downstream');
await new Promise(r=>server.close(r));
console.log('PR-05 second corrective supported pattern real-UI projection: PASS');
