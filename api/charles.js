// /api/charles.js

import fs from "fs";
import path from "path";

import { elenaFacts } from "./knowledge/elena.js";
import { riccardoFacts } from "./knowledge/riccardo.js";

/**
 * Normalizza il testo dell'utente
 * (accenti, apostrofi, maiuscole)
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


// percorsi knowledge
const basePath = path.join(process.cwd(), "knowledge");
const elenaPath = path.join(basePath, "elena.json");
const riccardoPath = path.join(basePath, "riccardo.json");

// helper: carica JSON
function loadJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

// riconoscimento personaggio
function detectCharacter(text) {
  if (text.includes("elena")) return "elena";
  if (text.includes("riccardo")) return "riccardo";
  return null;
}

// risposta per personaggio
function answerFromCharacter(character, text) {
  if (!character) {
    return "Charles: Mi dispiace, ma su questo non dispongo di fatti accertati.";
  }

  if (text.includes("chi è") || text.includes("chi era") || text.includes("dimmi")) {
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

  return `${character.nome}: Su questo non dispongo di fatti accertati.`;
}

// 🔴 ENTRY POINT OBBLIGATORIO PER VERCEL
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

    export function charlesReply(userText) {
    const text = normalize(userText);


    const who = detectCharacter(text);

    let character = null;
    if (who === "elena") character = loadJSON(elenaPath);
    if (who === "riccardo") character = loadJSON(riccardoPath);

    const reply = answerFromCharacter(character, text);

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("CHARLES ERROR:", err);
    return res.status(500).json({
      error: "Errore server",
      details: err.message
    });
  }
}
