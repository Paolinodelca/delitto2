export function profileOutcome(verdict) {
  if (!verdict || !verdict.mode) {
    throw new Error("Verdetto mancante o non riconosciuto");
  }

  // === MODALITÀ FRINGE ===
  if (verdict.mode === "fringe") {
    return {
      category: "cognitive_assessment",
      outcome: verdict.assessment,
      coherence: verdict.coherence,
      notes: verdict.notes || [],
      success: verdict.coherence === "acceptable"
    };
  }

  // === MODALITÀ CLASSICA (delitto) ===
  if (verdict.mode === "classic") {
    return {
      category: "judicial_assessment",
      score: verdict.score,
      verdict: verdict.verdict,
      success: verdict.score >= 70
    };
  }

  throw new Error("Modalità di verdetto non supportata");
}
