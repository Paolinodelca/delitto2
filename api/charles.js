import fs from "fs";
import path from "path";
import {
  createInitialGameState,
  gameStateToPrompt
} from "../game/gameState.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  try {
    const { playerText, gameState } = req.body;

    // 🔐 Stato ufficiale del gioco
    const state = gameState || createInitialGameState();
    const statePrompt = gameStateToPrompt(state);

    // 📖 Prompt base di Charles
    const basePath = process.cwd();
    const charlesPrompt = fs.readFileSync(
      path.join(basePath, "prompts", "charles.txt"),
      "utf-8"
    );

    const systemPrompt = `
${charlesPrompt}

${statePrompt}

REGOLE:
- Usa solo i fatti come verità.
- Non inventare nuovi fatti.
- Le ipotesi restano tali.
- Non risolvere il caso.
`;

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

    res.status(200).json({
      reply,
      gameState: state
    });

  } catch (error) {
    console.error("CHARLES ERROR:", error);
    res.status(500).json({ error: "Errore nel motore di Charles" });
  }
}
