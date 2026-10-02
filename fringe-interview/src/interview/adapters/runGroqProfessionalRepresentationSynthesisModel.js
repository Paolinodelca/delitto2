import { runGroqChatCompletion } from '../../infrastructure/groq/runGroqChatCompletion.js';
export async function runGroqProfessionalRepresentationSynthesisModel({systemPrompt,userPrompt}={}){
 const result=await runGroqChatCompletion({task:'professionalRepresentationSynthesis',systemText:systemPrompt,userText:userPrompt,temperature:0.1,maxRetries:1,retryDelayMs:500});
 return {model:result.model,rawContent:result.content,outputMode:result.outputMode};
}
export default runGroqProfessionalRepresentationSynthesisModel;
