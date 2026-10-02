import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createPrivateBetaUiServer} from '../src/app/privateBetaUiServer.js';
import {createMemoryPrivateBetaProfessionalIdentityStore,privateBetaPersonRefFromContext} from '../src/app/privateBetaProfessionalIdentityContinuity.js';
import {inspectProfessionalProfileBackupEnvelope,parseProfessionalProfileBackup} from '../src/app/privateBetaProfessionalProfileBackup.js';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';

const it=JSON.parse(readFileSync('config/private_beta_ui.it.json','utf8'));
const en=JSON.parse(readFileSync('config/private_beta_ui.en.json','utf8'));
const contextId='pd088b-second-corrective';
const personRef=privateBetaPersonRefFromContext(contextId);
const source={id:'current-cv',type:'text',sourceRole:'current_cv',content:'Marco Rossi. Production Supervisor.',metadata:{candidateName:'Marco Rossi',originalFilename:'Marco_Rossi_CV.docx'},provenance:{origin:'candidate_upload',providedBy:'user'}};
const record={version:'1.0',type:'private_beta_professional_identity_continuity',professionalIdentityRef:`professionalIdentity:${personRef.id}`,personRef,owner:'person',authorizedMaterials:{cvText:source.content},professionalSources:[source],sourceAssets:[],reusableKnowledgeResults:[],knowledgeRefs:[],revision:1,createdAt:'2026-09-30T15:00:00Z',updatedAt:'2026-09-30T15:00:00Z',lastEnrichedBySessionRef:null,representationSnapshots:[],currentRepresentationSnapshotRefs:{},applicationState:{}};
const store=createMemoryPrivateBetaProfessionalIdentityStore();await store.save({record});
const diagnostics=[];
const server=createPrivateBetaUiServer({locale:'it',professionalIdentityStore:store,contextIdFactory:()=>contextId,operatorDiagnosticsEnabled:true,backupExportDiagnosticStore:diagnostics});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`,cookie=`imago_beta_repeat_context=${contextId}`;

try{
  const html=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'backup'},identityAvailable:true,identitySummary:{professionalSources:[source],reusableKnowledgeResults:[],knowledgeCount:0}});
  const sectionMatch=/<section id="profile-backup">([\s\S]*?)<\/section>/.exec(html);
  assert(sectionMatch);
  assert.doesNotMatch(sectionMatch[0],/<script>/,'profile fragment must contain markup only');
  assert.match(sectionMatch[0],/id="profile-backup-download"/);
  assert.match(sectionMatch[0],/accept="\.imago,/);

  const scripts=[...html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
  const bootstrap=scripts.find(x=>x.includes('button_click_received')&&x.includes('/private-beta/profile-backup/export'));
  assert(bootstrap,'stable profile backup bootstrap script must be rendered outside the fragment');
  assert.match(bootstrap,/document\.addEventListener\('click'/);
  assert.match(bootstrap,/document\.addEventListener\('change'/);
  assert.doesNotMatch(bootstrap,/downloadButton\.addEventListener\('click'/);
  assert.equal(it.profileBackupPreparing,'Preparazione del backup…');
  assert.equal(en.profileBackupPreparing,'Preparing backup…');

  class FakeElement {
    constructor(id=''){this.id=id;this.dataset={};this.disabled=false;this.checked=false;this.value='';this.hidden=false;this.style={};this.files=[];this.textContent='';this.download='';this.href='';this.rel='';}
    closest(selector){return selector===`#${this.id}`?this:null;}
    click(){this.clicked=(this.clicked||0)+1;}
    remove(){this.removed=true;}
  }
  const elements=new Map();
  for(const id of ['profile-backup-download','profile-backup-status','profile-backup-protect','profile-backup-password','profile-backup-password-confirm','profile-backup-password-fields','profile-backup-import','profile-backup-file','profile-backup-import-password-wrap','profile-backup-import-password']){
    elements.set(id,new FakeElement(id));
  }
  const listeners={},blobUrls=new Map(),downloads=[];
  const document={
    getElementById:id=>elements.get(id)||null,
    addEventListener:(type,fn)=>{(listeners[type]??=[]).push(fn);},
    createElement:tag=>{const el=new FakeElement(tag);if(tag==='a')el.click=()=>downloads.push({href:el.href,download:el.download});return el;},
    body:{appendChild(node){node.appended=true;}}
  };
  let seq=0;
  const URLShim={
    createObjectURL(blob){const u=`blob:imago-${++seq}`;blobUrls.set(u,blob);return u;},
    revokeObjectURL(url){/* delayed cleanup is intentionally observable but not needed by test */ }
  };
  const routedFetch=async(url,options={})=>{
    const headers={...(options.headers||{}),cookie};
    return fetch(url.startsWith('http')?url:base+url,{...options,headers});
  };
  const context={
    document,
    window:{setTimeout:fn=>{fn();return 1;},IMAGO_OPERATOR_DIAGNOSTICS:false,console,confirm:()=>true},
    Element:FakeElement,
    fetch:routedFetch,
    URL:URLShim,
    URLSearchParams,
    TextEncoder,
    btoa:s=>Buffer.from(s,'binary').toString('base64'),
    localStorage:{setItem(){}},
    location:{reload(){}},
    console
  };
  vm.runInNewContext(bootstrap,context,{filename:'profile-backup-bootstrap.js'});
  assert.equal(listeners.click.length,1,'one delegated click listener only');
  assert.equal(listeners.change.length,1,'one delegated change listener only');

  const button=elements.get('profile-backup-download'),protect=elements.get('profile-backup-protect'),password=elements.get('profile-backup-password'),confirm=elements.get('profile-backup-password-confirm'),status=elements.get('profile-backup-status');

  // A/B/C: real rendered handler -> real HTTP POST -> v2 file.
  protect.checked=false;
  let event={target:button,preventDefault(){this.prevented=true;}};
  const unprotectedPromise=listeners.click[0](event);
  assert.equal(status.textContent,'Preparazione del backup…','feedback must be immediate before network completion');
  await unprotectedPromise;
  assert.equal(event.prevented,true);
  assert.equal(downloads.length,1);
  assert.match(downloads[0].download,/\.imago$/);
  const plain=Buffer.from(await blobUrls.get(downloads[0].href).arrayBuffer());
  assert.equal(inspectProfessionalProfileBackupEnvelope(plain).containerVersion,2);
  assert.equal(parseProfessionalProfileBackup(plain).schemaVersion,2);
  assert.match(status.textContent,/^Backup pronto per il download/);

  // D: protected real UI path -> real POST -> v3 file.
  protect.checked=true;password.value='passphrase sicura 2026';confirm.value=password.value;
  await listeners.click[0]({target:button,preventDefault(){}});
  assert.equal(downloads.length,2);
  const protectedBytes=Buffer.from(await blobUrls.get(downloads[1].href).arrayBuffer());
  assert.equal(inspectProfessionalProfileBackupEnvelope(protectedBytes).containerVersion,3);
  assert.equal(parseProfessionalProfileBackup(protectedBytes,{password:password.value}).security.encrypted,true);

  // Password mismatch stays client-side: no new request/download.
  const diagnosticCountBefore=diagnostics.length;
  confirm.value='diversa';
  await listeners.click[0]({target:button,preventDefault(){}});
  assert.equal(downloads.length,2);
  assert.equal(diagnostics.length,diagnosticCountBefore);
  assert.equal(status.textContent,it.profileBackupPasswordMismatch);

  // Mandatory server proof: UI-triggered POST emitted request_received for both modes.
  assert(diagnostics.some(x=>x.boundary==='portable_profile_backup_export'&&x.stage==='request_received'&&x.protected===false));
  assert(diagnostics.some(x=>x.boundary==='portable_profile_backup_export'&&x.stage==='request_received'&&x.protected===true));
  assert(diagnostics.some(x=>x.stage==='response_ready'&&x.protected===false&&x.bytes>0));
  assert(diagnostics.some(x=>x.stage==='response_ready'&&x.protected===true&&x.containerVersion===3&&x.bytes>0));

  // Stable delegation means rerendered controls reuse one document listener; no per-element duplicate binding.
  assert.equal(listeners.click.length,1);
  assert.match(bootstrap,/dataset\.imagoExportBusy==='true'/);
  assert.match(bootstrap,/URL\.createObjectURL\(blob\)/);
  assert.match(bootstrap,/a\.click\(\)/);
  assert.match(bootstrap,/setTimeout\(\(\)=>URL\.revokeObjectURL\(url\),1500\)/);

  // .imago is explicitly selectable; extension cannot be the pre-request blocker.
  assert.match(sectionMatch[0],/accept="\.imago,application\/json,application\/vnd\.imago\.profile-backup,application\/vnd\.imago\.profile-backup\+json"/);

  console.log('PD-088B Second Corrective Real Profile Backup Export UI Event Wiring: PASS');
} finally {
  await new Promise(r=>server.close(r));
}
