import fs from "fs";
   
import path from "path";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Metodo non consentito" });
    }
   

    const { playerText, gameState } = req.body;

const promptPath = path.join(process.cwd(), "prompts", "charles.txt");
//const systemPrompt = fs.readFileSync(promptPath, "utf-8");
let systemPrompt;
try {
  systemPrompt = fs.readFileSync(promptPath, "utf-8");
} catch (err) {
  console.error("PROMPT FILE NOT FOUND, using fallback");
  systemPrompt = `
Sei Charles, un maggiordomo inglese negli anni '50.
Tono: deferente, lucido, investigativo.
Rispondi in modo conciso.
Non inventare fatti.
Non risolvere il caso.
`;
}


console.log("===== SYSTEM PROMPT =====");
console.log(systemPrompt);
console.log("=========================");

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
          temperature: 0.2
        })
      }
    );

    const data = await response.json();

    return res.status(200).json({
      reply: data.choices[0].message.content,
      gameState
    });

  } catch (error) {
    console.error("CHARLES ERROR:", error);
    return res.status(500).json({
      error: "Errore server",
      details: error.message
    });
  }
}
