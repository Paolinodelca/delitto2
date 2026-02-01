export function advancePhase({ state }, payload) {
  const { to } = payload;

  const transitions = {
    inizio: ["indagine"],
    indagine: ["confronto", "accusa"],
    confronto: ["accusa"],
    accusa: ["chiusura"]
  };

  const allowedNext = transitions[state.phase] || [];

  if (!allowedNext.includes(to)) {
    throw new Error(
      `Transizione non valida: ${state.phase} → ${to}`
    );
  }

  state.phase = to;

  return { state };
}
