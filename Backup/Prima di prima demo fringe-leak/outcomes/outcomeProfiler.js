// /outcomes/outcomeProfiler.js

export function profileOutcome({ success, score, breakdown }) {
  if (!breakdown || typeof breakdown !== "object") {
    throw new Error("Breakdown mancante o invalido");
  }

  const entries = Object.entries(breakdown);
  const correct = entries.filter(([, v]) => v === true).map(([k]) => k);
  const wrong = entries.filter(([, v]) => v === false).map(([k]) => k);

  // Caso perfetto
  if (success === true) {
    return {
      profile: "perfect_solution",
      severity: "none",
      correct,
      wrong,
    };
  }

  // Nessun elemento corretto
  if (correct.length === 0) {
    return {
      profile: "arbitrary_accusation",
      severity: "grave",
      correct,
      wrong,
    };
  }

  // Un solo elemento corretto
  if (correct.length === 1) {
    return {
      profile: `single_correct_element`,
      severity: "media",
      focus: correct[0],
      correct,
      wrong,
    };
  }

  // Più elementi corretti ma accusa errata
  if (correct.length >= 2) {
    return {
      profile: "partial_reconstruction",
      severity: "lieve",
      correct,
      wrong,
    };
  }

  // Fallback (non dovrebbe accadere)
  return {
    profile: "unknown_outcome",
    severity: "indefinita",
    correct,
    wrong,
  };
}
