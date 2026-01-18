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
    discovered: false
  },

  F_PRESENZA_VILLA_RICCARDO: {
    id: "F_PRESENZA_VILLA_RICCARDO",
    description: "Riccardo era presente in villa il giorno del delitto",
    discovered: false
  }
};

/* =========================
   API FACT ENGINE
========================= */

export function discoverFact(id) {
  if (FACTS[id] && !FACTS[id].discovered) {
    FACTS[id].discovered = true;
    console.log("🧠 FATTO SCOPERTO:", id);
    return true;
  }
  return false;
}

export function isFactDiscovered(id) {
  return FACTS[id]?.discovered === true;
}

export function getKnownFacts() {
  return Object.values(FACTS)
    .filter(f => f.discovered)
    .map(f => f.id);
}

