const crypto=require('crypto');
const {buildMeasurementResult}=require('../../observation/buildMeasurementResult');
const {validateMeasurementResult}=require('../../observation/validateMeasurementResult');
const {validateDecisionAccountabilityMeasureResult}=require('./validateDecisionAccountabilityMeasureResult');
function canonical(v){if(Array.isArray(v))return `[${v.map(canonical).join(',')}]`;if(v&&typeof v==='object')return `{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${canonical(v[k])}`).join(',')}}`;return JSON.stringify(v)}
function clone(v){return JSON.parse(JSON.stringify(v))}
function projectDecisionAccountabilityMeasureResult(result,{calculatedAt}={}){
 const v=validateDecisionAccountabilityMeasureResult(result);if(!v.isValid||result.resultStatus!=='draft')return null;
 const at=calculatedAt||result.metadata.createdAt;const semantic=clone(result);const id=`measurement_result:${crypto.createHash('sha256').update(canonical({projection:'decision_accountability_lossless_v1',semantic})).digest('hex')}`;
 const out=buildMeasurementResult({id,measurementId:'decision_accountability',characteristicId:'decision_accountability',observationRefs:[{type:'decision_accountability_observation',id:result.observationId}],normalizedValue:result.score,direction:result.score===0?'neutral':'positive',confidence:result.inferenceSupport.value,coverage:result.inferenceSupport.components.coverage,evidenceQuality:result.inferenceSupport.components.evidenceQuality,sourceReliability:result.inferenceSupport.components.sourceConvergence,independence:1,consistency:result.inferenceSupport.components.consistency,status:'calculated',calculatedAt:at,calculatedBy:'decision_accountability_lossless_projection_v1',metadata:{version:'1.0',createdAt:at},extensions:{projection:{type:'lossless_identity_preserving',version:'1.0',specializedResult:semantic}}});
 const ov=validateMeasurementResult(out);if(!ov.valid)throw Object.assign(new Error(ov.errors.join(' | ')),{code:'INVALID_DECISION_ACCOUNTABILITY_PROJECTION'});return out;
}
module.exports={projectDecisionAccountabilityMeasureResult};
