const crypto = require('crypto');
function obj(v){return v!==null&&typeof v==='object'&&!Array.isArray(v)}
function clone(v){if(Array.isArray(v))return v.map(clone);if(obj(v))return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,clone(x)]));return v}
function str(v){return typeof v==='string'&&v.trim()?v.trim():null}
function stable(v){if(Array.isArray(v))return `[${v.map(stable).join(',')}]`;if(obj(v))return `{${Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')}}`;return JSON.stringify(v)}
function hash(v){return crypto.createHash('sha256').update(v).digest('hex')}
function buildDerivedDimensionMapping(input={},options={}){
  const resultTarget={knowledgeType:str(input.resultTarget&&input.resultTarget.knowledgeType),knowledgeId:str(input.resultTarget&&input.resultTarget.knowledgeId)};
  const dimensionId=str(input.dimensionId); const estimate=input.estimate; const confidenceStrategy='minimum';
  const createdAt=str(options.now)||str(input.metadata&&input.metadata.createdAt)||new Date().toISOString();
  const logical={resultTarget,dimensionId,estimate,confidenceStrategy,version:'1.0'};
  return {id:`derivedDimensionMapping_${hash(stable(logical)).slice(0,32)}`,resultTarget,dimensionId,estimate,confidenceStrategy,metadata:{version:'1.0',createdAt,updatedAt:createdAt},extensions:obj(input.extensions)?clone(input.extensions):{}};
}
module.exports={buildDerivedDimensionMapping};
