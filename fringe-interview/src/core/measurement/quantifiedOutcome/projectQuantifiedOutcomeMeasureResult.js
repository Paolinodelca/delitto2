const crypto=require('crypto');
const {buildMeasurementResult}=require('../../observation/buildMeasurementResult');
const {validateMeasurementResult}=require('../../observation/validateMeasurementResult');
const {validateQuantifiedOutcomeMeasureResult}=require('./validateQuantifiedOutcomeMeasureResult');
function canonical(v){if(Array.isArray(v))return`[${v.map(canonical).join(',')}]`;if(v&&typeof v==='object')return`{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${canonical(v[k])}`).join(',')}}`;return JSON.stringify(v)}
function clone(v){return JSON.parse(JSON.stringify(v))}
function projectQuantifiedOutcomeMeasureResult(result,{calculatedAt}={}){
 const v=validateQuantifiedOutcomeMeasureResult(result);if(!v.isValid||result.resultStatus!=='draft')return null;
 const at=calculatedAt||result.metadata.createdAt,semantic=clone(result),id=`measurement_result:${crypto.createHash('sha256').update(canonical({projection:'quantified_outcome_lossless_v1',semantic})).digest('hex')}`;
 const out=buildMeasurementResult({id,measurementId:'quantified_outcome',characteristicId:'quantified_outcome',observationRefs:[{type:'quantified_outcome_observation',id:result.observationId}],normalizedValue:1,direction:'positive',confidence:1,coverage:1,evidenceQuality:1,sourceReliability:1,independence:1,consistency:1,status:'calculated',calculatedAt:at,calculatedBy:'quantified_outcome_lossless_projection_v1',metadata:{version:'1.0',createdAt:at},extensions:{projection:{type:'lossless_identity_preserving',version:'1.0',meaning:'supported_presence_not_magnitude_score',specializedResult:semantic}}});
 const ov=validateMeasurementResult(out);if(!ov.valid)throw Object.assign(new Error(ov.errors.join(' | ')),{code:'INVALID_QUANTIFIED_OUTCOME_PROJECTION'});return out;
}
module.exports={projectQuantifiedOutcomeMeasureResult};
