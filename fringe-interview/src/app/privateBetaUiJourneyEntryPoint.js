import { runIntegratedPrivateBetaJourney } from "./privateBetaJourneyIntegration.js";
import { runGroqParserModel } from "../parser/adapters/index.js";

function isObject(value) { return !!value && typeof value === "object" && !Array.isArray(value); }
function text(value) { return typeof value === "string" ? value.trim() : ""; }
function splitAnswers(value) {
  if (Array.isArray(value)) return value.map(text).filter(Boolean);
  return text(value).split(/\n\s*\n/).map(text).filter(Boolean);
}
function buildFeedbackAction(uiInput = {}) {
  if (uiInput.feedbackAction === "skip" || !uiInput.feedbackAction) return { type: "skip" };
  if (uiInput.feedbackAction !== "submit") return null;
  return {
    type: "submit",
    responses: uiInput.feedbackResponses || {
      experience: { clarity: "clear", usefulness: "useful", reportCredibility: "credible" },
      valueAndDifficulty: { mostValuablePart: "professional_impression", difficulty: "none" },
      futureIntent: { reuse: "yes", recommend: "yes" }
    },
    comment: text(uiInput.feedbackComment)
  };
}
function buildOnboardingChoices(uiInput = {}) {
  return [
    uiInput.identityAction === "recover" ? "recover" : "create",
    uiInput.workingMode === "with_tutor" ? "with_tutor" : "independent",
    "prepare_interview"
  ];
}
export async function runPrivateBetaUiJourneyEntryPoint({
  uiInput,
  modelAdapter,
  operationalSink,
  now,
  betaSessionIdFactory,
  betaSessionTokenFactory,
  operationalEventIdFactory,
  sessionRunner,
  journeyVerifier,
  technicalDiagnosticSink
} = {}) {
  if (!isObject(uiInput)) throw new Error("PRIVATE_BETA_UI_INPUT_REQUIRED");
  const consentDecision = uiInput.consentDecision === "refuse" ? "refuse" : uiInput.consentDecision === "accept" ? "accept" : null;
  const baseModelAdapter = typeof modelAdapter === "function"
    ? modelAdapter
    : ({ task, system, user }) => runGroqParserModel({ task, system, user, temperature: 0.2 }).then((result) => result?.outputText || "");
  const effectiveModelAdapter = async (request) => {
    try {
      return await baseModelAdapter(request);
    } catch (error) {
      if (typeof technicalDiagnosticSink === "function") {
        const message = String(error?.message || "");
        const failureKind = /429/.test(message) ? "provider_rate_limit"
          : /5\d\d/.test(message) ? "provider_http_5xx"
          : /timeout|timed out/i.test(message) ? "provider_timeout"
          : /fetch failed|network/i.test(message) ? "provider_network"
          : "provider_or_model_adapter_error";
        try { technicalDiagnosticSink(Object.freeze({ boundary: "model_adapter", task: String(request?.task || "unknown"), failureKind })); } catch {}
      }
      throw error;
    }
  };

  const materials = {};
  Object.defineProperties(materials, {
    cvText: { enumerable: true, get: () => text(uiInput.cvText) },
    jdText: { enumerable: true, get: () => text(uiInput.jdText) },
    userNotes: { enumerable: true, get: () => text(uiInput.userNotes) },
    targetRole: { enumerable: true, get: () => text(uiInput.targetRole) },
    answers: { enumerable: true, get: () => splitAnswers(uiInput.answers) },
    modelAdapter: { enumerable: true, get: () => effectiveModelAdapter },
    inputMode: { enumerable: true, get: () => "text" },
    uiLocale: { enumerable: true, get: () => text(uiInput.uiLocale) || "it" },
    sessionLocale: { enumerable: true, get: () => text(uiInput.sessionLocale) || text(uiInput.uiLocale) || "it" },
    inputSource: { enumerable: true, get: () => "manual" },
    frictionType: { enumerable: true, get: () => "none" }
  });

  return runIntegratedPrivateBetaJourney({
    onboardingChoices: buildOnboardingChoices(uiInput),
    consentDecision,
    materials,
    feedbackAction: buildFeedbackAction(uiInput),
    interruptionRequested: uiInput.interruptionRequested === true,
    operationalSink,
    now,
    betaSessionIdFactory,
    betaSessionTokenFactory,
    operationalEventIdFactory,
    sessionRunner,
    journeyVerifier
  });
}

export default runPrivateBetaUiJourneyEntryPoint;
