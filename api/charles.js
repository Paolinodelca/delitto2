//### 🔧 `api/charles.js` (versione pulita – TEST SENZA LLM)


import fs from "fs";
import path from "path";

// 📁 base dati di gioco
const basePath = path.join(process.cwd(), "data", "game");
const factsPath = path.join(basePath, "facts.json");
const scenarioPath = path.join(basePath, "scenario.json");

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Metodo non consentito" });
    }

    const { playerText, gameState } = req.body;

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
    } catch {
      factsData = { fatti: [] };
    }

    const factsText =
      factsData.fatti.length > 0
        ? factsData.fatti.map(f => `- ${f.testo}`).join("\n")
        : "Nessun fatto accertato.";

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

    // ✅ test senza LLM
    return res.status(200).json({
      reply: `[TEST OK]\n\n${factsText}`,
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
