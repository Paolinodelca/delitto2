import { readFileSync } from "fs";
import { injectAdaptiveFollowup } from "../src/interview/injectAdaptiveFollowup.js";

const followupConfig = JSON.parse(
  readFileSync(new URL("../config/followup_packs.it.json", import.meta.url), "utf8")
);

const consistencyPack = {
  ...followupConfig.packs.consistency_probe,
  sourceQuestionText:
    "Puoi raccontarmi il tuo percorso e spiegare perché questo ruolo ti sembra il passo successivo naturale?",
  sourceAnswerText:
    "Ti faccio un esempio concreto: in un’attività di reporting..."
};

const interviewRuntime = {
  adaptiveFollowupBlocks: [],
  runtimeState: {
    currentStepIndex: 0,
    timeline: [
      {
        stepType: "core_question",
        phaseName: "ROLE_CONTEXT",
        label: "Domanda role fit"
      }
    ],
    usedAdaptiveTriggerTypes: [],
    interviewState: {
      phaseName: "ROLE_CONTEXT"
    }
  }
};

const updated = injectAdaptiveFollowup({
  interviewRuntime,
  followupPack: consistencyPack
});

console.log(JSON.stringify({
  adaptiveFollowupBlocks: updated.adaptiveFollowupBlocks,
  timeline: updated.runtimeState.timeline
}, null, 2));