/* ======================================================
   CONVERSATION CORE v1.0
   Gestione robusta input vocali e testuali
   Multilingua, a stati, anti-"boh"
====================================================== */

/* =========================
   STATI CONVERSAZIONALI
========================= */
const CONVERSATION_STATE = {
  NORMAL: "NORMAL",
  UNCERTAINTY: "UNCERTAINTY",
  DELEGATION: "DELEGATION",
  BLOCKED: "BLOCKED",
  NO_INPUT: "NO_INPUT"
};

/* =========================
   LANGUAGE PACK - ITALIANO
========================= */
const languagePackIT = {
  UNCERTAINTY: [
    "boh",
    "mah",
    "non so",
    "non ne ho idea",
    "non lo so",
    "eh"
  ],
  DELEGATION: [
    "vedi tu",
    "decidi tu",
    "fai tu"
  ]
};

/* =========================
   CONFIGURAZIONE LINGUA
========================= */
let activeLanguagePack = languagePackIT;

/* =========================
   CLASSIFICATORE INPUT
========================= */
function classifyInput(rawText) {
  if (rawText === null || rawText === undefined) {
    return CONVERSATION_STATE.NO_INPUT;
  }

  const text = rawText.trim().toLowerCase();

  if (text.length === 0) {
    return CONVERSATION_STATE.NO_INPUT;
  }

  for (const phrase of activeLanguagePack.UNCERTAINTY) {
    if (text === phrase || text.includes(phrase)) {
      return CONVERSATION_STATE.UNCERTAINTY;
    }
  }

  for (const phrase of activeLanguagePack.DELEGATION) {
    if (text === phrase || text.includes(phrase)) {
      return CONVERSATION_STATE.DELEGATION;
    }
  }

  return CONVERSATION_STATE.NORMAL;
}

/* =========================
   POLICY DI RISPOSTA
========================= */
function getPolicyReply(state) {
  switch (state) {
    case CONVERSATION_STATE.UNCERTAINTY:
      return "Va bene, allora ti guido io. Proviamo a fare un passo semplice.";

    case CONVERSATION_STATE.DELEGATION:
      return "D'accordo. Prendo io l'iniziativa e andiamo avanti.";

    case CONVERSATION_STATE.NO_INPUT:
      return "Non ho sentito una risposta. Dimmi pure quando vuoi.";

    case CONVERSATION_STATE.BLOCKED:
      return "Siamo un po' fermi. Cambiamo prospettiva.";

    default:
      return null; // NORMAL → gestito dal backend
  }
}

/* =========================
   API PUBBLICA
========================= */
function processPlayerInput(rawText) {
  const state = classifyInput(rawText);
  const policyReply = getPolicyReply(state);

  return {
    state,
    policyReply
  };
}

/* =========================
   EXPORT GLOBALE
========================= */
window.ConversationCore = {
  processPlayerInput,
  CONVERSATION_STATE
};
