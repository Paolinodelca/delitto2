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

for (const productMode of ["free", "pro", "premium"]) {
  const { interviewRuntime } = createInterviewRuntime({
    interviewSession,
    productMode
  });

  console.log(JSON.stringify({
    productMode,
    summaryProductMode: interviewRuntime.sessionSummary.productMode,
    metaProductMode: interviewRuntime.meta.productMode,
    depth: interviewRuntime.meta.interviewDepth,
    style: interviewRuntime.meta.interviewStyle,
    intent: interviewRuntime.meta.interviewIntent,
    showRecruiterPanel:
      interviewRuntime.meta.productCapabilities?.showRecruiterPanel,
    showPremiumRewriteWorkspace:
      interviewRuntime.meta.productCapabilities?.showPremiumRewriteWorkspace,
    contextCapabilities:
      interviewRuntime.runtimeState.interviewState.context.productCapabilities
  }, null, 2));
}


