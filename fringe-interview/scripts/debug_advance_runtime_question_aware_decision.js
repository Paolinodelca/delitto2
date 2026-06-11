import { readFileSync } from "fs";
import { advanceInterviewRuntime } from "../src/interview/advanceInterviewRuntime.js";

const followupConfig = JSON.parse(
  readFileSync(new URL("../config/followup_packs.it.json", import.meta.url), "utf8")
);

const questionText =
  "Parlami di una decisione in cui non c’era una risposta chiaramente giusta. Quale trade-off hai scelto e perché?";

const answerText =
  "In una fase di rollout operativo ho dovuto decidere come gestire alcune priorità tra team diversi. Ho scelto di procedere con un approccio più prudente, cercando di mantenere allineate le persone coinvolte e ridurre il rischio di errori.";

const interviewSession = {
  openingBlock: {},
  closingBlock: {},
  coreQuestionBlocks: [
    {
      question: questionText,
      prompt: questionText,
      questionKey: "decision_tradeoff",
      familyKey: "decision_making",
      familyLabel: "Decision making",
      narrativeRole: "decision",
      expectedSignals: [
        "decision",
        "tradeoff",
        "criterion",
        "impact",
        "ownership"
      ]
    }
  ]
};

const interviewRuntime = {
  sessionFollowupBlocks: Object.values(followupConfig.packs),
  meta: {
  interviewStyle: "supportive_coach"
    },
  adaptiveFollowupBlocks: [],
  currentStep: {
    stepType: "core_question",
    label: "Domanda decisione",
    phaseName: "DECISION_PROBE",
    blockIndex: 0,
    payload: interviewSession.coreQuestionBlocks[0]
  },
  runtimeState: {
    currentStepIndex: 0,
    isCompleted: false,
    answers: [],
    adaptiveFollowupBudget: 2,
    injectedAdaptiveFollowupCount: 0,
    usedAdaptiveTriggerTypes: [],
    usedAdaptiveFollowupFocuses: [],
    timeline: [
      {
        stepType: "core_question",
        label: "Domanda decisione",
        phaseName: "DECISION_PROBE",
        blockIndex: 0
      },
      {
        stepType: "closing",
        label: "Chiusura",
        phaseName: "CLOSING",
        blockIndex: 0
      }
    ],
    interviewState: {
      context: {
      interviewStyle: "supportive_coach"
      },
      phaseName: "DECISION_PROBE",
      targetSignals: [
        "decision",
        "tradeoff",
        "criterion",
        "impact",
        "ownership"
      ],
      coverage: {},
      deviationFlags: [],
      
      
      phaseLedger: {
    DECISION_PROBE: {
    attempts: 0,
    status: "active",
    notes: []
  }
},


      evaluationFocus: {}
    }
  }
};

const result = await advanceInterviewRuntime({
  interviewSession,
  interviewRuntime,
  answerText,
  modelAdapter: null
});

const runtime = result.interviewRuntime;

console.log(JSON.stringify({
  currentStepIndex: runtime.runtimeState.currentStepIndex,
  currentStepType: runtime.currentStep?.stepType,
  currentStepLabel: runtime.currentStep?.label,
  currentStepPhase: runtime.currentStep?.phaseName,
  currentQuestion: runtime.currentStep?.payload?.question,
  currentPrompt: runtime.currentStep?.payload?.prompt,
  injectedAdaptiveFollowupCount: runtime.runtimeState.injectedAdaptiveFollowupCount,
  usedAdaptiveTriggerTypes: runtime.runtimeState.usedAdaptiveTriggerTypes,
  adaptiveFollowupBlocks: runtime.adaptiveFollowupBlocks?.map((block) => ({
    triggerType: block.triggerType,
    label: block.label,
    sourceQuestionText: block.sourceQuestionText,
    firstFollowup: block.followups?.[0]
  })),
  timeline: runtime.runtimeState.timeline
}, null, 2));