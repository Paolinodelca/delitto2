import { createDirectionExplorationContext } from './contracts.js';
const arr=v=>Array.isArray(v)?v.map(x=>String(x??'').trim()).filter(Boolean):[];
const text=v=>typeof v==='string'?v.trim():'';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const freeze=v=>Object.freeze(clone(v));
export const CAREER_PREFERENCE_STATES=Object.freeze(['declared','uncertain','no_preference']);
export function createCareerPreferenceContext(x={}){
 const state=CAREER_PREFERENCE_STATES.includes(x.preferenceState)?x.preferenceState:'declared';
 const exploration=createDirectionExplorationContext(state==='no_preference'?{...x,preferredThemes:[],avoidedConditions:[],workContextPreferences:[],explicitDirectionRequests:[],uncertainties:[]}:x);
 const confirmedAt=text(x.confirmedAt)||text(x.updatedAt)||new Date().toISOString();
 const revision=Number.isInteger(x.revision)&&x.revision>0?x.revision:1;
 return freeze({...exploration,careerPreferenceContextVersion:'1.0',preferenceState:state,uncertainties:arr(x.uncertainties),candidateDeclared:true,revision,confirmedAt,updatedAt:text(x.updatedAt)||confirmedAt});
}
export function currentCareerPreferenceContext(record){const c=record?.applicationState?.careerPreferenceContext;return c?.candidateDeclared===true?createCareerPreferenceContext(c):null;}
export function reviseCareerPreferenceContext({priorContext=null,input={},now=new Date().toISOString()}={}){
 const prior=priorContext?.candidateDeclared===true?createCareerPreferenceContext(priorContext):null;
 const state=CAREER_PREFERENCE_STATES.includes(input.preferenceState)?input.preferenceState:'declared';
 const nextBase={...input,preferenceState:state};
 const nextComparable=createCareerPreferenceContext({...nextBase,revision:prior?.revision||1,confirmedAt:prior?.confirmedAt||now,updatedAt:prior?.updatedAt||now});
 const fields=['preferenceState','preferredThemes','avoidedConditions','geographyConstraints','mobilityConstraints','workContextPreferences','explicitDirectionRequests','uncertainties'];
 const same=prior&&fields.every(k=>JSON.stringify(prior[k]??[])===JSON.stringify(nextComparable[k]??[]));
 if(same)return prior;
 return createCareerPreferenceContext({...nextBase,revision:(prior?.revision||0)+1,confirmedAt:now,updatedAt:now});
}
export function careerPreferenceToExplorationContext(context){if(!context?.candidateDeclared)return createDirectionExplorationContext({});return createDirectionExplorationContext(context);}
