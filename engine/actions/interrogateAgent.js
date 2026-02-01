/**
 * interrogateAgent.js
 *
 * Responsabilità:
 * - simulare la reazione di un agente a una domanda / accusa / informazione
 * - NON muta lo state globale
 * - restituisce un oggetto strutturato con:
 *   - risposta narrativa
 *   - effetti suggeriti su hypotheses
 *   - variazioni di disposizione (trust, stress, cooperazione)
 */

export function interrogateAgent({ agent, prompt, state }) {
  if (!agent) {
    throw new Error("interrogateAgent: agent mancante");
  }

  if (!prompt || typeof prompt !== "string") {
    throw new Error("interrogateAgent: prompt non valido");
  }

 const disposition = {
  ...defaultDisposition(),
  ...agent.disposition
};



  const knowledge = agent.knowledge || [];

  // 1. Analisi del prompt
  const analysis = analyzePrompt(prompt, knowledge);

  // 2. Calcolo reazione emotiva / strategica
  const reaction = computeReaction(disposition, analysis);

  // 3. Generazione risposta narrativa
  const reply = generateReply(agent, reaction, analysis);

  // 4. Effetti suggeriti sul sistema
  const effects = computeEffects(agent, reaction, analysis);

  return {
    agentId: agent.id,
    reply,
    reaction,
    effects
  };
}

/* =========================
   DEFAULTS & HELPERS
   ========================= */

function defaultDisposition() {
  return {
    trust: 0.5,        // 0 = ostile, 1 = totalmente aperto
    stress: 0.3,       // 0 = calmo, 1 = panico
    cooperativeness: 0.5 // 0 = chiuso, 1 = collaborativo
  };
}

/* =========================
   PROMPT ANALYSIS
   ========================= */

function analyzePrompt(prompt, knowledge) {
  const lowered = prompt.toLowerCase();

  const isAccusation =
    lowered.includes("ucciso") ||
    lowered.includes("colpevole") ||
    lowered.includes("menti");

  const touchesKnownFact = knowledge.some(f =>
    lowered.includes(f.toLowerCase())
  );

  return {
    isAccusation,
    touchesKnownFact
  };
}

/* =========================
   REACTION LOGIC
   ========================= */

function computeReaction(disposition, analysis) {
  let tensionDelta = 0;
  let trustDelta = 0;

  if (analysis.isAccusation) {
    tensionDelta += 0.2;
    trustDelta -= 0.15;
  }

  if (analysis.touchesKnownFact) {
    tensionDelta += 0.1;
  }

  const newStress = clamp(disposition.stress + tensionDelta);
  const newTrust = clamp(disposition.trust + trustDelta);

  let stance = "neutral";
  if (newStress > 0.7 && newTrust < 0.4) stance = "defensive";
  if (newTrust > 0.6 && newStress < 0.5) stance = "open";

  return {
    stance,
    newStress,
    newTrust
  };
}

/* =========================
   NARRATIVE GENERATION
   ========================= */

function generateReply(agent, reaction, analysis) {
  switch (reaction.stance) {
    case "defensive":
      return `${agent.name} incrocia le braccia. "State forzando i fatti. Non ho altro da aggiungere."`;

    case "open":
      return `${agent.name} sospira. "Se devo essere onesto… c'è qualcosa che non ho detto prima."`;

    default:
      if (analysis.isAccusation) {
        return `${agent.name} scuote la testa. "Non potete accusarmi senza prove."`;
      }
      return `${agent.name} ascolta attentamente e risponde con cautela.`;
  }
}

/* =========================
   EFFECTS ON SYSTEM
   ========================= */

function computeEffects(agent, reaction, analysis) {
  const effects = {
    dispositionChanges: {
      trust: reaction.newTrust,
      stress: reaction.newStress
    },
    hypothesisHints: []
  };

  if (analysis.isAccusation && reaction.stance === "defensive") {
    effects.hypothesisHints.push({
      type: "reinforce",
      target: agent.id,
      reason: "Reazione difensiva a un'accusa diretta"
    });
  }

  if (reaction.stance === "open") {
    effects.hypothesisHints.push({
      type: "unlock",
      target: agent.id,
      reason: "Disponibilità a rivelare nuove informazioni"
    });
  }

  return effects;
}

/* =========================
   UTILS
   ========================= */

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}
