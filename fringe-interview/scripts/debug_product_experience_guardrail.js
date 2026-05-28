import { createInterviewRuntime } from "../src/interview/createInterviewRuntime.js";

const interviewSession = {
  summary: {},
  openingBlock: { prompt: "Apertura" },
  coreQuestionBlocks: [],
  closingBlock: { prompt: "Chiusura" },
  followupBlocks: []
};

const { interviewRuntime } = createInterviewRuntime({
  interviewSession,
  productMode: "free",
  interviewDepth: "deep",
  interviewStyle: "pressure_interviewer",
  interviewIntent: "stress_test"
});

console.log(JSON.stringify({
  requested: {
    productMode: "free",
    interviewDepth: "deep",
    interviewStyle: "pressure_interviewer",
    interviewIntent: "stress_test"
  },
  resolved: {
    productMode: interviewRuntime.meta.productMode,
    interviewDepth: interviewRuntime.meta.interviewDepth,
    interviewStyle: interviewRuntime.meta.interviewStyle,
    interviewIntent: interviewRuntime.meta.interviewIntent
  }
}, null, 2));