import assert from "assert";
import { runPrivateBetaUserJourney } from "../src/app/runPrivateBetaUserJourney.js";

const sessionInput = { cvText: "CV", jdText: "JD" };
let receivedInput = null;

const completed = await runPrivateBetaUserJourney({
  sessionInput,
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
assert.equal(Object.isFrozen(completed), true);
assert.equal(Object.isFrozen(completed.verification), true);

const invalidInput = await runPrivateBetaUserJourney({
  sessionInput: {},
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
  journeyVerifier: async () => {
    throw new Error("provider unavailable: 503");
  }
});
assert.equal(unavailable.error.code, "SERVICE_UNAVAILABLE");
assert.equal(unavailable.error.category, "service");
assert.equal(unavailable.fallback.action, "restart_later");

const unexpected = await runPrivateBetaUserJourney({
  sessionInput,
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
  journeyVerifier: null
});
assert.equal(invalidVerifier.error.code, "UNEXPECTED_ERROR");

console.log("Private Beta error handling foundation tests PASSED");
