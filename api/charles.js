import fs from "fs";
import path from "path";

// 📁 percorsi dati
const basePath = path.join(process.cwd(), "data", "game");
const factsPath = path.join(basePath, "facts.json");

// 🧠 riconoscimento semplice del tipo di domanda
function detectQuestionAmbito(text) {
  if (text.includes("chi è") || text.includes("di chi")) return "identità";
  if (text.includes("lavoro") || text.includes("fa")) return "lavoro";
  if (text.includes("con chi") || text.includes("parlato")) return "relazione";
  if (text.includes("dove") || text.includes("quando") || text.includes("visto")) return "contesto";
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

    // 📚 carica fatti
    let factsData = { fatti: [] };
    try {
      factsData = JSON.parse(fs.readFileSync(factsPath, "utf-8"));
    } catch {
      factsData = { fatti: [] };
    }

    const question = playerText.toLowerCase();
    const questionAmbito = detectQuestionAmbito(question);

    // 🎯 filtro corretto: trigger + ambito
    const matchingFacts = factsData.fatti.filter(fatto =>
      fatto.ambito === questionAmbito &&
      Array.isArray(fatto.trigger) &&
      fatto.trigger.some(trigger =>
        question.includes(trigger.toLowerCase())
      )
    );

    // 🗣️ risposta di Charles
    const reply =
      matchingFacts.length > 0
        ? matchingFacts.map(f => `- ${f.testo}`).join("\n")
        : "Mi dispiace, ma su questo non dispongo di fatti accertati.";

    return res.status(200).json({
      reply,
      gameState: req.body.gameState || {}
    });

  } catch (error) {
    console.error("CHARLES ERROR:", error);
    return res.status(500).json({
      error: "Errore server",
      details: error.message
    });
  }
}
