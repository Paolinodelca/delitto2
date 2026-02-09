// demo/demoFringeLeak.js

import readline from "readline";
import Engine from "../engine/engine_OLD.js";
import { judgeGame } from "../judge/judge.js";
import { profileOutcome } from "../outcomes/outcomeProfiler.js";
import { narrateVerdict } from "../narrator/narrator_OLD.js";

const engine = new Engine(process.cwd());



function askQuestion(rl, text) {
  return new Promise(resolve => {
    rl.question(text + "\n", answer => resolve(answer.trim()));
  });
}

export async function runFringeLeakSession({ scriptedAnswers = null } = {}) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let answerIndex = 0;
  const getAnswer = async (question) => {
    if (scriptedAnswers) {
      const a = scriptedAnswers[answerIndex++] ?? "";
      console.log(question);
      console.log(a);
      return a;
    }
    return askQuestion(rl, question);
  };

  console.log("\n=== FRINGE / LEAK — DEMO ===\n");

  console.log("Contesto:");
  console.log("Una scoperta tacita è emersa a Heliox.");
  console.log("Un preprint esterno suggerisce una fuga di conoscenza.");
  console.log("Tu sei Alex Riva.\n");

  // INTERROGAZIONE 1 (solo input, nessuna mutazione core)
  console.log("[INTERROGAZIONE 1]");
  await getAnswer(
    "Jonas Becker: «Hai mai discusso informalmente del fenomeno fuori dal laboratorio?»"
  );

  // IPOTESI DEL GIOCATORE → registrata come azione
  engine.applyAction((world, engineInstance) => {
    world.registerFact({
      id: "hyp_player_independent_convergence",
      type: "player_hypothesis",
      claim: "independent_convergence_not_leak"
    });
  });

  // INTERROGAZIONE 2
  console.log("\n[INTERROGAZIONE 2]");
  await getAnswer(
    "Jonas Becker: «Quindi stai dicendo che *non potevano* sapere davvero?»"
  );

  console.log("\n=== VERDETTO ===\n");

 
const verdict = judgeGame({
  world: engine.world,
  state: engine.state
});



  const outcome = profileOutcome(verdict);
  const narration = narrateVerdict({ verdict, outcome });

  rl.close();

  return {
    narrator: narration.narrator,
    tutor: narration.tutor,
    judge: verdict
  };
}

// esecuzione diretta
if (process.argv[1].includes("demoFringeLeak.js")) {
  runFringeLeakSession().then(result => {
    console.log("\n--- NARRATORE ---");
    console.log(result.narrator);

    console.log("\n--- TUTOR ---");
    console.log(result.tutor);

    console.log("\n--- GIUDICE ---");
    console.log(result.judge);
  });
}
