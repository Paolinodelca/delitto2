import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createPrivateBetaUiServer} from '../src/app/privateBetaUiServer.js';
import {createMemoryPrivateBetaProfessionalIdentityStore,privateBetaPersonRefFromContext} from '../src/app/privateBetaProfessionalIdentityContinuity.js';
import {inspectProfessionalProfileBackupEnvelope,parseProfessionalProfileBackup} from '../src/app/privateBetaProfessionalProfileBackup.js';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';

const it=JSON.parse(readFileSync('config/private_beta_ui.it.json','utf8'));
const contextId='pd088b-third-corrective';
const personRef=privateBetaPersonRefFromContext(contextId);
const source={id:'current-cv',type:'text',sourceRole:'current_cv',content:'Marco Rossi. Production Supervisor.',metadata:{candidateName:'Marco Rossi',originalFilename:'Marco_Rossi_CV.docx'},provenance:{origin:'candidate_upload',providedBy:'user'}};
const record={version:'1.0',type:'private_beta_professional_identity_continuity',professionalIdentityRef:`professionalIdentity:${personRef.id}`,personRef,owner:'person',authorizedMaterials:{cvText:source.content},professionalSources:[source],sourceAssets:[],reusableKnowledgeResults:[],knowledgeRefs:[],revision:1,createdAt:'2026-09-30T15:00:00Z',updatedAt:'2026-09-30T15:00:00Z',lastEnrichedBySessionRef:null,representationSnapshots:[],currentRepresentationSnapshotRefs:{},applicationState:{}};
const store=createMemoryPrivateBetaProfessionalIdentityStore();await store.save({record});
const diagnostics=[];
const server=createPrivateBetaUiServer({locale:'it',professionalIdentityStore:store,contextIdFactory:()=>contextId,operatorDiagnosticsEnabled:true,backupExportDiagnosticStore:diagnostics});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`,cookie=`imago_beta_repeat_context=${contextId}`;

function buildBrowserHarness(html,{statusPresent=true,urlSearchParams=URLSearchParams}={}){
  const scripts=[...html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
  const bootstrap=scripts.find(x=>x.includes("click_received")&&x.includes("/private-beta/profile-backup/export"));
  assert(bootstrap,'real rendered profile-backup bootstrap must exist');
  new vm.Script(bootstrap,{filename:'profile-backup-bootstrap.js'}); // syntax proof

  class FakeElement{
    constructor(id=''){this.id=id;this.dataset={};this.disabled=false;this.checked=false;this.value='';this.hidden=false;this.style={};this.files=[];this.textContent=id==='profile-backup-download'?it.profileBackupDownload:'';this.download='';this.href='';this.rel='';this.attributes={};}
    closest(selector){return selector===`#${this.id}`?this:null;}
    click(){this.clicked=(this.clicked||0)+1;}
    remove(){this.removed=true;}
    setAttribute(name,value){this.attributes[name]=value;}
  }
  const elements=new Map();
  for(const id of ['profile-backup-download','profile-backup-protect','profile-backup-password','profile-backup-password-confirm','profile-backup-password-fields','profile-backup-import','profile-backup-file','profile-backup-import-password-wrap','profile-backup-import-password']){
    elements.set(id,new FakeElement(id));
  }
  if(statusPresent)elements.set('profile-backup-status',new FakeElement('profile-backup-status'));

  const listeners={},blobUrls=new Map(),downloads=[],clientDiagnostics=[];
  const document={
    getElementById:id=>elements.get(id)||null,
    addEventListener:(type,fn)=>{(listeners[type]??=[]).push(fn);},
    createElement:tag=>{const el=new FakeElement(tag);if(tag==='a')el.click=()=>downloads.push({href:el.href,download:el.download});return el;},
    body:{appendChild(node){node.appended=true;}}
  };
  let seq=0;
  const URLShim={
    createObjectURL(blob){const u=`blob:imago-${++seq}`;blobUrls.set(u,blob);return u;},
    revokeObjectURL(){}
  };
  const routedFetch=async(url,options={})=>{
    const headers={...(options.headers||{}),cookie};
    return fetch(url.startsWith('http')?url:base+url,{...options,headers});
  };
  const consoleShim={...console,info:(label,payload)=>{clientDiagnostics.push({label,payload});}};
  const context={
    document,
    window:{setTimeout:fn=>{fn();return 1;},IMAGO_OPERATOR_DIAGNOSTICS:true,console:consoleShim,confirm:()=>true},
    Element:FakeElement,
    fetch:routedFetch,
    URL:URLShim,
    URLSearchParams:urlSearchParams,
    TextEncoder,
    btoa:s=>Buffer.from(s,'binary').toString('base64'),
    localStorage:{setItem(){}},
    location:{reload(){}},
    console:consoleShim
  };
  vm.runInNewContext(bootstrap,context,{filename:'profile-backup-bootstrap.js'});
  return {bootstrap,elements,listeners,blobUrls,downloads,clientDiagnostics};
}

