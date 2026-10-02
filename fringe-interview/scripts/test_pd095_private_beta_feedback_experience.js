import assert from 'assert';
import {mkdtemp,rm,readFile} from 'fs/promises';
import {tmpdir} from 'os';
import {join} from 'path';
import {createPrivateBetaUiServer} from '../src/app/privateBetaUiServer.js';
import {createJsonlPrivateBetaFeedbackStore} from '../src/app/privateBetaContextualFeedback.js';
import {renderPrivateBetaUiJourneyHtml} from '../src/app/renderPrivateBetaUiJourneyHtml.js';

function expectGlobalFeedback(html){
 assert.match(html,/id="imago-beta-feedback-open"/);
 assert.match(html,/id="imago-beta-feedback-dialog"/);
 assert.match(html,/positive_value/);
 assert.match(html,/improvement/);
 assert.match(html,/overall/);
 assert.doesNotMatch(html,/name="cvText"[^>]*value=/);
}
for(const locale of ['it','en']){
 const landing=renderPrivateBetaUiJourneyHtml({locale,result:null,identityAvailable:true,identitySummary:{professionalSources:[],reusableKnowledgeResults:[]}});
 expectGlobalFeedback(landing);
 assert.match(landing,locale==='it'?/Grazie per aver scelto di provare la versione Beta di IMAGO/:/Thank you for choosing to try the Beta version of IMAGO/);
 const surfaces=[
  {phase:'profile'},
  {phase:'start',navigationTarget:'professional_representation_understand'},
  {phase:'start',navigationTarget:'professional_direction_explore'},
  {phase:'start',navigationTarget:'opportunity_application'},
  {phase:'start',navigationTarget:'professional_identity_build_enrich'},
  {phase:'start',navigationTarget:'interview_practice'}
 ];
 for(const result of surfaces)expectGlobalFeedback(renderPrivateBetaUiJourneyHtml({locale,result,identityAvailable:true,identitySummary:{professionalSources:[],reusableKnowledgeResults:[]}}));
}

const root=await mkdtemp(join(tmpdir(),'imago-pd095-'));
const file=join(root,'feedback.jsonl');
const feedbackStore=createJsonlPrivateBetaFeedbackStore({filePath:file});
const consentStore=new Map([['pd095-context',true]]);
let server=createPrivateBetaUiServer({locale:'it',feedbackStore,feedbackConsentStore:consentStore,contextIdFactory:()=> 'pd095-context',operatorDiagnosticsEnabled:true,buildVersion:'pd095-test'});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let base=`http://127.0.0.1:${server.address().port}`;
let r=await fetch(base+'/private-beta/beta-feedback',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({feedbackKind:'contextual',category:'positive_value',freeText:'Questa sintesi mi ha fatto notare un collegamento utile.',usefulness:'very',route:'/private-beta?purpose=professional_representation_understand',functionArea:'professional_representation',workflowStep:'purpose_understand',profileLoaded:'true',purpose:'professional_representation_understand',cvText:'MUST_NOT_STORE',jdText:'MUST_NOT_STORE',answer:'MUST_NOT_STORE'})});
assert.equal(r.status,201);let payload=await r.json();assert.equal(payload.saved,true);
r=await fetch(base+'/private-beta/beta-feedback',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({feedbackKind:'overall',route:'/private-beta',functionArea:'landing',workflowStep:'landing',profileLoaded:'true',overallUsefulness:'very',easeOfUnderstanding:'mixed',mostValuableFunction:'professional_representation',greatestDifficulty:'Capire un passaggio',sawProfessionalPathDifferently:'yes',improvementPriority:'Rendere più chiaro il primo ingresso',finalComment:'Esperienza utile'})});
assert.equal(r.status,201);await r.json();
r=await fetch(base+'/private-beta/operator/feedback');assert.equal(r.status,200);const data=await r.json();assert.equal(data.feedback.length,2);const first=data.feedback[0];assert.equal(first.category,'positive_value');assert.equal(first.freeText,'Questa sintesi mi ha fatto notare un collegamento utile.');assert.equal(first.betaSessionId,'pd095-context');assert.equal(first.route,'/private-beta?purpose=professional_representation_understand');assert.equal(first.functionArea,'professional_representation');assert.equal(first.buildVersion,'pd095-test');assert.equal(first.profileLoaded,true);assert.equal(first.personRef,null);for(const forbidden of ['cvText','jdText','answer','knowledge','professionalIdentity','password'])assert.equal(forbidden in first,false);
assert.equal(data.feedback[1].kind,'overall');assert.equal(data.feedback[1].overall.mostValuableFunction,'professional_representation');
r=await fetch(base+'/private-beta/operator/feedback?format=csv');assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/text\/csv/);const csv=await r.text();assert.match(csv,/positive_value/);assert.match(csv,/professional_representation/);
await new Promise(r=>server.close(r));
const raw=await readFile(file,'utf8');assert.equal(raw.trim().split(/\r?\n/).length,2);
const reopened=createJsonlPrivateBetaFeedbackStore({filePath:file});assert.equal((await reopened.list({betaSessionId:'pd095-context'})).length,2);

server=createPrivateBetaUiServer({locale:'it',feedbackStore,feedbackConsentStore:new Map(),contextIdFactory:()=> 'no-consent'});await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}`;
r=await fetch(base+'/private-beta/beta-feedback',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({feedbackKind:'contextual',category:'issue',freeText:'test',functionArea:'landing'})});assert.equal(r.status,403);assert.equal((await r.json()).error,'FEEDBACK_CONSENT_REQUIRED');await new Promise(r=>server.close(r));

const failingStore={async append(){throw new Error('disk full');},async list(){return [];}};
server=createPrivateBetaUiServer({locale:'it',feedbackStore:failingStore,feedbackConsentStore:new Map([['fail-context',true]]),contextIdFactory:()=> 'fail-context'});await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}`;
r=await fetch(base+'/private-beta/beta-feedback',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({feedbackKind:'contextual',category:'issue',freeText:'non salvare',functionArea:'landing'})});assert.equal(r.status,500);assert.equal((await r.json()).saved,false);await new Promise(r=>server.close(r));
await rm(root,{recursive:true,force:true});
console.log('PD-095 Private Beta Feedback Experience: PASS');
