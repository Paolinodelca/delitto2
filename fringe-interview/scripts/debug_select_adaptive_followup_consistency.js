import { readFileSync } from "fs";
import { selectAdaptiveFollowup } from "../src/interview/selectAdaptiveFollowup.js";

const followupConfig = JSON.parse(
  readFileSync(new URL("../config/followup_packs.it.json", import.meta.url), "utf8")
);

const interviewRuntime = {
  sessionFollowupBlocks: Object.values(followupConfig.packs),
  runtimeState: {
    usedAdaptiveTriggerTypes: [],
    interviewState: {
      phaseName: "CASE_1"
    }
  }
};

const currentStep = {
  phaseName: "CASE_1",
  payload: {
    familyKey: "analytical_depth"
  }
};

const answerRecord = {
  answerAnalysis: {
    answerShapeAnalysis: {
      overallBand: "weak",
      problematicAnswerType: "none",
      questionContext: {
        offTopicRisk: "low"
      },
      dimensionScores: {
        questionAlignment: 26,
        ownership: 52,
        evidence: 60,
        specificity: 55,
        structure: 45,
        reflection: 40
      }
    }
  }
};

const selected = selectAdaptiveFollowup({
  interviewRuntime,
  currentStep,
  answerRecord
});

console.log(JSON.stringify({
  selectedTriggerType: selected?.triggerType,
  selectedLabel: selected?.label,
  selectedGoal: selected?.goal,
  firstFollowup: selected?.followups?.[0]
}, null, 2));