try{
  const html=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'backup'},identityAvailable:true,identitySummary:{professionalSources:[source],reusableKnowledgeResults:[],knowledgeCount:0}});
  const sectionMatch=/<section id="profile-backup">([\s\S]*?)<\/section>/.exec(html);
  assert(sectionMatch);
  assert.match(html,/Salva o ripristina il tuo profilo IMAGO/);
  assert.equal((html.match(/id="profile-backup-status"/g)||[]).length,1,'status target must exist exactly once');
  assert.match(sectionMatch[0],/accept="\.imago,/);

  const h=buildBrowserHarness(html);
  assert.equal(h.listeners.click.length,1);
  assert.equal(h.listeners.change.length,1);
  assert.match(h.bootstrap,/validation_started/);
  assert.match(h.bootstrap,/validation_passed/);
  assert.match(h.bootstrap,/export_ui_started/);
  assert.match(h.bootstrap,/fetch_started/);
  assert.match(h.bootstrap,/client_exception/);

  const button=h.elements.get('profile-backup-download'),protect=h.elements.get('profile-backup-protect'),password=h.elements.get('profile-backup-password'),confirmation=h.elements.get('profile-backup-password-confirm'),status=h.elements.get('profile-backup-status');

  // A — unprotected real markup: no password validation, preparation before POST, v2.
  protect.checked=false;
  let event={target:button,preventDefault(){this.prevented=true;}};
  const beforeUnprotected=diagnostics.length;
  const plainPromise=h.listeners.click[0](event);
  assert.equal(status.textContent,it.profileBackupPreparing);
  await plainPromise;
  assert.equal(event.prevented,true);
  assert.equal(h.downloads.length,1);
  assert.match(h.downloads[0].download,/\.imago$/);
  const plain=Buffer.from(await h.blobUrls.get(h.downloads[0].href).arrayBuffer());
  assert.equal(inspectProfessionalProfileBackupEnvelope(plain).containerVersion,2);
  assert(diagnostics.slice(beforeUnprotected).some(x=>x.boundary==='portable_profile_backup_export'&&x.stage==='request_received'&&x.protected===false));
  assert(diagnostics.slice(beforeUnprotected).some(x=>x.stage==='response_ready'&&x.protected===false));

  // B — protected real markup: valid password -> preparation -> POST -> v3.
  protect.checked=true;password.value='passphrase sicura 2026';confirmation.value=password.value;
  const beforeProtected=diagnostics.length;
  const protectedPromise=h.listeners.click[0]({target:button,preventDefault(){}});
  assert.equal(status.textContent,it.profileBackupPreparing);
  await protectedPromise;
  assert.equal(h.downloads.length,2);
  const protectedBytes=Buffer.from(await h.blobUrls.get(h.downloads[1].href).arrayBuffer());
  assert.equal(inspectProfessionalProfileBackupEnvelope(protectedBytes).containerVersion,3);
  assert.equal(parseProfessionalProfileBackup(protectedBytes,{password:password.value}).security.encrypted,true);
  assert(diagnostics.slice(beforeProtected).some(x=>x.boundary==='portable_profile_backup_export'&&x.stage==='request_received'&&x.protected===true));
  assert(diagnostics.slice(beforeProtected).some(x=>x.stage==='response_ready'&&x.protected===true));

  // C — too short -> visible validation, no POST.
  const beforeShort=diagnostics.length;
  password.value='short';confirmation.value='short';
  await h.listeners.click[0]({target:button,preventDefault(){}});
  assert.equal(status.textContent,it.profileBackupPasswordTooShort);
  assert.equal(diagnostics.length,beforeShort);

  // D — mismatch -> visible validation, no POST.
  const beforeMismatch=diagnostics.length;
  password.value='passphrase sicura 2026';confirmation.value='diversa';
  await h.listeners.click[0]({target:button,preventDefault(){}});
  assert.equal(status.textContent,it.profileBackupPasswordMismatch);
  assert.equal(diagnostics.length,beforeMismatch);

  // E — missing status target cannot fail silently: visible fallback on button.
  const missingStatus=buildBrowserHarness(html,{statusPresent:false});
  const mb=missingStatus.elements.get('profile-backup-download'),mp=missingStatus.elements.get('profile-backup-protect');
  mp.checked=false;
  await missingStatus.listeners.click[0]({target:mb,preventDefault(){}});
  assert.ok(mb.textContent.length>0);
  assert.equal(mb.attributes['data-imago-status-fallback'],'true');

  // F — unexpected client exception after validation is bounded and visible, with no password in diagnostics.
  class ExplodingParams{constructor(){throw new TypeError('bounded URLSearchParams construction failure');}}
  const failure=buildBrowserHarness(html,{urlSearchParams:ExplodingParams});
  const fb=failure.elements.get('profile-backup-download'),fp=failure.elements.get('profile-backup-protect'),fs=failure.elements.get('profile-backup-status');
  fp.checked=false;
  await failure.listeners.click[0]({target:fb,preventDefault(){}});
  assert.equal(fs.textContent,it.profileBackupExportFailed);
  const clientFailure=failure.clientDiagnostics.find(x=>x.payload?.stage==='client_exception');
  assert(clientFailure);
  assert.equal(clientFailure.payload.protected,false);
  assert(!JSON.stringify(failure.clientDiagnostics).includes('passphrase sicura 2026'));

  // G — stable delegation / rerender contract: one document listener, no per-button listener.
  assert.equal(h.listeners.click.length,1);
  assert.doesNotMatch(h.bootstrap,/downloadButton\.addEventListener/);

  // H — import picker still selects .imago.
  assert.match(sectionMatch[0],/accept="\.imago,application\/json,application\/vnd\.imago\.profile-backup,application\/vnd\.imago\.profile-backup\+json"/);

  // Client diagnostic stage ordering exists and never logs the password.
  const stages=h.clientDiagnostics.map(x=>x.payload?.stage).filter(Boolean);
  for(const stage of ['click_received','validation_started','validation_passed','export_ui_started','fetch_started','response_received','blob_created','download_triggered','completed']){
    assert(stages.includes(stage),`missing client stage ${stage}`);
  }
  assert(!JSON.stringify(h.clientDiagnostics).includes('passphrase sicura 2026'));

  console.log('PD-088B Third Corrective Real Backup Export Client Validation -> Fetch Completion: PASS');
} finally {
  await new Promise(r=>server.close(r));
}
