const crypto = require("crypto");
const { validateDimensionContribution } = require("./validateDimensionContribution");

function isObject(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function cleanString(value) { return typeof value === "string" && value.trim() ? value.trim() : null; }
function clone(value) { if (Array.isArray(value)) return value.map(clone); if (isObject(value)) return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, clone(v)])); return value; }
function validIso(value) { return typeof value === "string" && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString() === value; }
function fingerprint(ids) { return crypto.createHash("sha256").update(["knowledge-ledger", "1.0", ...ids].join("|")).digest("hex"); }
function canonicalSort(items) { return [...items].sort((a,b) => a.metadata.createdAt.localeCompare(b.metadata.createdAt) || a.id.localeCompare(b.id)); }
function statistics(items) { return { totalContributions: items.length, dimensionCount: new Set(items.map(x => x.dimensionId)).size, measurementCount: new Set(items.map(x => x.measurementId)).size }; }

function buildKnowledgeLedger(input = {}, options = {}) {
  const source = isObject(input) ? input : {};
  const metadata = isObject(source.metadata) ? source.metadata : {};
  const now = cleanString(options.now) || cleanString(metadata.updatedAt) || cleanString(metadata.createdAt);
  if (!validIso(now)) { const e = new Error("A valid ISO options.now or metadata timestamp is required."); e.code = "INVALID_KNOWLEDGE_LEDGER_OPTIONS"; throw e; }
  const contributions = Array.isArray(source.contributions) ? canonicalSort(source.contributions.map(clone)) : [];
  for (let i=0;i<contributions.length;i+=1) {
    const validation = validateDimensionContribution(contributions[i]);
    if (!validation.valid) { const e = new Error(`contributions[${i}] is invalid: ${validation.errors.join(" | ")}`); e.code="INVALID_DIMENSION_CONTRIBUTION"; e.details={index:i,validation}; throw e; }
  }
  const ids = contributions.map(x => x.id);
  if (new Set(ids).size !== ids.length) { const e = new Error("Duplicate DimensionContribution ids are not allowed."); e.code="DUPLICATE_LEDGER_CONTRIBUTION"; throw e; }
  return {
    id: `knowledgeLedger_${fingerprint([...ids].sort()).slice(0,32)}`,
    contributions,
    statistics: statistics(contributions),
    metadata: { version: "1.0", createdAt: cleanString(metadata.createdAt) || now, updatedAt: now },
    extensions: isObject(source.extensions) ? clone(source.extensions) : {},
  };
}
module.exports = { buildKnowledgeLedger };
