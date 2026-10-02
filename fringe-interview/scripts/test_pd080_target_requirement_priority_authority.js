import assert from 'node:assert/strict';
import {CURATED_ROLE_REPRESENTATIONS} from '../src/app/careerDirection/roleFixtures.js';
import {createTargetRequirementPriority,buildTargetRequirementPriorityDiagnostics,CURATED_ONET_TASK_DESCRIPTORS} from '../src/app/careerDirection/targetRequirementPriorityAuthority.js';
const ops=CURATED_ROLE_REPRESENTATIONS.find(r=>r.id.includes('operations_manager'));
const prod=CURATED_ROLE_REPRESENTATIONS.find(r=>r.id.includes('industrial_production'));
const get=(role,id)=>role.extensions.targetRequirementPriorities.find(p=>p.targetRequirementRef===id);
// A exact O*NET descriptor + reconstructable priority provenance
const budget=get(ops,'operations_manager.budget_operational_resources');
assert.equal(budget.accepted,true); assert.equal(budget.descriptors[0].descriptorIdentity.taskId,20703); assert.equal(budget.descriptors[0].rawImportanceRating.displayValue,73); assert.equal(budget.descriptors[0].rawPriorityRelation.taskType,'Core'); assert.match(budget.descriptors[0].mappingBasis.authorityRef,/target_requirement_priority_authority/);
// B Level remains distinct and is not fabricated from Importance. Current curated task slice has no Level rating.
assert.equal(budget.descriptors[0].rawLevelRating,null); assert.notEqual(budget.descriptors[0].rawImportanceRating.displayValue,budget.descriptors[0].rawLevelRating);
// C Core is source-native distinct authority
assert.equal(CURATED_ONET_TASK_DESCRIPTORS['11-3051.00:34'].taskType,'Core');
// D/E ESCO is deliberately not forced into current Beta fixtures: no ESCO relation is fabricated.
assert.equal(ops.extensions.targetRequirementPriorities.some(p=>p.externalAuthority==='ESCO'),false); assert.equal(prod.extensions.targetRequirementPriorities.some(p=>p.externalAuthority==='ESCO'),false);
// F occupation code only / no exact curated mapping => no accepted priority
const continuity=prod.requirements.find(r=>r.id==='industrial_production_manager.manufacturing_continuity');
assert.equal(createTargetRequirementPriority({targetDirectionRef:prod.id,targetRequirement:continuity,roleSourceRefs:prod.sourceRefs}).accepted,false);
// G prose similarity alone cannot create mapping (unknown requirement identity)
assert.equal(createTargetRequirementPriority({targetDirectionRef:ops.id,targetRequirement:{id:'fake.budget',statement:'budget'},roleSourceRefs:ops.sourceRefs}).accepted,false);
// H wrong occupation descriptor fails closed
const opReq=ops.requirements.find(r=>r.id==='operations_manager.budget_operational_resources');
const wrong=createTargetRequirementPriority({targetDirectionRef:ops.id,targetRequirement:opReq,roleSourceRefs:ops.sourceRefs,descriptorKeys:['11-3051.00:33']}); assert.equal(wrong.accepted,false);
// I multiple descriptors preserve descriptor-level ratings; no averaging/max normalization
const ps=get(prod,'industrial_production_manager.budget_schedule_scope'); assert.equal(ps.descriptors.length,2); assert.deepEqual(ps.descriptors.map(d=>d.descriptorIdentity.taskId),[34,33]); assert.deepEqual(ps.descriptors.map(d=>d.rawImportanceRating.displayValue),[75,64]); assert.equal(ps.aggregation.state,'descriptor_level_only_no_aggregation'); assert.equal(ps.aggregation.normalizedPriority,null);
// J current requirements unchanged; priority is extension only
assert.equal(ops.requirements.length,4); assert.equal(prod.requirements.length,5); assert.equal(ops.requirements[0].strength,'core_common');
// Current fixture examples + diagnostics
assert.equal(get(ops,'operations_manager.cross_functional_operational_coordination').descriptors[0].descriptorIdentity.taskId,20706);
assert.equal(get(prod,'industrial_production_manager.cross_functional_operational_coordination').descriptors[0].descriptorIdentity.taskId,35);
const diag=buildTargetRequirementPriorityDiagnostics(prod); assert(diag.some(d=>d.targetRequirementRef==='industrial_production_manager.budget_schedule_scope'&&d.rawPriority.length===2));
console.log('PD-080 target requirement priority authority tests PASSED');
