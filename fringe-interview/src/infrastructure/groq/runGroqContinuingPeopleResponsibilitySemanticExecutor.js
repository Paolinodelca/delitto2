import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {runGroqChatCompletion} from './runGroqChatCompletion.js';
const require=createRequire(import.meta.url);
const {CONTINUING_PEOPLE_RESPONSIBILITY_SEMANTIC_CANDIDATE_SCHEMA,validateContinuingPeopleResponsibilityProductionSemanticCandidate,supportIsVerbatim}=require('../../app/knowledge/continuingPeopleResponsibilityProductionSemanticCandidate.js');
const {buildContinuingPeopleResponsibilityProductionSemanticPrompt}=require('../../app/knowledge/buildContinuingPeopleResponsibilityProductionSemanticPrompt.js');
const REPAIR_SELECTION_SCHEMA=Object.freeze({type:'object',properties:{selections:{type:'array',items:{type:'object',properties:{field:{type:'string'},candidateId:{type:'string'}},required:['field','candidateId'],additionalProperties:false}}},required:['selections'],additionalProperties:false});
function parseJson(result){try{return JSON.parse(result?.content)}catch{return null}}
function providerMeta(result,repair={}){return Object.freeze({task:'continuingPeopleResponsibilitySemanticExecutor',model:result?.model||null,outputMode:result?.outputMode||null,...repair})}
function successfulProviderDiagnostic(result){return Object.freeze({model:result?.model||null,outputMode:result?.outputMode||null,structuredOutput:result?.outputMode==='json_schema'||result?.outputMode==='json_object',elapsedMs:Number.isFinite(Number(result?.execution?.elapsedMs))?Number(result.execution.elapsedMs):null,httpAttemptsUsed:Number.isFinite(Number(result?.execution?.httpAttemptsUsed??result?.attemptsUsed))?Number(result?.execution?.httpAttemptsUsed??result?.attemptsUsed):null})}
function diagnosticCandidateShape(candidate){
 const support=candidate?.support;
 const peopleScope=candidate?.peopleScope;
 return Object.freeze({
  topLevelKeys:Object.freeze(candidate&&typeof candidate==='object'&&!Array.isArray(candidate)?Object.keys(candidate).sort():[]),
  interpretationStatus:typeof candidate?.interpretationStatus==='string'?candidate.interpretationStatus:null,
  responsibilityPresence:typeof candidate?.responsibilityPresence==='string'?candidate.responsibilityPresence:null,
  continuity:typeof candidate?.continuity==='string'?candidate.continuity:null,
  responsibilityMode:typeof candidate?.responsibilityMode==='string'?candidate.responsibilityMode:null,
  peopleScopeKind:typeof peopleScope?.kind==='string'?peopleScope.kind:null,
  peopleScopeValueType:peopleScope&&Object.prototype.hasOwnProperty.call(peopleScope,'value')?(peopleScope.value===null?'null':Array.isArray(peopleScope.value)?'array':typeof peopleScope.value):'absent',
  responsibilityKindsCount:Array.isArray(candidate?.responsibilityKinds)?candidate.responsibilityKinds.length:null,
  responsibilityKinds:Object.freeze(Array.isArray(candidate?.responsibilityKinds)?candidate.responsibilityKinds.filter(x=>typeof x==='string').slice(0,8):[]),
  supportPresence:support===null?'null':Array.isArray(support)?'array':typeof support==='object'?'object':typeof support,
  supportFieldTypes:Object.freeze(support&&typeof support==='object'&&!Array.isArray(support)?Object.fromEntries(Object.entries(support).map(([key,value])=>[key,value===null?'null':Array.isArray(value)?'array':typeof value])):{}),
  limitationsPresence:Array.isArray(candidate?.limitations),
  limitationsCount:Array.isArray(candidate?.limitations)?candidate.limitations.length:null
 });
}
function buildRepairGroundingMap(candidate){
 const support=candidate?.support||{};
 const responsibilityKinds=Array.isArray(candidate?.responsibilityKinds)?candidate.responsibilityKinds:[];
 const kindSupport=Array.isArray(support?.responsibilityKinds)?support.responsibilityKinds:[];
 return Object.freeze([
  Object.freeze({field:'presence',semanticValue:candidate?.responsibilityPresence??null,candidateSupportClaim:support?.presence??null}),
  Object.freeze({field:'continuity',semanticValue:candidate?.continuity??null,candidateSupportClaim:support?.continuity??null}),
  Object.freeze({field:'mode',semanticValue:candidate?.responsibilityMode??null,candidateSupportClaim:support?.mode??null}),
  Object.freeze({field:'peopleScope',semanticValue:candidate?.peopleScope??null,candidateSupportClaim:support?.peopleScope??null}),
  Object.freeze({field:'professionalContext',semanticValue:candidate?.professionalContext?.description??null,candidateSupportClaim:support?.professionalContext??null}),
  ...responsibilityKinds.map((semanticValue,index)=>Object.freeze({field:`responsibilityKinds[${index}]`,semanticValue,candidateSupportClaim:kindSupport[index]??null})),
  Object.freeze({field:'eventTime',semanticValue:candidate?.eventTime?.description??null,candidateSupportClaim:candidate?.eventTime?.description??null})
 ]);
}
function exactOccurrences(text,claim){
 if(typeof claim!=='string'||claim.length===0)return [];
 const out=[];let from=0;
 while(from<=text.length-claim.length){const index=text.indexOf(claim,from);if(index<0)break;out.push(Object.freeze({start:index,end:index+claim.length,excerpt:claim}));from=index+1;}
 return out;
}
function resolveExactGrounding(text,groundingMap){
 const resolved=new Map();const unresolved=[];
 for(const item of groundingMap){const matches=exactOccurrences(text,item.candidateSupportClaim);if(matches.length===1)resolved.set(item.field,matches[0]);else unresolved.push(Object.freeze({...item,exactOccurrenceCount:matches.length}));}
 return {resolved,unresolved:Object.freeze(unresolved)};
}
function stableCandidateId(field,start,end,excerpt){
 return `candidate_${createHash('sha256').update(`${field}\u0000${start}\u0000${end}\u0000${excerpt}`).digest('hex').slice(0,12)}`;
}
function buildExactEvidenceSegments(text){
 const spans=[];const seen=new Set();
 const add=(start,end)=>{
  while(start<end&&/\s/.test(text[start]))start++;
  while(end>start&&/\s/.test(text[end-1]))end--;
  if(start>=end)return;
  const key=`${start}:${end}`;if(seen.has(key))return;seen.add(key);spans.push({start,end,excerpt:text.slice(start,end)});
 };
 let last=0;
 for(const match of text.matchAll(/[.!?]+/g)){add(last,match.index);last=match.index+match[0].length;}add(last,text.length);
 const clauses=[];last=0;
 for(const match of text.matchAll(/[,;:.!?]+/g)){clauses.push([last,match.index]);last=match.index+match[0].length;}clauses.push([last,text.length]);
 for(const [start,end] of clauses){
  add(start,end);
  const clause=text.slice(start,end);let local=0;
  for(const match of clause.matchAll(/\s+(?:e|ed|and|but|ma|or|oppure)\s+/gi)){add(start+local,start+match.index);local=match.index+match[0].length;}
  add(start+local,end);
 }
 return spans.filter(item=>exactOccurrences(text,item.excerpt).length===1).slice(0,32);
}
function buildSelectionCandidates(text,unresolved){
 const segments=buildExactEvidenceSegments(text);const table=new Map();const selectionMap=[];
 for(const item of unresolved){
  const candidates=segments.map(segment=>{
   const candidateId=stableCandidateId(item.field,segment.start,segment.end,segment.excerpt);
   const owned=Object.freeze({field:item.field,candidateId,start:segment.start,end:segment.end,excerpt:segment.excerpt});
   table.set(candidateId,owned);
   return Object.freeze({candidateId,excerpt:segment.excerpt});
  });
  selectionMap.push(Object.freeze({field:item.field,semanticValue:item.semanticValue,candidateSupportClaim:item.candidateSupportClaim,candidates:Object.freeze(candidates)}));
 }
 return {table,selectionMap:Object.freeze(selectionMap)};
}
function buildSelectionRepairPrompt({candidate,selectionMap}){
 return {
  systemText:[
   'Select ONLY among application-owned exact Evidence candidates for already-validated continuing-people-responsibility fields that could not be grounded deterministically.',
   'The semantic candidate has already passed semantic validation. Your task is bounded source-location selection only, not semantic interpretation.',
   'For each entry in unresolvedSelectionMap, choose the candidateId whose application-owned exact Evidence excerpt supports the supplied FIELD and SEMANTIC VALUE without semantic strengthening.',
   'The candidate excerpts were materialized by the application from original Evidence. You MUST NOT return Evidence text, character offsets, rewritten text, normalized text, paraphrases, reasons, explanations, or any semantic field.',
   'Return ONLY one valid JSON object. Do not return prose, Markdown, code fences, comments, or additional keys.',
   'The output shape is exactly: {"selections":[{"field":"<exact FIELD from unresolvedSelectionMap>","candidateId":"<candidateId from that field candidates>"}]}.',
   'Return exactly one selections entry for every unresolvedSelectionMap entry, in the same order. Copy field exactly. candidateId MUST be one of the IDs offered for that same field.',
   'If none of the offered exact Evidence candidates supports the already-validated semantic field, return an empty candidateId for that field; the application will fail closed.',
   'Do not infer new semantics, strengthen the semantic value, or choose unrelated Evidence merely to complete the output.'
  ].join('\n'),
  userText:['Select application-owned Evidence candidate IDs for these unresolved already-validated fields.',JSON.stringify({validatedCandidate:candidate,unresolvedSelectionMap:selectionMap}),'Return ONLY the required JSON object containing field + candidateId selections.'].join('\n')
 };
}
async function complete({completionRunner,systemText,userText,task,jsonSchema=CONTINUING_PEOPLE_RESPONSIBILITY_SEMANTIC_CANDIDATE_SCHEMA}){return completionRunner({task,systemText,userText,temperature:0,maxRetries:2,retryDelayMs:1200,jsonSchema,strictSchemaCompatible:true})}
async function completeRepair({completionRunner,systemText,userText}){return completionRunner({task:'continuingPeopleResponsibilitySemanticSupportRepair',systemText,userText,temperature:0,maxRetries:2,retryDelayMs:1200,jsonSchema:REPAIR_SELECTION_SCHEMA,strictSchemaCompatible:false})}
async function completeInitialJsonObjectRecovery({completionRunner,systemText,userText}){return completionRunner({task:'continuingPeopleResponsibilitySemanticExecutorRecovery',systemText,userText,temperature:0,maxRetries:2,retryDelayMs:1200,jsonSchema:CONTINUING_PEOPLE_RESPONSIBILITY_SEMANTIC_CANDIDATE_SCHEMA,strictSchemaCompatible:false})}
function structuredOutputRejected(error){return error?.providerDiagnostic?.failureKind==='structured_output_rejected'}
function groundingOnlyValidationErrors(errors=[]){return Array.isArray(errors)&&errors.length>0&&errors.every(error=>typeof error==='string'&&error.endsWith(' requires Evidence support.'))}
function hasExactKeys(value,keys){if(!value||typeof value!=='object'||Array.isArray(value))return false;const actual=Object.keys(value).sort();const expected=[...keys].sort();return actual.length===expected.length&&actual.every((key,index)=>key===expected[index])}
function applyProviderSelections({repair,text,unresolved,selectionMap,table,resolved}){
 if(!hasExactKeys(repair,['selections'])||!Array.isArray(repair.selections)||repair.selections.length!==unresolved.length)return null;
 const used=new Set();
 for(let i=0;i<unresolved.length;i++){
  const selection=repair.selections[i];const expected=unresolved[i];const offered=selectionMap[i];
  if(!hasExactKeys(selection,['field','candidateId'])||selection.field!==expected.field||selection.field!==offered?.field||typeof selection.candidateId!=='string'||selection.candidateId.length===0||used.has(selection.candidateId))return null;
  const owned=table.get(selection.candidateId);
  if(!owned||owned.field!==expected.field||!offered.candidates.some(candidate=>candidate.candidateId===selection.candidateId))return null;
  if(textFromOwnedCandidate(owned)===null)return null;
  used.add(selection.candidateId);resolved.set(expected.field,Object.freeze({start:owned.start,end:owned.end,excerpt:owned.excerpt}));
 }
 return resolved;
 function textFromOwnedCandidate(owned){
  if(!Number.isInteger(owned.start)||!Number.isInteger(owned.end)||owned.start<0||owned.end<=owned.start)return null;
  return text.slice(owned.start,owned.end)===owned.excerpt?owned.excerpt:null;
 }
}
function materializeCandidateFromGrounding(candidate,resolved){
 const c=JSON.parse(JSON.stringify(candidate));
 const get=(field)=>resolved.get(field)?.excerpt??null;
 c.support={presence:get('presence'),continuity:get('continuity'),mode:get('mode'),peopleScope:get('peopleScope'),professionalContext:get('professionalContext'),responsibilityKinds:c.responsibilityKinds.map((_,i)=>get(`responsibilityKinds[${i}]`))};
 if(c.eventTime?.description)c.eventTime={description:get('eventTime')};
 return c;
}
export async function runGroqContinuingPeopleResponsibilitySemanticExecutor({evidence,completionRunner=runGroqChatCompletion}={}){
 const text=String(evidence?.content?.answerText||'');
 const prompt=buildContinuingPeopleResponsibilityProductionSemanticPrompt({evidence});
 let result=null,candidate=null,validation=null,initialGroundingOnlyRejection=false;
 let structuredRecoveryAttempted=false,structuredFailureDiagnostic=null;
 const recovery={attempted:false,succeeded:false,mode:null,initialFailureDiagnostic:null};
 const recoveryView=()=>Object.freeze({attempted:recovery.attempted,succeeded:recovery.succeeded,mode:recovery.mode,initialFailureDiagnostic:recovery.initialFailureDiagnostic});
 async function recoverOnce(initialFailureDiagnostic){
  if(recovery.attempted)return null;
  recovery.attempted=true;recovery.mode='json_object';recovery.initialFailureDiagnostic=initialFailureDiagnostic||null;
  return completeInitialJsonObjectRecovery({completionRunner,...prompt});
 }
 function candidateFailure(reason,category,validationErrors,currentCandidate,providerDiagnostic){
  return Object.freeze({supported:false,reason,diagnostic:{category,validationErrors:Object.freeze((validationErrors||[]).slice(0,8)),candidateShape:diagnosticCandidateShape(currentCandidate),providerDiagnostic:providerDiagnostic||null,pd073Recovery:recoveryView()}});
 }
 try{
  result=await complete({completionRunner,...prompt,task:'continuingPeopleResponsibilitySemanticExecutor'});
 }catch(error){
  if(!structuredOutputRejected(error))throw error;
  structuredRecoveryAttempted=true;structuredFailureDiagnostic=error?.providerDiagnostic||null;
  try{result=await recoverOnce(structuredFailureDiagnostic);}catch(recoveryError){
   recoveryError.initialStructuredOutputRecovery=Object.freeze({attempted:true,succeeded:false,mode:'json_object',initialFailureDiagnostic:structuredFailureDiagnostic});
   throw recoveryError;
  }
 }
 candidate=parseJson(result);
 if(!candidate){
  if(!recovery.attempted){
   const initial=Object.freeze({category:'json_parse_failure',providerDiagnostic:successfulProviderDiagnostic(result)});
   try{result=await recoverOnce(initial);}catch(recoveryError){return Object.freeze({supported:false,reason:'malformed_provider_output',diagnostic:{category:'json_parse_failure',providerDiagnostic:recoveryError?.providerDiagnostic||successfulProviderDiagnostic(result),pd073Recovery:recoveryView()}});}
   candidate=parseJson(result);
  }
  if(!candidate)return Object.freeze({supported:false,reason:'malformed_provider_output',diagnostic:{category:'json_parse_failure',providerDiagnostic:successfulProviderDiagnostic(result),pd073Recovery:recoveryView()}});
 }
 validation=validateContinuingPeopleResponsibilityProductionSemanticCandidate(candidate);
 initialGroundingOnlyRejection=!validation.isValid&&groundingOnlyValidationErrors(validation.errors);
 if(!validation.isValid&&!initialGroundingOnlyRejection){
  const initial=Object.freeze({category:'candidate_rejected',validationErrors:Object.freeze(validation.errors.slice(0,8)),candidateShape:diagnosticCandidateShape(candidate),providerDiagnostic:successfulProviderDiagnostic(result)});
  if(recovery.attempted)return candidateFailure('invalid_provider_output','candidate_rejected',validation.errors,candidate,successfulProviderDiagnostic(result));
  let recoveryResult;
  try{recoveryResult=await recoverOnce(initial);}catch(recoveryError){return candidateFailure('invalid_provider_output','candidate_rejected',validation.errors,candidate,recoveryError?.providerDiagnostic||successfulProviderDiagnostic(result));}
  const recoveredCandidate=parseJson(recoveryResult);
  const recoveredValidation=validateContinuingPeopleResponsibilityProductionSemanticCandidate(recoveredCandidate);
  const recoveredGroundingOnly=!recoveredValidation.isValid&&groundingOnlyValidationErrors(recoveredValidation.errors);
  if(!recoveredCandidate||(!recoveredValidation.isValid&&!recoveredGroundingOnly))return candidateFailure('invalid_provider_output','candidate_rejected',recoveredValidation?.errors||validation.errors,recoveredCandidate||candidate,successfulProviderDiagnostic(recoveryResult));
  result=recoveryResult;candidate=recoveredCandidate;validation=recoveredValidation;initialGroundingOnlyRejection=recoveredGroundingOnly;recovery.succeeded=true;
 }else if(recovery.attempted){
  recovery.succeeded=true;
 }
 if(candidate.interpretationStatus!=='SUPPORTED')return Object.freeze({supported:false,reason:'unsupported_semantics',diagnostic:{category:'legitimate_unsupported_semantics',pd073Recovery:recoveryView()}});
 const providerRecoveryMeta={initialStructuredOutputRecoveryAttempted:structuredRecoveryAttempted,initialStructuredOutputRecoveryStatus:structuredRecoveryAttempted?(recovery.succeeded?'succeeded':'failed'):null,initialStructuredOutputFailureDiagnostic:structuredFailureDiagnostic,pd073Recovery:recoveryView()};
 if(!initialGroundingOnlyRejection&&supportIsVerbatim(candidate,text))return Object.freeze({supported:true,candidate:Object.freeze(candidate),provider:providerMeta(result,{supportRepairAttempted:false,...providerRecoveryMeta})});
 const groundingMap=buildRepairGroundingMap(candidate);const grounding=resolveExactGrounding(text,groundingMap);let repairResult=null;
 if(grounding.unresolved.length>0){
  const selection=buildSelectionCandidates(text,grounding.unresolved);
  if(selection.selectionMap.some(item=>item.candidates.length===0))return Object.freeze({supported:false,reason:'unsupported_candidate_support',diagnostic:{category:'source_span_repair_rejected',initialCategory:'evidence_support_rejected',repairFailure:'no_application_owned_evidence_candidates',pd073Recovery:recoveryView()}});
  const repairPrompt=buildSelectionRepairPrompt({candidate,selectionMap:selection.selectionMap});
  try{repairResult=await completeRepair({completionRunner,...repairPrompt});}catch(error){return Object.freeze({supported:false,reason:'unsupported_candidate_support',diagnostic:{category:'source_span_repair_rejected',initialCategory:'evidence_support_rejected',repairFailure:'provider_execution',providerDiagnostic:error?.providerDiagnostic||null,pd073Recovery:recoveryView()}});}
  const repair=parseJson(repairResult);
  if(!repair||!applyProviderSelections({repair,text,unresolved:grounding.unresolved,selectionMap:selection.selectionMap,table:selection.table,resolved:grounding.resolved}))return Object.freeze({supported:false,reason:'unsupported_candidate_support',diagnostic:{category:'source_span_repair_rejected',initialCategory:'evidence_support_rejected',repairFailure:'invalid_application_owned_candidate_selection',pd073Recovery:recoveryView()}});
 }
 const repaired=materializeCandidateFromGrounding(candidate,grounding.resolved);validation=validateContinuingPeopleResponsibilityProductionSemanticCandidate(repaired);
 if(!validation.isValid)return Object.freeze({supported:false,reason:'unsupported_candidate_support',diagnostic:{category:'source_span_repair_rejected',initialCategory:'evidence_support_rejected',repairFailure:'candidate_rejected',validationErrors:validation.errors.slice(0,8),pd073Recovery:recoveryView()}});
 if(repaired.interpretationStatus!=='SUPPORTED')return Object.freeze({supported:false,reason:'unsupported_semantics',diagnostic:{category:'source_span_repair_rejected',initialCategory:'evidence_support_rejected',repairFailure:'legitimate_unsupported_semantics',pd073Recovery:recoveryView()}});
 if(!supportIsVerbatim(repaired,text))return Object.freeze({supported:false,reason:'unsupported_candidate_support',diagnostic:{category:'source_span_repair_rejected',initialCategory:'evidence_support_rejected',repairFailure:'evidence_support_rejected',pd073Recovery:recoveryView()}});
 return Object.freeze({supported:true,candidate:Object.freeze(repaired),provider:providerMeta(repairResult||result,{supportRepairAttempted:Boolean(repairResult),supportRepairStatus:repairResult?'application_owned_candidate_selection_accepted':'deterministic_exact_claim_materialization',initialCategory:'evidence_support_rejected',...providerRecoveryMeta})});
}
