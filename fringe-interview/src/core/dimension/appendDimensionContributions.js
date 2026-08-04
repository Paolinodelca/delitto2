const { validateKnowledgeLedger } = require("./validateKnowledgeLedger");
const { validateDimensionContribution } = require("./validateDimensionContribution");
const { buildKnowledgeLedger } = require("./buildKnowledgeLedger");
const { collectIntegrityErrors, canonicalProvenanceErrors } = require("./knowledgeLedgerIntegrity");
function fail(code,message,details){const e=new Error(message);e.code=code;if(details!==undefined)e.details=details;throw e;}
function appendDimensionContributions(ledger, contributions, options={}){
 const lv=validateKnowledgeLedger(ledger); if(!lv.valid) fail("INVALID_KNOWLEDGE_LEDGER",lv.errors.join(" | "),lv);
 if(!Array.isArray(contributions)) fail("INVALID_DIMENSION_CONTRIBUTION","contributions must be an array.");
 const integrityErrors=[]; collectIntegrityErrors(contributions,"contributions",integrityErrors);
 if(integrityErrors.length) fail("INVALID_DIMENSION_CONTRIBUTION",integrityErrors.join(" | "),{valid:false,errors:integrityErrors,warnings:[]});
 const existing=new Set(ledger.contributions.map(x=>x.id)), batch=new Set();
 contributions.forEach((c,i)=>{const v=validateDimensionContribution(c); const errors=v.valid?canonicalProvenanceErrors(c,`contributions[${i}]`):v.errors; if(errors.length) fail("INVALID_DIMENSION_CONTRIBUTION",`contributions[${i}] is invalid: ${errors.join(" | ")}`,{index:i,validation:{...v,valid:false,errors}}); if(existing.has(c.id)||batch.has(c.id)) fail("DUPLICATE_LEDGER_CONTRIBUTION",`Duplicate DimensionContribution id: ${c.id}.`); batch.add(c.id);});
 return buildKnowledgeLedger({contributions:[...ledger.contributions,...contributions],metadata:{version:"1.0",createdAt:ledger.metadata.createdAt,updatedAt:options.now},extensions:ledger.extensions},{now:options.now});
}
module.exports={appendDimensionContributions};
