export function connectFacts({ knowledge, state }, payload) {
  const { by, basedOn, claim } = payload;

  if (!state || !state.hypotheses) {
    throw new Error("State o hypotheses mancanti");
  }

  if (!by || !basedOn || !claim) {
    throw new Error("Payload incompleto per connectFacts");
  }

  // verifica che l’attore conosca i facts
  const actorKnowledge = knowledge.getKnowledgeOf(by);
  const knownFacts = actorKnowledge.map(k => k.content);

  const unknown = basedOn.filter(f => !knownFacts.includes(f));
  if (unknown.length > 0) {
    throw new Error("Deduzione su facts non conosciuti");
  }

  state.hypotheses.push({
    by,
    basedOn,
    claim,
    status: "attiva",
    confidence: 0.5
  });

  return state;
}




