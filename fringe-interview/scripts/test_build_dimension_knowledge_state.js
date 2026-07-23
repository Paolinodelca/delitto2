const assert = require("assert");
const { buildDimensionKnowledgeState, validateDimensionKnowledgeState } = require("../src/core/dimension");
const now = "2026-07-22T15:00:00.000Z";
const base = {
  dimensionId: " decision_clarity ", dimensionType: "elementary", stateType: "observed",
  estimate: .72, direction: "supporting", coverage: .65, confidence: .74, consistency: .8,
  stability: null, evidenceQuality: .85, sourceReliability: .9,
  measurementCount: 2, independentMeasurementCount: 1, resultCount: 2, sourceDiversity: 1,
  contextDistribution: [{contextId:" pressure ",observationCount:2,estimate:.68,coverage:.4,metadata:{source:"test"}}],
  contradictions: [], supportingMeasurementResultRefs:["mr_1"," mr_1 ","mr_2"], supportingCapabilityResultRefs:[],
  derivationTrace:null, metadata:{version:"1.0",createdAt:now,updatedAt:now}, extensions:{experiment:"a"}
};
const snapshot=JSON.stringify(base);
const state=buildDimensionKnowledgeState(base,{now});
assert.strictEqual(JSON.stringify(base),snapshot);
assert.strictEqual(state.dimensionId,"decision_clarity");
assert.deepStrictEqual(state.supportingMeasurementResultRefs,["mr_1","mr_2"]);
assert.notStrictEqual(state.contextDistribution,base.contextDistribution);
assert.notStrictEqual(state.extensions,base.extensions);
assert.strictEqual(validateDimensionKnowledgeState(state).valid,true);

const unknown=buildDimensionKnowledgeState({dimensionId:"ownership",dimensionType:"elementary",stateType:"unknown"},{now});
assert.strictEqual(unknown.estimate,null); assert.strictEqual(unknown.direction,"unknown");
assert.strictEqual(unknown.coverage,0); assert.strictEqual(unknown.confidence,0); assert.strictEqual(unknown.consistency,0);
assert.strictEqual(validateDimensionKnowledgeState(unknown).valid,true);

const derived=buildDimensionKnowledgeState({dimensionId:"leadership",dimensionType:"derived",stateType:"derived",estimate:.7,direction:"supporting",coverage:.5,confidence:.7,consistency:.8,resultCount:1,sourceDiversity:1,supportingCapabilityResultRefs:["cr_1"],derivationTrace:{method:"capability_result",sourceResultRefs:["cr_1"],capabilityId:"leadership",metadata:{}},metadata:{createdAt:now,updatedAt:now}},{now});
assert.strictEqual(validateDimensionKnowledgeState(derived).valid,true);
const hybrid=buildDimensionKnowledgeState({dimensionId:"strategic_orientation",dimensionType:"hybrid",stateType:"hybrid",estimate:.6,direction:"mixed",coverage:.7,confidence:.6,consistency:.5,measurementCount:1,independentMeasurementCount:1,resultCount:2,sourceDiversity:2,supportingMeasurementResultRefs:["mr_3"],supportingCapabilityResultRefs:["cr_2"],metadata:{createdAt:now,updatedAt:now}},{now});
assert.strictEqual(validateDimensionKnowledgeState(hybrid).valid,true);
console.log("test_build_dimension_knowledge_state PASS");
