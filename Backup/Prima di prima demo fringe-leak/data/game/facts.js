/* =====================================================
   FACT ENGINE — Stato della verità del gioco
   ===================================================== */

// Tutti i fatti possibili del gioco
export const FACTS = {
  F_PARENTELA_RICCARDO_ELENA: {
    id: "F_PARENTELA_RICCARDO_ELENA",
    description: "Riccardo è figlio di Elena",
    discovered: false
  },

  F_PRESENZA_VILLA_ELENA: {
    id: "F_PRESENZA_VILLA_ELENA",
    description: "Elena era presente in villa il giorno del delitto",
    discovered: false,
  timesMentioned: 0
  },

  F_PRESENZA_VILLA_RICCARDO: {
    id: "F_PRESENZA_VILLA_RICCARDO",
    description: "Riccardo era presente in villa il giorno del delitto",
    discovered: false,
  timesMentioned: 0
  }
};

/* =========================
   API FACT ENGINE
========================= */

export function discoverFact(id) {
  if (!FACTS[id]) return false;

  if (!FACTS[id].discovered) {
    FACTS[id].discovered = true;
    FACTS[id].timesMentioned = 1;
    console.log("🧠 FATTO SCOPERTO:", id);
    return "first";
  }

  FACTS[id].timesMentioned++;
  return "repeat";
}


export function isFactDiscovered(id) {
  return FACTS[id]?.discovered === true;
}

export function getKnownFacts() {
  return Object.values(FACTS)
    .filter(f => f.discovered)
    .map(f => f.id);
}
export function areFactsDiscovered(ids = []) {
  return ids.every(id => FACTS[id]?.discovered === true);
}

