const {validateKnowledgeCoverage}=require('./validateKnowledgeCoverage');
const {queryKnowledgeCoverage}=require('./queryKnowledgeCoverage');
const {validateKnowledgeCoverageQueryResult}=require('./validateKnowledgeCoverageQueryResult');
function healthKnowledgeCoverageQuery(coverage){const cv=validateKnowledgeCoverage(coverage);if(!cv.valid)throw new Error(cv.errors.join(' | '));const result=queryKnowledgeCoverage(coverage,{knowledgeLayer:'derived'});const v=validateKnowledgeCoverageQueryResult(result);if(!v.valid)throw new Error(v.errors.join(' | '));return{ok:true,result};}
module.exports={healthKnowledgeCoverageQuery};
