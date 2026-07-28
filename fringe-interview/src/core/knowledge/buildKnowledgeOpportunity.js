const crypto=require('crypto');
const {validateKnowledgeOpportunity}=require('./validateKnowledgeOpportunity');
function obj(v){return v&&typeof v==='object'&&!Array.isArray(v)}
function clone(v){if(Array.isArray(v))return v.map(clone);if(obj(v))return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,clone(x)]));return v}
function stable(v){if(Array.isArray(v))return `[${v.map(stable).join(',')}]`;if(obj(v))return `{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${stable(v[k])}`).join(',')}}`;return JSON.stringify(v)}
function hash(v){return crypto.createHash('sha256').update(stable(v)).digest('hex')}
function fail(code,v){const e=new Error(v.errors.join(' | '));e.code=code;e.details=v;throw e}
function buildKnowledgeOpportunity(input={}){
 const identity={opportunityType:input.opportunityType,scope:input.scope,scopeRef:input.scopeRef,sourceCoverageRef:input.sourceCoverageRef,coverageState:input.coverageState,knowledgeLayers:[...(input.knowledgeLayers||[])].sort(),reasonCodes:[...(input.reasonCodes||[])].sort(),opportunityVersion:'1.0'};
 const out={id:`knowledgeOpportunity_${hash(identity).slice(0,32)}`,opportunityVersion:'1.0',opportunityType:input.opportunityType,scope:input.scope,scopeRef:input.scopeRef,coverageState:input.coverageState,knowledgeLayers:[...(input.knowledgeLayers||[])].sort(),reasonCodes:[...(input.reasonCodes||[])].sort(),sourceCoverageRef:input.sourceCoverageRef,provenance:{type:'knowledge_opportunity_evaluation',producerVersion:'1.0',deterministic:true,interpretive:false},dependencyRefs:[...(input.dependencyRefs||[input.sourceCoverageRef])].filter(Boolean).sort(),metadata:{contractVersion:'1.0',evaluationStrategyVersion:'1.0',readOnly:true},extensions:obj(input.extensions)?clone(input.extensions):{}};
 const v=validateKnowledgeOpportunity(out);if(!v.valid)fail('INVALID_GENERATED_KNOWLEDGE_OPPORTUNITY',v);return out;
}
module.exports={buildKnowledgeOpportunity};
