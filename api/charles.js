import fs from "fs";
import path from "path";

// 📁 percorsi dati
const basePath = path.join(process.cwd(), "data", "game");
const factsPath = path.join(basePath, "facts.json");

// 🧠 riconoscimento semplice del tipo di domanda
function detectQuestionAmbito(text) {
  // normalizzazione minima
  const t = text
    .toLowerCase()
    .replace(/’/g, "'");

  if (t.includes("chi è") || t.includes("di chi")) return "identità";
  if (t.includes("lavoro") || t.includes("fa")) return "lavoro";
  if (t.includes("con chi") || t.includes("parlato")) return "relazione";
  if (
    t.includes("dove") ||
    t.includes("dov'") ||
    t.includes("quando") ||
    t.includes("visto")
  ) return "contesto";

  return "generica";
}


export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Metodo non consentito" });
    }

    // 🧾 input
    const playerText =
      req.body.playerText ||
      req.body.message ||
      req.body.text ||
      "";

    const state = req.body.gameState || {};

    // 📚 carica fatti
    let factsData = { fatti: [] };
    try {
      factsData = JSON.parse(fs.readFileSync(factsPath, "utf-8"));
    } catch {
      factsData = { fatti: [] };
    }

    const question = playerText.toLowerCase();
    const questionAmbito = detectQuestionAmbito(question);


  const discoveredFacts = state.scoperte?.fatti || [];

// ⛔ NON usarla nel filtro adesso

const matchingFacts = factsData.fatti.filter(fatto =>
  Array.isArray(fatto.trigger) &&
  fatto.trigger.some(trigger =>
    question.includes(trigger.toLowerCase()))
);

    
    // 🗣️ risposta di Charles
    const reply =
      matchingFacts.length > 0
        ? matchingFacts.map(f => `- ${f.testo}`).join("\n")
        : "Mi dispiace, ma su questo non dispongo di fatti accertati.";

    return res.status(200).json({
  reply,
  usedFacts: matchingFacts.map(f => f.id),
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
