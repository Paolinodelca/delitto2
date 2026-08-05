import assert from "assert";
import { assessBetaUserJourney } from "../src/app/assessBetaUserJourney.js";

function buildSession({ betaStatus, runtimeCompleted, report = true, answers = 2 }) {
  return {
    fringeInterviewMVPSession: {
      betaSession: { status: betaStatus },
      interviewRuntime: {
        runtimeState: {
          isCompleted: runtimeCompleted,
          answers: Array.from({ length: answers }, (_, index) => ({ index }))
        }
      },
      finalCandidateReport: report ? { finalTakeaway: { message: "Ready" } } : null
    }
  };
}

const completed = assessBetaUserJourney(buildSession({
  betaStatus: "completed",
  runtimeCompleted: true
}));
assert.equal(completed.status, "completed");
assert.equal(completed.completed, true);
assert.equal(completed.reportAvailable, true);
assert.deepEqual(completed.blockers, []);
assert.equal(completed.answersRecorded, 2);

const partial = assessBetaUserJourney(buildSession({
  betaStatus: "in_progress",
  runtimeCompleted: false
}));
assert.equal(partial.status, "in_progress");
assert.equal(partial.completed, false);
assert.equal(partial.reportAvailable, false);
assert.deepEqual(partial.blockers.map((item) => item.code), [
  "INTERVIEW_NOT_COMPLETED",
  "BETA_SESSION_NOT_CLOSED"
]);

const blocked = assessBetaUserJourney({});
assert.equal(blocked.status, "blocked");
assert.equal(blocked.completed, false);
assert.deepEqual(blocked.blockers.map((item) => item.code), [
  "BETA_SESSION_NOT_STARTED",
  "INTERVIEW_NOT_COMPLETED",
  "FINAL_REPORT_NOT_BUILT",
  "BETA_SESSION_NOT_CLOSED"
]);

assert.equal(Object.isFrozen(completed), true);
assert.equal(Object.isFrozen(completed.stages), true);
assert.equal(Object.isFrozen(completed.blockers), true);

console.log("Beta user journey assessment tests PASSED");
