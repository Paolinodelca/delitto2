// hypotheses/hypotheses.js

export function createHypothesis({ by, basedOn, claim }) {
  return {
    by,
    basedOn,
    claim,
    status: "attiva",
    confidence: 0.5,
    createdAt: Date.now()
  };
}
