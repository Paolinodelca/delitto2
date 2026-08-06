import assert from "assert";
import {
  buildPrivateBetaOperationalEvent,
  createInMemoryPrivateBetaOperationalSink,
  emitPrivateBetaOperationalEvent,
  recordPrivateBetaInterruption,
  PRIVATE_BETA_OPERATIONAL_FORBIDDEN_FIELDS
} from "../src/app/privateBetaOperationalLogging.js";
import { runPrivateBetaUserJourney } from "../src/app/runPrivateBetaUserJourney.js";
import { startPrivateBetaOnboarding, advancePrivateBetaOnboarding } from "../src/app/privateBetaOnboarding.js";
import { createPrivateBetaConsent, decidePrivateBetaConsent } from "../src/app/privateBetaPrivacyConsent.js";

const NOW = "2026-08-06T12:00:00.000Z";
const identity = Object.freeze({ id: "identity-001", owner: "person", snapshot: "unchanged" });
const start = buildPrivateBetaOperationalEvent({ eventId: "evt-start", sessionId: "beta-001", eventType: "session_started", boundary: "beta_journey", outcome: "started", now: NOW });
assert.equal(start.eventType, "session_started");
assert.equal(Object.isFrozen(start), true);
for (const field of PRIVATE_BETA_OPERATIONAL_FORBIDDEN_FIELDS) assert.equal(field in start, false);
assert.deepEqual(Object.keys(start).sort(), ["boundary","errorCode","eventId","eventType","formatVersion","outcome","sessionId","timestamp","type","version"].sort());

const sink = createInMemoryPrivateBetaOperationalSink();
await emitPrivateBetaOperationalEvent(start, sink);
const interrupted = await recordPrivateBetaInterruption({ eventId: "evt-interrupt", sessionId: "beta-001", now: NOW, sink });
assert.equal(interrupted.eventType, "session_interrupted");
assert.equal(sink.getEvents().length, 2);

let onboarding = startPrivateBetaOnboarding();
onboarding = advancePrivateBetaOnboarding(onboarding, "create");
onboarding = advancePrivateBetaOnboarding(onboarding, "independent");
onboarding = advancePrivateBetaOnboarding(onboarding, "prepare_interview");
const consent = decidePrivateBetaConsent(createPrivateBetaConsent(onboarding, { now: NOW }), "accept", { now: NOW });
const journeySink = createInMemoryPrivateBetaOperationalSink();
const completed = await runPrivateBetaUserJourney({
  sessionInput: { cvText: "PRIVATE CV", jdText: "PRIVATE JD", professionalIdentity: identity },
  consentState: consent,
  operationalSessionId: "beta-journey-001",
  operationalNow: NOW,
  operationalSink: journeySink,
  operationalEventIdFactory: (type) => `evt-${type}`,
  journeyVerifier: async () => ({ status: "passed", sessionId: "beta-journey-001", reportAvailable: true })
});
assert.equal(completed.completed, true);
assert.deepEqual(journeySink.getEvents().map((e) => e.eventType), ["session_started", "session_completed"]);
assert.equal(JSON.stringify(journeySink.getEvents()).includes("PRIVATE CV"), false);
assert.equal(JSON.stringify(journeySink.getEvents()).includes("PRIVATE JD"), false);
assert.deepEqual(identity, { id: "identity-001", owner: "person", snapshot: "unchanged" });

const errorSink = createInMemoryPrivateBetaOperationalSink();
const failed = await runPrivateBetaUserJourney({
  sessionInput: { cvText: "CV", jdText: "JD" }, consentState: consent,
  operationalSessionId: "beta-error-001", operationalNow: NOW, operationalSink: errorSink,
  operationalEventIdFactory: (type) => `err-${type}`,
  journeyVerifier: async () => { throw new Error("provider unavailable: 503 with secret-token"); }
});
assert.equal(failed.error.code, "SERVICE_UNAVAILABLE");
assert.deepEqual(errorSink.getEvents().map((e) => e.eventType), ["session_started", "application_error"]);
assert.equal(errorSink.getEvents()[1].errorCode, "SERVICE_UNAVAILABLE");
assert.equal(JSON.stringify(errorSink.getEvents()).includes("secret-token"), false);

const sinkFailure = await runPrivateBetaUserJourney({
  sessionInput: { cvText: "CV", jdText: "JD" }, consentState: consent,
  operationalSessionId: "beta-safe-001", operationalNow: NOW,
  operationalSink: async () => { throw new Error("sink unavailable"); },
  journeyVerifier: async () => ({ status: "passed", sessionId: "beta-safe-001", reportAvailable: true })
});
assert.equal(sinkFailure.completed, true);

const minimized = buildPrivateBetaOperationalEvent({ ...start, eventId: "x", cvText: "forbidden" });
assert.equal("cvText" in minimized, false);
console.log("Private Beta operational logging foundation tests PASSED");
