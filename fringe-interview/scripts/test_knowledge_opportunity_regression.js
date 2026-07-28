const assert=require('assert');const fs=require('fs');const path=require('path');const know=require('../src/core/knowledge');const {buildCoverage}=require('./knowledge_opportunity_fixture');
const coverage=buildCoverage(),query={knowledgeLayer:'derived'},cb=JSON.stringify(coverage),qb=JSON.stringify(query);const result=know.evaluateKnowledgeOpportunities(coverage,query);assert.strictEqual(JSON.stringify(coverage),cb);assert.strictEqual(JSON.stringify(query),qb);const forbidden=['score','rank','ranking','priority','weight','recommendation','recommendedAction','question','prompt','candidateAssessment','personAssessment'];function walk(v){if(Array.isArray(v))return v.forEach(walk);if(v&&typeof v==='object')for(const [k,x] of Object.entries(v)){assert(!forbidden.includes(k),`forbidden field ${k}`);walk(x)}}walk(result);assert.throws(()=>know.buildKnowledgeOpportunity({opportunityType:'unknown'}));const bad=JSON.parse(JSON.stringify(result));bad.opportunities[0].priority='high';assert(!know.validateKnowledgeOpportunityCollection(bad).valid);const sourceFiles=['buildKnowledgeOpportunity.js','evaluateKnowledgeOpportunities.js','healthKnowledgeOpportunity.js'].map(f=>fs.readFileSync(path.join(__dirname,'../src/core/knowledge',f),'utf8'));for(const s of sourceFiles){assert(!/\b(fetch|axios|openai|groq|callback|setTimeout|setInterval|Math\.random)\b/i.test(s));assert(!/require\(['"](?:fs|http|https|net|tls)['"]\)/.test(s));}
const validCollection=know.evaluateKnowledgeOpportunities(buildCoverage());
function invalidSummary(mutator){const copy=JSON.parse(JSON.stringify(validCollection));mutator(copy.summary);assert(!know.validateKnowledgeOpportunityCollection(copy).valid);}
invalidSummary(s=>{s.byOpportunityType.derived_layer_only+=1});
invalidSummary(s=>{delete s.byOpportunityType.derived_layer_only});
invalidSummary(s=>{s.byOpportunityType.unknown_type=1});
invalidSummary(s=>{s.byOpportunityType.derived_layer_only=-1});
invalidSummary(s=>{s.byOpportunityType.derived_layer_only=1.5});
invalidSummary(s=>{s.totalOpportunities+=1});
invalidSummary(s=>{s.empty=!s.empty});
const emptyCollection={...validCollection,id:'empty_summary_regression',opportunities:[],summary:{totalOpportunities:0,dimensionOpportunityCount:0,capabilityOpportunityCount:0,byOpportunityType:{},empty:true}};
assert(know.validateKnowledgeOpportunityCollection(emptyCollection).valid);
console.log('Knowledge Opportunity regression tests PASSED');
