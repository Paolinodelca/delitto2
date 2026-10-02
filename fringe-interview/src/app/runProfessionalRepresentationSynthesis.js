import { extractJsonObject } from '../parser/extractJsonObject.js';
import { buildProfessionalRepresentationSynthesisPrompt } from '../interview/buildProfessionalRepresentationSynthesisPrompt.js';
import { runGroqProfessionalRepresentationSynthesisModel } from '../interview/adapters/runGroqProfessionalRepresentationSynthesisModel.js';
import { buildProfessionalRepresentationSynthesisInput,buildDeterministicProfessionalRepresentation,reconcileProfessionalRepresentationRealization } from './buildProfessionalRepresentationSynthesis.js';
export async function runProfessionalRepresentationSynthesis({authorizedSemanticMaterial=[],locale='it',narrativeRealizer=runGroqProfessionalRepresentationSynthesisModel,useModel=true}={}){
 const synthesisInput=buildProfessionalRepresentationSynthesisInput({authorizedSemanticMaterial,locale});
 const fallback=buildDeterministicProfessionalRepresentation({synthesisInput,locale});
 if(!useModel||typeof narrativeRealizer!=='function'||fallback.claims.length===0)return {synthesisInput,representation:fallback};
 try{const prompts=buildProfessionalRepresentationSynthesisPrompt({synthesisInput,deterministicRepresentation:fallback,locale});const result=await narrativeRealizer(prompts);const parsed=extractJsonObject(result?.rawContent);const reconciled=reconcileProfessionalRepresentationRealization({synthesisInput,realization:parsed,deterministicRepresentation:fallback,locale});return {synthesisInput,representation:reconciled||fallback};}catch{return {synthesisInput,representation:fallback};}
}
export default runProfessionalRepresentationSynthesis;
