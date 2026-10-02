import { createHash } from 'node:crypto';

export const CANDIDATE_PROFILE_DERIVATION_RECIPE=Object.freeze({id:'candidate_profile_derived_preparation',version:'1.0'});
const txt=v=>typeof v==='string'?v.trim():'';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const hash=v=>createHash('sha256').update(String(v??''),'utf8').digest('hex');
const key=(source,recipe)=>`${txt(source?.id)}|${hash(txt(source?.content))}|${recipe.id}@${recipe.version}`;
const aggregateKey=(sources,userNotes,recipe)=>hash(JSON.stringify({sources:(sources||[]).map(s=>({id:txt(s.id),contentFingerprint:hash(txt(s.content))})),userNotesFingerprint:hash(txt(userNotes)),recipe}));
const providerMetaOf=result=>result?.modelMeta&&typeof result.modelMeta==='object'?result.modelMeta:null;

export async function resolveCandidateProfileDerivedPreparation({
 professionalSources=[],
 userNotes='',
 existing=null,
 runParser,
 recipe=CANDIDATE_PROFILE_DERIVATION_RECIPE,
 onDerivedPreparationCheckpoint,
 beforeSourceProviderCall,
 onSourceProgress,
 profileBindingRef=null
}={}){
 if(typeof runParser!=='function')throw new Error('CANDIDATE_PROFILE_DERIVED_PREPARATION_PARSER_REQUIRED');
 const binding=txt(profileBindingRef);
 const existingBinding=txt(existing?.profileBindingRef);
 const bindingCompatible=!binding||!existing||existingBinding===binding;
 const priorSources=bindingCompatible&&Array.isArray(existing?.sources)?existing.sources:[];
 const priorByRef=new Map(priorSources.map(x=>[x.sourceRef,x]));
 const sourceRecords=[],candidateSourceProfiles=[],sourceDiagnostics=[];
 let logicalCallCount=0,lastProviderMeta=null;
 const checkpoint=async({aggregate=null,stage,sourceRef=null}={})=>{
  if(typeof onDerivedPreparationCheckpoint!=='function')return;
  const derivedPreparation={version:'1.0',type:'candidate_profile_derived_preparation',profileBindingRef:binding||null,recipeId:`${recipe.id}@${recipe.version}`,sources:clone(sourceRecords),...(aggregate?{aggregate:clone(aggregate)}:{})};
  await onDerivedPreparationCheckpoint(Object.freeze({derivedPreparation:clone(derivedPreparation),stage,sourceRef}));
 };
 const progress=record=>{if(typeof onSourceProgress==='function')try{onSourceProgress(Object.freeze({...record}));}catch{}};
 for(let index=0;index<professionalSources.length;index+=1){
  const source=professionalSources[index],sourceRef=txt(source.id),k=key(source,recipe),prior=priorByRef.get(sourceRef);
  let cp,hit=false,missReason='missing',parserResult=null,pacing=null;
  if(prior&&prior.derivationKey===k){
   cp=clone(prior.candidateProfile);hit=true;missReason=null;
   progress({stage:'source_checkpoint_hit',sourceRef,sourceFingerprintMatch:true,checkpointHit:true,checkpointMiss:false,providerCallRequired:false,providerCallSkipped:true,resumeFromCheckpoint:true,remainingSourceCount:professionalSources.length-index-1});
  }else{
   if(prior)missReason=prior.recipeId!==`${recipe.id}@${recipe.version}`?'recipe_changed':'source_fingerprint_changed';
   progress({stage:'source_checkpoint_miss',sourceRef,sourceFingerprintMatch:prior?false:null,checkpointHit:false,checkpointMiss:true,providerCallRequired:true,providerCallSkipped:false,resumeFromCheckpoint:false,remainingSourceCount:professionalSources.length-index});
   if(typeof beforeSourceProviderCall==='function'){
    pacing=await beforeSourceProviderCall({source,index,sourceRef,previousProviderMeta:lastProviderMeta,remainingSourceCount:professionalSources.length-index});
    if(pacing)progress({stage:'source_provider_pacing',sourceRef,...pacing});
   }
   try{
    parserResult=await runParser({cvText:source.content,userNotes:'',source,sourceIndex:index});
   }catch(error){
    progress({stage:'source_provider_failed',sourceRef,checkpointHit:false,providerCallRequired:true,providerCallSkipped:false,remainingSourceCount:professionalSources.length-index,error});
    throw error;
   }
   logicalCallCount++;
   cp=parserResult?.parsed?.candidateProfile||parserResult?.parsed||{};
   lastProviderMeta=providerMetaOf(parserResult);
  }
  sourceRecords.push({sourceRef,sourceContentFingerprint:hash(txt(source.content)),recipeId:`${recipe.id}@${recipe.version}`,derivationKey:k,candidateProfile:clone(cp)});
  if(!hit)await checkpoint({stage:'source_validated',sourceRef});
  candidateSourceProfiles.push({sourceId:source.id,sourceType:source.type||'text',sourceRole:source.sourceRole||null,provenance:source.provenance||{},candidateProfile:clone(cp)});
  const rate=lastProviderMeta?.rateLimitMetadata||null;
  const diagnostic={sourceRef,sourceFingerprintMatch:hit?true:(prior?false:null),checkpointHit:hit,checkpointMiss:!hit,derivedPreparationHit:hit,missReason,modelCallPerformed:!hit,providerCallRequired:!hit,providerCallSkipped:hit,resumeFromCheckpoint:hit,remainingSourceCount:professionalSources.length-index-1,remainingTokens:rate?.remainingTokens??null,resetTokens:rate?.resetTokens??null,recommendedWaitMs:rate?.recommendedWaitMs??null,pacingReason:pacing?.pacingReason||null,chosenWaitMs:pacing?.chosenWaitMs??0};
  sourceDiagnostics.push(diagnostic);
  progress({stage:'source_complete',...diagnostic});
 }
 const aKey=aggregateKey(professionalSources,userNotes,recipe),priorAgg=bindingCompatible?existing?.aggregate:null;
 let aggregateProfile,aggregateHit=false,aggregateMissReason='missing';
 if(priorAgg?.derivationKey===aKey){
  aggregateProfile=clone(priorAgg.candidateProfile);aggregateHit=true;aggregateMissReason=null;
 }else{
  if(priorAgg)aggregateMissReason=priorAgg.recipeId!==`${recipe.id}@${recipe.version}`?'recipe_changed':'aggregate_inputs_changed';
  let aggregatePacing=null;
  if(typeof beforeSourceProviderCall==='function'){
   aggregatePacing=await beforeSourceProviderCall({source:null,index:professionalSources.length,sourceRef:'aggregate',previousProviderMeta:lastProviderMeta,remainingSourceCount:0,isAggregate:true});
   if(aggregatePacing)progress({stage:'aggregate_provider_pacing',sourceRef:'aggregate',...aggregatePacing});
  }
  const parsed=await runParser({cvText:professionalSources.map((s,i)=>`[SOURCE ${i+1} | ${s.sourceRole||s.type||'text'} | ${s.id}]\n${s.content}`).join('\n\n'),userNotes,isAggregate:true});
  logicalCallCount++;
  aggregateProfile=parsed.parsed?.candidateProfile||parsed.parsed||{};
  lastProviderMeta=providerMetaOf(parsed);
 }
 const aggregateRecord={derivationKey:aKey,recipeId:`${recipe.id}@${recipe.version}`,orderedSourceRefs:professionalSources.map(s=>txt(s.id)),userNotesFingerprint:hash(txt(userNotes)),candidateProfile:clone(aggregateProfile)};
 const derivedPreparation={version:'1.0',type:'candidate_profile_derived_preparation',profileBindingRef:binding||null,recipeId:`${recipe.id}@${recipe.version}`,sources:sourceRecords,aggregate:aggregateRecord};
 if(!aggregateHit)await checkpoint({aggregate:aggregateRecord,stage:'aggregate_validated'});
 return {aggregateProfile,candidateSourceProfiles,derivedPreparation,diagnostics:{
  candidateProfileLogicalCallCount:logicalCallCount,
  perSourceHitCount:sourceDiagnostics.filter(x=>x.checkpointHit).length,
  perSourceMissCount:sourceDiagnostics.filter(x=>x.checkpointMiss).length,
  aggregateHit,
  aggregateMissReason,
  resumeFromCheckpoint:sourceDiagnostics.some(x=>x.resumeFromCheckpoint),
  materializationStatus:'complete',
  profileBindingMatch:bindingCompatible,
  sources:sourceDiagnostics
 }};
}

export function attachCandidateProfileDerivedPreparation({professionalIdentity,derivedPreparation}={}){
 return Object.freeze({...clone(professionalIdentity),candidateProfileDerivedPreparation:clone(derivedPreparation)});
}
