const crypto=require("crypto");
const { validateKnowledgeLedger }=require("./validateKnowledgeLedger");
const { aggregateDimensionContributions }=require("./aggregateDimensionContributions");
const { validateDimensionKnowledgeState }=require("./validateDimensionKnowledgeState");
function isObject(v){return v!==null&&typeof v==="object"&&!Array.isArray(v);} function clone(v){if(Array.isArray(v))return v.map(clone);if(isObject(v))return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,clone(x)]));return v;} function stable(v){if(Array.isArray(v))return `[${v.map(stable).join(",")}]`;if(isObject(v))return `{${Object.keys(v).sort().map(k=>JSON.stringify(k)+":"+stable(v[k])).join(",")}}`;return JSON.stringify(v);} function hash(v){return crypto.createHash("sha256").update(v).digest("hex");}
function fail(code,message,details){const e=new Error(message);e.code=code;if(details!==undefined)e.details=details;throw e;}
function buildKnowledgeSnapshot(ledger, options={}){
 const validation=validateKnowledgeLedger(ledger); if(!validation.valid) fail("INVALID_KNOWLEDGE_LEDGER",validation.errors.join(" | "),validation);
 const now=options.now||ledger.metadata.updatedAt; const groups=new Map(); for(const c of ledger.contributions){if(!groups.has(c.dimensionId))groups.set(c.dimensionId,[]);groups.get(c.dimensionId).push(c);}
 const dimensionStates=[...groups.keys()].sort().map(id=>aggregateDimensionContributions(id,groups.get(id),{now}));
 dimensionStates.forEach((s,i)=>{const v=validateDimensionKnowledgeState(s);if(!v.valid)fail("INVALID_GENERATED_KNOWLEDGE_SNAPSHOT",`dimensionStates[${i}] is invalid: ${v.errors.join(" | ")}`,v);});
 const stateFingerprints=dimensionStates.map(s=>hash(stable(s))); const id=`knowledgeSnapshot_${hash(["knowledge-snapshot","1.0",ledger.id,...stateFingerprints].join("|")).slice(0,32)}`;
 return {id,ledgerRef:`knowledgeLedger:${ledger.id}`,dimensionStates:clone(dimensionStates),statistics:{dimensionCount:dimensionStates.length,contributionCount:ledger.contributions.length},metadata:{version:"1.0",createdAt:now},extensions:isObject(options.extensions)?clone(options.extensions):{}};
}
module.exports={buildKnowledgeSnapshot};
