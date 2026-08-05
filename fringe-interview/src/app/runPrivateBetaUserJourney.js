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
  journeyVerifier = verifyPrivateBetaUserJourney
} = {}) {
  try {
    if (typeof journeyVerifier !== "function") {
      throw new Error("runPrivateBetaUserJourney: journeyVerifier must be a function.");
    }

    const verification = await journeyVerifier({ sessionInput });

    return freeze({
      status: "completed",
      completed: true,
      reportAvailable: verification?.reportAvailable === true,
      verification
    });
  } catch (error) {
    return buildSafeFailure(error);
  }
}

export default runPrivateBetaUserJourney;
