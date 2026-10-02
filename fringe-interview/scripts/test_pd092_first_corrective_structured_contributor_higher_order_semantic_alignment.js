import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildHigherOrderCompositionInput} from '../src/app/higherOrderCompositionInput.js';
import {validateHigherOrderStructureProposal} from '../src/app/higherOrderDescriptiveProfessionalStructureVerticalSlice.js';
import {HIGHER_ORDER_PROFESSIONAL_SYNTHESIS_SCHEMA} from '../src/infrastructure/groq/runGroqHigherOrderProfessionalSynthesisModel.js';

const none={subjectScope:'documented_material_structure',structureClaim:'descriptive_combination',personPropertyAssertion:'none',continuityAssertion:'none',leadershipAssertion:'none',ownershipAssertion:'none',responsibilityAssertion:'none',generalAutonomyAssertion:'none',resultCausalityAssertion:'none',targetRelationAssertion:'none'};
const base=(id,refs,cls,wording='Descrizione bounded senza parole chiave.')=>({proposalRef:id,contributorRefs:refs,structureWording:wording,compositionBasis:'structured semantic compatibility',compositionSemanticClass:cls,claimShape:none,persistence:'representation_only',targetInputs:[],providerAuthority:false});
const c=(ref,type,classes,wording='test wording')=>({status:'accepted',contributorRef:ref,contributorType:type,nativeRef:ref,semanticContent:{wording},structuredSemanticIdentity:{status:classes.length?'established':'unestablished',classes,basis:'controlled'},materialRefs:[`m:${ref}`],sourceRefs:[`s:${ref}`],professionalBasisRefs:[`episode:${ref}`]});

// A — structured Knowledge match.
const people1=c('people1','bounded_canonical_knowledge_meaning',['people_responsibility'],'no lexical people wording');
const people2=c('people2','bounded_canonical_knowledge_meaning',['people_responsibility'],'opaque');
assert.equal(validateHigherOrderStructureProposal(base('A',['people1','people2'],'people_responsibility'),{contributors:[people1,people2]}).status,'accepted');

// B — structured Knowledge mismatch.
const outcome=c('outcome','bounded_canonical_knowledge_meaning',['quantified_outcome'],'people coordination words are intentionally present');
const mismatch=validateHigherOrderStructureProposal(base('B',['people1','outcome'],'people_responsibility','people coordination'),{contributors:[people1,outcome]});
assert.equal(mismatch.status,'rejected');
assert(mismatch.errors.includes('contributor_semantic_misalignment:outcome'));

// C — Pattern kind maps structurally, wording not needed.
const input=buildHigherOrderCompositionInput({supportedPatterns:[{kind:'documented_cross_functional_coordination_recurrence',sourceRefs:['s1','s2'],episodeRefs:[],supportCount:2}]});
const pattern=input.find(x=>x.contributorType==='supported_pattern');
assert.deepEqual(pattern.structuredSemanticIdentity.classes,['cross_functional_coordination']);
const pattern2={...pattern,contributorRef:'pattern:second',nativeRef:'pattern:second',materialRefs:['s3'],sourceRefs:['s3'],professionalBasisRefs:['episode:p2']};
assert.equal(validateHigherOrderStructureProposal(base('C',[pattern.contributorRef,'pattern:second'],'cross_functional_coordination','opaque'),{contributors:[pattern,pattern2]}).status,'accepted');

// D — KPI/process relationship with no structured cross-functional identity cannot authorize cross-functional support.
const kpi=c('kpi','grounded_descriptive_professional_relationship',[],'KPI process improvement supplier ramp-up coordination');
const pattern3={...pattern,contributorRef:'pattern:third',nativeRef:'pattern:third',materialRefs:['s4'],sourceRefs:['s4'],professionalBasisRefs:['episode:p3']};
const unestablished=validateHigherOrderStructureProposal(base('D',['kpi',pattern.contributorRef,'pattern:third'],'cross_functional_coordination'),{contributors:[kpi,pattern,pattern3]});
assert.equal(unestablished.status,'accepted'); // two structured coordination contributors authorize the theme; KPI relation does not.
const kpiState=unestablished.semanticAlignment.contributorStates.find(x=>x.contributorRef==='kpi');
assert.equal(kpiState.state,'UNESTABLISHED');
assert(!kpiState.classes.includes('cross_functional_coordination'));
assert.deepEqual([...unestablished.semanticAlignment.semanticSupportContributorRefs].sort(),[pattern.contributorRef,'pattern:third'].sort());
assert.deepEqual(unestablished.semanticAlignment.contextContributorRefs,['kpi']);

// E — wording attack cannot override incompatible structured identity.
const attacked=c('attack','grounded_descriptive_professional_relationship',['process_performance_improvement'],'cross-functional coordination coordination coordination');
const attackedResult=validateHigherOrderStructureProposal(base('E',['attack',pattern.contributorRef],'cross_functional_coordination'),{contributors:[attacked,pattern]});
assert.equal(attackedResult.status,'rejected');
assert(attackedResult.errors.includes('contributor_semantic_misalignment:attack'));

// F — unknown wording but structured identity is compatible.
const opaque1=c('opaque1','supported_pattern',['cross_functional_coordination'],'zzz');
const opaque2=c('opaque2','supported_pattern',['cross_functional_coordination'],'yyy');
assert.equal(validateHigherOrderStructureProposal(base('F',['opaque1','opaque2'],'cross_functional_coordination','xxx'),{contributors:[opaque1,opaque2]}).status,'accepted');

// G — fully unestablished cannot establish a specific theme.
const u1=c('u1','source_grounded_professional_episode_meaning',[],'coordination');
const u2=c('u2','grounded_descriptive_professional_relationship',[],'coordination');
const u=validateHigherOrderStructureProposal(base('G',['u1','u2'],'cross_functional_coordination','coordination'),{contributors:[u1,u2]});
assert.equal(u.status,'rejected');
assert(u.errors.includes('insufficient_structured_semantic_support_for_composition_class'));

// Composite valid structure: decision accountability + quantified contribution remains possible.
const d=c('decision','bounded_canonical_knowledge_meaning',['decision_accountability'],'opaque');
const q=c('quant','bounded_canonical_knowledge_meaning',['quantified_outcome'],'opaque');
assert.equal(validateHigherOrderStructureProposal(base('H',['decision','quant'],'decision_accountability_quantified_outcome'),{contributors:[d,q]}).status,'accepted');

// Production schema requires bounded semantic class.
const item=HIGHER_ORDER_PROFESSIONAL_SYNTHESIS_SCHEMA.properties.structureProposals.items;
assert(item.required.includes('compositionSemanticClass'));
assert(item.properties.compositionSemanticClass.enum.includes('cross_functional_coordination'));

// Lexical anchors are no longer deterministic acceptance authority.
const validatorSource=fs.readFileSync(new URL('../src/app/higherOrderDescriptiveProfessionalStructureVerticalSlice.js',import.meta.url),'utf8');
assert(!validatorSource.includes('SEMANTIC_ANCHORS'));
assert(!validatorSource.includes('anchorsFor('));

console.log('PD-092 First Corrective structured contributor -> Higher-Order semantic alignment: PASS');
