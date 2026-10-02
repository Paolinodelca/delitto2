import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createPrivateBetaUiServer } from '../src/app/privateBetaUiServer.js';
import { createMemoryPrivateBetaProfessionalIdentityStore, privateBetaPersonRefFromContext } from '../src/app/privateBetaProfessionalIdentityContinuity.js';

const fixture=JSON.parse(await readFile(new URL('../fixtures/expected_candidate_profile_01.json',import.meta.url),'utf8'));
function candidate(summary){const x=structuredClone(fixture);(x.candidateProfile||x).summary=summary;return x;}
const contextId='pa01-build-enrich-human';
const personRef=privateBetaPersonRefFromContext(contextId);
const at='2026-09-09T10:00:00.000Z';
const mk=(id,role,content)=>({id,type:'text',label:role,content,language:null,sourceRole:role,quality:null,provenance:{origin:role==='professional_declaration'?'user_declaration':role,providedBy:'user',collectedAt:at},metadata:{createdAt:at,updatedAt:at}});
const priorSources=[
 mk('current_cv','current_cv','Marco Bianchi. Production Supervisor. Operational coordination and KPI.'),
 mk('previous_cv','previous_cv','Industrialization Engineer. Production-line launch in Germany.'),
 mk('professional_declaration','professional_declaration','Project Atlas supplier ramp-up with supply chain, quality and production.')
];
const priorRecord={version:'1.0',type:'private_beta_professional_identity_continuity',professionalIdentityRef:`professionalIdentity:${personRef.id}`,personRef,owner:'person',authorizedMaterials:{cvText:priorSources[0].content,userNotes:''},professionalSources:priorSources,reusableKnowledgeResults:[],knowledgeRefs:[],revision:3,createdAt:at,updatedAt:at,lastEnrichedBySessionRef:null};
const newDelta='Negli ultimi mesi ho coordinato operativamente anche un’iniziativa per ridurre i tempi di cambio formato su una linea produttiva. Ho lavorato con produzione e manutenzione per individuare le principali cause di perdita di tempo e organizzare le azioni di miglioramento. L’attività è ancora in corso e non dispongo ancora di un risultato finale consolidato.';

const store=createMemoryPrivateBetaProfessionalIdentityStore();await store.save({record:priorRecord});
const calls=[];
const adapter=async({task,user})=>{calls.push({task,user});assert.equal(task,'candidateProfile','Build/Enrich must not invoke RoleProfile/JobFit/interview preparation');let summary='Production Supervisor';if(user.includes('Germany')&&!user.includes('Project Atlas'))summary='Industrialization Engineer; Germany production-line launch';else if(user.includes('Project Atlas')&&!user.includes('cambio formato'))summary='Project Atlas supplier ramp-up';else if(user.includes('cambio formato')&&!user.includes('Project Atlas'))summary='Changeover-time initiative in progress; no consolidated final result';else if(user.includes('Project Atlas')&&user.includes('cambio formato'))summary='Production Supervisor; Germany; Project Atlas; changeover initiative in progress';return JSON.stringify(candidate(summary));};
const diagnostics=[];
const server=createPrivateBetaUiServer({locale:'it',professionalIdentityStore:store,contextIdFactory:()=>contextId,journeyOptions:{modelAdapter:adapter},operatorDiagnosticsEnabled:true,preparationDiagnosticStore:diagnostics});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`,cookie=`imago_beta_repeat_context=${contextId}`;
const body=new URLSearchParams({identityAction:'recover',workingMode:'independent',productPurpose:'professional_identity_build_enrich',consentDecision:'accept',targetRole:'',cvText:'',previousCvText:'',professionalDeclaration:newDelta,userNotes:'',jdText:'',uiLocale:'it',sessionLocale:'it'});
const response=await fetch(base+'/private-beta/journey',{method:'POST',headers:{cookie,'content-type':'application/x-www-form-urlencoded'},body});
const html=await response.text();
assert.equal(response.status,200,html);
assert.match(html,/purpose-known/);
assert.match(html,/Germany production-line launch/);
assert.match(html,/Project Atlas supplier ramp-up/);
assert.match(html,/Changeover-time initiative in progress/);
assert.doesNotMatch(html,/understanding\/continue/);
assert.doesNotMatch(html,/runtime-question/);
assert.match(html,/imago-continuity-artifact/,'updated continuity artifact must be returned to the browser');
assert.ok(calls.length>=5&&calls.every(x=>x.task==='candidateProfile'));
const saved=await store.load({personRef});
assert.equal(saved.revision,4,'additive delta must produce one PI revision');
assert.equal(saved.personRef.id,personRef.id);
assert(saved.professionalSources.some(x=>x.content.includes('Germany')),'historical CV must remain');
assert(saved.professionalSources.some(x=>x.content.includes('Project Atlas')),'prior declaration must remain');
assert(saved.professionalSources.some(x=>x.content.includes('cambio formato')),'new delta must be added');
assert.equal(saved.professionalSources.filter(x=>x.sourceRole==='professional_declaration').length,2,'new declaration must be additive, not replacement');
assert(!JSON.stringify(saved).includes('20%'),'no invented result may be introduced');
assert.equal(saved.reusableKnowledgeResults.length,priorRecord.reusableKnowledgeResults.length,'purpose must not create Knowledge');

const match=html.match(/<script id="imago-continuity-artifact" type="application\/json">([\s\S]*?)<\/script>/);assert(match,'browser continuity artifact missing');
const artifact=JSON.parse(match[1]);assert.equal(artifact.revision,4);assert.equal(artifact.professionalSources.filter(x=>x.sourceRole==='professional_declaration').length,2);
await new Promise(r=>server.close(r));
console.log('PA-01 Build/Enrich execution-routing corrective: PASS');
