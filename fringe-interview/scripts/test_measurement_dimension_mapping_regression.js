const assert=require("assert");
const api=require("../src/core/dimension");
const at="2026-07-23T10:00:00.000Z";
const valid=api.buildMeasurementDimensionMapping({id:"mapping",measurementId:"measurement",targets:[{dimensionId:"ownership",contributionType:"supporting"}],metadata:{createdAt:at,updatedAt:at}},{now:at});
const cases=[
["id",{...valid,id:null}], ["measurementId",{...valid,measurementId:""}], ["targets",{...valid,targets:[]}], ["dimensionId",{...valid,targets:[{...valid.targets[0],dimensionId:""}]}], ["duplicate",{...valid,targets:[valid.targets[0],{...valid.targets[0]}]}], ["contributionType",{...valid,targets:[{...valid.targets[0],contributionType:"neutral"}]}], ["weight",{...valid,targets:[{...valid.targets[0],weight:1.1}]}], ["confidenceFactor",{...valid,targets:[{...valid.targets[0],confidenceFactor:-1}]}], ["valueStrategy",{...valid,valueStrategy:"scale"}], ["confidenceStrategy",{...valid,confidenceStrategy:"average"}], ["metadata",{...valid,metadata:null}], ["createdAt",{...valid,metadata:{...valid.metadata,createdAt:"bad"}}], ["extensions",{...valid,extensions:[]}], ["not allowed",{...valid,extra:true}]
];
for(const [label,value] of cases){const r=api.validateMeasurementDimensionMapping(value);assert.strictEqual(r.valid,false,label);assert.ok(r.errors.some(e=>e.includes(label)||label==="duplicate"&&e.includes("duplicate")),`${label}: ${r.errors.join(" | ")}`)}
assert.deepStrictEqual(Object.keys(api).filter(k=>k.includes("MeasurementDimensionMapping")||k==="mapMeasurementResultToDimensionContributions").sort(),["buildMeasurementDimensionMapping","mapMeasurementResultToDimensionContributions","validateMeasurementDimensionMapping"]);
console.log("test_measurement_dimension_mapping_regression PASS");
