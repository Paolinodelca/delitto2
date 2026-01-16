// /api/charles.js

import fs from "fs";
import path from "path";

/**
 * Normalizza il testo dell'utente
 */
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[èéê]/g, "e")
    .replace(/[à]/g, "a")
    .replace(/[ì]/g, "i")
    .replace(/[ò]/g, "o")
    .replace(/[ù]/g, "u");
}

// mappa degli intenti della domanda
const intentMap = {
  identita: ["chi e", "chi era", "dimmi", "dimmi di"],
  contesto: ["dove", "quando", "era", "si trovava", "presente"]
};

// rileva l'intento
function detectIntent(text) {
  for (const [intent, keywords] of Object.entries(intentMap)) {
    if (keywords.some(k => text.includes(k))) {
      return intent;
    }
  }
  return "generica";
}

// percorsi knowledge
const basePath = path.join(process.cwd(), "knowledge");
const elenaPath = path.join(basePath, "elena.json");
const riccardoPath = path.join(basePath, "riccardo.json");

// carica JSON
function loadJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

// riconoscimento personaggio singolo
function detectCharacter(text) {
  if (text.includes("elena")) return "elena";
  if (text.includes("riccardo")) return "riccardo";
  return null;
}

// 🔹 FASE 5: rileva TUTTI i personaggi menzionati
function detectCharacters(text) {
  const found = [];
  if (text.includes("elena")) found.push("Elena");
  if (text.includes("riccardo")) found.push("Riccardo");
  return found;
}

// risposta logica centrale
function answerFromCharacter(character, text) {
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

  // RELAZIONI NON NOTE
  if (
    text.includes("padre") ||
    text.includes("figlio") ||
    text.includes("figlia")
  ) {
    return `${character.nome}: Non risultano informazioni accertate su relazioni familiari.`;
  }

  return `${character.nome}: Su questo non dispongo di fatti accertati.`;
}

// ✅ ENTRY POINT VERCEL
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Metodo non consentito" });
    }

    const userText =
      req.body.playerText ||
      req.body.text ||
      req.body.message ||
      "";

    const text = normalize(userText);
    if (
  text === "boh" ||
  text === "non so" ||
  text === "non lo so" ||
  text === "non ricordo"
) {
  return res.status(200).json({
    reply: "Charles: Va bene. Quando vuoi chiarire, sono qui."
  });
}

    
    const who = detectCharacter(text);

    let character = null;
    if (who === "elena") character = loadJSON(elenaPath);
    if (who === "riccardo") character = loadJSON(riccardoPath);


    
let reply;
let newState = req.body.gameState || {};

// se c’è un’ambiguità in sospeso
if (newState.pendingAmbiguity) {
  const chosen = detectCharacter(text);
/////
if (chosen) {
  const originalText = newState.pendingAmbiguity.originalText;
  const mergedText = originalText + " " + chosen;

  const finalText = normalize(mergedText);
  const whoFinal = detectCharacter(finalText);

  let finalCharacter = null;
  if (whoFinal === "elena") finalCharacter = loadJSON(elenaPath);
  if (whoFinal === "riccardo") finalCharacter = loadJSON(riccardoPath);

  reply = answerFromCharacter(finalCharacter, finalText);

  delete newState.pendingAmbiguity;
} else {
  // risposta evasiva o indecisa → chiudiamo l’ambiguità
  if (
    text.includes("boh") ||
    text.includes("non so") ||
    text.includes("non ricordo") ||
    text.includes("nessuno")
  ) {
    reply =
      "Charles: Va bene. Quando vuoi chiarire a chi ti riferisci, chiedimelo pure.";
    delete newState.pendingAmbiguity;
  } else {
    reply =
      "Charles: Non ho capito a chi ti riferisci. Puoi dirmi il nome?";
  }
}


  
} else {
  reply = answerFromCharacter(character, text);

  // se la risposta segnala ambiguità, la memorizziamo
  if (reply.startsWith("Charles: La domanda coinvolge più persone")) {
    newState.pendingAmbiguity = {
      originalText: text
    };
  }
}

return res.status(200).json({
  reply,
  gameState: newState
});


    
  } catch (err) {
    console.error("CHARLES ERROR:", err);
    return res.status(500).json({
      error: "Errore server",
      details: err.message
    });
  }
}
