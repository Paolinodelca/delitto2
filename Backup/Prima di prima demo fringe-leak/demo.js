// demo.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { judgeGame } from "./judge/judge.js";

// utilità per __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// carichiamo truth.json a mano
const worldTruthPath = path.join(__dirname, "data/world/truth.json");
const worldTruthRaw = fs.readFileSync(worldTruthPath, "utf-8");
const worldTruthData = JSON.parse(worldTruthRaw);

// WORLD FINTA ma coerente (wrapper minimo)


const world = {
  getFactById(id) {
    return worldTruthData[id] || null;
  }
};




// STATE MINIMO
const state = {
  accusation: {

    accused: 'riccardo_brambilla',
motive: 'gelosia',
method: 'avvelenamento',
time: '21_00'


  }
};

console.log("=== DEMO ACCUSA ===");
console.log(state.accusation);

// JUDGE
const verdict = judgeGame({ world, state });

console.log("\n=== VERDETTO ===");
console.log(verdict);
