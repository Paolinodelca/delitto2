// charles.js

import { elenaFacts } from "./knowledge/elena.js";
import { riccardoFacts } from "./knowledge/riccardo.js";

/**
 * Funzione principale chiamata dal backend
 */
export function charlesReply(userText) {
  const text = userText.toLowerCase();

  // 1. Rilevamento personaggio
  const character = detectCharacter(text);

  console.log("CHARLES | personaggio rilevato:", character);

  // 2. Routing verso la knowledge base corretta
  if (character === "elena") {
    return answerFromFacts("Elena", elenaFacts, text);
  }

  if (character === "riccardo") {
    return answerFromFacts("Riccardo", riccardoFacts, text);
  }

  // 3. Fallback narrativo
  return fallback();
}

/**
 * Riconosce se nella domanda è citato un personaggio
 */
function detectCharacter(text) {
  if (text.includes("elena")) return "elena";
  if (text.includes("riccardo")) return "riccardo";
  return null;
}

/**
 * Cerca una risposta nella knowledge base del personaggio
 */
function answerFromFacts(name, facts, text) {
  for (const fact of facts) {
    if (text.includes(fact.trigger)) {
      console.log(`CHARLES | fatto trovato per ${name}:`, fact.trigger);
      return `${name}: ${fact.answer}`;
    }
  }

  // se il personaggio è noto ma la domanda no
  return `${name}: Su questo non risultano fatti accertati.`;
}

/**
 * Risposta di Charles quando non sa nemmeno di chi si parla
 */
function fallback() {
  return "Charles: Mi dispiace, ma su questo non dispongo di fatti accertati.";
}
