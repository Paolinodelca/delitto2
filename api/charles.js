// charles.js

import fs from "fs";
import path from "path";

const knowledgePath = path.join(process.cwd(), "knowledge");

/**
 * Funzione principale
 */
export function charlesReply(userText) {
  const text = userText.toLowerCase();

  const character = detectCharacter(text);

  console.log("CHARLES | personaggio rilevato:", character);

  if (!character) {
    return fallback();
  }

  const characterData = loadCharacter(character);

  if (!characterData) {
    return fallback();
  }

  return answerFromCharacter(characterData, text);
}

/**
 * Rileva il personaggio citato
 */
function detectCharacter(text) {
  if (text.includes("riccardo")) return "riccardo";
  if (text.includes("elena")) return "elena";
  return null;
}

/**
 * Carica il JSON del personaggio
 */
function loadCharacter(name) {
  try {
    const filePath = path.join(knowledgePath, `${name}.json`);
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("CHARLES | errore caricamento JSON:", err);
    return null;
  }
}

/**
 * Genera la risposta a partire dal personaggio
 */
function answerFromCharacter(character, text) {
  // domande di identità
  if (text.includes("chi è") || text.includes("chi era")) {
    return `${character.nome}: ${character.descrizione}`;
  }

  // domande generiche sul personaggio
  if (
    text.includes("dimmi") ||
    text.includes("parlami") ||
    text.includes("raccontami")
  ) {
    return `${character.nome}: ${character.descrizione}`;
  }

  return `${character.nome}: Su questo non dispongo di fatti accertati.`;
}

/**
 * Fallback totale
 */
function fallback() {
  return "Charles: Mi dispiace, ma su questo non dispongo di fatti accertati.";
}
