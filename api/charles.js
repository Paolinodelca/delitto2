import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  try {
    const { playerText, gameState } = req.body;

    /* =========================
       1. STATO DI GIOCO SICURO
       ========================= */
    const safeGameState = gameState || {
      discoveredFacts: [],
      interviewed: [],
      unlockedActions: [],
      timePassed: 0
    };

    const statePrompt = `
Stato dell'indagine:
- Fatti scoperti: ${safeGameState.discoveredFacts.join(", ") || "nessuno"}
- Persone interrogate: ${safeGameState.interviewed.join(", ") || "nessuna"}
- Azioni disponibili: ${safeGameState.unlockedActions.join(", ") || "nessuna"}
`;

    /* =========================
       2. LETTURA FILE DI SCENARIO
       ========================= */
    const basePath = process.cwd();

    const charlesPrompt = fs.readFileSync(
      path.join(basePath, "prompts", "charles.txt"),
      "utf-8"
    );

    const scenarioData = JSON.parse(
      fs.readFileSync(
        path.join(basePath, "game", "scenario.json"),
        "utf-8"
      )
    );

    const scenarioPrompt = `
Ambientazione: ${scenarioData.ambientazione}
Vittima: ${scenarioData.vittima}
Sospettati: ${scenarioData.sospettati.join(", ")}
Atmosfera: ${scenarioData.atmosfera}
`;

    /* =========================
       3. PROMPT DI SISTEMA
       ========================= */
    const systemPrompt = `
${charlesPrompt}

Contesto del caso:
${scenarioPrompt}

${statePrompt}

Regole di comportamento:
- Non fare domande al posto del giocatore
- Non rivelare mai la soluzione
- Usa lo stato per suggerire nuove direzioni
- Tono deferente, ironico, intelligente
`;

    /* =========================
       4. CHIAMATA A GROQ
       ========================= */
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: playerText }
          ],
          temperature: 0.8
        })
      }
    );

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      throw new Error("Risposta AI non valida");
    }

    const reply = data.choices[0].message.content;

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("CHARLES ERROR:", error);
    return res.status(500).json({ error: "Errore nel motore di Charles" });
  }
}

