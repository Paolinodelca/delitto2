function obj(v){return v!==null&&typeof v==='object'&&!Array.isArray(v)}
function strings(v){return Array.isArray(v)?[...new Set(v.filter(x=>typeof x==='string'&&x.trim()).map(x=>x.trim()))]:[]}
function clone(v){return JSON.parse(JSON.stringify(v))}
function quantitative(v){
 if(!obj(v)||typeof v.value!=='number'||!Number.isFinite(v.value))return null;
 const unit=typeof v.unit==='string'&&v.unit.trim()?v.unit.trim():null;
 if(!unit)return null;
 return {value:v.value,unit,approximate:v.approximate===true,direction:['increase','decrease','change','level'].includes(v.direction)?v.direction:'change'};
}
function buildQuantifiedOutcomeObservation(input={}){
 const s=obj(input)?input:{};
 const evidenceIds=strings(s.evidenceIds), outcome=typeof s.measurableOutcome==='string'&&s.measurableOutcome.trim()?s.measurableOutcome.trim():null;
 const value=quantitative(s.quantitativeValue), context=obj(s.context)?clone(s.context):{};
 const relationship=typeof s.contributionRelationship==='string'&&s.contributionRelationship.trim()?s.contributionRelationship.trim():null;
 const causalityBoundary=s.causalityBoundary==='sole_causality_established'?'sole_causality_established':s.causalityBoundary==='contribution_only'?'contribution_only':null;
 const observed=!!(outcome&&value&&relationship&&causalityBoundary&&evidenceIds.length&&Object.keys(context).length);
 return {observationId:typeof s.observationId==='string'&&s.observationId.trim()?s.observationId:null,observationType:'quantified_outcome',observationStatus:observed?'observed':'insufficient',measurableOutcome:outcome,quantitativeValue:value,contributionRelationship:relationship,causalityBoundary,context,evidenceIds,limitations:strings(s.limitations),metadata:{version:'1.0',createdAt:s.metadata?.createdAt||new Date().toISOString()},extensions:obj(s.extensions)?clone(s.extensions):{}};
}
module.exports={buildQuantifiedOutcomeObservation};
