// api/charles.js

import fs from "fs";
import path from "path";

const knowledgePath = path.join(process.cwd(), "knowledge");

/* =========================
   API HANDLER (Vercel)
========================= */
export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  const userText =
    req.body.playerText ||
    req.body.text ||
    req.body.message ||
    "";

  const reply = charlesReply(userText);

  return res.status(200).json({ reply });
}

/* =========================
   LOGICA DI CHARLES
========================= */

function charlesReply(userText) {
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

/* =========================
   UTILITÀ
========================= */

function detectCharacter(text) {
  if (text.includes("riccardo")) return "riccardo";
  if (text.includes("elena")) return "elena";
  return null;
}

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
/////
function answerFromCharacter(character, text) {
  if (text.includes("chi è") || text.includes("chi era")) {
    return `${character.nome}: ${character.descrizione}`;
  }

  if (
    text.includes("dove") ||
    text.includes("quando") ||
    text.includes("era")
  ) {
    if (character.contesto) {
      return `${character.nome}: ${character.contesto}`;
    }
    return `${character.nome}: Su questo non risultano informazioni accertate.`;
  }

  if (
    text.includes("dimmi") ||
    text.includes("parlami") ||
    text.includes("raccontami")
  ) {
    return `${character.nome}: ${character.descrizione}`;
  }

  return `${character.nome}: Su questo non dispongo di fatti accertati.`;
}



///////
function fallback() {
  return "Charles: Mi dispiace, ma su questo non dispongo di fatti accertati.";
}
