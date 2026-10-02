const {buildDecisionAccountabilityMeasureDefinition}=require('./buildDecisionAccountabilityMeasureDefinition');
const {validateDecisionAccountabilityObservation}=require('./validateDecisionAccountabilityObservation');
const {validateMeasurementDefinition}=require('../validateMeasurementDefinition');

const A={recommendation:.3,shared:.7,final:1};
const S={individual_task:.15,team:.4,function:.65,site:.85,organization:1};
const E={claimed:.15,implicit:.4,explicit:.75,explicit_with_outcomes:1};
const isObject=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const round=v=>Math.round(v*10000)/10000;
function band(v,t){if(v<t.weak)return'not_supported';if(v<t.moderate)return'weak';if(v<t.strong)return'moderate';if(v<t.veryStrong)return'strong';return'very_strong'}
function iband(v){if(v===0)return'none';if(v<.4)return'low';if(v<.6)return'moderate';if(v<.8)return'high';return'very_high'}

function continuityScore(continuity,benchmarkMonths){
  if(continuity?.state!=='known'||continuity.qualification!=='exact'||typeof continuity.months!=='number')return null;
  return Math.min(continuity.months/benchmarkMonths,1);
}

function knownWeightedStrength(components,weights){
  const entries=[
    ['decisionAuthorityScore','decisionAuthority'],
    ['consequenceScopeScore','consequenceScope'],
    ['accountabilityEvidenceScore','accountabilityEvidence'],
    ['responsibilityContinuityScore','responsibilityContinuity']
  ].filter(([componentKey,weightKey])=>typeof components[componentKey]==='number'&&typeof weights[weightKey]==='number'&&weights[weightKey]>0);
  const totalWeight=entries.reduce((sum,[,weightKey])=>sum+weights[weightKey],0);
  if(!entries.length||totalWeight<=0)return null;
  return round(entries.reduce((sum,[componentKey,weightKey])=>sum+components[componentKey]*weights[weightKey],0)/totalWeight);
}

function buildDecisionAccountabilityMeasureResult({observation={},definition=null}={}){
  const d=definition??buildDecisionAccountabilityMeasureDefinition();
  const ov=validateDecisionAccountabilityObservation(observation);
  const dv=validateMeasurementDefinition(d);
  const compatible=dv.isValid&&d.dimensionId==='decision_accountability'&&isObject(d.aggregation?.weights)&&isObject(d.thresholds);
  const w=d.aggregation?.weights||{};
  const bm=d.benchmark?.reference?.responsibilityContinuityMonths||24;
  let status=!ov.isValid||!compatible?'invalid':observation.observationStatus==='contextual'?'contextual':observation.observationStatus!=='observed'?'insufficient':'draft';

  const ca=A[observation.decisionAuthority];
  const cs=S[observation.consequenceScope];
  const ae=observation.accountabilityEvidence===null?null:E[observation.accountabilityEvidence];
  const rc=continuityScore(observation.responsibilityContinuity,bm);
  const components={
    decisionAuthorityScore:ca===undefined?null:ca,
    consequenceScopeScore:cs===undefined?null:cs,
    accountabilityEvidenceScore:ae===null||ae===undefined?null:ae,
    responsibilityContinuityScore:rc
  };

  let score=null,b=null;
  if(status==='draft'){
    score=knownWeightedStrength(components,w);
    if(score===null)status='insufficient';
    else b=band(score,d.thresholds);
  }

  const inf=observation.inferenceSupportInputs||{},infComponents={};
  for(const f of ['evidenceQuality','sourceConvergence','consistency','coverage'])infComponents[f]=isObject(inf[f])?JSON.parse(JSON.stringify(inf[f])):{state:'not_yet_derived'};
  const allInfKnown=Object.values(infComponents).every(x=>x.state==='known');
  const iv=allInfKnown?round(infComponents.evidenceQuality.value*.3+infComponents.sourceConvergence.value*.25+infComponents.consistency.value*.25+infComponents.coverage.value*.2):null;

  const notes=[];
  if(observation.decisionAuthority==='final')notes.push('Final decision authority was observed.');
  if(['site','organization'].includes(observation.consequenceScope))notes.push('Observed decisions affected a broad organizational scope.');
  if(observation.accountabilityEvidence==='explicit_with_outcomes')notes.push('Decision responsibility was explicitly connected to observable outcomes.');
  if(rc!==null&&rc>=1)notes.push('Observed responsibility continuity reached the configured benchmark.');
  if(status==='draft'&&Object.values(components).some(v=>v===null))notes.push('Strength was calculated only from known applicable components; unknown optional components were preserved as unknown and excluded from aggregation.');
  if(status==='insufficient')notes.push('Strength measurement is unavailable because no canonically applicable known strength components can be aggregated.');
  if(!allInfKnown)notes.push('Inference support is partial or unavailable; unknown inputs were not scored as zero.');

  return {
    measureId:'decision_accountability',
    resultStatus:status,
    observationId:typeof observation.observationId==='string'?observation.observationId:null,
    score,
    band:b,
    components,
    weights:{
      decisionAuthority:w.decisionAuthority||0,
      consequenceScope:w.consequenceScope||0,
      accountabilityEvidence:w.accountabilityEvidence||0,
      responsibilityContinuity:w.responsibilityContinuity||0
    },
    benchmarkReference:{responsibilityContinuityMonths:bm},
    inferenceSupport:{state:allInfKnown?'known':'partial',value:iv,band:iv===null?null:iband(iv),components:infComponents},
    evidenceIds:Array.isArray(observation.evidenceIds)?[...observation.evidenceIds]:[],
    context:isObject(observation.context)?{...observation.context}:{},
    explainability:{
      strongestComponent:status==='draft'?Object.entries(components).filter(([,v])=>typeof v==='number').sort((a,b)=>b[1]-a[1])[0]?.[0].replace('Score','')||null:null,
      weakestComponent:status==='draft'?Object.entries(components).filter(([,v])=>typeof v==='number').sort((a,b)=>a[1]-b[1])[0]?.[0].replace('Score','')||null:null,
      notes
    },
    limitations:Array.isArray(observation.limitations)?[...new Set(observation.limitations)]:[],
    metadata:{version:'1.2',createdAt:new Date().toISOString()},
    extensions:{observationValidation:ov,definitionValidation:dv,aggregation:{mode:'known_applicable_weight_normalization',knownComponentCount:Object.values(components).filter(v=>typeof v==='number').length}}
  };
}
module.exports={buildDecisionAccountabilityMeasureResult};
