export function applyHypothesisEffects({ hypotheses, state }, payload) {
  const { hypothesisId } = payload;

  const hypothesis = hypotheses.list.find(h => h.id === hypothesisId);
  if (!hypothesis) {
    throw new Error("Hypothesis non trovata");
  }

  state.agentDisposition = state.agentDisposition || {};

  // Effetto semplice e controllabile:
  // se un agente è nominato nella claim, diventa più difensivo
  Object.keys(state.agentDisposition).forEach(agent => {
    if (hypothesis.claim.includes(agent)) {
      state.agentDisposition[agent].suspicionLevel =
        (state.agentDisposition[agent].suspicionLevel || 0) + 0.3;

      state.agentDisposition[agent].attitude = "difensivo";
    }
  });

  return { state };
}
