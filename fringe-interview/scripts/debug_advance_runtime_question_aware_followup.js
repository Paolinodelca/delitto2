import { readFileSync } from "fs";
import { advanceInterviewRuntime } from "../src/interview/advanceInterviewRuntime.js";

const followupConfig = JSON.parse(
  readFileSync(new URL("../config/followup_packs.it.json", import.meta.url), "utf8")
);

const questionText =
  "Puoi raccontarmi il tuo percorso e spiegare perché questo ruolo ti sembra il passo successivo naturale?";

const answerText =
  "Ti faccio un esempio concreto: in un’attività di reporting che si è complicata più del previsto ho dovuto ricostruire i dati, ridefinire alcune metriche e chiarire con gli stakeholder cosa servisse davvero.";

const interviewSession = {
  openingBlock: {},
  closingBlock: {},
  coreQuestionBlocks: [
    {
      question: questionText,
      prompt: questionText,
      questionKey: "role_fit",
      familyKey: "transferability",
      familyLabel: "Role fit",
      narrativeRole: "role_fit",
      expectedSignals: [
        "role fit",
        "transition logic",
        "motivation",
        "relevant experience"
      ]
    }
  ]
};

const interviewRuntime = {
  sessionFollowupBlocks: Object.values(followupConfig.packs),
  adaptiveFollowupBlocks: [],
  currentStep: {
    stepType: "core_question",
    label: "Domanda role fit",
    phaseName: "ROLE_CONTEXT",
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
        label: "Domanda role fit",
        phaseName: "ROLE_CONTEXT",
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
      phaseName: "ROLE_CONTEXT",
      targetSignals: [
        "role fit",
        "transition logic",
        "motivation",
        "relevant experience"
      ],
      coverage: {},
      deviationFlags: []
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