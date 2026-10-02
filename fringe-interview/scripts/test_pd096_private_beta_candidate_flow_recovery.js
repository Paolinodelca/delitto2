import assert from 'node:assert/strict';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';
import {createPrivateBetaUiServer} from '../src/app/privateBetaUiServer.js';
import {createMemoryPrivateBetaProfessionalIdentityStore,privateBetaPersonRefFromContext} from '../src/app/privateBetaProfessionalIdentityContinuity.js';

const person=privateBetaPersonRefFromContext('pd096');
const source={id:'current-cv',type:'text',sourceRole:'current_cv',content:'Production Supervisor. Coordinamento attività produttive.',metadata:{},provenance:{origin:'candidate'}};
const knowledge={semanticType:'continuing_people_responsibility',semanticPolicyRef:'policy:people',knowledgeSnapshot:{id:'k1',subjectRef:person},knowledgeRef:'knowledgeSnapshot:k1'};
const record={version:'1.0',type:'private_beta_professional_identity_continuity',professionalIdentityRef:`professionalIdentity:${person.id}`,personRef:person,owner:'person',authorizedMaterials:{cvText:source.content,userNotes:''},professionalSources:[source],sourceAssets:[],reusableKnowledgeResults:[knowledge],knowledgeRefs:[knowledge.knowledgeRef],revision:2,createdAt:'2026-10-01T10:00:00Z',updatedAt:'2026-10-02T08:00:00Z',lastEnrichedBySessionRef:null,representationSnapshots:[],currentRepresentationSnapshotRefs:{},applicationState:{careerPreferenceContext:{candidateDeclared:true,preferenceState:'declared',preferredThemes:['operations']}}};
const summary={professionalSources:[source],sourceAssets:[],reusableKnowledgeResults:[knowledge],knowledgeCount:1,careerPreferenceContext:record.applicationState.careerPreferenceContext,revision:2,activePurpose:'',portableRestore:null};

const landing=renderPrivateBetaUiJourneyHtml({locale:'it',identityAvailable:true,identitySummary:summary});
assert.match(landing,/class="imago-beta-feedback-entry"/);
assert.match(landing,/>Backup</);
assert.match(landing,/landing-functions-primary/);
assert.doesNotMatch(landing,/contextual-feedback/);

const profile=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'profile'},identityAvailable:true,identitySummary:summary});
assert.match(profile,/profile-summary-first/);
assert.match(profile,/profile-overview-section/);
assert.match(profile,/Gestisci backup del profilo/);
assert.doesNotMatch(profile,/id="profile-backup"/);
assert.match(profile,/class="imago-beta-feedback-entry"/);

const backup=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'backup'},identityAvailable:true,identitySummary:summary});
assert.match(backup,/Salva o ripristina il tuo profilo IMAGO/);
assert.match(backup,/id="profile-backup"/);
assert.match(backup,/profile-backup\/export/);
assert.match(backup,/class="imago-beta-feedback-entry"/);
assert.match(backup,/aria-current="page"[^>]*>Backup<|>Backup<[^]*aria-current="page"/);

const interviewEntry=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'start',navigationTarget:'interview_practice'},identityAvailable:true,identitySummary:summary});
assert.match(interviewEntry,/name="targetRole"[^>]*required/);
assert.match(interviewEntry,/name="jdText"[^>]*required/);
assert.doesNotMatch(interviewEntry,/id="imago-product-landing"/);

const enrichResult=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'purpose_build_enrich',productPurpose:'professional_identity_build_enrich',enrichmentOutcome:{changed:false,knowledgeCreated:false},preInterview:{sourceGroundedProjection:[],professionalIdentityContinuity:{reusedKnowledgeCount:1}}},identityAvailable:true,identitySummary:summary});
assert.match(enrichResult,/Risultato dell.arricchimento/);
assert.match(enrichResult,/non ha aggiunto un nuovo elemento professionale/);
assert.match(enrichResult,/non diventano automaticamente conoscenza professionale confermata/);
assert.doesNotMatch(enrichResult,/id="imago-product-landing"/);

const enrichFailure=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'start',navigationTarget:'professional_identity_build_enrich',error:{code:'UNEXPECTED_ERROR'}},identityAvailable:true,identitySummary:summary});
assert.match(enrichFailure,/function-entry-enrich/);
assert.match(enrichFailure,/beta-result|function-entry-error/);
assert.doesNotMatch(enrichFailure,/id="imago-product-landing"/);

const store=createMemoryPrivateBetaProfessionalIdentityStore();await store.save({record});
let server=createPrivateBetaUiServer({locale:'it',professionalIdentityStore:store,contextIdFactory:()=> 'pd096'});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`,cookie='imago_beta_repeat_context=pd096';
let response=await fetch(base+'/private-beta/backup',{headers:{cookie}});assert.equal(response.status,200);const backupHtml=await response.text();assert.match(backupHtml,/Salva o ripristina il tuo profilo IMAGO/);
response=await fetch(base+'/private-beta/profile-backup/export',{headers:{cookie}});assert.equal(response.status,200);assert.match(response.headers.get('content-disposition'),/IMAGO_backup_\d{4}-\d{2}-\d{2}_\d{4}\.imago/);assert.equal(response.headers.get('x-imago-backup-schema-version'),'2');assert.equal(response.headers.get('x-imago-backup-material-count'),'1');assert.equal(response.headers.get('x-imago-backup-knowledge-count'),'1');const bytes=Buffer.from(await response.arrayBuffer());
await new Promise(r=>server.close(r));

const fresh=createMemoryPrivateBetaProfessionalIdentityStore();server=createPrivateBetaUiServer({locale:'it',professionalIdentityStore:fresh,contextIdFactory:()=> 'pd096-fresh'});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base2=`http://127.0.0.1:${server.address().port}`,cookie2='imago_beta_repeat_context=pd096-fresh';
response=await fetch(base2+'/private-beta/profile-backup/restore',{method:'POST',headers:{cookie:cookie2,'content-type':'application/vnd.imago.profile-backup'},body:bytes});assert.equal(response.status,200);const restored=await response.json();assert.equal(restored.sourceCount,1);assert.equal(restored.knowledgeCount,1);assert.equal(restored.sourceAssetCount,0);assert.equal(restored.preferencePresent,true);assert.ok(restored.backupCreatedAt);
await new Promise(r=>server.close(r));

console.log('PD-096 Private Beta Candidate Flow Recovery: PASS');
