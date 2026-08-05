import assert from "assert";
import { verifyPrivateBetaUserJourney } from "../src/app/verifyPrivateBetaUserJourney.js";

function completedResult() {
  return {
    fringeInterviewMVPSession: {
      betaSession: { sessionId: "beta-e2e-001", status: "completed" },
      interviewRuntime: { runtimeState: { isCompleted: true, answers: [{}, {}, {}] } },
      finalCandidateReport: { finalTakeaway: { message: "Ready" } },
      betaUserJourney: {
        status: "completed",
        completed: true,
        reportAvailable: true,
        answersRecorded: 3,
        stages: {
          started: true,
          interviewCompleted: true,
          reportBuilt: true,
          sessionClosed: true
        },
        blockers: []
      }
    }
  };
}

const calls = [];
const passed = await verifyPrivateBetaUserJourney({
  sessionInput: { cvText: "CV", jdText: "JD" },
  sessionRunner: async (input) => {
    calls.push(input);
    return completedResult();
  }
});

assert.equal(calls.length, 1);
assert.deepEqual(calls[0], { cvText: "CV", jdText: "JD" });
assert.deepEqual(passed, {
  status: "passed",
  journeyStatus: "completed",
  sessionId: "beta-e2e-001",
  answersRecorded: 3,
  reportAvailable: true,
  stages: {
    started: true,
    interviewCompleted: true,
    reportBuilt: true,
    sessionClosed: true
  }
});
assert.equal(Object.isFrozen(passed), true);
assert.equal(Object.isFrozen(passed.stages), true);

await assert.rejects(
  () => verifyPrivateBetaUserJourney({
    sessionInput: { cvText: "CV", jdText: "JD" },
    sessionRunner: async () => ({
      fringeInterviewMVPSession: {
        betaSession: { status: "in_progress" },
        interviewRuntime: { runtimeState: { isCompleted: false, answers: [] } },
        finalCandidateReport: {},
        betaUserJourney: {
          status: "in_progress",
          completed: false,
          reportAvailable: false,
          blockers: [{ code: "INTERVIEW_NOT_COMPLETED" }]
        }
      }
    })
  }),
  /PRIVATE_BETA_E2E_JOURNEY_INCOMPLETE: INTERVIEW_NOT_COMPLETED/
);

await assert.rejects(
  () => verifyPrivateBetaUserJourney({
    sessionInput: { cvText: "CV", jdText: "JD" },
    sessionRunner: async () => ({ fringeInterviewMVPSession: {} })
  }),
  /PRIVATE_BETA_E2E_JOURNEY_ASSESSMENT_MISSING/
);

console.log("Private Beta user journey verification tests PASSED");
