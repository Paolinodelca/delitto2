// /api/charles.js

import fs from "fs";
import path from "path";

/* =========================
   UTILITÀ BASE
========================= */

// Normalizza il testo dell'utente
function normalize(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[èéê]/g, "e")
    .replace(/[à]/g, "a")
    .replace(/[ì]/g, "i")
    .replace(/[ò]/g, "o")
    .replace(/[ù]/g, "u");
}

// Mappa degli intenti
const intentMap = {
  identita: ["chi e", "chi era", "chi sono", "dimmi", "dimmi di"],
  contesto: ["dove", "quando", "era", "si trovava", "presente"]
};

// Rileva intento
function detectIntent(text) {
  for (const [intent, keywords] of Object.entries(intentMap)) {
    if (keywords.some(k => text.includes(k))) {
      return intent;
    }
  }
  return "generica";
}

/* =========================
   KNOWLEDGE BASE
========================= */

const basePath = path.join(process.cwd(), "knowledge");
const elenaPath = path.join(basePath, "elena.json");
const riccardoPath = path.join(basePath, "riccardo.json");

function loadJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

/* =========================
   PERSONAGGI
========================= */

// Tutti i personaggi menzionati
function detectCharacters(text) {
  const found = [];
  if (text.includes("elena")) found.push("elena");
  if (text.includes("riccardo")) found.push("riccardo");
  return found;
}

// Carica il personaggio richiesto
function loadCharacter(name) {
  if (name === "elena") return loadJSON(elenaPath);
  if (name === "riccardo") return loadJSON(riccardoPath);
  return null;
}

/* =========================
   RISPOSTE LOGICHE
========================= */

function answerSingleCharacter(character, text) {
  if (!character) {
    return "Charles: Mi dispiace, ma su questo non dispongo di fatti accertati.";
  }

  const intent = detectIntent(text);

  // IDENTITÀ
  if (intent === "identita") {
    if (character.descrizione) {
      return `${character.nome}: ${character.descrizione}`;
    }
    return `${character.nome}: Non risultano informazioni biografiche accertate.`;
  }

  // CONTESTO
  if (intent === "contesto") {
    if (character.contesto) {
      return `${character.nome}: ${character.contesto}`;
    }
    return `${character.nome}: Su questo non risultano informazioni accertate.`;
  }

  // RELAZIONI
  if (
    text.includes("padre") ||
    text.includes("figlio") ||
    text.includes("figlia")
  ) {
    return `${character.nome}: Non risultano informazioni accertate su relazioni familiari.`;
  }

  return `${character.nome}: Su questo non dispongo di fatti accertati.`;
}

/* =========================
   ENTRY POINT VERCEL
========================= */

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Metodo non consentito" });
    }

    // 🔹 Recupero testo (robusto)
    const rawText =
      req.body?.playerText ??
      req.body?.text ??
      req.body?.message ??
      "";

    const text = normalize(String(rawText));

    // 🔹 Risposte evasive / neutre
    if (
      text === "" ||
      text === "boh" ||
      text === "non so" ||
      text === "non lo so" ||
      text === "non ricordo"
    ) {
      return res.status(200).json({
        reply: "Charles: Va bene. Quando vuoi chiarire, sono qui."
      });
    }

    const characters = detectCharacters(text);

    // 🔹 CASO 1: NESSUN PERSONAGGIO
    if (characters.length === 0) {
      return res.status(200).json({
        reply: "Charles: Non riesco a capire a chi ti riferisci."
      });
    }

    // 🔹 CASO 2: PIÙ PERSONAGGI → gestione esplicita
    if (characters.length > 1) {
      // relazione familiare
      if (text.includes("figlio") || text.includes("padre")) {
        return res.status(200).json({
          reply:
            "Charles: Non risultano informazioni accertate su relazioni familiari tra queste persone."
        });
      }

      // identità multipla
      if (detectIntent(text) === "identita") {
        return res.status(200).json({
          reply:
            "Charles: Sono persone coinvolte negli eventi della villa."
        });
      }

      // contesto multiplo
      if (detectIntent(text) === "contesto") {
        return res.status(200).json({
          reply:
            "Charles: Erano presenti in momenti diversi secondo le testimonianze."
        });
      }

      return res.status(200).json({
        reply:
          "Charles: La domanda coinvolge più persone. Puoi specificarne una?"
      });
    }

    // 🔹 CASO 3: UN SOLO PERSONAGGIO
    const characterName = characters[0];
    const character = loadCharacter(characterName);

    const reply = answerSingleCharacter(character, text);

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("CHARLES ERROR:", err);
    return res.status(500).json({
      error: "Errore server",
      details: err.message
    });
  }
}
