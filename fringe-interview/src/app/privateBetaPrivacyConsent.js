const CONSENT_VERSION = "private-beta-privacy-1.0";
const MODEL_VERSION = "1.0";

function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function freeze(value) {
  if (Array.isArray(value)) {
    value.forEach(freeze);
    return Object.freeze(value);
  }
  if (isObject(value)) {
    Object.values(value).forEach(freeze);
    return Object.freeze(value);
  }
  return value;
}

function validIso(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString() === value;
}

function resolveNow(now) {
  const value = now ?? new Date().toISOString();
  if (!validIso(value)) throw new Error("PRIVATE_BETA_CONSENT_INVALID_TIMESTAMP");
  return value;
}

function assertCompletedOnboarding(onboardingState) {
  if (!isObject(onboardingState) || onboardingState.version !== "1.0" || onboardingState.completed !== true) {
    throw new Error("PRIVATE_BETA_CONSENT_ONBOARDING_REQUIRED");
  }
  const mode = onboardingState.selections?.workingMode;
  if (mode !== "independent" && mode !== "with_tutor") {
    throw new Error("PRIVATE_BETA_CONSENT_INVALID_ONBOARDING");
  }
  return mode;
}

function assertConsentState(state) {
  if (!isObject(state) || state.version !== MODEL_VERSION || state.type !== "private_beta_privacy_consent") {
    throw new Error("PRIVATE_BETA_CONSENT_INVALID_STATE");
  }
  if (!["pending", "accepted", "refused", "revoked"].includes(state.status)) {
    throw new Error("PRIVATE_BETA_CONSENT_INVALID_STATE");
  }
  if (state.policyVersion !== CONSENT_VERSION || !validIso(state.createdAt)) {
    throw new Error("PRIVATE_BETA_CONSENT_INVALID_STATE");
  }
  if (state.tutorAccessGranted !== false || state.professionalIdentityOwner !== "person") {
    throw new Error("PRIVATE_BETA_CONSENT_INVALID_STATE");
  }
  return state;
}

export function createPrivateBetaConsent(onboardingState, { now, policyVersion = CONSENT_VERSION } = {}) {
  const workingMode = assertCompletedOnboarding(onboardingState);
  if (policyVersion !== CONSENT_VERSION) throw new Error("PRIVATE_BETA_CONSENT_UNSUPPORTED_POLICY_VERSION");
  const createdAt = resolveNow(now);

  return freeze({
    version: MODEL_VERSION,
    type: "private_beta_privacy_consent",
    status: "pending",
    policyVersion,
    createdAt,
    decidedAt: null,
    revokedAt: null,
    professionalIdentityOwner: "person",
    purpose: "private_beta_experience",
    necessaryDataUse: true,
    revocable: true,
    workingMode,
    tutorAccessGranted: false,
    notice: {
      classification: "PRIVATE_BETA_PROVISIONAL_NOTICE",
      title: "Privacy e consenso — Private Beta",
      summary: "IMAGO usa i dati personali necessari per offrire l’esperienza Private Beta. La Professional Identity resta della persona.",
      details: "Il consenso può essere rifiutato o revocato. La modalità con Tutor non concede accesso automatico: ogni futura autorizzazione dovrà essere separata, esplicita e revocabile. Questa informativa è provvisoria e non dichiara conformità legale o GDPR completa."
    },
    choices: [
      { id: "accept", label: "Accetto l’uso necessario dei dati" },
      { id: "refuse", label: "Non accetto" }
    ]
  });
}

export function decidePrivateBetaConsent(state, decision, { now } = {}) {
  assertConsentState(state);
  if (state.status !== "pending") throw new Error("PRIVATE_BETA_CONSENT_DECISION_NOT_ALLOWED");
  if (decision !== "accept" && decision !== "refuse") throw new Error("PRIVATE_BETA_CONSENT_INVALID_DECISION");
  const decidedAt = resolveNow(now);

  return freeze({
    ...state,
    status: decision === "accept" ? "accepted" : "refused",
    decidedAt
  });
}

export function revokePrivateBetaConsent(state, { now } = {}) {
  assertConsentState(state);
  if (state.status !== "accepted") throw new Error("PRIVATE_BETA_CONSENT_REVOCATION_NOT_ALLOWED");
  const revokedAt = resolveNow(now);

  return freeze({
    ...state,
    status: "revoked",
    revokedAt
  });
}

export function assertPrivateBetaDataUseAllowed(state) {
  assertConsentState(state);
  if (state.status === "pending") throw new Error("PRIVATE_BETA_CONSENT_REQUIRED");
  if (state.status === "refused") throw new Error("PRIVATE_BETA_CONSENT_REFUSED");
  if (state.status === "revoked") throw new Error("PRIVATE_BETA_CONSENT_REVOKED");
  return true;
}

export { CONSENT_VERSION as PRIVATE_BETA_CONSENT_POLICY_VERSION };
