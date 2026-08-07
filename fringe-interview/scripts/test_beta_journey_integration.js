import assert from "assert";
import { runIntegratedPrivateBetaJourney } from "../src/app/privateBetaJourneyIntegration.js";
import { createInMemoryPrivateBetaOperationalSink } from "../src/app/privateBetaOperationalLogging.js";
import { createBetaSession } from "../src/session/index.js";
import { startBetaRuntimeSession } from "../src/app/betaRuntimeSessionIntegration.js";

function makeNow() {
  let tick = 0;
  return () => new Date(Date.parse("2026-08-07T08:00:00.000Z") + tick++ * 1000).toISOString();
}

function ids() {
  let n = 0;
  return () => `bi01-${++n}`;
}

const onboardingChoices = ["create", "independent", "prepare_interview"];
const feedbackResponses = {
  experience: { clarity: "clear", usefulness: "useful", reportCredibility: "credible" },
  valueAndDifficulty: { mostValuablePart: "professional_impression", difficulty: "none" },
  futureIntent: { reuse: "yes", recommend: "yes" }
};

function completedSessionResult(sessionId) {
  return {
    fringeInterviewMVPSession: {
      betaSession: {
        schemaVersion: "1.1",
        revision: 7,
        sessionId,
        testerId: "tester_stub",
        resumeTokenHash: "a".repeat(64),
        status: "completed",
        currentStep: "interview_completed",
        inputRefs: [],
        interview: { status: "completed", runtimeRef: { type: "interview_runtime", id: `${sessionId}_runtime` } },
        resultRef: { type: "final_candidate_report", id: `${sessionId}_final_candidate_report` },
        lifecycle: {
          createdAt: "2026-08-07T08:00:00.000Z",
          updatedAt: "2026-08-07T08:01:00.000Z",
          interruptedAt: null,
          completedAt: "2026-08-07T08:01:00.000Z"
        }
      },
      interviewRuntime: { runtimeState: { isCompleted: true, answers: [{ answer: "free professional presentation" }] } },
      finalCandidateReport: { finalTakeaway: { message: "Ready" } },
      professionalPerceptionReport: {
        overview: {
          operationalActionPlan: {
            globalPriorities: [
              { title: "Azione 1", action: "Rendi più concreto un risultato." },
              { title: "Azione 2", action: "Esplicita il contributo personale." },
              { title: "Azione 3", action: "Collega l'esperienza al ruolo." },
              { title: "Azione 4", action: "Non deve apparire nella prima vista." }
            ]
          }
        },
        professionalPerception: {
          perceptionV2: {
            whoEmerges: { narrative: "Emerge un profilo professionale leggibile." },
            credibilityAssets: { narrative: "Sono visibili asset di credibilità concreti." },
            targetDistance: { bridgeNarrative: "La distanza principale è nella dimostrazione dell'impatto." }
          }
        }
      },
      betaUserJourney: {
        status: "completed",
        completed: true,
        reportAvailable: true,
        answersRecorded: 1,
        stages: { started: true, interviewCompleted: true, reportBuilt: true, sessionClosed: true },
        blockers: []
      }
    }
  };
}

const preInterview = createBetaSession({
  now: () => "2026-08-07T07:59:00.000Z",
  idFactory: () => "pre-interview",
  tokenFactory: () => "bi01-pre-interview-token-12345678901234567890"
});
const startedRuntimeSession = startBetaRuntimeSession(preInterview.session, {
  runtime: { currentStep: { phaseName: "OPENING" }, runtimeState: { isCompleted: false, answers: [] } },
  inputRefs: [{ type: "candidate_input", id: "cv" }],
  now: () => "2026-08-07T08:00:00.000Z"
});
assert.equal(startedRuntimeSession.sessionId, preInterview.session.sessionId);
assert.equal(startedRuntimeSession.status, "in_progress");
assert.deepEqual(startedRuntimeSession.inputRefs, [{ type: "candidate_input", id: "cv" }]);

const sink = createInMemoryPrivateBetaOperationalSink();
let receivedInput = null;
const positive = await runIntegratedPrivateBetaJourney({
  onboardingChoices,
  consentDecision: "accept",
  materials: {
    cvText: "AUTHORIZED CV",
    targetRole: "Operations Manager",
    modelAdapter: async () => ({}),
    answers: ["Il mio percorso professionale..."]
  },
  feedbackAction: { type: "submit", responses: feedbackResponses, comment: "Esperienza utile." },
  operationalSink: sink,
  now: makeNow(),
  betaSessionIdFactory: ids(),
  betaSessionTokenFactory: () => "bi01-resume-token-123456789012345678901234",
  sessionRunner: async (input) => {
    receivedInput = input;
    assert.equal(input.betaSession.status, "created");
    assert.equal(input.betaSession.currentStep, "session_preparation");
    assert.deepEqual(input.betaSession.inputRefs, []);
    return completedSessionResult(input.betaSession.sessionId);
  }
});

assert.equal(positive.completed, true);
assert.equal(positive.status, "completed_with_gap");
assert.equal(positive.onboarding.completed, true);
assert.equal(positive.consent.status, "accepted");
assert.equal(receivedInput.cvText, "AUTHORIZED CV");
assert.equal(positive.interview.completed, true);
assert.equal(positive.interview.inputMode, "text");
assert.equal(positive.report.available, true);
assert.equal(positive.report.firstView.messages.length, 3);
assert.equal(positive.report.firstView.nextActions.length, 3);
assert.equal(positive.professionalIdentitySnapshot.status, "unavailable");
assert.equal(positive.professionalIdentitySnapshot.persisted, false);
assert.equal(positive.feedback.status, "submitted");
assert.equal(positive.feedback.comment, "Esperienza utile.");
assert.equal(positive.capabilityGaps.some((gap) => gap.code === "VOICE_SUBSYSTEM_UNAVAILABLE"), true);
assert.deepEqual(sink.getEvents().map((event) => event.eventType), ["session_started", "session_completed"]);
assert.equal(JSON.stringify(sink.getEvents()).includes("AUTHORIZED CV"), false);

