export function applyHypothesisEffects({ state }) {
  if (!state || !state.hypotheses || !state.agentDisposition) {
    throw new Error("Stato incompleto per applyHypothesisEffects");
  }

  state.hypotheses.forEach(h => {
    const target = extractTargetFromClaim(h.claim);
    if (!target) return;

    const agent = state.agentDisposition[target];
    if (!agent) return;

    agent.suspicionLevel = Math.min(1, agent.suspicionLevel + 0.2);

    if (agent.suspicionLevel > 0.7) {
      agent.attitude = "ostile";
    } else if (agent.suspicionLevel > 0.4) {
      agent.attitude = "difensivo";
    }
  });

  return state;
}

function extractTargetFromClaim(claim) {
  if (!claim) return null;
  if (claim.includes("riccardo")) return "riccardo_brambilla";
  if (claim.includes("dario")) return "dario_rossi";
  return null;
}
