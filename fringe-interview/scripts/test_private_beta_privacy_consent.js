import assert from "assert";
import {
  startPrivateBetaOnboarding,
  advancePrivateBetaOnboarding
} from "../src/app/privateBetaOnboarding.js";
import {
  createPrivateBetaConsent,
  decidePrivateBetaConsent,
  revokePrivateBetaConsent,
  assertPrivateBetaDataUseAllowed,
  PRIVATE_BETA_CONSENT_POLICY_VERSION
} from "../src/app/privateBetaPrivacyConsent.js";
import { runPrivateBetaUserJourney } from "../src/app/runPrivateBetaUserJourney.js";

const CREATED_AT = "2026-08-06T10:00:00.000Z";
const DECIDED_AT = "2026-08-06T10:01:00.000Z";
const REVOKED_AT = "2026-08-06T10:02:00.000Z";

function completeOnboarding(mode = "independent") {
  let state = startPrivateBetaOnboarding();
  state = advancePrivateBetaOnboarding(state, "create");
  state = advancePrivateBetaOnboarding(state, mode);
  return advancePrivateBetaOnboarding(
    state,
    mode === "with_tutor" ? "prepare_candidate" : "prepare_interview"
  );
}

const pending = createPrivateBetaConsent(completeOnboarding(), { now: CREATED_AT });
assert.equal(pending.status, "pending");
assert.equal(pending.policyVersion, PRIVATE_BETA_CONSENT_POLICY_VERSION);
assert.equal(pending.createdAt, CREATED_AT);
assert.equal(pending.professionalIdentityOwner, "person");
assert.equal(pending.tutorAccessGranted, false);
assert.equal(pending.choices.length, 2);
assert.match(pending.notice.classification, /PRIVATE_BETA_PROVISIONAL_NOTICE/);
assert.match(pending.notice.details, /non dichiara conformità legale o GDPR completa/i);
assert.equal(Object.isFrozen(pending), true);
assert.equal(Object.isFrozen(pending.notice), true);

const accepted = decidePrivateBetaConsent(pending, "accept", { now: DECIDED_AT });
assert.equal(accepted.status, "accepted");
assert.equal(accepted.decidedAt, DECIDED_AT);
assert.equal(assertPrivateBetaDataUseAllowed(accepted), true);

const refused = decidePrivateBetaConsent(
  createPrivateBetaConsent(completeOnboarding(), { now: CREATED_AT }),
  "refuse",
  { now: DECIDED_AT }
);
assert.equal(refused.status, "refused");
assert.throws(() => assertPrivateBetaDataUseAllowed(refused), /PRIVATE_BETA_CONSENT_REFUSED/);

const tutorPending = createPrivateBetaConsent(completeOnboarding("with_tutor"), { now: CREATED_AT });
const tutorAccepted = decidePrivateBetaConsent(tutorPending, "accept", { now: DECIDED_AT });
assert.equal(tutorAccepted.workingMode, "with_tutor");
assert.equal(tutorAccepted.tutorAccessGranted, false);

const revoked = revokePrivateBetaConsent(accepted, { now: REVOKED_AT });
assert.equal(revoked.status, "revoked");
assert.equal(revoked.revokedAt, REVOKED_AT);
assert.throws(() => assertPrivateBetaDataUseAllowed(revoked), /PRIVATE_BETA_CONSENT_REVOKED/);
assert.throws(() => revokePrivateBetaConsent(revoked, { now: REVOKED_AT }), /REVOCATION_NOT_ALLOWED/);

let verifierCalls = 0;
const completedJourney = await runPrivateBetaUserJourney({
  sessionInput: { cvText: "CV", jdText: "JD" },
  consentState: accepted,
  journeyVerifier: async () => {
    verifierCalls += 1;
    return { status: "passed", sessionId: "beta-consent", reportAvailable: true };
  }
});
assert.equal(completedJourney.status, "completed");
assert.equal(verifierCalls, 1);

for (const [state, expectedCode] of [
  [pending, "CONSENT_REQUIRED"],
  [refused, "CONSENT_REFUSED"],
  [revoked, "CONSENT_REVOKED"]
]) {
  const blocked = await runPrivateBetaUserJourney({
    sessionInput: { cvText: "sensitive CV", jdText: "JD" },
    consentState: state,
    journeyVerifier: async () => {
      verifierCalls += 1;
      throw new Error("verifier must not run");
    }
  });
  assert.equal(blocked.error.code, expectedCode);
  assert.equal(blocked.error.category, "privacy");
  assert.equal(blocked.fallback.action, "review_consent");
}
assert.equal(verifierCalls, 1);

assert.throws(
  () => createPrivateBetaConsent(startPrivateBetaOnboarding(), { now: CREATED_AT }),
  /PRIVATE_BETA_CONSENT_ONBOARDING_REQUIRED/
);
assert.throws(
  () => createPrivateBetaConsent(completeOnboarding(), { now: "not-a-time" }),
  /PRIVATE_BETA_CONSENT_INVALID_TIMESTAMP/
);
assert.throws(
  () => decidePrivateBetaConsent(pending, "maybe", { now: DECIDED_AT }),
  /PRIVATE_BETA_CONSENT_INVALID_DECISION/
);

console.log("Private Beta privacy and consent foundation tests PASSED");
