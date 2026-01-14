import fs from "fs";
import path from "path";

// 📁 percorsi dati
const basePath = path.join(process.cwd(), "data", "game");
const factsPath = path.join(basePath, "facts.json");

// 🧠 riconoscimento semplice del tipo di domanda
function detectQuestionAmbito(text) {
  // normalizzazione minima
  
  const t = text
    .toLowerCase()
    .replace(/’/g, "'");

  if (t.includes("chi è") || t.includes("di chi")) return "identità";
  if (t.includes("lavoro") || t.includes("fa")) return "lavoro";
  if (t.includes("con chi") || t.includes("parlato")) return "relazione";
  if (
  t.includes("dove") ||
  t.includes("dov") ||      // copre dov', dove, doveera
  t.includes("quando") ||
  t.includes("era") ||      // fondamentale per “dove era”
  t.includes("visto")
) return "contesto";


  return "generica";
}

function invertRelationFact(fatto, targetName) {
  const r = fatto.relazione;
  if (!r || !r.bidirezionale) return null;

  if (r.oggetto === targetName) {
    return {
      id: fatto.id + "_inv",
      testo: `${r.oggetto[0].toUpperCase() + r.oggetto.slice(1)} ha parlato con ${r.soggetto}.`,
      ambito: fatto.ambito
    };
  }

  return null;
}


export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Metodo non consentito" });
    }

    // 🧾 input
    const playerText =
      req.body.playerText ||
      req.body.message ||
      req.body.text ||
      "";

    const state = req.body.gameState || {};

    // 📚 carica fatti
    let factsData = { fatti: [] };
   
    
    try {
      factsData = JSON.parse(fs.readFileSync(factsPath, "utf-8"));
    } catch {
      factsData = { fatti: [] };
    }

    const question = playerText.toLowerCase();
    const questionAmbito = detectQuestionAmbito(question);


  const discoveredFacts = state.scoperte?.fatti || [];

// ⛔ NON usarla nel filtro adesso

const matchingFacts = factsData.fatti.filter(fatto =>
  discoveredFacts.includes(fatto.id) &&
  Array.isArray(fatto.trigger) &&
  fatto.trigger.some(trigger =>
    question.includes(trigger.toLowerCase())
  )
);

    const ambitoCompatibleFacts = matchingFacts.filter(
  f => f.ambito === questionAmbito
);


    
// 🧠 fatti noti sul soggetto, ma non pertinenti alla domanda
const mentionedNames = ["riccardo", "elena"];

const mentionedName = mentionedNames.find(name =>
  question.includes(name)
);

/////    
const knownFactsOnSubject = mentionedName
  ? factsData.fatti.filter(f =>
      discoveredFacts.includes(f.id) &&
      f.testo.toLowerCase().includes(mentionedName)
    )
  : [];

const inferredFacts = [];

if (mentionedName) {
  factsData.fatti.forEach(f => {
    if (
      discoveredFacts.includes(f.id) &&
      f.relazione &&
      f.relazione.bidirezionale
    ) {
      const inv = invertRelationFact(f, mentionedName);
      if (inv) inferredFacts.push(inv);
    }
  });
}

//////
  
  : [];



    
    // 🗣️ risposta di Charles
  let reply;

if (ambitoCompatibleFacts.length > 0) {
  reply = ambitoCompatibleFacts.map(f => `- ${f.testo}`).join("\n");
} else if (matchingFacts.length > 0) {
  reply =
    "Non ho informazioni precise su questo aspetto, ma so che:\n" +
    matchingFacts.map(f => `- ${f.testo}`).join("\n");
} else if (knownFactsOnSubject.length > 0 || inferredFacts.length > 0) {
  reply =
    "Su questo punto non dispongo di informazioni precise, ma so che:\n" +
    [...knownFactsOnSubject, ...inferredFacts]
      .map(f => `- ${f.testo}`)
      .join("\n");
}
/*
   */
  else {
  reply = "Mi dispiace, ma su questo non dispongo di fatti accertati.";
}

    return res.status(200).json({
  reply,
  usedFacts: matchingFacts.map(f => f.id),
  gameState: state
});


  } catch (error) {
    console.error("CHARLES ERROR:", error);
    return res.status(500).json({
      error: "Errore server",
      details: error.message
    });
  }
}
