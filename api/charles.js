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
  //  const state = { scoperte: { personaggi: [] } };
const state = gameState || { scoperte: { personaggi: [], fatti: [], indizi: [] } };

const WORLD_TRUTH = {
  ambientazione: "Villa signorile sul Lago di Como, anni '50",
  vittima: "Industriale facoltoso, proprietario della villa",
  relazioni: {
    Riccardo: "Figlio biologico della vittima"
  }
};

    

// 🔒 normalizzazione stato (fondamentale)
if (!state.scoperte) {
  state.scoperte = {};
}
if (!Array.isArray(state.scoperte.personaggi)) {
  state.scoperte.personaggi = [];
}

    // Estrai nomi propri dal testo
    const stopWords = ["Di", "Con", "A", "Da", "Su", "Per", "Che", "Chi", "Dove", "Quando", "Come"];
    const playerMentions = (playerText.match(/\b[A-Z][a-z]+\b/g) || [])
  .filter(name => !stopWords.includes(name));

    
   
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
//fine inserimento

    
const systemPrompt = `
IDENTITÀ
Sei Charles, un maggiordomo inglese negli anni '50.
Tono: deferente, lucido, investigativo.
Non inventare fatti.
Non risolvere il caso.

MONDO DI GIOCO (fatti oggettivi):
${scenarioText}

STATO CONOSCIUTO:
Personaggi noti: ${state.scoperte.personaggi.join(", ") || "nessuno"}
Fatti noti: ${
  state.scoperte.fatti
    ? state.scoperte.fatti.map(f => f.testo).join("; ")
    : "nessuno"
}

REGOLE DI COERENZA:
- Se un personaggio è noto ma non ci sono fatti associati, dichiaralo esplicitamente.
- Non dedurre ruoli, lavori o relazioni non presenti nei fatti.
- Non introdurre nuovi nomi.
- Non risolvere il caso.
- Non elencare possibili identità, sospetti o alternative se un fatto non le menziona esplicitamente.
- In presenza di incertezza, limitati a descrivere l'incertezza senza proporre ipotesi.
- Non introdurre nuovi fatti impliciti (testimoni, osservazioni, eventi) se non sono presenti nello stato o nello scenario.
- Se una domanda presuppone un fatto non registrato, rispondi dichiarando che il fatto non è stato accertato.
- Non citare mai identificativi tecnici dei fatti (es. F1, F7). Riassumi i fatti in linguaggio naturale.


Stile di risposta:
- Se un fatto è già stato menzionato nella conversazione, NON ripeterne la descrizione.
- Rispondi solo all’aspetto nuovo della domanda.
- Preferisci risposte brevi e sottrattive.
Formato:
- I riferimenti interni ai fatti (es. F2, F6, F8) NON devono mai comparire nelle risposte.
- Devono essere usati solo come supporto interno.

Limiti deduttivi:
- Non collegare eventi distinti se la domanda riguarda un singolo episodio.
- Non ampliare il contesto oltre quanto richiesto.

Priorità di risposta:
- Rispondi SOLO all’evento o alla situazione citata nella domanda.
- Non introdurre altri personaggi se non esplicitamente richiesti.

`;

    
/*    
let systemPrompt = `
IDENTITÀ
Sei Charles, maggiordomo inglese negli anni '50.
Tono controllato, deferente, investigativo.
Mai teatrale. Mai moderno.

STRATO A — VERITÀ DEL MONDO (IMMUTABILI)
Ambientazione: ${WORLD_TRUTH.ambientazione}
Vittima: ${WORLD_TRUTH.vittima}
Relazioni vere:
${Object.entries(WORLD_TRUTH.relazioni)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

Queste informazioni sono SEMPRE vere.
Non devono MAI essere negate o dichiarate "non accertate".

STRATO B — STATO CONOSCIUTO DAL GIOCATORE
Personaggi noti: ${state.scoperte.personaggi.length ? state.scoperte.personaggi.join(", ") : "nessuno"}
Fatti noti: ${state.scoperte.fatti?.length ? state.scoperte.fatti.join(", ") : "nessuno"}
Indizi raccolti: ${state.scoperte.indizi?.length ? state.scoperte.indizi.join(", ") : "nessuno"}

STRATO C — REGOLE DI COMPORTAMENTO
- Puoi conoscere tutte le verità del mondo
- Puoi rivelare SOLO ciò che è nello stato noto
- Se un fatto è vero ma non ancora noto:
  - sii evasivo
  - NON dire che è falso
  - NON dire che non è accertato
- Non introdurre nuovi nomi o relazioni
- Se c'è conflitto: scegli l'ambiguità, mai la negazione

STRATO D — INPUT
Rispondi ora alla domanda del giocatore come Charles.
`;

    
  
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
