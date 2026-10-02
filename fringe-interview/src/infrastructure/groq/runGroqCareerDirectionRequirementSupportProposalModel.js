import { runGroqChatCompletion } from './runGroqChatCompletion.js';
export const CAREER_DIRECTION_REQUIREMENT_SUPPORT_PROPOSAL_SCHEMA={type:'object',properties:{proposals:{type:'array',maxItems:12,items:{type:'object',properties:{contributorRef:{type:'string'},targetDirectionRef:{type:'string'},targetRequirementRef:{type:'string'},relationBasis:{type:'string'}},required:['contributorRef','targetDirectionRef','targetRequirementRef','relationBasis']}}},required:['proposals']};
export async function runGroqCareerDirectionRequirementSupportProposalModel({systemPrompt,userPrompt,runner=runGroqChatCompletion,executionDiagnosticSink}={}){
 const result=await runner({task:'careerDirectionRequirementSupportProposal',systemText:systemPrompt,userText:userPrompt,temperature:0.1,maxRetries:1,retryDelayMs:500,jsonSchema:CAREER_DIRECTION_REQUIREMENT_SUPPORT_PROPOSAL_SCHEMA,strictSchemaCompatible:true,executionDiagnosticSink});
 let parsed;try{parsed=JSON.parse(result.content);}catch{const e=new Error('PD079L_MALFORMED_STRUCTURED_OUTPUT');e.task='careerDirectionRequirementSupportProposal';throw e;}
 if(!parsed||!Array.isArray(parsed.proposals)){const e=new Error('PD079L_INVALID_STRUCTURED_OUTPUT');e.task='careerDirectionRequirementSupportProposal';throw e;}
 return {model:result.model,outputMode:result.outputMode,attemptsUsed:result.attemptsUsed,execution:result.execution,rateLimitMetadata:result.rateLimitMetadata,structured:parsed};
}
export default runGroqCareerDirectionRequirementSupportProposalModel;
