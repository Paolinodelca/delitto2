/* =====================================================
   FACT ENGINE — VERITÀ DEL MONDO DI GIOCO
   ===================================================== */

/*
  Ogni FATTO rappresenta qualcosa che può essere
  scoperto dal giocatore.

  - discovered: true  → il giocatore lo sa
  - discovered: false → il giocatore NON lo sa ancora
  - requires: prerequisiti logici
*/

export const FACTS = {
  /* =========================
     PERSONAGGI
  ========================= */

  F_RICCARDO_IDENTITA: {
    id: "F_RICCARDO_IDENTITA",
    text: "Riccardo è un giovane uomo coinvolto negli eventi della villa.",
    discovered: true
  },

  F_ELENA_IDENTITA: {
    id: "F_ELENA_IDENTITA",
    text: "Elena è una donna presente in villa il giorno del delitto.",
    discovered: true
  },

  /* =========================
     RELAZIONI
  ========================= */

  F_PARENTELA_RICCARDO_ELENA: {
    id: "F_PARENTELA_RICCARDO_ELENA",
    text: "Riccardo è figlio di Elena.",
    discovered: false,
    requires: ["F_RICCARDO_IDENTITA", "F_ELENA_IDENTITA"]
  },

  /* =========================
     CONTESTO
  ========================= */

  F_VILLA_SCENA_DELITTO: {
    id: "F_VILLA_SCENA_DELITTO",
    text: "Il delitto è avvenuto all'interno della villa.",
    discovered: true
  }
};

/* =====================================================
   FUNZIONI DEL FACT ENGINE
   ===================================================== */

/**
 * Ritorna true se il fatto è già noto
 */
export function isFactDiscovered(id) {
  return FACTS[id]?.discovered === true;
}

/**
 * Tenta di scoprire un fatto.
 * Rispetta eventuali prerequisiti.
 */
export function discoverFact(id) {
  const fact = FACTS[id];
  if (!fact) return false;

  if (fact.requires) {
    const ok = fact.requires.every(req => isFactDiscovered(req));
    if (!ok) return false;
  }

  if (!fact.discovered) {
    fact.discovered = true;
    console.log("📌 FATTO SCOPERTO:", id);
  }

  return true;
}

/**
 * Ritorna i testi di tutti i fatti noti
 * (da passare all’AI)
 */
export function getKnownFacts() {
  return Object.values(FACTS)
    .filter(f => f.discovered)
    .map(f => f.text);
}
