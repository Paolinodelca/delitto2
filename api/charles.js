/* =====================================================
   CHARLES API — FACT-DRIVEN
   ===================================================== */

import fs from "fs";
import path from "path";

// 🧠 FACT ENGINE
import {
  FACTS,
  isFactDiscovered,
  getKnownFacts
} from "../data/game/facts.js";

/* =========================
   UTIL
========================= */

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

/* =========================
   PERSONAGGI (STATICI)
========================= */

const basePath = path.join(process.cwd(), "knowledge");

function loadCharacter(name) {
  try {
    const file = path.join(basePath, `${name}.json`);
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return null;
  }
}

function detectCharacter(text) {
  if (text.includes("riccardo")) return "riccardo";
  if (text.includes("elena")) return "elena";
  return null;
}

/* =========================
   LOGICA DI RISPOSTA
========================= */

import { discoverFact, isFactDiscovered } from "../data/game/facts.js";

function answerWithFacts(character, text) {
  if (!character) {
    return "Charles: Non riesco a capire a chi ti riferisci.";
  }

  /* =========================
     IDENTITÀ
  ========================= */

  if (text.includes("chi e") || text.includes("chi era")) {
    return `${character.nome}: ${character.descrizione}`;
  }

  /* =========================
     PARENTELA (SBLOCCA FATTO)
  ========================= */

  if (
    text.includes("figlio") ||
    text.includes("padre") ||
    text.includes("madre")
  ) {
    // 🔓 SCOPERTA DEL FATTO
    discoverFact("F_PARENTELA_RICCARDO_ELENA");

    if (isFactDiscovered("F_PARENTELA_RICCARDO_ELENA")) {
      return "Charles: Risulta che Riccardo sia figlio di Elena.";
    }
  }

  /* =========================
     PRESENZA IN VILLA
  ========================= */

  if (text.includes("dove") || text.includes("era")) {
    if (character.nome === "Elena") {
      discoverFact("F_PRESENZA_VILLA_ELENA");
      return "Elena: Ero presente in villa il giorno del delitto.";
    }

    if (character.nome === "Riccardo") {
      discoverFact("F_PRESENZA_VILLA_RICCARDO");
      return "Riccardo: Ero in villa nei giorni precedenti al delitto.";
    }
  }

  return "Charles: Non dispongo di informazioni accertate su questo.";
}





/* =========================
   API HANDLER
========================= */
export default function handler(req, res) {
  return res.status(200).json({
    reply: "Backend vivo e risponde."
  });
}

/*
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  const rawText =
    req.body.playerText ||
    req.body.text ||
    "";

  const text = normalize(rawText);

  // 🧠 fatti noti (per debug o future AI)
  const knownFacts = getKnownFacts();
  console.log("📚 FATTI NOTI:", knownFacts);

  const who = detectCharacter(text);
  const character = who ? loadCharacter(who) : null;

  const reply = answerWithFacts(character, text);

  return res.status(200).json({
    reply,
    knownFacts
  });
}
*/
