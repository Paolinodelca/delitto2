const {validateQuantifiedOutcomeObservation}=require('./validateQuantifiedOutcomeObservation');
function clone(v){return JSON.parse(JSON.stringify(v))}
function buildQuantifiedOutcomeMeasureResult({observation={}}={}){
 const valid=validateQuantifiedOutcomeObservation(observation).isValid&&observation.observationStatus==='observed';
 return {measureId:'quantified_outcome',resultStatus:valid?'draft':'insufficient',observationId:typeof observation.observationId==='string'?observation.observationId:null,presence:valid?1:null,evidenceIds:Array.isArray(observation.evidenceIds)?[...observation.evidenceIds]:[],context:observation.context&&typeof observation.context==='object'?clone(observation.context):{},semanticDetail:valid?{measurableOutcome:observation.measurableOutcome,quantitativeValue:clone(observation.quantitativeValue),contributionRelationship:observation.contributionRelationship,causalityBoundary:observation.causalityBoundary}:null,limitations:Array.isArray(observation.limitations)?[...observation.limitations]:[],metadata:{version:'1.0',createdAt:observation.metadata?.createdAt||new Date().toISOString()},extensions:{observationValidation:validateQuantifiedOutcomeObservation(observation)}};
}
module.exports={buildQuantifiedOutcomeMeasureResult};
