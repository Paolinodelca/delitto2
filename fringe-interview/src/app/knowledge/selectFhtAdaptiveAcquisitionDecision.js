const policy=require('../../../config/adaptive_acquisition_policy.json');

function arr(v){return Array.isArray(v)?v:[]}
function text(v){return typeof v==='string'?v.trim():''}
function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.freeze(v);Object.values(v).forEach(freeze)}return v}
function knowledgeGoal(item){
 const direct=text(item?.semanticType);
 if(direct)return direct;
 const ref=text(item?.semanticPolicyRef||item?.semanticAuthority?.semanticPolicyRef||item?.semanticAuthority?.policyRef);
 if(ref.endsWith(':decision_accountability:v1'))return 'decision_accountability';
 if(ref.endsWith(':quantified_outcome:v1'))return 'quantified_outcome';
 return '';
}
function hasAuthorizedKnowledge(results,goal){return arr(results).some(x=>Boolean(x?.knowledgeSnapshot)&&knowledgeGoal(x)===goal)}
function cueForGoal(answerText,goal,profile,persistedCues=[]){
 const persisted=arr(persistedCues).find(x=>x?.purposeRef===goal&&text(x?.referent));
 if(persisted)return {type:'persisted_session_opening',referent:text(persisted.referent),sourceRef:text(persisted.sourceRef)};
 const normalized=text(answerText).toLocaleLowerCase();
 if(!normalized)return null;
 const cues=arr(profile?.boundedConversationalCues?.[goal]);
 const cue=cues.find(x=>normalized.includes(text(x).toLocaleLowerCase()));
 return cue?{type:'accepted_answer_opening',referent:cue}:null;
}
function retainFhtBoundedAcquisitionCues({planning,answerText='',sourceRef='',existingCues=[],policyProfile=policy}={}){
 const authorized=new Set(arr(planning?.activeGoals).filter(Boolean));
 const next=arr(existingCues).filter(x=>x&&authorized.has(x.purposeRef)&&text(x.referent)).map(x=>({...x}));
 for(const goal of authorized){
   const cue=cueForGoal(answerText,goal,policyProfile,[]);if(!cue)continue;
   const key=`${goal}|${text(cue.referent).toLocaleLowerCase()}|${text(sourceRef)}`;
   if(next.some(x=>x.key===key))continue;
   next.push({key,purposeRef:goal,referent:text(cue.referent),sourceRef:text(sourceRef),state:'available'});
 }
 return freeze(next);
}
function actionKey(association){return text(association?.runtimeActionIdentity?.key)||text(association?.runtimeActionRef).replace(/^interviewQuestion:/,'')}
function selectFhtAdaptiveAcquisitionDecision({planning,runtimeKnowledgeResults=[],usedActionKeys=[],availableActionKeys=[],acceptedAnswerText='',persistedCues=[],policyProfile=policy}={}){
 const authorizedGoals=arr(planning?.activeGoals).filter(Boolean);
 const associations=arr(planning?.runtimeActionAssociations);
 const available=new Set(arr(availableActionKeys).map(text).filter(Boolean));
 const used=arr(usedActionKeys).map(text).filter(Boolean);
 const params=policyProfile?.behavioralParameters||{};
 const unresolvedPriority=Number(params.unresolvedPurposePriority||0);
 const representedPriority=Number(params.representedPurposePriority||0);
 const openingBonus=Number(params.conversationalOpeningBonus||0);
 const repeatPenalty=Number(params.repeatedActionPenalty||0);
 const switchThreshold=Number(params.switchThreshold||0);
 const candidates=authorizedGoals.map(goal=>{
   const represented=hasAuthorizedKnowledge(runtimeKnowledgeResults,goal);
   const cue=cueForGoal(acceptedAnswerText,goal,policyProfile,persistedCues);
   const eligibleActions=associations.filter(a=>arr(a?.purposeRefs).some(r=>r?.goal===goal)).map(a=>({association:a,actionKey:actionKey(a)})).filter(x=>x.actionKey&&(!available.size||available.has(x.actionKey))).map(x=>{
     const repeatCount=used.filter(k=>k===x.actionKey).length;
     return {...x,repeatCount,actionScore:-repeatCount*repeatPenalty};
   }).sort((a,b)=>b.actionScore-a.actionScore||a.actionKey.localeCompare(b.actionKey));
   const priority=(represented?representedPriority:unresolvedPriority)+(cue?openingBonus:0);
   return {goal,state:represented?'represented':'not_observed',cue,priority,eligibleActions};
 }).filter(x=>x.eligibleActions.length);
 candidates.sort((a,b)=>b.priority-a.priority||a.goal.localeCompare(b.goal));
 const selectedPurpose=candidates[0]||null;
 const selectedAction=selectedPurpose?.eligibleActions?.[0]||null;
 const alternative=candidates[1]||null;
 const applicable=Boolean(selectedPurpose&&selectedAction&&(!alternative||selectedPurpose.priority-alternative.priority>=switchThreshold||selectedPurpose.state==='not_observed'));
 const trace={policyVersion:text(policyProfile?.policyVersion),candidatePurposes:candidates.map(x=>({goal:x.goal,state:x.state,cue:x.cue,priority:x.priority,eligibleActions:x.eligibleActions.map(a=>({actionKey:a.actionKey,repeatCount:a.repeatCount,actionScore:a.actionScore}))})),selectedPurpose:applicable?selectedPurpose.goal:null,selectedAction:applicable?selectedAction.actionKey:null,selectionReason:applicable?'authorized_purpose_priority':'no_high_value_acquisition_decision'};
 if(!applicable)return freeze({applicable:false,trace});
 return freeze({applicable:true,purpose:selectedPurpose.goal,actionKey:selectedAction.actionKey,association:selectedAction.association,cue:selectedPurpose.cue,trace});
}
module.exports={selectFhtAdaptiveAcquisitionDecision,retainFhtBoundedAcquisitionCues,FHT_ADAPTIVE_ACQUISITION_POLICY:policy};
