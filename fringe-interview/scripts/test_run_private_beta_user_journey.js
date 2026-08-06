import assert from "assert";
import { runPrivateBetaUserJourney } from "../src/app/runPrivateBetaUserJourney.js";
import {
  startPrivateBetaOnboarding,
  advancePrivateBetaOnboarding
} from "../src/app/privateBetaOnboarding.js";
import { createPrivateBetaConsent, decidePrivateBetaConsent } from "../src/app/privateBetaPrivacyConsent.js";

const sessionInput = { cvText: "CV", jdText: "JD" };
let onboarding = startPrivateBetaOnboarding();
onboarding = advancePrivateBetaOnboarding(onboarding, "create");
onboarding = advancePrivateBetaOnboarding(onboarding, "independent");
onboarding = advancePrivateBetaOnboarding(onboarding, "prepare_interview");
const consentState = decidePrivateBetaConsent(
  createPrivateBetaConsent(onboarding, { now: "2026-08-06T10:00:00.000Z" }),
  "accept",
  { now: "2026-08-06T10:01:00.000Z" }
);

let receivedInput = null;

const completed = await runPrivateBetaUserJourney({
  sessionInput,
  consentState,
  feedbackNow: "2026-08-06T11:00:00.000Z",
  journeyVerifier: async ({ sessionInput: input }) => {
    receivedInput = input;
    return {
      status: "passed",
      sessionId: "beta-001",
      reportAvailable: true
    };
  }
});

assert.deepEqual(receivedInput, sessionInput);
assert.equal(completed.status, "completed");
assert.equal(completed.completed, true);
assert.equal(completed.reportAvailable, true);
assert.equal(completed.verification.sessionId, "beta-001");
assert.equal(completed.feedback.status, "not_started");
assert.equal(completed.feedback.sessionRef, "beta-001");
assert.equal(completed.feedback.createdAt, "2026-08-06T11:00:00.000Z");
assert.equal(Object.isFrozen(completed), true);
assert.equal(Object.isFrozen(completed.verification), true);

const completedWithoutSessionRef = await runPrivateBetaUserJourney({
  sessionInput,
  consentState,
  journeyVerifier: async () => ({
    status: "passed",
    sessionId: null,
    reportAvailable: true
  })
});
assert.equal(completedWithoutSessionRef.status, "completed");
assert.equal(completedWithoutSessionRef.completed, true);
assert.equal(completedWithoutSessionRef.feedback, null);

const invalidInput = await runPrivateBetaUserJourney({
  sessionInput: {},
  consentState,
  journeyVerifier: async () => {
    throw new Error("runFringeInterviewMVPSession: cvText is required.");
  }
});
assert.deepEqual(invalidInput.error, {
  code: "INVALID_INPUT",
  category: "input",
  message: "Non è stato possibile avviare la sessione. Controlla i dati inseriti e riprova."
});
assert.deepEqual(invalidInput.fallback, {
  safe: true,
  action: "review_input"
});

const incomplete = await runPrivateBetaUserJourney({
  sessionInput,
  consentState,
  journeyVerifier: async () => {
    throw new Error("PRIVATE_BETA_E2E_JOURNEY_INCOMPLETE: INTERVIEW_NOT_COMPLETED");
  }
});
assert.equal(incomplete.error.code, "JOURNEY_INCOMPLETE");
assert.equal(incomplete.error.category, "session");
assert.equal(incomplete.fallback.action, "restart_session");
assert.equal(incomplete.completed, false);
assert.equal(incomplete.reportAvailable, false);

const unavailable = await runPrivateBetaUserJourney({
  sessionInput,
  consentState,
  journeyVerifier: async () => {
    throw new Error("provider unavailable: 503");
  }
});
assert.equal(unavailable.error.code, "SERVICE_UNAVAILABLE");
assert.equal(unavailable.error.category, "service");
assert.equal(unavailable.fallback.action, "restart_later");

const unexpected = await runPrivateBetaUserJourney({
  sessionInput,
  consentState,
  journeyVerifier: async () => {
    throw new Error("opaque internal stack detail /tmp/private-file.js:42");
  }
});
assert.equal(unexpected.error.code, "UNEXPECTED_ERROR");
assert.equal(unexpected.error.category, "unexpected");
assert.equal(unexpected.error.message.includes("/tmp/private-file.js"), false);
assert.equal(JSON.stringify(unexpected).includes("opaque internal stack detail"), false);
assert.equal(Object.isFrozen(unexpected), true);
assert.equal(Object.isFrozen(unexpected.error), true);
assert.equal(Object.isFrozen(unexpected.fallback), true);

const invalidVerifier = await runPrivateBetaUserJourney({
  sessionInput,
  consentState,
  journeyVerifier: null
});
assert.equal(invalidVerifier.error.code, "UNEXPECTED_ERROR");

console.log("Private Beta error handling foundation tests PASSED");
