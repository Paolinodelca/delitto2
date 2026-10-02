import assert from 'node:assert/strict';
import {createPrivateBetaUiServer} from '../src/app/privateBetaUiServer.js';
import {createMemoryPrivateBetaProfessionalIdentityStore,privateBetaPersonRefFromContext,attachPrivateBetaProfessionalSourceAsset} from '../src/app/privateBetaProfessionalIdentityContinuity.js';
import {buildProfessionalSourceAsset} from '../src/app/privateBetaProfessionalSourceAssets.js';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';
import {renderApplicationDocumentPdf} from '../src/app/opportunityApplication/renderApplicationDocumentPdf.js';

const person=privateBetaPersonRefFromContext('pd091');
const sources=[
 {id:'current_cv',type:'text',label:'Current CV',sourceRole:'current_cv',content:'Marco Rossi — Production Supervisor presso Alfa S.p.A. dal 2022. Coordinamento di 10 persone e miglioramento KPI di linea.',metadata:{role:'Production Supervisor'},provenance:{origin:'current_cv',providedBy:'user'}},
 {id:'previous_cv',type:'text',label:'Previous CV',sourceRole:'previous_cv',content:'Process Engineer presso Beta S.p.A., 2018–2022. Industrializzazione e avviamento linee.',metadata:{role:'Process Engineer'},provenance:{origin:'previous_cv',providedBy:'user'}},
 {id:'professional_declaration',type:'text',label:'Professional declaration',sourceRole:'professional_declaration',content:'Ho seguito progetti trasversali tra produzione, qualità e manutenzione.',provenance:{origin:'user_declaration',providedBy:'user'}},
 {id:'professional_declaration_2',type:'text',label:'Professional declaration',sourceRole:'professional_declaration',content:'Esperienza aggiunta: supporto tecnico a RFQ e revisioni con stakeholder interni.',provenance:{origin:'user_declaration',providedBy:'user'}}
];
const dm={type:'application_document_model',documentType:'cv',generatedAt:'2026-10-01T08:00:00Z',sections:[{kind:'cv_header',blocks:[{kind:'candidate_name',text:'Marco Rossi'}]}]};
const pdf=renderApplicationDocumentPdf({documentModel:dm});
const asset=buildProfessionalSourceAsset({sourceRef:'current_cv',originalFilename:'Marco_Rossi_CV.pdf',mimeType:'application/pdf',bytes:pdf});
let record={version:'1.0',type:'private_beta_professional_identity_continuity',professionalIdentityRef:`professionalIdentity:${person.id}`,personRef:person,owner:'person',authorizedMaterials:{cvText:sources[0].content,userNotes:''},professionalSources:sources,sourceAssets:[],reusableKnowledgeResults:[],knowledgeRefs:[],revision:1,createdAt:'2026-10-01T08:00:00Z',updatedAt:'2026-10-01T08:00:00Z',lastEnrichedBySessionRef:null,representationSnapshots:[],currentRepresentationSnapshotRefs:{},applicationState:{}};
record=attachPrivateBetaProfessionalSourceAsset({priorRecord:record,sourceAsset:asset,now:'2026-10-01T08:01:00Z'});

const summary={professionalSources:record.professionalSources,sourceAssets:record.sourceAssets.map(a=>({assetId:a.assetId,sourceRefs:a.sourceRefs,originalFilename:a.originalFilename,mimeType:a.mimeType,byteSize:a.byteSize})),knowledgeCount:3,portableRestore:null};
const html=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'profile'},identityAvailable:true,identitySummary:summary});
assert.match(html,/Materiali professionali nel profilo/);
assert.equal((html.match(/class="profile-material-card"/g)||[]).length,4);
assert.match(html,/Marco_Rossi_CV\.pdf/);
assert.match(html,/Production Supervisor presso Alfa/);
assert.match(html,/Scarica originale/);
assert.match(html,/File originale non disponibile per questo materiale/);
assert.match(html,/Origine del profilo:<\/strong> continuità locale/);
const backupHtml=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'backup'},identityAvailable:true,identitySummary:summary});
assert.match(backupHtml,/Protezione del backup/);
assert.match(backupHtml,/profile-protection-option/);
assert.match(backupHtml,/Preparazione del backup/);
assert.match(backupHtml,/Profilo IMAGO ripristinato correttamente/);
assert.doesNotMatch(html,/>sourceRef</i);
assert.doesNotMatch(html,/>materialRef</i);
assert.doesNotMatch(html,/>sha256</i);

const imported=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'profile'},identityAvailable:true,identitySummary:{...summary,portableRestore:{imported:true}}});
assert.match(imported,/Origine del profilo:<\/strong> backup importato/);
assert.match(imported,/Gestisci backup del profilo/);

const store=createMemoryPrivateBetaProfessionalIdentityStore();await store.save({record});const server=createPrivateBetaUiServer({locale:'it',professionalIdentityStore:store,contextIdFactory:()=> 'pd091'});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`,cookie='imago_beta_repeat_context=pd091';
try{
 let response=await fetch(base+`/private-beta/profile-source/download?assetId=${encodeURIComponent(asset.assetId)}`,{headers:{cookie}});assert.equal(response.status,200);assert.equal(Buffer.from(await response.arrayBuffer()).compare(pdf),0);assert.match(response.headers.get('content-disposition'),/Marco_Rossi_CV\.pdf/);
 response=await fetch(base+'/private-beta/profile-backup/export',{headers:{cookie}});const backup=Buffer.from(await response.arrayBuffer());
 const freshStore=createMemoryPrivateBetaProfessionalIdentityStore();const freshPerson=privateBetaPersonRefFromContext('pd091-fresh');const freshServer=createPrivateBetaUiServer({locale:'it',professionalIdentityStore:freshStore,contextIdFactory:()=> 'pd091-fresh'});await new Promise(r=>freshServer.listen(0,'127.0.0.1',r));const fresh=`http://127.0.0.1:${freshServer.address().port}`,freshCookie='imago_beta_repeat_context=pd091-fresh';
 try{
  response=await fetch(fresh+'/private-beta/profile-backup/preview',{method:'POST',headers:{cookie:freshCookie,'content-type':'application/vnd.imago.profile-backup'},body:backup});const preview=await response.json();assert.equal(response.status,200);assert.equal(preview.sourceCount,4);assert.equal(preview.knowledgeCount,0);assert(preview.materialLabels.length>=4);
  response=await fetch(fresh+'/private-beta/profile-backup/restore',{method:'POST',headers:{cookie:freshCookie,'content-type':'application/vnd.imago.profile-backup'},body:backup});assert.equal(response.status,200);
  const restored=await freshStore.load({personRef:freshPerson});assert.equal(restored.professionalSources.length,4);assert.equal(restored.sourceAssets.length,1);assert.equal(restored.portableRestore?.imported,true);
  response=await fetch(fresh+'/private-beta/profile',{headers:{cookie:freshCookie}});const restoredHtml=await response.text();assert.match(restoredHtml,/backup importato/);assert.equal((restoredHtml.match(/class="profile-material-card"/g)||[]).length,4);
 } finally {await new Promise(r=>freshServer.close(r));}
} finally {await new Promise(r=>server.close(r));}

console.log('PD-091 Candidate-facing Profile Material Transparency: PASS');
