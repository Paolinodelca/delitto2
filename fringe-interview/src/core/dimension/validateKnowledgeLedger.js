const { validateDimensionContribution } = require("./validateDimensionContribution");
const { collectIntegrityErrors, canonicalProvenanceErrors, ledgerId } = require("./knowledgeLedgerIntegrity");
const TOP=["id","contributions","statistics","metadata","extensions"];
function isObject(v){return v!==null&&typeof v==="object"&&!Array.isArray(v);} function validString(v){return typeof v==="string"&&v.trim().length>0;} function validIso(v){return typeof v==="string"&&!Number.isNaN(Date.parse(v))&&new Date(v).toISOString()===v;}
function validateKnowledgeLedger(ledger={}){
 const errors=[],warnings=[]; if(!isObject(ledger)) return {valid:false,errors:["KnowledgeLedger must be an object."],warnings};
 const integrityErrors=[]; collectIntegrityErrors(ledger,"knowledgeLedger",integrityErrors); errors.push(...integrityErrors);
 for(const k of Object.keys(ledger)) if(!TOP.includes(k)) errors.push(`knowledgeLedger.${k} is not allowed.`);
 if(!Array.isArray(ledger.contributions)) errors.push("contributions must be an array.");
 const items=Array.isArray(ledger.contributions)?ledger.contributions:[]; const ids=new Set();
 items.forEach((c,i)=>{const v=validateDimensionContribution(c); if(!v.valid) errors.push(`contributions[${i}] is invalid: ${v.errors.join(" | ")}`); errors.push(...canonicalProvenanceErrors(c,`contributions[${i}]`)); if(c&&validString(c.id)){if(ids.has(c.id)) errors.push(`Duplicate DimensionContribution id: ${c.id}.`); ids.add(c.id);} if(i>0){const p=items[i-1]; const orderable=p&&c&&p.metadata&&c.metadata&&validIso(p.metadata.createdAt)&&validIso(c.metadata.createdAt)&&validString(p.id)&&validString(c.id); if(orderable&&(p.metadata.createdAt>c.metadata.createdAt||(p.metadata.createdAt===c.metadata.createdAt&&p.id.localeCompare(c.id)>0))) errors.push("contributions must use canonical createdAt/id ordering.");}});
 const contentIsHashable=integrityErrors.length===0&&items.every(c=>validateDimensionContribution(c).valid);
 if(contentIsHashable){const expected=ledgerId(items); if(ledger.id!==expected) errors.push("id does not match canonical content-derived Ledger identity.");}
 if(!isObject(ledger.statistics)) errors.push("statistics must be an object."); else {for(const k of Object.keys(ledger.statistics)) if(!["totalContributions","dimensionCount","measurementCount"].includes(k)) errors.push(`statistics.${k} is not allowed.`); const exp={totalContributions:items.length,dimensionCount:new Set(items.map(x=>x.dimensionId)).size,measurementCount:new Set(items.map(x=>x.measurementId)).size}; for(const k of Object.keys(exp)) if(ledger.statistics[k]!==exp[k]) errors.push(`statistics.${k} must equal ${exp[k]}.`);}
 if(!isObject(ledger.metadata)) errors.push("metadata must be an object."); else {for(const k of Object.keys(ledger.metadata)) if(!["version","createdAt","updatedAt"].includes(k)) errors.push(`metadata.${k} is not allowed.`); if(ledger.metadata.version!=="1.0") errors.push('metadata.version must be "1.0".'); if(!validIso(ledger.metadata.createdAt)) errors.push("metadata.createdAt must be a valid ISO timestamp."); if(!validIso(ledger.metadata.updatedAt)) errors.push("metadata.updatedAt must be a valid ISO timestamp."); if(validIso(ledger.metadata.createdAt)&&validIso(ledger.metadata.updatedAt)&&ledger.metadata.updatedAt<ledger.metadata.createdAt) errors.push("metadata.updatedAt must not precede metadata.createdAt.");}
 if(!isObject(ledger.extensions)) errors.push("extensions must be an object."); if(!validString(ledger.id)) errors.push("id must be a non-empty string.");
 return {valid:errors.length===0,errors,warnings};
}
module.exports={validateKnowledgeLedger};
