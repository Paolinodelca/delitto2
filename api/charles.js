import fs from "fs";
import path from "path";
import { areFactsDiscovered } from "../data/game/facts.js";

import {
  FACTS,
  discoverFact,
  isFactDiscovered,
  getKnownFacts
} from "../data/game/facts.js";

/* =========================
   Utility
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
   Personaggi statici
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
   Logica di risposta
========================= */

function answerWithFacts(character, text) {

 if (!character) {
    return "Charles: Non riesco a capire a chi ti riferisci.";
  }
  
    if (
    text.includes("figlio") ||
    text.includes("padre") ||
    text.includes("madre")
  ) {
    discoverFact("F_PARENTELA_RICCARDO_ELENA");

    if (isFactDiscovered("F_PARENTELA_RICCARDO_ELENA")) {
      return "Charles: Risulta che Riccardo sia figlio di Elena.";
    }
  }
  

  if (text.includes("chi e") || text.includes("chi era")) {
    return `${character.nome}: ${character.descrizione}`;
  }


/* =========================
   MOTIVO / PERCHÉ
========================= */

if (text.includes("perche") || text.includes("motivo")) {
  // questa risposta richiede fatti
  const requiredFacts = ["F_PRESENZA_VILLA_RICCARDO"];

  if (!areFactsDiscovered(requiredFacts)) {
    return "Charles: Non ho ancora elementi sufficienti per rispondere con certezza.";
  }

  return "Charles: Le ragioni della presenza di Riccardo in villa non sono ancora del tutto chiare.";
}


  
  if (text.includes("dove") || text.includes("era")) {
    if (character.nome === "Elena") {
      discoverFact("F_PRESENZA_VILLA_ELENA");
      
      return "Elena: Ero presente in villa il giorno del delitto.";
    }

    if (character.nome === "Riccardo") {
      discoverFact("F_PRESENZA_VILLA_RICCARDO");
      
      if (state === "first") {
      return "Riccardo: Ero in villa nei giorni precedenti al delitto.";
    }

    return "Riccardo: L’ho già detto. Ero in villa nei giorni precedenti al delitto.";
    }
  }

  

  
  return "Charles: Non dispongo di informazioni accertate su questo.";
}



/* =========================
   API handler (attivo)
========================= */

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Metodo non consentito" });
    }

    const rawText = req.body.playerText || req.body.text || "";
    const text = normalize(rawText);

    const knownFacts = getKnownFacts();
    console.log("📚 FATTI NOTI:", knownFacts);

    const who = detectCharacter(text);
    const character = who ? loadCharacter(who) : null;

    const reply = answerWithFacts(character, text);

    return res.status(200).json({
      reply,
      knownFacts,
    });
  } catch (err) {
    console.error("Errore handler API:", err);
    return res.status(500).json({ error: "Errore interno al server" });
  }
}