let refusedReads = 0;
const refusedMaterials = {};
Object.defineProperty(refusedMaterials, "cvText", { enumerable: true, get() { refusedReads += 1; return "MUST NOT READ"; } });
const refused = await runIntegratedPrivateBetaJourney({
  onboardingChoices,
  consentDecision: "refuse",
  materials: refusedMaterials,
  now: makeNow(),
  betaSessionIdFactory: ids(),
  betaSessionTokenFactory: () => "bi01-refuse-token-12345678901234567890123"
});
assert.equal(refused.error.code, "CONSENT_REFUSED");
assert.equal(refusedReads, 0);
assert.equal(refused.betaSession.status, "interrupted");

let revokedReads = 0;
const revokedMaterials = {};
Object.defineProperty(revokedMaterials, "cvText", { enumerable: true, get() { revokedReads += 1; return "MUST NOT READ"; } });
const revoked = await runIntegratedPrivateBetaJourney({
  onboardingChoices,
  consentDecision: "accept",
  revokeConsentBeforeMaterials: true,
  materials: revokedMaterials,
  now: makeNow(),
  betaSessionIdFactory: ids(),
  betaSessionTokenFactory: () => "bi01-revoke-token-12345678901234567890123"
});
assert.equal(revoked.error.code, "CONSENT_REVOKED");
assert.equal(revokedReads, 0);

const interrupted = await runIntegratedPrivateBetaJourney({
  onboardingChoices,
  consentDecision: "accept",
  materials: { cvText: "CV", targetRole: "Role" },
  interruptionRequested: true,
  now: makeNow(),
  betaSessionIdFactory: ids(),
  betaSessionTokenFactory: () => "bi01-interrupt-token-12345678901234567890"
});
assert.equal(interrupted.status, "interrupted");
assert.equal(interrupted.betaSession.status, "interrupted");

const failed = await runIntegratedPrivateBetaJourney({
  onboardingChoices,
  consentDecision: "accept",
  materials: { cvText: "CV", targetRole: "Role", modelAdapter: async () => ({}) },
  now: makeNow(),
  betaSessionIdFactory: ids(),
  betaSessionTokenFactory: () => "bi01-failure-token-1234567890123456789012",
  sessionRunner: async () => { throw new Error("provider unavailable 503 /private/stack.js secret"); }
});
assert.equal(failed.completed, false);
assert.equal(failed.error.code, "SERVICE_UNAVAILABLE");
assert.equal(JSON.stringify(failed).includes("/private/stack.js"), false);
assert.equal(JSON.stringify(failed).includes("secret"), false);

const skipped = await runIntegratedPrivateBetaJourney({
  onboardingChoices,
  consentDecision: "accept",
  materials: { cvText: "CV", targetRole: "Role", modelAdapter: async () => ({}) },
  feedbackAction: { type: "skip" },
  now: makeNow(),
  betaSessionIdFactory: ids(),
  betaSessionTokenFactory: () => "bi01-skip-token-123456789012345678901234",
  sessionRunner: async (input) => completedSessionResult(input.betaSession.sessionId)
});
assert.equal(skipped.completed, true);
assert.equal(skipped.feedback.status, "skipped");

const noFeedback = await runIntegratedPrivateBetaJourney({
  onboardingChoices,
  consentDecision: "accept",
  materials: { cvText: "CV", targetRole: "Role", modelAdapter: async () => ({}) },
  now: makeNow(),
  betaSessionIdFactory: ids(),
  betaSessionTokenFactory: () => "bi01-no-feedback-token-12345678901234567890",
  sessionRunner: async (input) => completedSessionResult(input.betaSession.sessionId)
});
assert.equal(noFeedback.completed, true);
assert.equal(noFeedback.feedback.status, "not_started");

const sinkFailure = await runIntegratedPrivateBetaJourney({
  onboardingChoices,
  consentDecision: "accept",
  materials: { cvText: "CV", targetRole: "Role", modelAdapter: async () => ({}) },
  feedbackAction: { type: "skip" },
  operationalSink: async () => { throw new Error("sink failed"); },
  now: makeNow(),
  betaSessionIdFactory: ids(),
  betaSessionTokenFactory: () => "bi01-sink-token-123456789012345678901234",
  sessionRunner: async (input) => completedSessionResult(input.betaSession.sessionId)
});
assert.equal(sinkFailure.completed, true);

const identity = Object.freeze({ id: "pi-001", owner: "person", snapshot: "unchanged" });
const identityJourney = await runIntegratedPrivateBetaJourney({
  onboardingChoices,
  consentDecision: "accept",
  materials: { cvText: "CV", targetRole: "Role", professionalIdentity: identity, modelAdapter: async () => ({}) },
  feedbackAction: { type: "skip" },
  now: makeNow(),
  betaSessionIdFactory: ids(),
  betaSessionTokenFactory: () => "bi01-identity-token-123456789012345678901",
  sessionRunner: async (input) => completedSessionResult(input.betaSession.sessionId)
});
assert.deepEqual(identity, { id: "pi-001", owner: "person", snapshot: "unchanged" });
assert.equal(identityJourney.professionalIdentitySnapshot.persisted, false);

console.log("BI-01 Beta Journey Integration tests PASSED");
