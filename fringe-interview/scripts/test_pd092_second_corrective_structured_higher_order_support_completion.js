import assert from 'node:assert/strict';
import { validateDescriptorProposal, validateRelationshipHypothesis } from '../src/app/groundedDescriptiveRelationshipVerticalSlice.js';
import { buildHigherOrderCompositionInput } from '../src/app/higherOrderCompositionInput.js';
import { validateHigherOrderStructureProposal } from '../src/app/higherOrderDescriptiveProfessionalStructureVerticalSlice.js';
import { naturalizeCandidateWording } from '../src/app/candidateFacingRepresentationPresentation.js';

const descriptorClaim=(role='work_phase',agencyLevel='not_established')=>({
  subjectScope:'source_material',descriptiveRole:role,agencyLevel,responsibilityScope:'not_established',
  ownershipAssertion:'none',decisionAuthorityAssertion:'none',resultCausalityAssertion:'none',personPropertyAssertion:'none'
});
const relationshipClaim=()=>({
  subjectScope:'material_relationship',relationshipClaim:'recurrence',personPropertyAssertion:'none',
  capabilityAssertion:'none',ownershipAssertion:'none',responsibilityAssertion:'none',
  causalityAssertion:'none',fitReadinessAssertion:'none',sameEpisodeAssertion:'none',continuityAssertion:'none'
});
const higherClaim={subjectScope:'documented_material_structure',structureClaim:'descriptive_combination',personPropertyAssertion:'none',continuityAssertion:'none',leadershipAssertion:'none',ownershipAssertion:'none',responsibilityAssertion:'none',generalAutonomyAssertion:'none',resultCausalityAssertion:'none',targetRelationAssertion:'none'};

const exactA='Coordinamento con Engineering, Quality e Production durante l’avviamento.';
const exactB='Coordinamento con Supply Chain, Quality e Production durante la stabilizzazione.';
const materials=[
  {materialRef:'source:a',sourceId:'a',exactSupports:[exactA],structuredSupports:[{exactText:exactA,semanticClasses:['cross_functional_coordination']}],semanticCeiling:{subjectScopes:['source_material'],agencyLevel:'not_established',responsibilityScope:'not_established',ownershipAssertion:'none',decisionAuthorityAssertion:'none',resultCausalityAssertion:'none'}},
  {materialRef:'source:b',sourceId:'b',exactSupports:[exactB],structuredSupports:[{exactText:exactB,semanticClasses:['cross_functional_coordination']}],semanticCeiling:{subjectScopes:['source_material'],agencyLevel:'not_established',responsibilityScope:'not_established',ownershipAssertion:'none',decisionAuthorityAssertion:'none',resultCausalityAssertion:'none'}}
];
const descriptor=(id,materialRef,text)=>({descriptorRole:'work_phase',descriptiveValue:`opaque-${id}`,materialRef,grounding:{exactText:text,supportRef:`${materialRef}:support:1`},provenance:{providerRef:'controlled:test',proposalRef:id},claimShape:descriptorClaim(),persistence:'representation_only'});
const d1=validateDescriptorProposal(descriptor('d1','source:a',exactA),{materials});
const d2=validateDescriptorProposal(descriptor('d2','source:b',exactB),{materials});
assert.equal(d1.status,'accepted');
assert.equal(d2.status,'accepted');
assert.deepEqual(d1.semanticClasses,['cross_functional_coordination']);
assert.deepEqual(d2.semanticClasses,['cross_functional_coordination']);

const rel=validateRelationshipHypothesis({
  descriptorRefs:[d1.descriptorId,d2.descriptorId],
  relationshipWording:'opaque relationship wording',
  relationshipBasis:'bounded structured supports',
  provenance:{providerRef:'controlled:test',proposalRef:'r1'},
  claimShape:relationshipClaim(),
  persistence:'representation_only'
},{acceptedDescriptors:[d1,d2]});
assert.equal(rel.status,'accepted');
assert.deepEqual(rel.semanticClasses,['cross_functional_coordination']);
assert.equal(rel.semanticClassBasis,'accepted_descriptor_grounding_semantics_across_independent_materials');

