import assert from "assert";
import { readFile } from "fs/promises";
import { runPrivateBetaUiJourneyEntryPoint } from "../src/app/privateBetaUiJourneyEntryPoint.js";
import { runFringeInterviewMVP } from "../src/app/runFringeInterviewMVP.js";

const cvText = await readFile("fixtures/sample_cv_01.txt", "utf8");
const jdText = await readFile("fixtures/sample_jd_01.txt", "utf8");
const expected = {
  candidateProfile: JSON.parse(await readFile("fixtures/expected_candidate_profile_01.json", "utf8")),
  roleProfile: JSON.parse(await readFile("fixtures/expected_role_profile_01.json", "utf8")),
  jobFitAnalysis: JSON.parse(await readFile("fixtures/expected_job_fit_analysis_01.json", "utf8"))
};
const parserAdapter = async ({ task }) => {
  if (expected[task]) return JSON.stringify(expected[task]);
  return "Quale esempio concreto rende visibile il tuo contributo?";
};

// The real runtime already owns a question before any answer is supplied.
const prepared = await runFringeInterviewMVP({ cvText, jdText, modelAdapter: parserAdapter, interviewLengthMode: "short" });
const currentStep = prepared.fringeInterviewMVP.interviewRuntime.currentStep;
assert.ok(currentStep, "runtime must expose a current step before answers");
assert.ok(currentStep.payload, "runtime current step must carry its canonical payload");

// ME-01B UI adapter currently forwards a pre-baked answer list into the batch session runner.
let receivedAnswers = null;
await runPrivateBetaUiJourneyEntryPoint({
  uiInput: { identityAction:"create", workingMode:"independent", consentDecision:"accept", cvText:"CV", jdText:"JD", answers:"A1\n\nA2", feedbackAction:"skip" },
  modelAdapter: parserAdapter,
  sessionRunner: async (input) => {
    receivedAnswers = input.answers;
    return { fringeInterviewMVPSession: {
      betaSession: { status:"completed", sessionId: input.betaSession.sessionId },
      interviewRuntime: { runtimeState: { isCompleted:true, answers:[{answerText:"A1"},{answerText:"A2"}] } },
      finalCandidateReport: {}, professionalPerceptionReport: {},
      betaUserJourney: { status:"completed", completed:true, reportAvailable:true, answersRecorded:2, stages:{started:true,interviewCompleted:true,reportBuilt:true,sessionClosed:true}, blockers:[] }
    }};
  },
  now: (()=>{let n=0; return ()=>new Date(Date.parse("2026-08-14T12:00:00Z")+n++*1000).toISOString();})(),
  betaSessionIdFactory: ()=>"me01c-batch",
  betaSessionTokenFactory: ()=>"me01c-resume-token-12345678901234567890"
});
assert.deepEqual(receivedAnswers, ["A1","A2"]);

// Server/test-only diagnostics identify the provider task/failure kind without content or secrets.
const diagnostics=[];
const failed = await runPrivateBetaUiJourneyEntryPoint({
  uiInput: { identityAction:"create", workingMode:"independent", consentDecision:"accept", cvText:"PRIVATE CV", jdText:"PRIVATE JD", answers:"PRIVATE ANSWER", feedbackAction:"skip" },
  modelAdapter: async ({task}) => { throw new Error(`fetch failed for ${task}: PRIVATE CV PRIVATE ANSWER secret-value`); },
  technicalDiagnosticSink: d => diagnostics.push(d),
  now: (()=>{let n=0; return ()=>new Date(Date.parse("2026-08-14T13:00:00Z")+n++*1000).toISOString();})(),
  betaSessionIdFactory: ()=>"me01c-diagnostic",
  betaSessionTokenFactory: ()=>"me01c-resume-token-12345678901234567890"
});
assert.equal(failed.error.code, "SERVICE_UNAVAILABLE");
assert.equal(diagnostics.length, 1);
assert.deepEqual(Object.keys(diagnostics[0]).sort(), ["boundary","failureKind","task"]);
assert.equal(diagnostics[0].failureKind, "provider_network");
assert.equal(JSON.stringify(diagnostics).includes("PRIVATE CV"), false);
assert.equal(JSON.stringify(diagnostics).includes("PRIVATE ANSWER"), false);
assert.equal(JSON.stringify(diagnostics).includes("secret-value"), false);

console.log("ME-01C Live UI Journey Diagnostic tests PASSED");
