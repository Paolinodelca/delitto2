import assert from 'assert';
import {createPrivateBetaUiServer} from '../src/app/privateBetaUiServer.js';

const providerFailure=async({task})=>{
  const e=new Error(`Groq provider request failed for ${task} with status 429.`);
  e.status=429;e.task=task;e.providerDiagnostic={failureKind:'rate_limit',providerCode:'rate_limit_exceeded',providerType:'rate_limit_error',providerMessage:'Provider rate limit reached.'};
  throw e;
};
const diagnostics=[];
const server=createPrivateBetaUiServer({operatorDiagnosticsEnabled:true,preparationDiagnosticStore:diagnostics,journeyOptions:{modelAdapter:providerFailure}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
try{
  const form=new URLSearchParams({identityAction:'create',workingMode:'independent',consentDecision:'accept',targetRole:'Operations Manager',jdText:'Operations Manager responsibilities',cvText:'Marco Bianchi Production Supervisor',previousCvText:'Industrialization Engineer Germany production line launch',professionalDeclaration:'Project Atlas supplier ramp-up',userNotes:'cross-functional operations'});
  const post=await fetch(base+'/private-beta/journey',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:form});
  assert.equal(post.status,422);
  const html=await post.text();assert(html.includes('Non è stato possibile'));
  const normal=await fetch(base+'/private-beta/operator/preparation-diagnostics');assert.equal(normal.status,200);
  const payload=await normal.json();assert(payload.preparationDiagnostics.length>=2);
  const provider=payload.preparationDiagnostics.find(x=>x.boundary==='model_adapter');assert(provider);
  assert.equal(provider.stage,'provider_model_call');assert.equal(provider.task,'candidateProfile');assert.equal(provider.errorClass,'provider');assert.equal(provider.failureKind,'rate_limit');assert.equal(provider.httpStatus,429);assert.equal(provider.providerCode,'rate_limit_exceeded');
  const serialized=JSON.stringify(payload);assert(!serialized.includes('Marco Bianchi'));assert(!serialized.includes('Industrialization Engineer'));assert(!serialized.includes('Project Atlas'));
} finally {await new Promise(r=>server.close(r));}
const gated=createPrivateBetaUiServer({operatorDiagnosticsEnabled:false,preparationDiagnosticStore:diagnostics});await new Promise(r=>gated.listen(0,'127.0.0.1',r));
try{const r=await fetch(`http://127.0.0.1:${gated.address().port}/private-beta/operator/preparation-diagnostics`);assert.equal(r.status,404);}finally{await new Promise(r=>gated.close(r));}
console.log('EAR second corrective provider preparation diagnostics PASS');
