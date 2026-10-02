import { DIRECTION_PEOPLE_ACTION } from './directionKnowledgeAcquisition.js';
import {pd086AuthorityForConditionReason} from './pendingProfessionalResponsibilityAcquisition.js';
function arr(v){return Array.isArray(v)?v:[]}
function roleLabel(h){return h?.metadata?.roleLabel||h?.directionRef||h?.id||''}
function semanticKey(h,c){return h?.metadata?.roleRequirementSemanticKeys?.[c?.roleRequirementRef]||null}
function identityFor(h,c,pd086Enabled=false){const key=semanticKey(h,c);const pd086=pd086Enabled?pd086AuthorityForConditionReason(c?.reason):null;const action=c?.reason==='people_responsibility_scope'?DIRECTION_PEOPLE_ACTION:pd086?.actionIdentity||null;return [c?.reason||'unknown',key||'unknown',action||'informational'].join('|')}
export function buildCareerDirectionClarificationQueue({careerDirectionEvaluation,directionResolutions=[],pd086Enabled=false}={}){
 const resolutions=new Map(arr(directionResolutions).filter(x=>x?.conditionRef).map(x=>[x.conditionRef,x]));
 const grouped=new Map();
 for(const h of arr(careerDirectionEvaluation?.hypotheses)){
  for(const c of arr(h?.conditionsToVerify)){
   const resolution=resolutions.get(c?.id);
   if(['resolved_by_current_authorised_state','target_relative_confirmed_absence'].includes(resolution?.resolutionState))continue;
   const identity=identityFor(h,c,pd086Enabled);
   const pd086=pd086Enabled?pd086AuthorityForConditionReason(c?.reason):null;const actionable=c?.reason==='people_responsibility_scope'||Boolean(pd086);const actionRef=c?.reason==='people_responsibility_scope'?DIRECTION_PEOPLE_ACTION:pd086?.actionIdentity||null;
   const item=grouped.get(identity)||{identity,conditionReason:c?.reason||null,roleRequirementSemanticKey:semanticKey(h,c),semanticType:pd086?.semanticType||null,actionability:actionable?'actionable_now':'informational_only',acquisitionActionRef:actionable?actionRef:null,affectedDirections:[],conditionRefs:[],resolutionState:'unresolved'};
   if(!item.affectedDirections.some(x=>x.directionRef===h.id))item.affectedDirections.push({directionRef:h.id,label:roleLabel(h)});
   if(c?.id&&!item.conditionRefs.includes(c.id))item.conditionRefs.push(c.id);
   grouped.set(identity,item);
  }
 }
 return Object.freeze([...grouped.values()].map(x=>Object.freeze({...x,affectedDirections:Object.freeze(x.affectedDirections),conditionRefs:Object.freeze(x.conditionRefs)})));
}
export default buildCareerDirectionClarificationQueue;
