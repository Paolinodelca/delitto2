// game/gameState.js

export function createInitialGameState() {
  return {
    facts: [
      {
        id: "death_time_estimated",
        text: "La vittima è morta tra le 21:30 e le 22:30.",
        confirmed: true
      }
    ],

    hypotheses: [],

    timeline: [
      {
        time: "21:30–22:30",
        event: "Finestra temporale stimata della morte",
        source: "medico legale"
      }
    ],

    interviewed: [],
    unlockedActions: []
  };
}
export function gameStateToPrompt(state) {
  const factsText =
    state.facts.length > 0
      ? state.facts.map(f => `- ${f.text}`).join("\n")
      : "- Nessun fatto accertato";

  const timelineText =
    state.timeline.length > 0
      ? state.timeline.map(e => `- ${e.time}: ${e.event}`).join("\n")
      : "- Nessun evento registrato";

  return `
STATO DELL’INDAGINE (verità confermate):

FATTI:
${factsText}

CRONOLOGIA:
${timelineText}
`;
}
