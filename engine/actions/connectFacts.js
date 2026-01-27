export function connectFacts({ knowledge, hypotheses }, payload) {
  const { actor, basedOn, claim } = payload;

  if (!actor || !basedOn || !claim) {
    throw new Error("Payload incompleto per connectFacts");
  }

  // Verifica che l’attore conosca tutti i facts usati
  const actorKnowledge = knowledge.getKnowledgeOf(actor);

  const knownFacts = actorKnowledge.map(k => k.content);

  const unknown = basedOn.filter(f => !knownFacts.includes(f));

  if (unknown.length > 0) {
    throw new Error("Tentativo di deduzione su facts non conosciuti");
  }

  // Registra l’ipotesi
  hypotheses.add({
    by: actor,
    basedOn,
    claim,
    status: "attiva",
    confidence: 0.5
  });

  return { hypotheses };
}
