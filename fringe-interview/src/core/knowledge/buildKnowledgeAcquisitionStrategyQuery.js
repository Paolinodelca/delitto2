const {validateKnowledgeAcquisitionStrategyQuery,FIELDS}=require('./validateKnowledgeAcquisitionStrategyQuery');
function clone(v){if(Array.isArray(v))return v.map(clone);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,clone(x)]));return v}
function buildKnowledgeAcquisitionStrategyQuery(input={}){const q={};for(const k of FIELDS)if(input[k]!==undefined)q[k]=typeof input[k]==='string'?input[k].trim():input[k];const v=validateKnowledgeAcquisitionStrategyQuery(q);if(!v.valid){const e=new Error(v.errors.join(' | '));e.code='INVALID_KNOWLEDGE_ACQUISITION_STRATEGY_QUERY';e.details=v;throw e}return clone(q)}
module.exports={buildKnowledgeAcquisitionStrategyQuery};
