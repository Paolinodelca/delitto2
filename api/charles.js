import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  try {
    const { playerText } = req.body;

    // --- 1. Leggiamo i file esterni ---
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

    // --- 2. Costruiamo il contesto ---
    const scenarioPrompt = `
Ambientazione: ${scenarioData.ambientazione}
Vittima: ${scenarioData.vittima}
Sospettati: ${scenarioData.sospettati.join(", ")}
Atmosfera: ${scenarioData.atmosfera}
`;

    const systemPrompt = `
${charlesPrompt}

Contesto del caso:
${scenarioPrompt}
`;

    // --- 3. Chiamata al modello ---
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      throw new Error("Risposta AI non valida");
    }

    const reply = data.choices[0].message.content;

    res.status(200).json({ reply });

  } catch (error) {
    console.error("CHARLES ERROR:", error);
    res.status(500).json({ error: "Errore nel motore di Charles" });
  }
}
