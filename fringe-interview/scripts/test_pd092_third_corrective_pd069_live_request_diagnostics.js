import assert from 'node:assert/strict';
import { runGroqChatCompletion } from '../src/infrastructure/groq/runGroqChatCompletion.js';
import { GROUNDED_RELATIONSHIP_PROPOSAL_SCHEMA } from '../src/infrastructure/groq/runGroqGroundedRelationshipProposalModel.js';
import { buildGroqRequestBody, closeJsonSchemaObjects, DEFAULT_GROQ_MODEL } from '../src/infrastructure/groq/groqModelCompatibility.js';
import { createLiveGroundedRelationshipProposalProviders } from '../src/app/liveGroundedRelationshipProposalProvider.js';

function validateStrictObjects(node,path='$',errors=[]){
  if(Array.isArray(node)){node.forEach((x,i)=>validateStrictObjects(x,`${path}[${i}]`,errors));return errors;}
  if(!node||typeof node!=='object')return errors;
  if(node.type==='object'&&node.properties){
    const props=Object.keys(node.properties), required=Array.isArray(node.required)?node.required:[];
    if(node.additionalProperties!==false)errors.push(`${path}:additionalProperties`);
    for(const key of props)if(!required.includes(key))errors.push(`${path}:optional:${key}`);
    for(const [key,value] of Object.entries(node.properties))validateStrictObjects(value,`${path}.${key}`,errors);
  }
  if(node.items)validateStrictObjects(node.items,`${path}[]`,errors);
  if(Array.isArray(node.anyOf))node.anyOf.forEach((x,i)=>validateStrictObjects(x,`${path}.anyOf[${i}]`,errors));
  return errors;
}

const request=buildGroqRequestBody({task:'groundedRelationshipProposal',model:DEFAULT_GROQ_MODEL,systemText:'system',userText:'user',jsonSchema:GROUNDED_RELATIONSHIP_PROPOSAL_SCHEMA,strictSchemaCompatible:true});
assert.equal(request.contract.mode,'json_schema');
assert.equal(request.body.response_format.type,'json_schema');
assert.equal(request.body.response_format.json_schema.strict,true);
assert.deepEqual(validateStrictObjects(closeJsonSchemaObjects(GROUNDED_RELATIONSHIP_PROPOSAL_SCHEMA)),[]);
assert.equal(JSON.stringify(GROUNDED_RELATIONSHIP_PROPOSAL_SCHEMA).includes('semanticClasses'),false,'PD-092 Second Corrective must not add semanticClasses to provider response schema');

const previousKey=process.env.GROQ_API_KEY;
process.env.GROQ_API_KEY='gsk_TEST_SECRET';
const originalFetch=globalThis.fetch;
let calls=0;
const providerRawMessage="Invalid request parameter for response_format at relationshipHypotheses.descriptorProposalRefs.";
globalThis.fetch=async()=>{calls++;return new Response(JSON.stringify({error:{message:providerRawMessage,type:'invalid_request_error',code:'invalid_request'}}),{status:400,headers:{'content-type':'application/json'}});};
try{
  const diagnostics=[];
  await assert.rejects(()=>runGroqChatCompletion({task:'groundedRelationshipProposal',systemText:'system',userText:'user',jsonSchema:GROUNDED_RELATIONSHIP_PROPOSAL_SCHEMA,strictSchemaCompatible:true,maxRetries:3,executionDiagnosticSink:x=>diagnostics.push(x)}),error=>{
    assert.equal(error.providerDiagnostic.status,400);
    assert.equal(error.providerDiagnostic.providerType,'invalid_request_error');
    assert.equal(error.providerDiagnostic.providerCode,'invalid_request');
    assert.equal(error.providerDiagnostic.failureKind,'invalid_request');
    assert.match(error.providerDiagnostic.providerErrorMessage,/response_format/);
    return true;
  });
  assert.equal(calls,1,'invalid_request must not be retried as a transient rate limit');
  const failed=diagnostics.find(x=>x.stage==='failed');
  assert(failed);
  assert.equal(failed.httpStatus,400);
  assert.equal(failed.providerCode,'invalid_request');
  assert.equal(failed.providerType,'invalid_request_error');
  assert.match(failed.providerErrorMessage,/response_format/);
  assert.equal(JSON.stringify(failed).includes('gsk_TEST_SECRET'),false);

  const liveDiagnostics=[];
  const providers=createLiveGroundedRelationshipProposalProviders({modelRunner:async()=>{const e=new Error('provider failed');e.providerDiagnostic={status:400,providerCode:'invalid_request',providerType:'invalid_request_error',providerMessage:'Provider rejected the request.',providerErrorMessage:providerRawMessage,outputMode:'json_schema',structuredOutput:true,httpAttemptsUsed:1,failureKind:'invalid_request'};throw e;},diagnosticSink:x=>liveDiagnostics.push(x)});
  await providers.descriptorProposalProvider({materials:[{materialRef:'m1',sourceId:'s1',summary:'x',facts:['x'],exactSupports:['x']}],locale:'it'});
  const pd069Failed=liveDiagnostics.find(x=>x.stage==='model_call_failed');
  assert(pd069Failed);
  assert.equal(pd069Failed.httpStatus,400);
  assert.equal(pd069Failed.providerCode,'invalid_request');
  assert.equal(pd069Failed.outputMode,'json_schema');
  assert.match(pd069Failed.providerErrorMessage,/response_format/);
} finally {
  globalThis.fetch=originalFetch;
  if(previousKey===undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY=previousKey;
}

console.log('PD-092 Third Corrective PD-069 request diagnostics: PASS');
