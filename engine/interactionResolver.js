/**
 * interactionResolver.js
 *
 * Responsabilità:
 * - applicare allo state gli effetti di un'interazione
 * - NON genera testo
 * - NON deduce verità
 * - NON accede a World o Knowledge
 *
 * Questo modulo è un "esecutore di conseguenze".
 */

import { applyHypothesisEffects } from "./actions/applyHypothesisEffects.js";

export function resolveInterrogationEffects({ state, interrogationResult }) {
  if (!state) {
    throw new Error("InteractionResolver: state mancante");
  }

  if (!interrogationResult) {
    return;
  }

  const { agentId, effects } = interrogationResult;

  if (!effects) {
    return;
  }

  // =========================
  // 1. Effetti sulle ipotesi
  // =========================
  // Alcune risposte possono rafforzare o indebolire
  // ipotesi già formulate dal giocatore
  if (Array.isArray(effects.hypothesisHints) && effects.hypothesisHints.length > 0) {
    applyHypothesisEffects({ state, hints: effects.hypothesisHints });
  }

  // =========================
  // 2. Effetti sull'agente interrogato
  // =========================
  if (effects.dispositionChanges && agentId) {
    const agent = state.agentDisposition?.[agentId];
    if (!agent) {
      return;
    }

    if (typeof effects.dispositionChanges.stress === "number") {
      agent.suspicionLevel = clamp(
        effects.dispositionChanges.stress
      );
    }

    if (typeof effects.dispositionChanges.trust === "number") {
      agent.trustLevel = clamp(
        effects.dispositionChanges.trust
      );
    }
  }
}

/* =========================
   UTILS
   ========================= */

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}
