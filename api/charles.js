import fs from "fs";
import path from "path";

// 📁 percorsi
const basePath = path.join(process.cwd(), "data", "game");
const factsPath = path.join(basePath, "facts.json");
const scenarioPath = path.join(basePath, "scenario.json");

// 🔍 riconoscimento molto semplice del tipo di domanda
function detectQuestionType(text) {
  if (text.includes("chi è")) return "identità";
  if (text.includes("che lavoro")) return "attributo";
  if (text.includes("con chi")) return "relazione";
  if (text.includes("dove") || text.includes("quando")) return "contesto";
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

   // const state = req.body.gameState || {};
    const state = req.body.gameState || {};

  if (!state.scoperte) {
  state.scoperte = { fatti: [] };
  }
  if (!Array.isArray(state.scoperte.fatti)) {
  state.scoperte.fatti = [];
  }


    // 📖 scenario (qui non lo usiamo ancora, ma lo teniamo)
    let scenarioText = "{}";
    try {
      scenarioText = fs.readFileSync(scenarioPath, "utf-8");
    } catch {}

    // 📚 fatti
    let factsData = { fatti: [] };
    try {
      factsData = JSON.parse(fs.readFileSync(factsPath, "utf-8"));
    } catch {}

    const question = playerText.toLowerCase();
    const questionType = detectQuestionType(question);

    // 🎯 FILTRO CORRETTO (QUESTO È IL matchingFacts “giusto”)
   const matchingFacts = factsData.fatti.filter(fatto =>
  state.scoperte.fatti.includes(fatto.id) &&
  fatto.tipo === questionType &&
  Array.isArray(fatto.trigger) &&
  fatto.trigger.some(trigger =>
    question.includes(trigger.toLowerCase()))
  );


    // 🗣️ risposta di Charles
    const replyText =
      matchingFacts.length > 0
        ? matchingFacts.map(f => `- ${f.testo}`).join("\n")
        : "Mi dispiace, ma su questo non dispongo di fatti accertati.";

    return res.status(200).json({
      reply: replyText,
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
