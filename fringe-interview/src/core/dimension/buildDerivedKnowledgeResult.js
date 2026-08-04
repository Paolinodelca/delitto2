const crypto = require("crypto");

function object(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function clone(value) { if (Array.isArray(value)) return value.map(clone); if (object(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)])); return value; }
function deepFreeze(value) { if (value && typeof value === "object" && !Object.isFrozen(value)) { Object.freeze(value); Object.values(value).forEach(deepFreeze); } return value; }
function string(value) { return typeof value === "string" && value.trim() ? value.trim() : null; }
function stable(value) { if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`; if (object(value)) return `{${Object.keys(value).sort().map(key => JSON.stringify(key) + ":" + stable(value[key])).join(",")}}`; return JSON.stringify(value); }
function hash(value) { return crypto.createHash("sha256").update(value).digest("hex"); }

function buildDerivedKnowledgeResult(input = {}, options = {}) {
  const dependencyRefs = [...new Set((Array.isArray(input.dependencyRefs) ? input.dependencyRefs : []).map(string).filter(Boolean))].sort();
  const target = { knowledgeType: string(input.target && input.target.knowledgeType), knowledgeId: string(input.target && input.target.knowledgeId) };
  const value = object(input.value) ? clone(input.value) : { valueType: "boolean", value: true };
  const ruleRef = string(input.ruleRef);
  const snapshotRef = string(input.snapshotRef);
  const derivedAt = string(options.now) || string(input.derivedAt) || new Date().toISOString();
  const logical = { ruleRef, snapshotRef, target, value, confidence: input.confidence, dependencyRefs, version: "1.0" };
  return deepFreeze({
    id: `derivedKnowledgeResult_${hash(stable(logical)).slice(0, 32)}`,
    ruleRef,
    snapshotRef,
    target,
    value,
    confidence: input.confidence,
    dependencyRefs,
    provenance: { knowledgeType: "derived", derivedBy: "derived_knowledge_rule_evaluator_v1" },
    derivedAt,
    metadata: { version: "1.0" },
    extensions: object(input.extensions) ? clone(input.extensions) : {},
  });
}

module.exports = { buildDerivedKnowledgeResult };
