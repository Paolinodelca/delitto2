import assert from "assert";
import {
  buildBetaRuntimeResumeState,
  completeBetaRuntimeSession,
  createBetaRuntimeSession,
  interruptBetaRuntimeSession,
  resumeBetaRuntimeSession,
  syncBetaRuntimeProgress
} from "../src/app/betaRuntimeSessionIntegration.js";
import { validateBetaSession } from "../src/session/index.js";

let tick = 0;
const now = () => new Date(Date.parse("2026-07-22T10:00:00.000Z") + tick++ * 60000).toISOString();
const runtime = (phase, completed = false) => ({
  currentStep: completed ? null : { phaseName: phase, stepType: "core_question" },
  runtimeState: { isCompleted: completed, answers: [] }
});
const ids = (() => { let i=0; return () => `integration-${++i}`; })();
const created = createBetaRuntimeSession({
  testerId: "tester_runtime", inputRefs: [{type:"candidate_input",id:"cv"}],
  runtime: runtime("OPENING"), now, idFactory: ids,
  tokenFactory: () => "runtime-integration-token-12345678901234567890"
});
assert.equal(created.session.status, "in_progress");
assert.equal(created.session.interview.status, "in_progress");
assert.equal(created.session.revision, 3);
assert.ok(created.session.interview.runtimeRef);
assert.ok(!JSON.stringify(created.session).includes(created.resumeToken));

const progressed = syncBetaRuntimeProgress(created.session, { runtime: runtime("CASE_1"), now });
assert.equal(progressed.currentStep, "CASE_1");
assert.equal(progressed.revision, 4);
assert.deepEqual(created.session.currentStep, "OPENING");

const interrupted = interruptBetaRuntimeSession(progressed, { runtime: runtime("DECISION_PROBE"), now });
assert.equal(interrupted.status, "interrupted");
assert.ok(interrupted.lifecycle.interruptedAt);
const identity = interrupted.sessionId;
const interruptedRevision = interrupted.revision;
const resumed = resumeBetaRuntimeSession(interrupted, { runtime: runtime("DECISION_PROBE"), now });
assert.equal(resumed.sessionId, identity);
assert.equal(resumed.status, "in_progress");
assert.equal(resumed.lifecycle.interruptedAt, null);
assert.equal(resumed.revision, interruptedRevision + 2);

assert.throws(() => completeBetaRuntimeSession(resumed, {
  runtime: runtime("CLOSING", false), resultRef: {type:"final_candidate_report",id:"r1"}, now
}), /must be completed/);
const completed = completeBetaRuntimeSession(resumed, {
  runtime: runtime("CLOSING", true), resultRef: {type:"final_candidate_report",id:"r1"}, now
});
assert.equal(completed.status, "completed");
assert.equal(completed.interview.status, "completed");
assert.equal(completed.currentStep, "interview_completed");
assert.deepEqual(completed.resultRef, {type:"final_candidate_report",id:"r1"});
assert.ok(completed.lifecycle.completedAt);
assert.ok(validateBetaSession(completed).valid);
const resumeState = buildBetaRuntimeResumeState(completed);
assert.equal(resumeState.canResume, false);
assert.ok(!("resumeTokenHash" in resumeState));
console.log("test_beta_runtime_session_integration PASS");
