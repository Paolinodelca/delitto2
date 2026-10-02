import assert from 'assert';
import {createPrivateBetaUiServer} from '../src/app/privateBetaUiServer.js';
import {createMemoryPrivateBetaProfessionalIdentityStore,privateBetaPersonRefFromContext} from '../src/app/privateBetaProfessionalIdentityContinuity.js';

const contextId='ear-browser-person';
const personRef=privateBetaPersonRefFromContext(contextId);
const sessionStore=new Map();
const sessionRef='session-ear-browser';
sessionStore.set(sessionRef,{sessionId:sessionRef,personRef,knowledgeSubjectRef:personRef,identityAction:'create',consent:{status:'accepted'},feedbackSequence:0,now:()=> '2026-09-08T15:00:00.000Z',session:{betaSession:{sessionId:sessionRef},rawInput:{cvText:'Production Supervisor',userNotes:''},professionalSources:[{id:'source-current',type:'text',label:'Current CV',content:'Production Supervisor',language:'it',sourceRole:'current_cv',quality:{completeness:'unknown',reliability:'user_provided',freshness:'current'},provenance:{origin:'private_beta',providedBy:'user',collectedAt:'2026-09-08T15:00:00.000Z'},metadata:{},extensions:{}}],runtimeKnowledgeResults:[]}});
const store1=createMemoryPrivateBetaProfessionalIdentityStore();
const finalize=async()=>({publicResult:{completed:true,phase:'experience_closed',report:{available:false}}});
const server1=createPrivateBetaUiServer({locale:'it',sessionStore,professionalIdentityStore:store1,contextIdFactory:()=>contextId,stagedFinalize:finalize});
await new Promise(r=>server1.listen(0,'127.0.0.1',r));const u1=`http://127.0.0.1:${server1.address().port}`;
let r=await fetch(u1+'/private-beta/feedback',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded','Cookie':`imago_beta_repeat_context=${contextId}`},body:new URLSearchParams({sessionRef})});
assert.equal(r.status,200);const html=await r.text();
assert(html.includes('Esperienza completata'));assert(html.includes('Professional Identity salvata'));assert(html.includes('id="beta-completed-next"'));assert(!html.includes('action="/private-beta/feedback"'));
assert(html.includes('imago.privateBeta.professionalIdentity.v1'));assert(html.includes('id="imago-continuity-artifact"'));
const m=html.match(/<script id="imago-continuity-artifact" type="application\/json">([^<]+)<\/script>/);assert(m);const artifact=JSON.parse(m[1]);assert.equal(artifact.personRef.id,personRef.id);assert.equal(artifact.professionalSources[0].content,'Production Supervisor');
await new Promise(r0=>server1.close(r0));

// Simulate server restart: fresh process-local PI store, same browser cookie + localStorage artifact restore.
const store2=createMemoryPrivateBetaProfessionalIdentityStore();const server2=createPrivateBetaUiServer({locale:'it',professionalIdentityStore:store2,contextIdFactory:()=>contextId});await new Promise(r0=>server2.listen(0,'127.0.0.1',r0));const u2=`http://127.0.0.1:${server2.address().port}`;
r=await fetch(u2+'/private-beta/continuity/restore',{method:'POST',headers:{'content-type':'application/json','Cookie':`imago_beta_repeat_context=${contextId}`},body:JSON.stringify(artifact)});assert.equal(r.status,204);
r=await fetch(u2+'/private-beta',{headers:{Cookie:`imago_beta_repeat_context=${contextId}`}});const home=await r.text();assert(home.includes('Riprendi una esistente'));assert(home.includes('CV attuale'));
// Malformed/mismatched artifacts fail safely.
r=await fetch(u2+'/private-beta/continuity/restore',{method:'POST',headers:{'content-type':'application/json','Cookie':`imago_beta_repeat_context=${contextId}`},body:JSON.stringify({...artifact,personRef:{type:'person',id:'other'}})});assert.equal(r.status,422);
await new Promise(r0=>server2.close(r0));
console.log('EAR third corrective browser continuity/completion PASS');
