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
      phaseName: "DECISION_PROBE"
    }
  }
};

const currentStep = {
  phaseName: "DECISION_PROBE",
  payload: {
    familyKey: "decision_making"
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
        questionAlignment: 62,
        ownership: 55,
        evidence: 52,
        specificity: 50,
        structure: 42,
        reflection: 30
      },
      detectedSignals: {
        tradeoffMarkers: 0
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