const { validateKnowledgeLedger }=require("./validateKnowledgeLedger");
const { aggregateDimensionContributions }=require("./aggregateDimensionContributions");
const { validateDimensionKnowledgeState }=require("./validateDimensionKnowledgeState");
const { clone, collectIntegrityErrors, deepFreeze }=require("./knowledgeLedgerIntegrity");
const { snapshotId }=require("./knowledgeSnapshotIntegrity");
function isObject(v){return v!==null&&typeof v==="object"&&!Array.isArray(v);} function validIso(v){return typeof v==="string"&&!Number.isNaN(Date.parse(v))&&new Date(v).toISOString()===v;}
function fail(code,message,details){const e=new Error(message);e.code=code;if(details!==undefined)e.details=details;throw e;}
function buildKnowledgeSnapshot(ledger, options={}){
 if(!isObject(options))fail("INVALID_KNOWLEDGE_SNAPSHOT_OPTIONS","options must be an object.");
 const validation=validateKnowledgeLedger(ledger); if(!validation.valid) fail("INVALID_KNOWLEDGE_LEDGER",validation.errors.join(" | "),validation);
 const now=options.now||ledger.metadata.updatedAt; const groups=new Map(); for(const c of ledger.contributions){if(!groups.has(c.dimensionId))groups.set(c.dimensionId,[]);groups.get(c.dimensionId).push(c);}
 if(!validIso(now))fail("INVALID_KNOWLEDGE_SNAPSHOT_OPTIONS","options.now must be a valid ISO timestamp.");
 const integrityErrors=[];collectIntegrityErrors(options.extensions===undefined?{}:options.extensions,"options.extensions",integrityErrors);if(integrityErrors.length)fail("INVALID_KNOWLEDGE_SNAPSHOT_OPTIONS",integrityErrors.join(" | "),{valid:false,errors:integrityErrors,warnings:[]});
 if(options.extensions!==undefined&&!isObject(options.extensions))fail("INVALID_KNOWLEDGE_SNAPSHOT_OPTIONS","options.extensions must be an object.");
 const dimensionStates=[...groups.keys()].sort().map(id=>aggregateDimensionContributions(id,groups.get(id),{now}));
 dimensionStates.forEach((s,i)=>{const v=validateDimensionKnowledgeState(s);if(!v.valid)fail("INVALID_GENERATED_KNOWLEDGE_SNAPSHOT",`dimensionStates[${i}] is invalid: ${v.errors.join(" | ")}`,v);});
 const id=snapshotId(ledger.id,dimensionStates);
 return deepFreeze({id,ledgerRef:`knowledgeLedger:${ledger.id}`,dimensionStates:clone(dimensionStates),statistics:{dimensionCount:dimensionStates.length,contributionCount:ledger.contributions.length},metadata:{version:"1.0",createdAt:now},extensions:isObject(options.extensions)?clone(options.extensions):{}});
}
module.exports={buildKnowledgeSnapshot};
