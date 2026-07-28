const { validateKnowledgeCoverageQuery } = require('./validateKnowledgeCoverageQuery');
function clone(v){if(Array.isArray(v))return v.map(clone);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,clone(x)]));return v;}
function buildKnowledgeCoverageQuery(input={}){const q={};for(const k of ['dimensionId','capabilityId','coverageState','knowledgeLayer','overallCoverageState'])if(input[k]!==undefined)q[k]=typeof input[k]==='string'?input[k].trim():input[k];const v=validateKnowledgeCoverageQuery(q);if(!v.valid){const e=new Error(v.errors.join(' | '));e.code='INVALID_KNOWLEDGE_COVERAGE_QUERY';e.details=v;throw e;}return clone(q);}
module.exports={buildKnowledgeCoverageQuery};
