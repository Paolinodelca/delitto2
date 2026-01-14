import fs from "fs";
import path from "path";

const basePath = path.join(process.cwd(), "data", "game");
const factsPath = path.join(basePath, "facts.json");

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Metodo non consentito" });
    }

    const playerText =
      req.body.playerText ||
      req.body.message ||
      req.body.text ||
      "";

    let factsData = { fatti: [] };
    try {
      factsData = JSON.parse(fs.readFileSync(factsPath, "utf-8"));
    } catch {}

    const question = playerText.toLowerCase();

    const matchingFacts = factsData.fatti.filter(f =>
      Array.isArray(f.trigger) &&
      f.trigger.some(t => question.includes(t))
    );

    const reply =
      matchingFacts.length > 0
        ? matchingFacts.map(f => `- ${f.testo}`).join("\n")
        : "Mi dispiace, ma su questo non dispongo di fatti accertati.";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("CHARLES ERROR:", error);
    return res.status(500).json({
      error: "Errore server",
      details: error.message
    });
  }
}
