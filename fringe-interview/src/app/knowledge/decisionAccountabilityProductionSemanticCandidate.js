const AUTHORITIES = ['none','recommendation','shared','final'];
const POSITIVE_AUTHORITIES = ['recommendation','shared','final'];
const SCOPES = ['individual_task','team','function','site','organization'];
const ACCOUNTABILITY = ['claimed','implicit','explicit','explicit_with_outcomes'];
const QUALIFICATIONS = ['exact','approximate','lower_bound','upper_bound','range'];
const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const nonNegative = v => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const clean = v => typeof v === 'string' && v.trim() ? v.trim() : null;

const DECISION_ACCOUNTABILITY_SEMANTIC_CANDIDATE_SCHEMA = Object.freeze({
  type:'object',
  properties:{
    interpretationStatus:{type:'string',enum:['SUPPORTED','UNSUPPORTED']},
    decisionAuthority:{anyOf:[{type:'string',enum:AUTHORITIES},{type:'null'}]},
    consequenceScope:{anyOf:[{type:'string',enum:SCOPES},{type:'null'}]},
    accountabilityEvidence:{anyOf:[{type:'string',enum:ACCOUNTABILITY},{type:'null'}]},
    responsibilityContinuity:{
      type:'object',
      properties:{
        state:{type:'string',enum:['known','unknown']},
        qualification:{anyOf:[{type:'string',enum:QUALIFICATIONS},{type:'null'}]},
        months:{anyOf:[{type:'number',minimum:0},{type:'null'}]},
        minimumMonths:{anyOf:[{type:'number',minimum:0},{type:'null'}]},
        maximumMonths:{anyOf:[{type:'number',minimum:0},{type:'null'}]}
      },
      required:['state','qualification','months','minimumMonths','maximumMonths'],additionalProperties:false
    },
    context:{
      type:'object',
      properties:{decision:{anyOf:[{type:'string'},{type:'null'}]},responsibility:{anyOf:[{type:'string'},{type:'null'}]},consequence:{anyOf:[{type:'string'},{type:'null'}]}},
      required:['decision','responsibility','consequence'],additionalProperties:false
    },
    limitations:{type:'array',items:{type:'string'}}
  },
  required:['interpretationStatus','decisionAuthority','consequenceScope','accountabilityEvidence','responsibilityContinuity','context','limitations'],additionalProperties:false
});

function validateContinuity(t, errors){
  if(!isObject(t)||!['known','unknown'].includes(t.state)){errors.push('responsibilityContinuity state is invalid.');return;}
  if(t.state==='unknown'){
    if(t.qualification!==null||t.months!==null||t.minimumMonths!==null||t.maximumMonths!==null)errors.push('unknown continuity must not carry temporal values.');
    return;
  }
  if(!QUALIFICATIONS.includes(t.qualification)){errors.push('known continuity qualification is invalid.');return;}
  if(['exact','approximate','lower_bound','upper_bound'].includes(t.qualification)){
    if(!nonNegative(t.months)||t.minimumMonths!==null||t.maximumMonths!==null)errors.push('known scalar continuity is malformed.');
  } else if(!nonNegative(t.minimumMonths)||!nonNegative(t.maximumMonths)||t.minimumMonths>t.maximumMonths||t.months!==null)errors.push('known continuity range is malformed.');
}

function validateDecisionAccountabilityProductionSemanticCandidate(candidate={}){
  const errors=[];
  if(!isObject(candidate))return {isValid:false,errors:['semantic candidate must be an object.']};
  const allowed=['interpretationStatus','decisionAuthority','consequenceScope','accountabilityEvidence','responsibilityContinuity','context','limitations'];
  Object.keys(candidate).filter(k=>!allowed.includes(k)).forEach(k=>errors.push(`unauthorized semantic candidate field: ${k}.`));
  if(!['SUPPORTED','UNSUPPORTED'].includes(candidate.interpretationStatus))errors.push('interpretationStatus is invalid.');
  if(candidate.decisionAuthority!==null&&!AUTHORITIES.includes(candidate.decisionAuthority))errors.push('decisionAuthority is invalid.');
  if(candidate.consequenceScope!==null&&!SCOPES.includes(candidate.consequenceScope))errors.push('consequenceScope is invalid.');
  if(candidate.accountabilityEvidence!==null&&!ACCOUNTABILITY.includes(candidate.accountabilityEvidence))errors.push('accountabilityEvidence is invalid.');
  validateContinuity(candidate.responsibilityContinuity,errors);
  if(!isObject(candidate.context))errors.push('context must be an object.');
  else {
    const contextKeys=['decision','responsibility','consequence'];
    Object.keys(candidate.context).filter(k=>!contextKeys.includes(k)).forEach(k=>errors.push(`context.${k} is not allowed.`));
    contextKeys.forEach(k=>{if(candidate.context[k]!==null&&typeof candidate.context[k]!=='string')errors.push(`context.${k} must be string or null.`)});
  }
  if(!Array.isArray(candidate.limitations)||candidate.limitations.some(x=>typeof x!=='string'))errors.push('limitations must be an array of strings.');
  const concreteContext=isObject(candidate.context)&&Boolean(clean(candidate.context.decision))&&Boolean(clean(candidate.context.responsibility));
  if(candidate.interpretationStatus==='SUPPORTED'){
    const positive=POSITIVE_AUTHORITIES.includes(candidate.decisionAuthority)&&SCOPES.includes(candidate.consequenceScope)&&concreteContext;
    const contextual=candidate.decisionAuthority==='none'&&concreteContext;
    if(!positive&&!contextual)errors.push('SUPPORTED candidate does not meet positive/contextual minimum sufficiency.');
  }
  return {isValid:errors.length===0,errors};
}

function candidateToObservationInput(candidate={}){
  const context={};
  for(const key of ['decision','responsibility','consequence']){const value=clean(candidate.context?.[key]);if(value)context[key]=value;}
  const continuity=candidate.responsibilityContinuity?.state==='known'
    ? candidate.responsibilityContinuity.qualification==='range'
      ? {state:'known',qualification:'range',minimumMonths:candidate.responsibilityContinuity.minimumMonths,maximumMonths:candidate.responsibilityContinuity.maximumMonths}
      : {state:'known',qualification:candidate.responsibilityContinuity.qualification,months:candidate.responsibilityContinuity.months}
    : {state:'unknown'};
  return {decisionAuthority:candidate.decisionAuthority,consequenceScope:candidate.consequenceScope,accountabilityEvidence:candidate.accountabilityEvidence,responsibilityContinuity:continuity,context,limitations:candidate.limitations};
}
module.exports={DECISION_ACCOUNTABILITY_SEMANTIC_CANDIDATE_SCHEMA,validateDecisionAccountabilityProductionSemanticCandidate,candidateToObservationInput};
