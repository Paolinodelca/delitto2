//### 🔧 `api/charles.js` (versione pulita – TEST SENZA LLM)


import fs from "fs";
import path from "path";

// 📁 base dati di gioco
const basePath = path.join(process.cwd(), "data", "game");
const factsPath = path.join(basePath, "facts.json");
const scenarioPath = path.join(basePath, "scenario.json");

// 🔍 STEP 2 – funzione di analisi (non ancora attiva)
function discoverFacts(playerText, factsData) {
  const text = playerText.toLowerCase();

  return factsData.fatti.filter(fatto =>
    fatto.trigger?.some(trigger =>
      text.includes(trigger.toLowerCase())
    )
  );
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Metodo non consentito" });
    }

  const gameState = req.body.gameState || {};
  const playerText =
  req.body.playerText ||
  req.body.message ||
  req.body.text ||
  "";

    
   
   const state = gameState || {};

    // 📖 carica scenario
    let scenarioText = "{}";
    try {
      scenarioText = fs.readFileSync(scenarioPath, "utf-8");
    } catch {
      scenarioText = "{}";
    }

    // 📚 carica fatti
let factsData = { fatti: [] };
try {
  factsData = JSON.parse(fs.readFileSync(factsPath, "utf-8"));
} catch {
  factsData = { fatti: [] };
}

// 🔎 normalizza la domanda del giocatore
const question = (playerText || "").toLowerCase();

// 🎯 seleziona i fatti rilevanti tramite trigger
const matchingFacts = factsData.fatti.filter(fatto =>
  Array.isArray(fatto.trigger) &&
  fatto.trigger.some(trigger =>
    question.includes(trigger.toLowerCase())
  )
);

// 🗣️ costruzione risposta di Charles
const replyText =
  matchingFacts.length > 0
    ? matchingFacts.map(f => `- ${f.testo}`).join("\n")
    : "Mi dispiace, ma su questo non dispongo di fatti accertati.";

   
  
    // 🧠 system prompt (chiuso correttamente)
    const systemPrompt = `
IDENTITÀ
Sei Charles, un maggiordomo inglese negli anni '50.
Tono: deferente, lucido, investigativo.
Non inventare fatti.
Non risolvere il caso.

MONDO DI GIOCO:
${scenarioText}

FATTI ACCERTATI:
${factsText}

REGOLE:
- Puoi affermare solo ciò che è nei fatti.
- Se un'informazione non è accertata, dichiaralo.
- Non citare ID o riferimenti tecnici.
- Risposte brevi, non narrative.
`;
/*    
const replyText =
  matchingFacts.length > 0
    ? matchingFacts.map(f => `- ${f.testo}`).join("\n")
    : "Mi dispiace, ma su questo non dispongo di fatti accertati.";
*/
return res.status(200).json({
  reply: replyText,
  gameState: state
});
    
  } catch (error) {
    console.error("CHARLES ERROR:", error);
    console.log("PLAYER TEXT NORMALIZZATO:", playerText);

    return res.status(500).json({
      error: "Errore server",
      details: error.message
    });
  }
}
