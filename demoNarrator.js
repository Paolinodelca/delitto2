import { judgeGame } from "./judge/judge.js";
import { narrateVerdict } from "./narrator/narrator_OLD.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { profileOutcome } from "./outcomes/outcomeProfiler.js";
import { createHypothesis } from "./hypotheses/hypotheses.js";
import { connectFacts } from "./engine/actions/connectFacts.js";
import { applyHypothesisEffects } from "./engine/actions/applyHypothesisEffects.js";
import { interrogateAgent } from "./engine/actions/interrogateAgent.js";
import { resolveInterrogationEffects } from "./engine/interactionResolver.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== WORLD =====
const truth = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "./data/world/truth.json"),
    "utf-8"
  )
);

const world = {
  getFactById(id) {
    if (!(id in truth)) return null;
    return { id, value: truth[id] };
  }
};

// ===== KNOWLEDGE (mock da demo) =====
const knowledge = {
  getKnowledgeOf(actor) {
    return [
      { content: "fact_time_22" },
      { content: "fact_riccardo_present" }
    ];
  }
};

// ===== STATE =====
const state = {
  hypotheses: [],
  accusation: {
    accused: "dario_rossi",
    motive: "gelosia",
    method: "avvelenamento",
    time: "21_00"
  },
  agentDisposition: {
    riccardo_brambilla: {
      attitude: "neutro",
      suspicionLevel: 0.3
    },
    dario_rossi: {
      attitude: "neutro",
      suspicionLevel: 0.1
    }
  }
};


// ===== HYPOTHESIS =====
const h1 = createHypothesis({
  by: "player",
  basedOn: ["fact_time_22", "fact_riccardo_present"],
  claim: "riccardo_possible_killer"
});

connectFacts({ knowledge, state }, h1);

// reazioni degli agenti alle ipotesi
applyHypothesisEffects({ state });
console.log("\n=== INTERROGATORIO ===");
const riccardoAgent = {
  id: "riccardo_brambilla",
  name: "Riccardo Brambilla",
  disposition: state.agentDisposition["riccardo_brambilla"],
  knowledge: knowledge.getKnowledgeOf("riccardo_brambilla").map(k => k.content)
};


console.log("\n=== INTERROGATORIO ===");

const interrogationResult = interrogateAgent({
  agent: riccardoAgent,
  prompt: "Puoi raccontarmi cosa ricordi della sera dell'omicidio?",
  state
});

console.log(interrogationResult);

resolveInterrogationEffects({
  state,
  interrogationResult
});




console.log(interrogationResult);

console.log("STATE FINALE:", JSON.stringify(state, null, 2));


// ===== JUDGE =====
console.log("\n=== GIUDIZIO ===");
const result = judgeGame({ world, state });
console.log(result);

// ===== OUTCOME =====
console.log("\n=== OUTCOME PROFILE ===");
const outcome = profileOutcome(result);
console.log(outcome);

// ===== NARRAZIONE =====
console.log("\n=== NARRATORE ===");
console.log(narrateVerdict({ result, outcome, role: "narratore" }));

console.log("\n=== GIUDICE ===");
console.log(narrateVerdict({ result, role: "giudice" }));

console.log("\n=== TUTOR ===");
console.log(narrateVerdict({ result, role: "tutor" }));

console.log("\n=== IPOTESI DEL GIOCATORE ===");
console.log(state.hypotheses);

console.log("\n=== DISPOSIZIONE AGENTI ===");
console.log(state.agentDisposition);


