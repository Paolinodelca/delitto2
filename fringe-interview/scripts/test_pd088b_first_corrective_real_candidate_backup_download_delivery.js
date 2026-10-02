import assert from 'node:assert/strict';
import {createPrivateBetaUiServer} from '../src/app/privateBetaUiServer.js';
import {createMemoryPrivateBetaProfessionalIdentityStore,privateBetaPersonRefFromContext} from '../src/app/privateBetaProfessionalIdentityContinuity.js';
import {parseProfessionalProfileBackup,inspectProfessionalProfileBackupEnvelope} from '../src/app/privateBetaProfessionalProfileBackup.js';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';

const context='pd088b-first-corrective';
const personRef=privateBetaPersonRefFromContext(context);
const source={id:'current-cv',type:'text',sourceRole:'current_cv',content:'Marco Rossi. Production Supervisor.',metadata:{candidateName:'Marco Rossi',originalFilename:'Marco_Rossi_CV.docx'},provenance:{origin:'candidate_upload',providedBy:'user'}};
const record={version:'1.0',type:'private_beta_professional_identity_continuity',professionalIdentityRef:`professionalIdentity:${personRef.id}`,personRef,owner:'person',authorizedMaterials:{cvText:source.content},professionalSources:[source],sourceAssets:[],reusableKnowledgeResults:[],knowledgeRefs:[],revision:1,createdAt:'2026-09-30T14:30:00Z',updatedAt:'2026-09-30T14:30:00Z',lastEnrichedBySessionRef:null,representationSnapshots:[],currentRepresentationSnapshotRefs:{},applicationState:{}};
const store=createMemoryPrivateBetaProfessionalIdentityStore();await store.save({record});
const diagnostics=[];
const server=createPrivateBetaUiServer({locale:'it',professionalIdentityStore:store,contextIdFactory:()=>context,operatorDiagnosticsEnabled:true,backupExportDiagnosticStore:diagnostics});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`,cookie=`imago_beta_repeat_context=${context}`;
try{
  let r=await fetch(base+'/private-beta/profile-backup/export',{headers:{cookie}});
  assert.equal(r.status,200);assert.match(r.headers.get('content-type')||'',/application\/vnd\.imago\.profile-backup/);assert.match(r.headers.get('content-disposition')||'',/attachment; filename="[^"]+\.imago"/);assert.equal(r.headers.get('cache-control'),'no-store');
  const plain=Buffer.from(await r.arrayBuffer());assert(plain.length>0);assert.equal(inspectProfessionalProfileBackupEnvelope(plain).containerVersion,2);assert.equal(parseProfessionalProfileBackup(plain).schemaVersion,2);

  const password='passphrase sicura 2026';
  const form=new URLSearchParams({protected:'true',password,confirmPassword:password});
  r=await fetch(base+'/private-beta/profile-backup/export',{method:'POST',headers:{cookie,'content-type':'application/x-www-form-urlencoded'},body:form.toString()});
  assert.equal(r.status,200);assert.equal(r.headers.get('x-imago-backup-encrypted'),'true');assert.match(r.headers.get('content-disposition')||'',/\.imago"$/);
  const protectedBytes=Buffer.from(await r.arrayBuffer());assert(protectedBytes.length>0);assert.equal(inspectProfessionalProfileBackupEnvelope(protectedBytes).containerVersion,3);assert.equal(parseProfessionalProfileBackup(protectedBytes,{password}).security.encrypted,true);


  // Exact Candidate-facing exported bytes must round-trip through a fresh continuity environment.
  const freshContext='pd088b-first-corrective-fresh',freshPerson=privateBetaPersonRefFromContext(freshContext),freshStore=createMemoryPrivateBetaProfessionalIdentityStore();
  const freshServer=createPrivateBetaUiServer({locale:'it',professionalIdentityStore:freshStore,contextIdFactory:()=>freshContext});
  await new Promise(resolve=>freshServer.listen(0,'127.0.0.1',resolve));const freshBase=`http://127.0.0.1:${freshServer.address().port}`,freshCookie=`imago_beta_repeat_context=${freshContext}`;
  try{
    let rr=await fetch(freshBase+'/private-beta/profile-backup/preview',{method:'POST',headers:{cookie:freshCookie,'content-type':'application/vnd.imago.profile-backup'},body:plain});assert.equal(rr.status,200);
    rr=await fetch(freshBase+'/private-beta/profile-backup/restore',{method:'POST',headers:{cookie:freshCookie,'content-type':'application/vnd.imago.profile-backup'},body:plain});assert.equal(rr.status,200);assert.equal((await freshStore.load({personRef:freshPerson})).professionalSources[0].content,source.content);
    // Replace with the protected Candidate-facing file using its password.
    const b64=Buffer.from(password,'utf8').toString('base64');
    rr=await fetch(freshBase+'/private-beta/profile-backup/preview',{method:'POST',headers:{cookie:freshCookie,'content-type':'application/vnd.imago.profile-backup','x-imago-backup-password-b64':b64},body:protectedBytes});assert.equal(rr.status,200);
    rr=await fetch(freshBase+'/private-beta/profile-backup/restore',{method:'POST',headers:{cookie:freshCookie,'content-type':'application/vnd.imago.profile-backup','x-imago-backup-password-b64':b64,'x-imago-confirm-restore':'replace'},body:protectedBytes});assert.equal(rr.status,200);assert.equal((await freshStore.load({personRef:freshPerson})).professionalSources[0].content,source.content);
  } finally {await new Promise(resolve=>freshServer.close(resolve));}

  const mismatch=new URLSearchParams({protected:'true',password:'abcdefgh',confirmPassword:'abcdefgi'});
  r=await fetch(base+'/private-beta/profile-backup/export',{method:'POST',headers:{cookie,'content-type':'application/x-www-form-urlencoded'},body:mismatch.toString()});assert.equal(r.status,422);assert.equal((await r.json()).error,'PROFILE_BACKUP_PASSWORD_MISMATCH');

  r=await fetch(base+'/private-beta/operator/profile-backup-export-diagnostics',{headers:{cookie}});assert.equal(r.status,200);const d=(await r.json()).backupExportDiagnostics;assert(d.some(x=>x.stage==='response_ready'&&x.protected===false&&x.bytes>0));assert(d.some(x=>x.stage==='response_ready'&&x.protected===true&&x.containerVersion===3&&x.bytes>0));assert(d.some(x=>x.stage==='request_validation'&&x.failureKind==='password_validation'));assert.doesNotMatch(JSON.stringify(d),/passphrase sicura 2026|abcdefgh|Marco Rossi/);

  const html=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'backup'},identityAvailable:true,identitySummary:{professionalSources:[source],knowledgeCount:0}});
  assert.match(html,/response\.blob\(\)/);assert.match(html,/blob\.size<1/);assert.match(html,/downloadButton\.disabled=true/);assert.match(html,/a\.click\(\)/);assert.match(html,/setTimeout\(\(\)=>URL\.revokeObjectURL\(url\),1500\)/);assert.doesNotMatch(html,/a\.remove\(\);URL\.revokeObjectURL\(url\)/);assert.match(html,/Backup pronto per il download\./);
} finally {await new Promise(r=>server.close(r));}
console.log('PD-088B First Corrective Real Candidate Backup Download Delivery: PASS');
