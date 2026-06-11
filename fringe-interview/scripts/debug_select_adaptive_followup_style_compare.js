import { readFileSync } from "fs";
import { selectAdaptiveFollowup } from "../src/interview/selectAdaptiveFollowup.js";

const followupConfig = JSON.parse(
  readFileSync(new URL("../config/followup_packs.it.json", import.meta.url), "utf8")
);

function buildRuntime(interviewStyle) {
  return {
    sessionFollowupBlocks: Object.values(followupConfig.packs),
    meta: {
      interviewStyle
    },
    runtimeState: {
      usedAdaptiveTriggerTypes: [],
      interviewState: {
        phaseName: "CASE_1"
      }
    }
  };
}

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
        questionAlignment: 62,
        ownership: 42,
        evidence: 38,
        specificity: 50,
        structure: 48,
        reflection: 35
      }
    }
  }
};

for (const style of [
  "supportive_coach",
  "structured_corporate",
  "pressure_interviewer"
]) {
  const selected = selectAdaptiveFollowup({
    interviewRuntime: buildRuntime(style),
    currentStep,
    answerRecord
  });

  console.log(JSON.stringify({
    style,
    selectedTriggerType: selected?.triggerType,
    selectedLabel: selected?.label,
    selectedGoal: selected?.goal
  }, null, 2));
}