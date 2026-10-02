import { pathToFileURL } from 'node:url';
import { createLiveGroundedRelationshipProposalProviders } from '../src/app/liveGroundedRelationshipProposalProvider.js';
import { runGroundedDescriptiveRelationshipVerticalSlice } from '../src/app/groundedDescriptiveRelationshipVerticalSlice.js';

const arr=v=>Array.isArray(v)?v:[];
const text=v=>typeof v==='string'?v.trim():'';

export function buildPd069lLiveDiagnosticProjection({out,lastRun,call,inputMaterials}={}){
 const structured=lastRun?.status==='ok'&&lastRun?.result?.structured?lastRun.result.structured:{};
 const descriptorRejections=new Map(arr(out?.descriptorRejections).map(x=>[text(x?.proposalRef),arr(x?.errors)]));
 const acceptedDescriptors=new Map(arr(out?.descriptors).map(x=>[text(x?.provenance?.proposalRef),x]));
 const relationshipRejections=new Map(arr(out?.relationshipRejections).map(x=>[text(x?.proposalRef),arr(x?.errors)]));
 const acceptedRelationships=new Map(arr(out?.relationships).map(x=>[text(x?.provenance?.proposalRef),x]));
 const descriptors=arr(structured?.descriptorProposals).map(p=>{
  const proposalRef=text(p?.proposalRef),accepted=acceptedDescriptors.get(proposalRef);
  return {proposalRef,materialRef:text(p?.materialRef),descriptorRole:text(p?.descriptorRole),descriptiveValue:text(p?.descriptiveValue),claimShape:p?.claimShape??null,supportRef:text(p?.grounding?.supportRef)||null,accepted:Boolean(accepted),rejectionReasons:accepted?[]:(descriptorRejections.get(proposalRef)||['proposal_not_accepted'])};
 });
 const relationships=arr(structured?.relationshipHypotheses).map(h=>{
  const proposalRef=text(h?.proposalRef),accepted=acceptedRelationships.get(proposalRef);
  return {proposalRef,descriptorProposalRefs:arr(h?.descriptorProposalRefs).map(text),relationshipWording:text(h?.relationshipWording),relationshipBasis:text(h?.relationshipBasis),claimShape:h?.claimShape??null,accepted:Boolean(accepted),rejectionReasons:accepted?[]:(relationshipRejections.get(proposalRef)||['proposal_not_accepted'])};
 });
 return {providerStatus:out?.providerStatus??'unknown',model:text(call?.model)||null,elapsedMs:Number.isFinite(call?.elapsedMs)?call.elapsedMs:null,inputMaterials:Number.isInteger(inputMaterials)?inputMaterials:null,descriptorProposals:descriptors.length,acceptedDescriptors:arr(out?.descriptors).length,relationshipHypotheses:relationships.length,acceptedRelationships:arr(out?.relationships).length,descriptors,relationships};
}

export async function runPd069lLiveVerification(){
 if(!process.env.GROQ_API_KEY?.trim()){console.log('LIVE VERIFICATION NOT EXECUTED — PROVIDER CREDENTIALS UNAVAILABLE.');return 2;}
 const materials=[{materialRef:'fixture:a',sourceId:'fixture:a',summary:'Documented line start-up phase',facts:['Participated in a production line start-up involving quality and production.'],exactSupports:['Participated in a production line start-up involving quality and production.'],semanticCeiling:{subjectScopes:['source_material'],agencyLevel:'participated',responsibilityScope:'not_established',ownershipAssertion:'none',decisionAuthorityAssertion:'none',resultCausalityAssertion:'none'}},{materialRef:'fixture:b',sourceId:'fixture:b',summary:'Documented process stabilisation phase',facts:['Contributed during process stabilisation involving supply chain and engineering.'],exactSupports:['Contributed during process stabilisation involving supply chain and engineering.'],semanticCeiling:{subjectScopes:['source_material'],agencyLevel:'contributed',responsibilityScope:'not_established',ownershipAssertion:'none',decisionAuthorityAssertion:'none',resultCausalityAssertion:'none'}}];
 const diagnostics=[];const providers=createLiveGroundedRelationshipProposalProviders({diagnosticSink:x=>diagnostics.push(x)});
 const out=await runGroundedDescriptiveRelationshipVerticalSlice({materials,descriptorProposalProvider:providers.descriptorProposalProvider,relationshipHypothesisProvider:providers.relationshipHypothesisProvider,locale:'it'});
 const call=diagnostics.find(x=>x.stage==='model_call_end')||diagnostics.find(x=>x.stage==='model_call_failed')||{};
 console.log(JSON.stringify(buildPd069lLiveDiagnosticProjection({out,lastRun:providers.getLastRun(),call,inputMaterials:materials.length}),null,2));
 return out.relationships.length?0:1;
}

if(import.meta.url===pathToFileURL(process.argv[1]||'').href){process.exitCode=await runPd069lLiveVerification();}
