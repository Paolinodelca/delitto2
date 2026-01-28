import path from "path";
import { fileURLToPath } from "url";

import { World } from "./engine/world.js";
import { judgeAccusation } from "./judge/judge.js";
import { narrateVerdict } from "./narrator/narrator.js";

// serve per ottenere il path corretto
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. carichiamo il mondo
const world = new World(__dirname);

// 2. accusa di test (SBAGLIATA di proposito)
const accusation = {
  accused: "dario_rossi",
  motive: "gelosia",
  method: "avvelenamento",
  time: "21_00"
};

// 3. il Judge valuta
const verdict = judgeAccusation(world, accusation);

// 4. il Narratore reagisce
const narration = narrateVerdict({
  verdict,
  role: "narratore"
});

// 5. output
console.log("=== VERDETTO ===");
console.log(verdict);

console.log("\n=== NARRAZIONE ===");
console.log(narration);
