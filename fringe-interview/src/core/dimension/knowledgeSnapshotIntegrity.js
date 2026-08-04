const crypto = require("crypto");
const { clone } = require("./knowledgeLedgerIntegrity");

function isObject(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (isObject(value)) return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
function semanticState(state) {
  const content = clone(state);
  if (isObject(content.metadata)) {
    delete content.metadata.createdAt;
    delete content.metadata.updatedAt;
  }
  return content;
}
function snapshotId(ledgerId, states) {
  const digest = crypto.createHash("sha256").update(canonical({
    schema: "knowledge-snapshot-content-identity-v2",
    ledgerId,
    aggregationStrategy: "confidence_weighted_signed_mean_v1",
    states: states.map(semanticState),
  })).digest("hex");
  return `knowledgeSnapshot_${digest.slice(0, 32)}`;
}

module.exports = { snapshotId };
