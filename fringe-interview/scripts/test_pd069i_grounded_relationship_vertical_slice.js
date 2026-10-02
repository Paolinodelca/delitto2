import assert from 'node:assert/strict';
import { runGroundedDescriptiveRelationshipVerticalSlice,validateDescriptorProposal,validateRelationshipHypothesis } from '../src/app/groundedDescriptiveRelationshipVerticalSlice.js';
import { buildTargetIndependentProfessionalRepresentation } from '../src/app/buildTargetIndependentProfessionalRepresentation.js';
import { renderPrivateBetaUiJourneyHtml } from '../src/app/renderPrivateBetaUiJourneyHtml.js';
const legacySafe=()=>({personLevelInference:false,capabilityInference:false,traitInference:false,personalityInference:false,leadershipInference:false,seniorityInference:false,fitReadinessInference:false,personKnowledgeWriteback:false,participationStrengthening:false,responsibilityStrengthening:false,ownershipStrengthening:false,decisionAuthorityStrengthening:false,causalityStrengthening:false});
const descriptorClaim=(overrides={})=>({subjectScope:'source_material',descriptiveRole:'work_phase',agencyLevel:'not_established',responsibilityScope:'not_established',ownershipAssertion:'none',decisionAuthorityAssertion:'none',resultCausalityAssertion:'none',personPropertyAssertion:'none',...overrides});
const relationshipClaim=(overrides={})=>({subjectScope:'material_relationship',relationshipClaim:'recurrence',personPropertyAssertion:'none',capabilityAssertion:'none',ownershipAssertion:'none',responsibilityAssertion:'none',causalityAssertion:'none',fitReadinessAssertion:'none',sameEpisodeAssertion:'none',continuityAssertion:'none',...overrides});
const materials=[
 {materialRef:'source:a',sourceId:'a',exactSupports:['Avviamento della linea con qualità e produzione.'],semanticCeiling:{subjectScopes:['source_material'],agencyLevel:'participated',responsibilityScope:'shared_non_exclusive',ownershipAssertion:'none',decisionAuthorityAssertion:'none',resultCausalityAssertion:'none'}},
 {materialRef:'source:b',sourceId:'b',exactSupports:['Stabilizzazione del processo con supply chain e engineering.'],semanticCeiling:{subjectScopes:['source_material'],agencyLevel:'contributed',responsibilityScope:'shared_non_exclusive',ownershipAssertion:'none',decisionAuthorityAssertion:'none',resultCausalityAssertion:'none'}}
];
const proposal=(id,materialRef,role,value,exactText,claim=descriptorClaim({descriptiveRole:role}))=>({descriptorRole:role,descriptiveValue:value,materialRef,grounding:{exactText,supportRef:`${materialRef}:support:1`},provenance:{providerRef:'controlled:test',proposalRef:id},claimShape:claim,semanticBoundary:legacySafe(),persistence:'representation_only'});
const p1=proposal('d1','source:a','work_phase','avviamento della linea',materials[0].exactSupports[0]);
const p2=proposal('d2','source:b','work_phase','stabilizzazione del processo',materials[1].exactSupports[0]);
const hypothesis={descriptorRefs:['descriptor:d1','descriptor:d2'],relationshipWording:'Esperienze documentate distinte comprendono fasi collegate all’avvio o alla stabilizzazione di attività produttive.',relationshipBasis:'bounded_open_semantic_relationship',provenance:{providerRef:'controlled:test',proposalRef:'r1'},claimShape:relationshipClaim(),semanticBoundary:{...legacySafe(),sameEpisodeFromProjectName:false,sameEpisodeFromRuntimeLineage:false,continuityFromChronology:false},persistence:'representation_only'};
const original=JSON.stringify(materials);
const out=await runGroundedDescriptiveRelationshipVerticalSlice({materials,descriptorProposalProvider:async()=>[p1,p2],relationshipHypothesisProvider:async()=>[hypothesis]});
assert.equal(out.descriptors.length,2);assert.equal(out.relationships.length,1);assert.deepEqual(out.relationships[0].descriptorValues.map(x=>x.descriptiveValue),['avviamento della linea','stabilizzazione del processo']);assert.equal(JSON.stringify(materials),original);assert.equal(out.relationships[0].persistent,false);
// Legacy provider safety flags are diagnostic only: changing them cannot authorise or reject a claim.
const noisyFlags={...p1,semanticBoundary:{...legacySafe(),leadershipInference:true,capabilityInference:true}};assert.equal(validateDescriptorProposal(noisyFlags,{materials}).status,'accepted');
// Critical adversarial cases: all provider-owned booleans claim "safe", but structured claims exceed upstream authority.
const adversarialDescriptors=[
 {...p1,descriptiveValue:'provider wording may remain open',semanticBoundary:legacySafe(),claimShape:descriptorClaim({personPropertyAssertion:'capability'})},
 {...p1,semanticBoundary:legacySafe(),claimShape:descriptorClaim({agencyLevel:'coordinated'})},
 {...p1,semanticBoundary:legacySafe(),claimShape:descriptorClaim({ownershipAssertion:'authorised'})},
 {...p1,semanticBoundary:legacySafe(),claimShape:descriptorClaim({responsibilityScope:'exclusive_sole'})},
 {...p1,semanticBoundary:legacySafe(),claimShape:descriptorClaim({resultCausalityAssertion:'authorised'})},
 {...p1,semanticBoundary:legacySafe(),claimShape:{subjectScope:'source_material',descriptiveRole:'work_phase'}},
 {...p1,claimShape:null}
];
for(const x of adversarialDescriptors)assert.equal(validateDescriptorProposal(x,{materials}).status,'rejected');
const badDescriptors=[proposal('x','missing','work_phase','x','x'),proposal('x','source:a','unknown_role','x',materials[0].exactSupports[0]),proposal('x','source:a','work_phase','x','wrong'),{...p1,provenance:{}},{...p1,persistence:'person_knowledge'}];
for(const x of badDescriptors)assert.equal(validateDescriptorProposal(x,{materials}).status,'rejected');
const accepted=out.descriptors;
const adversarialRelationships=[
 {...hypothesis,semanticBoundary:{...hypothesis.semanticBoundary,capabilityInference:false,leadershipInference:false},claimShape:relationshipClaim({personPropertyAssertion:'capability'})},
 {...hypothesis,semanticBoundary:hypothesis.semanticBoundary,claimShape:relationshipClaim({capabilityAssertion:'authorised'})},
 {...hypothesis,semanticBoundary:hypothesis.semanticBoundary,claimShape:relationshipClaim({sameEpisodeAssertion:'same_episode'})},
 {...hypothesis,semanticBoundary:hypothesis.semanticBoundary,claimShape:relationshipClaim({continuityAssertion:'professional_continuity'})},
 {...hypothesis,semanticBoundary:hypothesis.semanticBoundary,claimShape:{subjectScope:'material_relationship',relationshipClaim:'recurrence'}}
];
for(const x of adversarialRelationships)assert.equal(validateRelationshipHypothesis(x,{acceptedDescriptors:accepted}).status,'rejected');
const badRels=[{...hypothesis,descriptorRefs:['descriptor:d1','missing']},{...hypothesis,descriptorRefs:['descriptor:d1','descriptor:d1']},{...hypothesis,persistence:'person_knowledge'},{...hypothesis,provenance:{}}];for(const x of badRels)assert.equal(validateRelationshipHypothesis(x,{acceptedDescriptors:accepted}).status,'rejected');
// Explicit upstream ceiling tests.
assert.equal(validateDescriptorProposal({...p1,claimShape:descriptorClaim({agencyLevel:'participated'})},{materials}).status,'accepted');
assert.equal(validateDescriptorProposal({...p1,claimShape:descriptorClaim({agencyLevel:'contributed'})},{materials}).status,'rejected');
const sources=[{id:'a',sourceRole:'professional_declaration',content:'Avviamento della linea con qualità e produzione.'},{id:'b',sourceRole:'professional_declaration',content:'Stabilizzazione del processo con supply chain e engineering.'}];
const projection=sources.map(s=>({sourceId:s.id,sourceRole:s.sourceRole,facts:[s.content],roleDescriptionFacts:[],domainSignals:[],experienceHighlights:[s.content],sourceFaithfulExperienceExcerpts:[s.content],activitySemantics:[]}));
const repProposal=(id,materialRef,value,exactText)=>proposal(id,materialRef,'work_phase',value,exactText,descriptorClaim());
const rep=await buildTargetIndependentProfessionalRepresentation({professionalSources:sources,sourceGroundedProjection:projection,descriptorProposalProvider:async()=>[repProposal('d1','source:a','avviamento della linea',sources[0].content),repProposal('d2','source:b','stabilizzazione del processo',sources[1].content)],relationshipHypothesisProvider:async()=>[hypothesis]});
assert.equal(rep.professionalMeaning.groundedDescriptiveRelationships.length,1);const thread=rep.professionalMeaning.professionalThreads.find(x=>x.kind==='grounded_descriptive_relationship');assert(thread);assert(rep.professionalMeaning.level1ProfessionalThreads.some(x=>x.threadId===thread.threadId));assert(!JSON.stringify(rep).includes('personKnowledgeWriteback":true'));
const html=renderPrivateBetaUiJourneyHtml({locale:'it',result:{phase:'purpose_understand',preInterview:{targetIndependentProfessionalRepresentation:rep}}});assert.match(html,/Esperienze documentate distinte comprendono/);assert.doesNotMatch(html,/descriptor extraction|proposal provider|relationship hypothesis/i);assert.match(html,/Avviamento della linea/);assert.match(html,/Stabilizzazione del processo/);
const none=await buildTargetIndependentProfessionalRepresentation({professionalSources:sources,sourceGroundedProjection:projection});assert.equal(none.professionalMeaning.groundedDescriptiveRelationships.length,0);
console.log('PD-069I grounded relationship vertical slice / first corrective: PASS');
