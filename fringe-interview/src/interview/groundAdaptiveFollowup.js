function arr(v){return Array.isArray(v)?v:[]}
function text(v){return typeof v==='string'?v.trim():''}
function normalize(v){return text(v).toLocaleLowerCase()}
function measurableReferent(answerText){
 const source=text(answerText);
 const match=source.match(/\b(miglioramento\s+misurabile|risultato\s+misurabile|measurable\s+improvement|measurable\s+result)\b/i);
 return match?{type:'measurable_result',text:match[1],source:'accepted_answer'}:null;
}
export function buildGroundedConversationalContext({answerText='',explicitReferents=[]}={}){
 const referents=arr(explicitReferents).filter(x=>x&&text(x.type)&&text(x.text)).map(x=>({type:text(x.type),text:text(x.text),source:text(x.source)||'explicit_session_context'}));
 const measurable=measurableReferent(answerText);if(measurable)referents.push(measurable);
 return Object.freeze({referents:Object.freeze(referents.map(Object.freeze))});
}
function hasType(context,type){return arr(context?.referents).some(x=>x?.type===type)}
export function groundAdaptiveFollowupPack({followupPack,groundedContext}={}){
 if(!followupPack)return {valid:false,pack:null,selectedGroundedReferents:[],validationOutcome:'missing_pack'};
 const trigger=text(followupPack?.triggerType);
 const refs=arr(groundedContext?.referents);
 if(trigger==='tool_adaptation'){
   const grounded=hasType(groundedContext,'tool_used')&&hasType(groundedContext,'tool_required');
   if(!grounded){
     const safe=arr(followupPack?.followups).find(q=>/nuovi strumenti|nuovo sistema|new tools|new system/i.test(text(q)));
     if(!safe)return {valid:false,pack:null,selectedGroundedReferents:[],validationOutcome:'rejected_missing_tool_referents'};
     return {valid:true,pack:{...followupPack,followups:[safe]},selectedGroundedReferents:[],validationOutcome:'safe_non_presuppositive_pivot'};
   }
   return {valid:true,pack:followupPack,selectedGroundedReferents:refs.filter(x=>x.type==='tool_used'||x.type==='tool_required'),validationOutcome:'grounded'};
 }
 if(trigger==='achievement_quantification'){
   return {valid:true,pack:followupPack,selectedGroundedReferents:refs.filter(x=>x.type==='measurable_result'),validationOutcome:'grounded_or_non_presuppositive'};
 }
 return {valid:true,pack:followupPack,selectedGroundedReferents:[],validationOutcome:'no_special_referent_required'};
}
