import { createBetaSession, transitionBetaSession, updateBetaSessionProgress } from "../session/index.js";
import { runFringeInterviewMVPSession } from "./runFringeInterviewMVPSession.js";
import { verifyPrivateBetaUserJourney } from "./verifyPrivateBetaUserJourney.js";
import { runPrivateBetaUserJourney } from "./runPrivateBetaUserJourney.js";
import { startPrivateBetaOnboarding, advancePrivateBetaOnboarding } from "./privateBetaOnboarding.js";
import {
  createPrivateBetaConsent,
  decidePrivateBetaConsent,
  revokePrivateBetaConsent,
  assertPrivateBetaDataUseAllowed
} from "./privateBetaPrivacyConsent.js";
import { submitPrivateBetaFeedback, skipPrivateBetaFeedback } from "./privateBetaFeedback.js";
import {
  buildPrivateBetaOperationalEvent,
  emitPrivateBetaOperationalEvent,
  recordPrivateBetaInterruption
} from "./privateBetaOperationalLogging.js";

const INTEGRATION_VERSION = "private-beta-journey-integration-1.0";
const SNAPSHOT_GAP_CODE = "PROFESSIONAL_IDENTITY_SNAPSHOT_CAPABILITY_UNAVAILABLE";

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

function resolveNow(now) {
  const raw = typeof now === "function" ? now() : now;
  const value = raw instanceof Date ? raw.toISOString() : raw;
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new Error("PRIVATE_BETA_INTEGRATION_INVALID_TIMESTAMP");
  }
  return new Date(value).toISOString();
}

function safeFailure(code, message, phase, extra = {}) {
  return freeze({
    status: "blocked",
    completed: false,
    phase,
    error: { code, message },
    ...extra
  });
}

async function emitEvent({ eventType, boundary, outcome, errorCode = null, sessionId, eventIdFactory, now, sink }) {
  const event = buildPrivateBetaOperationalEvent({
    eventId: eventIdFactory(eventType, boundary),
    sessionId,
    eventType,
    boundary,
    outcome,
    errorCode,
    now: resolveNow(now)
  });
  await emitPrivateBetaOperationalEvent(event, sink);
  return event;
}

function advanceSession(session, currentStep, now, inputRefs) {
  return updateBetaSessionProgress(session, {
    currentStep,
    inputRefs,
    now: () => resolveNow(now)
  });
}

function interruptCreatedSession(session, currentStep, now) {
  if (session.status !== "created") return session;
  return transitionBetaSession(session, {
    toStatus: "interrupted",
    currentStep,
    interviewStatus: "not_started",
    now: () => resolveNow(now)
  });
}

function buildProfessionalPerceptionFirstView(proReport) {
  const perception = proReport?.professionalPerception?.perceptionV2 || {};
  const priorities = proReport?.overview?.operationalActionPlan?.globalPriorities || [];
  const messages = [
    perception?.whoEmerges?.narrative,
    perception?.credibilityAssets?.narrative,
    perception?.targetDistance?.bridgeNarrative
  ].filter((value) => typeof value === "string" && value.trim()).slice(0, 3);

  return freeze({
    available: isObject(proReport),
    messages,
    nextActions: priorities.slice(0, 3).map((item) => freeze({
      title: item?.title || "",
      action: item?.action || ""
    }))
  });
}

function buildSnapshotGap(sessionId) {
  return freeze({
    status: "unavailable",
    persisted: false,
    sessionRef: sessionId,
    reasonCode: SNAPSHOT_GAP_CODE,
    message: "Lo snapshot persistente della Professional Identity non è disponibile nel boundary applicativo corrente; BI-01 non simula la persistenza."
  });
}

function applyFeedbackAction(feedbackState, feedbackAction, now) {
  if (!feedbackState || feedbackAction == null) return { feedback: feedbackState, error: null };
  try {
    if (feedbackAction.type === "skip") {
      return { feedback: skipPrivateBetaFeedback(feedbackState, { now: resolveNow(now) }), error: null };
    }
    if (feedbackAction.type === "submit") {
      return {
        feedback: submitPrivateBetaFeedback(feedbackState, feedbackAction.responses, {
          comment: feedbackAction.comment,
          now: resolveNow(now)
        }),
        error: null
      };
    }
    throw new Error("PRIVATE_BETA_INTEGRATION_INVALID_FEEDBACK_ACTION");
  } catch {
    return {
      feedback: feedbackState,
      error: freeze({
        code: "FEEDBACK_NOT_RECORDED",
        message: "Il feedback non è stato registrato. La sessione resta comunque completata."
      })
    };
  }
}

