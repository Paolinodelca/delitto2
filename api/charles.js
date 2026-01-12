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

    
    //const { playerText, gameState } = req.body;
    //temporaneo
 // console.log("PLAYER TEXT:", playerText);
 // console.log("BODY:", req.body);
//fine temporaneo
    // Stato di gioco
  /*
    const state = gameState || {
      scoperte: { personaggi: [], fatti: [], indizi: [] }
    };

    if (!state.scoperte.personaggi) {
      state.scoperte.personaggi = [];
    }
*/
   const state = gameState || {};

    // 📖 carica scenario
    let scenarioText = "{}";
    try {
      scenarioText = fs.readFileSync(scenarioPath, "utf-8");
    } catch {
      scenarioText = "{}";
    }

    // 📚 carica fatti (UNA SOLA VOLTA)
    let factsData = { fatti: [] };
    try {
      factsData = JSON.parse(fs.readFileSync(factsPath, "utf-8"));
    // 🔎 seleziona i fatti rilevanti in base ai trigger
    const question = (playerText || "").toLowerCase();

    const matchingFacts = factsData.fatti.filter(f =>
    Array.isArray(f.trigger) &&
    f.trigger.some(t => question.includes(t.toLowerCase()))
    );
  
      
    } catch {
      factsData = { fatti: [] };
    }

    const factsText =
      factsData.fatti.length > 0
        ? factsData.fatti.map(f => `- ${f.testo}`).join("\n")
        : "Nessun fatto accertato.";

// 🔍 analisi semplice della domanda
const question = (playerText || "").toLowerCase();

// cerchiamo fatti rilevanti
const matchingFacts = factsData.fatti.filter(f =>
  question.includes(f.soggetto?.toLowerCase())
);

// costruiamo la risposta di Charles
let reply;

if (matchingFacts.length > 0) {
  reply = matchingFacts
    .map(f => `- ${f.testo}`)
    .join("\n");
} else {
  reply = "Mi dispiace, ma su questo non dispongo di fatti accertati.";
}
  
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
    
const replyText =
  matchingFacts.length > 0
    ? matchingFacts.map(f => `- ${f.testo}`).join("\n")
    : "Mi dispiace, ma su questo non dispongo di fatti accertati.";

return res.status(200).json({
  reply: replyText,
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
