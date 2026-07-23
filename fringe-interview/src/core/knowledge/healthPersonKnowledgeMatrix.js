const {buildPersonKnowledgeMatrix}=require('./buildPersonKnowledgeMatrix');const {validatePersonKnowledgeMatrix}=require('./validatePersonKnowledgeMatrix');
function healthPersonKnowledgeMatrix(snapshot,derivedStates,now){const matrix=buildPersonKnowledgeMatrix({subjectRef:{type:'person',id:'health-subject'},knowledgeSnapshot:snapshot,derivedStates},{now});const validation=validatePersonKnowledgeMatrix(matrix);if(!validation.valid)throw new Error(validation.errors.join(' | '));return{ok:true,matrix}}
module.exports={healthPersonKnowledgeMatrix};