export async function runIntegratedPrivateBetaJourney({
  onboardingChoices = [],
  consentDecision,
  revokeConsentBeforeMaterials = false,
  materials,
  feedbackAction = null,
  interruptionRequested = false,
  operationalSink,
  now = () => new Date().toISOString(),
  betaSessionIdFactory,
  betaSessionTokenFactory,
  operationalEventIdFactory,
  sessionRunner = runFringeInterviewMVPSession,
  journeyVerifier = verifyPrivateBetaUserJourney
} = {}) {
  const created = createBetaSession({
    inputRefs: [],
    now: () => resolveNow(now),
    idFactory: betaSessionIdFactory,
    tokenFactory: betaSessionTokenFactory
  });
  let betaSession = created.session;
  const sessionId = betaSession.sessionId;
  const eventIdFactory = typeof operationalEventIdFactory === "function"
    ? operationalEventIdFactory
    : (eventType, boundary) => `${sessionId}:${boundary}:${eventType}`;

  await emitEvent({
    eventType: "session_started",
    boundary: "beta_journey",
    outcome: "started",
    sessionId,
    eventIdFactory,
    now,
    sink: operationalSink
  });

  let onboarding;
  try {
    betaSession = advanceSession(betaSession, "onboarding", now);
    onboarding = startPrivateBetaOnboarding();
    for (const choice of onboardingChoices) onboarding = advancePrivateBetaOnboarding(onboarding, choice);
    if (onboarding.completed !== true) throw new Error("PRIVATE_BETA_INTEGRATION_ONBOARDING_INCOMPLETE");
  } catch {
    betaSession = interruptCreatedSession(betaSession, "onboarding_blocked", now);
    await emitEvent({ eventType: "application_error", boundary: "onboarding", outcome: "failed", errorCode: "INVALID_INPUT", sessionId, eventIdFactory, now, sink: operationalSink });
    await recordPrivateBetaInterruption({ eventId: eventIdFactory("session_interrupted", "onboarding"), sessionId, boundary: "onboarding", now: resolveNow(now), sink: operationalSink });
    return safeFailure("ONBOARDING_INCOMPLETE", "Completa i passaggi iniziali prima di proseguire.", "onboarding", { betaSession });
  }

  betaSession = advanceSession(betaSession, "privacy_consent", now);
  let consent = createPrivateBetaConsent(onboarding, { now: resolveNow(now) });
  try {
    consent = decidePrivateBetaConsent(consent, consentDecision, { now: resolveNow(now) });
  } catch {
    betaSession = interruptCreatedSession(betaSession, "privacy_consent_blocked", now);
    await emitEvent({ eventType: "application_error", boundary: "privacy_consent", outcome: "failed", errorCode: "CONSENT_REQUIRED", sessionId, eventIdFactory, now, sink: operationalSink });
    return safeFailure("CONSENT_REQUIRED", "È necessaria una scelta esplicita sul consenso prima di proseguire.", "privacy_consent", { onboarding, consent, betaSession });
  }

  if (consent.status === "refused") {
    betaSession = interruptCreatedSession(betaSession, "privacy_consent_refused", now);
    await recordPrivateBetaInterruption({ eventId: eventIdFactory("session_interrupted", "privacy_consent"), sessionId, boundary: "privacy_consent", now: resolveNow(now), sink: operationalSink });
    return safeFailure("CONSENT_REFUSED", "Senza il consenso necessario non vengono acquisiti o utilizzati materiali personali.", "privacy_consent", { onboarding, consent, betaSession });
  }

  if (revokeConsentBeforeMaterials) consent = revokePrivateBetaConsent(consent, { now: resolveNow(now) });
  try {
    assertPrivateBetaDataUseAllowed(consent);
  } catch {
    betaSession = interruptCreatedSession(betaSession, "privacy_consent_revoked", now);
    await recordPrivateBetaInterruption({ eventId: eventIdFactory("session_interrupted", "privacy_consent"), sessionId, boundary: "privacy_consent", now: resolveNow(now), sink: operationalSink });
    return safeFailure("CONSENT_REVOKED", "Il consenso è stato revocato. Nessun nuovo materiale personale viene acquisito o utilizzato.", "privacy_consent", { onboarding, consent, betaSession });
  }

  betaSession = advanceSession(betaSession, "material_acquisition", now);
  if (!isObject(materials)) {
    betaSession = interruptCreatedSession(betaSession, "material_acquisition_blocked", now);
    await emitEvent({ eventType: "application_error", boundary: "material_acquisition", outcome: "failed", errorCode: "INVALID_INPUT", sessionId, eventIdFactory, now, sink: operationalSink });
    return safeFailure("MATERIALS_REQUIRED", "Non sono disponibili i materiali necessari per preparare la sessione.", "material_acquisition", { onboarding, consent, betaSession });
  }

  if (interruptionRequested) {
    betaSession = interruptCreatedSession(betaSession, "material_acquisition_interrupted", now);
    await recordPrivateBetaInterruption({ eventId: eventIdFactory("session_interrupted", "material_acquisition"), sessionId, boundary: "material_acquisition", now: resolveNow(now), sink: operationalSink });
    return freeze({
      status: "interrupted",
      completed: false,
      phase: "material_acquisition",
      onboarding,
      consent,
      betaSession
    });
  }

  betaSession = advanceSession(betaSession, "session_preparation", now);
  let rawSessionResult = null;
  const sessionInput = { ...materials, betaSession };

  const safeJourney = await runPrivateBetaUserJourney({
    sessionInput,
    consentState: consent,
    feedbackNow: resolveNow(now),
    operationalSessionId: sessionId,
    journeyVerifier: async ({ sessionInput: input }) => {
      rawSessionResult = await sessionRunner(input);
      return journeyVerifier({ sessionInput: input, sessionRunner: async () => rawSessionResult });
    }
  });

  if (safeJourney.completed !== true) {
    betaSession = interruptCreatedSession(betaSession, "interview_failed", now);
    await emitEvent({ eventType: "application_error", boundary: "beta_journey", outcome: "failed", errorCode: safeJourney.error?.code || "UNEXPECTED_ERROR", sessionId, eventIdFactory, now, sink: operationalSink });
    await recordPrivateBetaInterruption({ eventId: eventIdFactory("session_interrupted", "beta_journey"), sessionId, boundary: "beta_journey", now: resolveNow(now), sink: operationalSink });
    return freeze({
      status: "blocked",
      completed: false,
      phase: "interview",
      onboarding,
      consent,
      betaSession,
      error: safeJourney.error,
      fallback: safeJourney.fallback
    });
  }

  const sessionOutput = rawSessionResult?.fringeInterviewMVPSession || {};
  betaSession = sessionOutput.betaSession || betaSession;
  const professionalPerceptionReport = sessionOutput.professionalPerceptionReport || null;
  const reportView = buildProfessionalPerceptionFirstView(professionalPerceptionReport);
  const snapshot = buildSnapshotGap(sessionId);

  const feedbackResult = applyFeedbackAction(safeJourney.feedback, feedbackAction, now);
  if (feedbackResult.error) {
    await emitEvent({ eventType: "application_error", boundary: "feedback", outcome: "failed", errorCode: feedbackResult.error.code, sessionId, eventIdFactory, now, sink: operationalSink });
  }

  await emitEvent({
    eventType: "session_completed",
    boundary: "beta_journey",
    outcome: "completed",
    sessionId,
    eventIdFactory,
    now,
    sink: operationalSink
  });

  return freeze({
    version: INTEGRATION_VERSION,
    type: "private_beta_journey_integration",
    status: "completed_with_gap",
    completed: true,
    phase: "experience_closed",
    onboarding,
    consent,
    betaSession,
    interview: freeze({
      completed: true,
      inputMode: materials.inputMode || "text",
      voiceAvailable: false
    }),
    report: freeze({
      available: safeJourney.reportAvailable === true,
      finalCandidateReport: sessionOutput.finalCandidateReport || null,
      professionalPerceptionReport,
      firstView: reportView
    }),
    professionalIdentitySnapshot: snapshot,
    feedback: feedbackResult.feedback,
    feedbackError: feedbackResult.error,
    capabilityGaps: freeze([
      freeze({ code: SNAPSHOT_GAP_CODE, blockingForBetaValidation: true }),
      freeze({ code: "VOICE_SUBSYSTEM_UNAVAILABLE", blockingForBetaValidation: false })
    ])
  });
}

export const PRIVATE_BETA_JOURNEY_INTEGRATION_VERSION = INTEGRATION_VERSION;
export const PRIVATE_BETA_PROFESSIONAL_IDENTITY_SNAPSHOT_GAP_CODE = SNAPSHOT_GAP_CODE;

export default runIntegratedPrivateBetaJourney;

export { prepareStagedPrivateBetaJourney, continueStagedPrivateBetaJourney, answerStagedPrivateBetaJourney, finalizeStagedPrivateBetaJourney } from "./privateBetaStagedInterviewJourney.js";
