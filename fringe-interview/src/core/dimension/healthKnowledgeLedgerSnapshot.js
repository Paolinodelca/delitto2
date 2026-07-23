const { buildDimensionContribution }=require("./buildDimensionContribution");
const { buildKnowledgeLedger }=require("./buildKnowledgeLedger");
const { validateKnowledgeLedger }=require("./validateKnowledgeLedger");
const { appendDimensionContributions }=require("./appendDimensionContributions");
const { buildKnowledgeSnapshot }=require("./buildKnowledgeSnapshot");
const { validateKnowledgeSnapshot }=require("./validateKnowledgeSnapshot");
function healthKnowledgeLedgerSnapshot(){try{const now="2026-07-23T12:00:00.000Z";const c=buildDimensionContribution({id:"health_contribution",measurementId:"health_measurement",dimensionId:"health_dimension",contributionType:"supporting",contributionValue:0.8,confidence:0.9,provenance:{measurementResultRef:"measurementResult:health",sourceRefs:["mapping:health"]},metadata:{version:"1.0",createdAt:now,updatedAt:now},extensions:{}},{now});const empty=buildKnowledgeLedger({metadata:{createdAt:now,updatedAt:now}},{now});const ledger=appendDimensionContributions(empty,[c],{now});const lv=validateKnowledgeLedger(ledger);if(!lv.valid)throw new Error(lv.errors.join(" | "));const snapshot=buildKnowledgeSnapshot(ledger,{now});const sv=validateKnowledgeSnapshot(snapshot);if(!sv.valid)throw new Error(sv.errors.join(" | "));if(snapshot.dimensionStates.length!==1)throw new Error("Expected one dimension state.");return{ok:true,ledgerId:ledger.id,snapshotId:snapshot.id};}catch(error){return{ok:false,error:error.message};}}
module.exports={healthKnowledgeLedgerSnapshot};
