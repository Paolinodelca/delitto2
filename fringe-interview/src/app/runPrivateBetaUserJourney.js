import { buildPrivateBetaOperationalEvent, emitPrivateBetaOperationalEvent } from "./privateBetaOperationalLogging.js";
import { createPrivateBetaFeedback } from "./privateBetaFeedback.js";
import { assertPrivateBetaDataUseAllowed } from "./privateBetaPrivacyConsent.js";
import { verifyPrivateBetaUserJourney } from "./verifyPrivateBetaUserJourney.js";

const ERROR_DEFINITIONS = Object.freeze({
  INVALID_INPUT: Object.freeze({
    category: "input",
    message: "Non è stato possibile avviare la sessione. Controlla i dati inseriti e riprova.",
    fallbackAction: "review_input"
  }),
  JOURNEY_INCOMPLETE: Object.freeze({
    category: "session",
    message: "La sessione non è stata completata correttamente. Puoi avviarne una nuova senza usare questo risultato.",
    fallbackAction: "restart_session"
  }),
  SERVICE_UNAVAILABLE: Object.freeze({
    category: "service",
    message: "Il servizio non è temporaneamente disponibile. La sessione non è stata salvata come completata.",
    fallbackAction: "restart_later"
  }),
  CONSENT_REQUIRED: Object.freeze({
    category: "privacy",
    message: "Per avviare la Private Beta devi prima accettare l’uso necessario dei dati.",
    fallbackAction: "review_consent"
  }),
  CONSENT_REFUSED: Object.freeze({
    category: "privacy",
    message: "Il consenso necessario è stato rifiutato. Nessun dato verrà usato per avviare l’esperienza.",
    fallbackAction: "review_consent"
  }),
  CONSENT_REVOKED: Object.freeze({
    category: "privacy",
    message: "Il consenso è stato revocato. Il trattamento non può proseguire.",
    fallbackAction: "review_consent"
  }),
  UNEXPECTED_ERROR: Object.freeze({
    category: "unexpected",
    message: "Si è verificato un problema inatteso. La sessione non è stata salvata come completata.",
    fallbackAction: "restart_session"
  })
});

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

function errorText(error) {
  if (error instanceof Error) return error.message || "";
  if (typeof error === "string") return error;
  return "";
}

function classifyPrivateBetaError(error) {
  const message = errorText(error);

  if (/PRIVATE_BETA_CONSENT_REQUIRED/i.test(message)) return "CONSENT_REQUIRED";
  if (/PRIVATE_BETA_CONSENT_REFUSED/i.test(message)) return "CONSENT_REFUSED";
  if (/PRIVATE_BETA_CONSENT_REVOKED/i.test(message)) return "CONSENT_REVOKED";

  if (
    /sessionInput is required|cvText is required|provide jdText or targetRole|modelAdapter must be a function|sessionRunner must be a function/i.test(
      message
    )
  ) {
    return "INVALID_INPUT";
  }

  if (/PRIVATE_BETA_E2E_|BETA_SESSION_|INTERVIEW_NOT_COMPLETED|FINAL_REPORT_NOT_BUILT/i.test(message)) {
    return "JOURNEY_INCOMPLETE";
  }

  if (/429|500|502|503|504|timeout|timed out|network|fetch failed|service unavailable|provider unavailable/i.test(message)) {
    return "SERVICE_UNAVAILABLE";
  }

  return "UNEXPECTED_ERROR";
}

function buildSafeFailure(error) {
  const code = classifyPrivateBetaError(error);
  const definition = ERROR_DEFINITIONS[code];

  return freeze({
    status: "failed",
    completed: false,
    reportAvailable: false,
    error: {
      code,
      category: definition.category,
      message: definition.message
    },
    fallback: {
      safe: true,
      action: definition.fallbackAction
    }
  });
}

export async function runPrivateBetaUserJourney({
  sessionInput,
  consentState,
  feedbackNow,
  operationalSessionId = "beta-session-unassigned",
  operationalNow,
  operationalSink,
  operationalEventIdFactory = (eventType) => `${operationalSessionId}:${eventType}`,
  journeyVerifier = verifyPrivateBetaUserJourney
} = {}) {
  let activeBoundary = "privacy_consent";
  try {
    await emitPrivateBetaOperationalEvent(buildPrivateBetaOperationalEvent({
      eventId: operationalEventIdFactory("session_started"),
      sessionId: operationalSessionId,
      eventType: "session_started",
      boundary: "beta_journey",
      outcome: "started",
      now: operationalNow
    }), operationalSink);

    assertPrivateBetaDataUseAllowed(consentState);
    activeBoundary = "beta_journey";

    if (typeof journeyVerifier !== "function") {
      throw new Error("runPrivateBetaUserJourney: journeyVerifier must be a function.");
    }

    const verification = await journeyVerifier({ sessionInput });
    const feedback = typeof verification?.sessionId === "string" && verification.sessionId.trim()
      ? createPrivateBetaFeedback(verification.sessionId, { now: feedbackNow })
      : null;

    await emitPrivateBetaOperationalEvent(buildPrivateBetaOperationalEvent({
      eventId: operationalEventIdFactory("session_completed"),
      sessionId: verification?.sessionId || operationalSessionId,
      eventType: "session_completed",
      boundary: "beta_journey",
      outcome: "completed",
      now: operationalNow
    }), operationalSink);

    return freeze({
      status: "completed",
      completed: true,
      reportAvailable: verification?.reportAvailable === true,
      verification,
      feedback
    });
  } catch (error) {
    const failure = buildSafeFailure(error);
    try {
      await emitPrivateBetaOperationalEvent(buildPrivateBetaOperationalEvent({
        eventId: operationalEventIdFactory("application_error"),
        sessionId: operationalSessionId,
        eventType: "application_error",
        boundary: activeBoundary,
        outcome: "failed",
        errorCode: failure.error.code,
        now: operationalNow
      }), operationalSink);
    } catch {
      // Operational logging is deliberately failure-safe and never changes the journey result.
    }
    return failure;
  }
}

export default runPrivateBetaUserJourney;
