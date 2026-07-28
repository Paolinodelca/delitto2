const { validatePersonKnowledgeQuery } = require('./validatePersonKnowledgeQuery');
function obj(v){return v!==null&&typeof v==='object'&&!Array.isArray(v)}
function clone(v){if(Array.isArray(v))return v.map(clone);if(obj(v))return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,clone(x)]));return v}
function str(v){return typeof v==='string'&&v.trim()?v.trim():undefined}
function fail(code,message,details){const e=new Error(message);e.code=code;if(details)e.details=details;throw e}
function buildPersonKnowledgeQuery(input={}){
 const query={};
 for(const key of ['dimensionId','knowledgeLayer','capabilityId','recipeId','recipeVersion']){const value=str(input[key]);if(value!==undefined)query[key]=value}
 const validation=validatePersonKnowledgeQuery(query);if(!validation.valid)fail('INVALID_PERSON_KNOWLEDGE_QUERY',validation.errors.join(' | '),validation);
 return clone(query);
}
module.exports={buildPersonKnowledgeQuery};