const contributors=buildHigherOrderCompositionInput({
  relationships:[rel],
  descriptors:[d1,d2],
  supportedPatterns:[{kind:'documented_cross_functional_coordination_recurrence',sourceRefs:['a','b','c','d'],episodeRefs:['ea','eb','ec','ed'],supportCount:4}]
});
const relContributor=contributors.find(x=>x.relationshipId===rel.relationshipId);
const patternContributor=contributors.find(x=>x.contributorType==='supported_pattern');
assert.deepEqual(relContributor.structuredSemanticIdentity.classes,['cross_functional_coordination']);
assert.deepEqual(patternContributor.structuredSemanticIdentity.classes,['cross_functional_coordination']);
assert.equal(patternContributor.structuredSemanticIdentity.supportStrength,'independent_recurrence');

const proposal={
  proposalRef:'real-like-cross-functional',
  contributorRefs:[patternContributor.contributorRef,relContributor.contributorRef],
  structureWording:'opaque higher-order wording',
  compositionBasis:'structured pattern + structured relationship',
  compositionSemanticClass:'cross_functional_coordination',
  claimShape:higherClaim,
  persistence:'representation_only',
  targetInputs:[],
  providerAuthority:false
};
const accepted=validateHigherOrderStructureProposal(proposal,{contributors});
assert.equal(accepted.status,'accepted');
assert.deepEqual([...accepted.semanticAlignment.semanticSupportContributorRefs].sort(),[patternContributor.contributorRef,relContributor.contributorRef].sort());

// Strong recurrence Pattern is itself enough to establish the recurring semantic class;
// a second unestablished contributor may remain contextual without blocking.
const unestablished={status:'accepted',contributorRef:'context:1',contributorType:'grounded_descriptive_professional_relationship',nativeRef:'context:1',semanticContent:{wording:'opaque'},structuredSemanticIdentity:{status:'unestablished',classes:[],basis:'none'},materialRefs:['m:context'],sourceRefs:['s:context'],professionalBasisRefs:['e:context']};
const patternPlusContext=validateHigherOrderStructureProposal({...proposal,proposalRef:'pattern-primary',contributorRefs:[patternContributor.contributorRef,'context:1']},{contributors:[patternContributor,unestablished]});
assert.equal(patternPlusContext.status,'accepted');
assert.deepEqual(patternPlusContext.semanticAlignment.semanticSupportContributorRefs,[patternContributor.contributorRef]);
assert.deepEqual(patternPlusContext.semanticAlignment.contextContributorRefs,['context:1']);

// Knowledge mixed-type valid structures remain available.
const peopleKnowledge=buildHigherOrderCompositionInput({knowledgeContribution:[{semanticType:'continuing_people_responsibility',sourceRef:'knowledge:people',professionalMeaning:'opaque'}]}).find(x=>x.contributorType==='bounded_canonical_knowledge_meaning');
const peopleEpisode=buildHigherOrderCompositionInput({episodeMeanings:[{episodeMeaningId:'ep:people',sourceId:'s:people',description:'opaque',participation:'contributed',responsibilityScope:{state:'continuing',referent:{semanticType:'continuing_people_responsibility'}}}]}).find(x=>x.contributorType==='source_grounded_professional_episode_meaning');
const peopleAccepted=validateHigherOrderStructureProposal({
  ...proposal,proposalRef:'people',contributorRefs:[peopleKnowledge.contributorRef,peopleEpisode.contributorRef],
  compositionSemanticClass:'people_responsibility'
},{contributors:[peopleKnowledge,peopleEpisode]});
assert.equal(peopleAccepted.status,'accepted');

const knowledgeContributors=buildHigherOrderCompositionInput({knowledgeContribution:[
  {semanticType:'decision_accountability',sourceRef:'knowledge:decision',professionalMeaning:'opaque'},
  {semanticType:'quantified_outcome',sourceRef:'knowledge:outcome',professionalMeaning:'opaque'}
]});
const decision=knowledgeContributors.find(x=>x.semanticContent.semanticType==='decision_accountability');
const outcome=knowledgeContributors.find(x=>x.semanticContent.semanticType==='quantified_outcome');
assert.equal(validateHigherOrderStructureProposal({
  ...proposal,proposalRef:'decision-outcome',contributorRefs:[decision.contributorRef,outcome.contributorRef],
  compositionSemanticClass:'decision_accountability_quantified_outcome'
},{contributors:knowledgeContributors}).status,'accepted');

// Internal descriptor IDs never survive Candidate-facing wording.
assert.equal(naturalizeCandidateWording('Coordinamento ricorrente (desc1) con supporto (desc2) e descriptor3.',{locale:'it'}).includes('desc'),false);

console.log('PD-092 Second Corrective structured Higher-Order support completion: PASS');
