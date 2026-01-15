// charles.js

import { elenaFacts } from "./knowledge/elena.js";
import { riccardoFacts } from "./knowledge/riccardo.js";

/**
 * Funzione principale chiamata dal backend
 */
export function charlesReply(userText) {
  const text = userText.toLowerCase();

  const character = detectCharacter(text);
  const ambito = detectAmbito(text);

  console.log("CHARLES | personaggio:", character, "| ambito:", ambito);

  if (character === "elena") {
    return answerFromFacts("Elena", elenaFacts, text, ambito);
  }

  if (character === "riccardo") {
    return answerFromFacts("Riccardo", riccardoFacts, text, ambito);
  }

  return fallback();
}

/**
 * Riconosce il personaggio citato
 */
function detectCharacter(text) {
  if (text.includes("elena")) return "elena";
  if (text.includes("riccardo")) return "riccardo";
  return null;
}

/**
 * Riconosce il tipo di domanda
 */
function detectAmbito(text) {
  if (text.includes("chi è") || text.includes("chi era")) return "identità";
  if (text.includes("dove") || text.includes("era")) return "contesto";
  if (text.includes("con chi") || text.includes("parlato")) return "relazioni";
  if (text.includes("lavoro") || text.includes("fa")) return "lavoro";
  return "generico";
}

/**
 * Cerca una risposta coerente nella knowledge base
 */
function answerFromFacts(name, facts, text, ambito) {
  // 1. match diretto per trigger + ambito
  for (const fact of facts) {
    if (
      text.includes(fact.trigger) &&
      (!fact.ambito || fact.ambito === ambito)
    ) {
      console.log(`CHARLES | fatto trovato per ${name}:`, fact.trigger);
      return `${name}: ${fact.answer}`;
    }
  }

  // 2. fallback sul personaggio (ma coerente)
  return `${name}: Su questo punto non risultano fatti accertati.`;
}

/**
 * Fallback totale
 */
function fallback() {
  return "Charles: Mi dispiace, ma su questo non dispongo di fatti accertati.";
}
