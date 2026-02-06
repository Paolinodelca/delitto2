export function judgeGame({ world, state = null, position = null }) {
  // === MODALITÀ FRINGE (no accusa formale) ===
  if (!state || !state.accusation) {
    return {
      mode: "fringe",
      assessment: "underdetermined",
      coherence: "acceptable",
      notes: [
        "Nessuna accusa formale presentata",
        "Il ragionamento non viola i fatti noti",
        "La posizione resta difensiva ma plausibile"
      ]
    };
  }

  // === MODALITÀ CLASSICA (delitto) ===
  const accusation = state.accusation;

  const truth = {
    accused: world.getFactById("murderer")?.value,
    motive: world.getFactById("motive")?.value,
    method: world.getFactById("method")?.value,
    time: world.getFactById("time")?.value
  };

  let score = 0;

  if (accusation.accused === truth.accused) score += 50;
  if (accusation.motive === truth.motive) score += 20;
  if (accusation.method === truth.method) score += 20;
  if (accusation.time === truth.time) score += 10;

  return {
    mode: "classic",
    score,
    verdict: score >= 70 ? "fondata" : "infondata"
  };
}


