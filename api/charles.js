import fs from "fs";
import path from "path";

const statePath = path.join(process.cwd(), "data", "game", "state.json");

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Metodo non consentito" });
    }

    const { playerText } = req.body;

    // 1. carica stato
    let gameStateData;
    try {
      gameStateData = JSON.parse(fs.readFileSync(statePath, "utf-8"));
    } catch {
      gameStateData = { scoperte: { personaggi: [] } };
    }

    // 2. estrai nomi dal testo
    const playerMentions = playerText.match(/\b[A-Z][a-z]+\b/g) || [];
    const knownPeople = gameStateData.scoperte.personaggi;

    const newPeople = playerMentions.filter(
      name => !knownPeople.includes(name)
    );

    // 3. aggiorna stato se serve
    if (newPeople.length > 0) {
      gameStateData.scoperte.personaggi.push(...newPeople);

      fs.writeFileSync(
        statePath,
        JSON.stringify(gameStateData, null, 2),
        "utf-8"
      );
    }

    // 4. prompt
    const promptPath = path.join(process.cwd(), "prompts", "charles.txt");
    let systemPrompt;
    try {
      systemPrompt = fs.readFileSync(promptPath, "utf-8");
    } catch {
      systemPrompt = `
Sei Charles, un maggiordomo inglese negli anni '50.
Tono: deferente, lucido, investigativo.
Rispondi in modo conciso.
Non inventare fatti.
Non risolvere il caso.
`;
    }

    // 5. chiamata LLM
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: playerText }
          ],
          temperature: 0.2
        })
      }
    );

    const data = await response.json();

    return res.status(200).json({
      reply: data.choices[0].message.content,
      gameState: gameStateData
    });

  } catch (error) {
    console.error("CHARLES ERROR:", error);
    return res.status(500).json({
      error: "Errore server",
      details: error.message
    });
  }
}
