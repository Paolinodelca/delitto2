// engine/state.js

export class State {
  constructor(initial = {}) {
    this.phase = initial.phase || "inizio";

    this.hypotheses = initial.hypotheses || [];

    this.agentDisposition = initial.agentDisposition || {};

    this.accusation = initial.accusation || null;

    this.gameOver = initial.gameOver || false;
  }

  /* =========================
     PHASE MANAGEMENT
     ========================= */

  setPhase(phase) {
    this.phase = phase;
  }

  /* =========================
     HYPOTHESES
     ========================= */

  addHypothesis(hypothesis) {
    this.hypotheses.push({
      ...hypothesis,
      id:
        hypothesis.id ||
        `hyp_${Date.now()}_${Math.random().toString(36).slice(2)}`
    });
  }

  getActiveHypotheses() {
    return this.hypotheses.filter(h => h.status === "attiva");
  }

  /* =========================
     AGENT DISPOSITION
     ========================= */

  ensureAgent(agentId) {
    if (!this.agentDisposition[agentId]) {
      this.agentDisposition[agentId] = {
        attitude: "neutro",
        suspicionLevel: 0
      };
    }
  }

  updateDisposition(agentId, updaterFn) {
    this.ensureAgent(agentId);
    updaterFn(this.agentDisposition[agentId]);
  }

  /* =========================
     ACCUSATION & END GAME
     ========================= */

  setAccusation(accusation) {
    this.accusation = accusation;
    this.gameOver = true;
    this.phase = "chiusura";
  }
}
