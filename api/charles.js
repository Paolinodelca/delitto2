import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  console.log("BODY RICEVUTO:", req.body);

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Metodo non consentito" });
    }

    const { playerText, gameState } = req.body;

    // Stato di lavoro (solo in memoria)
  //  const state = gameState || { scoperte: { personaggi: [] } };
    const state = { scoperte: { personaggi: [] } };

// 🔒 normalizzazione stato (fondamentale)
if (!state.scoperte) {
  state.scoperte = {};
}
if (!Array.isArray(state.scoperte.personaggi)) {
  state.scoperte.personaggi = [];
}

    // Estrai nomi propri dal testo
    const playerMentions = playerText.match(/\b[A-Z][a-z]+\b/g) || [];
    const knownPeople = state.scoperte.personaggi || [];

    const newPeople = playerMentions.filter(
      name => !knownPeople.includes(name)
    );

    if (newPeople.length > 0) {
      state.scoperte.personaggi.push(...newPeople);
    }
//inizio inserimento
const scenarioPath = path.join(process.cwd(), "game", "scenario.json");
let scenarioText = "";

try {
  scenarioText = fs.readFileSync(scenarioPath, "utf-8");
} catch {
  scenarioText = "{}";
}
//fine inserimentto

    
    // Carica prompt di Charles
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
systemPrompt = `
${systemPrompt}

MONDO DI GIOCO (fatti oggettivi):
${scenarioText}
`;


// Arricchisci il prompt con lo stato noto
systemPrompt += `

STATO CONOSCIUTO:
Personaggi noti: ${state.scoperte.personaggi.join(", ") || "nessuno"}
Fatti noti: ${
  state.scoperte.fatti
    ? state.scoperte.fatti.map(f => f.testo).join("; ")
    : "nessuno"
}

Regole:
- Se un personaggio è noto ma non ci sono fatti associati, dichiaralo esplicitamente.
- Non dedurre ruoli, lavori o relazioni non presenti nei fatti.
- Non introdurre nuovi nomi.
- Non risolvere il caso.
`;



    
 /*   
    // Arricchisci il prompt con lo stato
    systemPrompt += `

STATO CONOSCIUTO:
Personaggi noti: ${state.scoperte.personaggi.join(", ") || "nessuno"}

Regole:
- Se un personaggio non è nello stato, dichiara che non hai informazioni verificate.
- Non introdurre nuovi nomi spontaneamente.
`;


    */
    // Chiamata LLM
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
