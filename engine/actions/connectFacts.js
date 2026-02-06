// engine/actions/connectFacts.js

/**
 * Registra una ipotesi del giocatore nello State.
 * NON modifica World
 * NON modifica Knowledge
 * NON verifica la verità dell'ipotesi
 *
 * Requisito:
 * - i facts usati devono essere noti all'attore (via knowledge view)
 */

export function connectFacts({ knowledge, state }, payload) {
  if (!state || !state.hypotheses) {
    throw new Error("State o state.hypotheses mancanti");
  }

  const { by, basedOn, claim, confidence = 0.5 } = payload;

  if (!by || !Array.isArray(basedOn) || !claim) {
    throw new Error("Payload incompleto per connectFacts");
  }

  // === Verifica conoscenza soggettiva ===
  if (!knowledge || typeof knowledge.getKnowledgeOf !== "function") {
    throw new Error("Knowledge view non valida");
  }

  const actorKnowledge = knowledge.getKnowledgeOf(by);
  const knownFacts = actorKnowledge.map(f => f.content);

  const unknownFacts = basedOn.filter(f => !knownFacts.includes(f));
  if (unknownFacts.length > 0) {
    throw new Error(
      `Ipotesi basata su facts non conosciuti: ${unknownFacts.join(", ")}`
    );
  }

  // === Registra ipotesi (pensiero, non verità) ===
  state.hypotheses.push({
    id: `hyp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    by,
    basedOn,
    claim,
    confidence,
    status: "attiva",
    createdAt: Date.now()
  });

  return state;
}





