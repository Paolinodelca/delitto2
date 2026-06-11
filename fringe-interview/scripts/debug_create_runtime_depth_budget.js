import { createInterviewRuntime } from "../src/interview/createInterviewRuntime.js";

const interviewSession = {
  summary: {},
  openingBlock: {
    prompt: "Apertura"
  },
  coreQuestionBlocks: [],
  closingBlock: {
    prompt: "Chiusura"
  },
  followupBlocks: []
};

for (const interviewDepth of ["quick", "standard", "deep"]) {
  const { interviewRuntime } = createInterviewRuntime({
    interviewSession,
    interviewDepth,
    interviewStyle: "structured_corporate",
    interviewIntent: "simulation"
  });

  console.log({
    interviewDepth,
    metaDepth: interviewRuntime.meta.interviewDepth,
    stateDepth: interviewRuntime.runtimeState.resolvedInterviewDepth,
    budget: interviewRuntime.runtimeState.adaptiveFollowupBudget
  });
}