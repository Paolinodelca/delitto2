function obj(v){return v!==null&&typeof v==='object'&&!Array.isArray(v)}
function validateQuantifiedOutcomeObservation(o){
 const errors=[];
 if(!obj(o))return{isValid:false,errors:['Observation must be an object.']};
 if(typeof o.observationId!=='string'||!o.observationId.trim())errors.push('observationId is invalid.');
 if(o.observationType!=='quantified_outcome')errors.push('observationType is invalid.');
 if(!['observed','insufficient'].includes(o.observationStatus))errors.push('observationStatus is invalid.');
 if(typeof o.measurableOutcome!=='string'||!o.measurableOutcome.trim())errors.push('measurableOutcome is invalid.');
 if(!obj(o.quantitativeValue)||typeof o.quantitativeValue.value!=='number'||!Number.isFinite(o.quantitativeValue.value)||typeof o.quantitativeValue.unit!=='string'||!o.quantitativeValue.unit.trim()||typeof o.quantitativeValue.approximate!=='boolean'||!['increase','decrease','change','level'].includes(o.quantitativeValue.direction))errors.push('quantitativeValue is invalid.');
 if(typeof o.contributionRelationship!=='string'||!o.contributionRelationship.trim())errors.push('contributionRelationship is invalid.');
 if(!['contribution_only','sole_causality_established'].includes(o.causalityBoundary))errors.push('causalityBoundary is invalid.');
 if(!obj(o.context)||Object.keys(o.context).length===0)errors.push('context is invalid.');
 if(!Array.isArray(o.evidenceIds)||o.evidenceIds.length===0||o.evidenceIds.some(x=>typeof x!=='string'||!x.trim()))errors.push('evidenceIds are invalid.');
 if(!Array.isArray(o.limitations)||!obj(o.metadata)||!obj(o.extensions))errors.push('Observation metadata/limitations/extensions are invalid.');
 return{isValid:errors.length===0,errors};
}
module.exports={validateQuantifiedOutcomeObservation};
