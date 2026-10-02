import {appendFile,readFile,mkdir} from "fs/promises";
import {dirname} from "path";
const REACTIONS=Object.freeze(["useful","unclear","not_representative","missing","representative","not_useful","wrong","functionality_missing","suggestion"]);
const CHECKPOINTS=Object.freeze(["professional_representation","career_direction","application_output","journey_conclusion","initial_understanding","interview_question","representation","final","beta_experience"]);
const CATEGORIES=Object.freeze(["positive_value","issue","improvement","other","overall_beta"]);
const USEFULNESS=Object.freeze(["not_at_all","slightly","fairly","very"]);
const FUNCTION_AREAS=Object.freeze(["landing","profile","professional_representation","career_direction","application","enrichment","interview_training","other"]);
const text=v=>typeof v==="string"?v.trim():"";
const bounded=(v,n=4000)=>text(v).slice(0,n);
const safeEnum=(v,allowed)=>allowed.includes(text(v))?text(v):null;
const safeOverall=value=>{
 const v=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
 return Object.freeze({
  overallUsefulness:bounded(v.overallUsefulness,80)||null,
  easeOfUnderstanding:bounded(v.easeOfUnderstanding,80)||null,
  mostValuableFunction:bounded(v.mostValuableFunction,80)||null,
  greatestDifficulty:bounded(v.greatestDifficulty,600)||null,
  sawProfessionalPathDifferently:bounded(v.sawProfessionalPathDifferently,80)||null,
  improvementPriority:bounded(v.improvementPriority,600)||null,
  finalComment:bounded(v.finalComment,2000)||null
 });
};
export function createMemoryPrivateBetaFeedbackStore(){const records=[];return Object.freeze({append:async record=>{records.push(structuredClone(record));return record;},list:async({sessionRef=null,contextRef=null,betaSessionId=null}={})=>records.filter(x=>(!sessionRef||x.sessionRef===sessionRef)&&(!contextRef||x.contextRef===contextRef)&&(!betaSessionId||x.betaSessionId===betaSessionId)).map(x=>structuredClone(x))});}
export function buildPrivateBetaContextualFeedbackRecord({sessionRef=null,contextRef=null,betaSessionId=null,personRef=null,purpose=null,checkpoint,surface=null,questionKey=null,runtimeStepIdentity=null,objectRef=null,uiLanguage=null,artifactLanguage=null,sequence=0,reaction=null,comment=null,kind="contextual",category=null,usefulness=null,route=null,functionArea=null,workflowStep=null,buildVersion=null,profileLoaded=null,overall=null,now=()=>new Date().toISOString()}={}){
 const s=text(sessionRef),cx=text(contextRef),beta=text(betaSessionId)||cx||s,cp=text(checkpoint||surface),r=text(reaction),c=bounded(comment,4000),normalizedKind=kind==="final"?"final":kind==="overall"?"overall":"contextual",cat=safeEnum(category,CATEGORIES),use=safeEnum(usefulness,USEFULNESS);
 if(!s&&!cx&&!beta)throw new Error("PRIVATE_BETA_CONTEXTUAL_FEEDBACK_CONTEXT_REQUIRED");
 if(!CHECKPOINTS.includes(cp))throw new Error("PRIVATE_BETA_CONTEXTUAL_FEEDBACK_CHECKPOINT_INVALID");
 if(r&&!REACTIONS.includes(r))throw new Error("PRIVATE_BETA_CONTEXTUAL_FEEDBACK_REACTION_INVALID");
 if(category&&!cat)throw new Error("PRIVATE_BETA_FEEDBACK_CATEGORY_INVALID");
 if(usefulness&&!use)throw new Error("PRIVATE_BETA_FEEDBACK_USEFULNESS_INVALID");
 const overallRecord=normalizedKind==='overall'?safeOverall(overall):null;
 const hasOverall=overallRecord&&Object.values(overallRecord).some(Boolean);
 if(!r&&!c&&!cat&&!use&&!hasOverall)return null;
 const timestamp=now();
 return Object.freeze({version:"3.0",type:"private_beta_product_feedback",kind:normalizedKind,feedbackId:`feedback:${beta}:${cp}:${Number.isInteger(sequence)?sequence:0}:${timestamp}`,createdAt:timestamp,timestamp,betaSessionId:beta||null,sessionRef:s||null,contextRef:cx||null,personRef:personRef?.type==="person"?Object.freeze({...personRef}):null,purpose:text(purpose)||null,category:cat,reaction:r||null,freeText:c||null,comment:c||null,usefulness:use,route:bounded(route,180)||null,functionArea:safeEnum(functionArea,FUNCTION_AREAS)||"other",workflowStep:bounded(workflowStep,120)||null,checkpoint:cp,surface:text(surface)||null,questionKey:text(questionKey)||null,runtimeStepIdentity:text(runtimeStepIdentity)||null,objectRef:text(objectRef)||null,uiLanguage:["it","en"].includes(text(uiLanguage))?text(uiLanguage):null,artifactLanguage:["it","en"].includes(text(artifactLanguage))?text(artifactLanguage):null,buildVersion:bounded(buildVersion,120)||null,profileLoaded:typeof profileLoaded==='boolean'?profileLoaded:null,overall:overallRecord,sequence:Number.isInteger(sequence)?sequence:0});
}
export function createJsonlPrivateBetaFeedbackStore({filePath}={}){const path=text(filePath);if(!path)throw new Error("PRIVATE_BETA_FEEDBACK_FILE_PATH_REQUIRED");return Object.freeze({append:async record=>{await mkdir(dirname(path),{recursive:true});await appendFile(path,JSON.stringify(record)+"\n","utf8");return record;},list:async({sessionRef=null,contextRef=null,betaSessionId=null}={})=>{let raw="";try{raw=await readFile(path,"utf8");}catch(e){if(e?.code==="ENOENT")return [];throw e;}return raw.split(/\r?\n/).filter(Boolean).map(line=>JSON.parse(line)).filter(x=>(!sessionRef||x.sessionRef===sessionRef)&&(!contextRef||x.contextRef===contextRef)&&(!betaSessionId||x.betaSessionId===betaSessionId));}});}
export const PRIVATE_BETA_CONTEXTUAL_FEEDBACK_REACTIONS=REACTIONS;
export const PRIVATE_BETA_FEEDBACK_CHECKPOINTS=CHECKPOINTS;
export const PRIVATE_BETA_FEEDBACK_CATEGORIES=CATEGORIES;
export const PRIVATE_BETA_FEEDBACK_USEFULNESS=USEFULNESS;
export const PRIVATE_BETA_FEEDBACK_FUNCTION_AREAS=FUNCTION_AREAS;
