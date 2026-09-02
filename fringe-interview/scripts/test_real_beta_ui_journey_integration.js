import assert from "assert";
import { createPrivateBetaUiServer } from "../src/app/privateBetaUiServer.js";
import { runPrivateBetaUiJourneyEntryPoint } from "../src/app/privateBetaUiJourneyEntryPoint.js";
import { createInMemoryPrivateBetaOperationalSink } from "../src/app/privateBetaOperationalLogging.js";

function makeNow(base = "2026-08-13T20:00:00.000Z") {
  let tick = 0;
  return () => new Date(Date.parse(base) + tick++ * 1000).toISOString();
}
function ids(prefix) { let n = 0; return () => `${prefix}-${++n}`; }
function completedSessionResult(sessionId) {
  return {
    fringeInterviewMVPSession: {
      betaSession: {
        schemaVersion: "1.1", revision: 7, sessionId, testerId: "tester_stub",
        resumeTokenHash: "a".repeat(64), status: "completed", currentStep: "interview_completed", inputRefs: [],
        interview: { status: "completed", runtimeRef: { type: "interview_runtime", id: `${sessionId}_runtime` } },
        resultRef: { type: "final_candidate_report", id: `${sessionId}_final_candidate_report` },
        lifecycle: { createdAt: "2026-08-13T20:00:00.000Z", updatedAt: "2026-08-13T20:01:00.000Z", interruptedAt: null, completedAt: "2026-08-13T20:01:00.000Z" }
      },
      interviewRuntime: { runtimeState: { isCompleted: true, answers: [{ answer: "free professional presentation" }] } },
      finalCandidateReport: { finalTakeaway: { message: "Ready" } },
      professionalPerceptionReport: {
        overview: { operationalActionPlan: { globalPriorities: [
          { title: "Azione 1", action: "Rendi concreto un risultato." },
          { title: "Azione 2", action: "Esplicita il contributo personale." },
          { title: "Azione 3", action: "Collega l'esperienza al ruolo." }
        ] } },
        professionalPerception: { perceptionV2: {
          whoEmerges: { narrative: "Emerge un profilo professionale leggibile." },
          credibilityAssets: { narrative: "Sono visibili asset di credibilità concreti." },
          targetDistance: { bridgeNarrative: "La distanza principale è nella dimostrazione dell'impatto." }
        } }
      },
      betaUserJourney: { status: "completed", completed: true, reportAvailable: true, answersRecorded: 1,
        stages: { started: true, interviewCompleted: true, reportBuilt: true, sessionClosed: true }, blockers: [] }
    }
  };
}

const sink = createInMemoryPrivateBetaOperationalSink();
let sessionRunnerCalls = 0;
let receivedInput = null;
const journeyOptions = {
  modelAdapter: async () => ({}),
  operationalSink: sink,
  now: makeNow(),
  betaSessionIdFactory: ids("me01b"),
  betaSessionTokenFactory: () => "me01b-resume-token-123456789012345678901234",
  sessionRunner: async (input) => { sessionRunnerCalls += 1; receivedInput = input; return completedSessionResult(input.betaSession.sessionId); }
};

const positive = await runPrivateBetaUiJourneyEntryPoint({
  uiInput: {
    identityAction: "create", workingMode: "independent", consentDecision: "accept",
    targetRole: "Product Operations Manager", cvText: "AUTHORIZED CV", userNotes: "AUTHORIZED PERSON NOTES", jdText: "AUTHORIZED JD",
    answers: "Presentazione libera del percorso.\n\nEsempio concreto di responsabilità.", feedbackAction: "skip",
    uiLocale: "it", sessionLocale: "it"
  }, ...journeyOptions
});
assert.equal(positive.completed, true);
assert.equal(sessionRunnerCalls, 1);
assert.equal(receivedInput.cvText, "AUTHORIZED CV");
assert.equal(receivedInput.jdText, "AUTHORIZED JD");
assert.equal(receivedInput.userNotes, "AUTHORIZED PERSON NOTES");
assert.equal(receivedInput.answers.length, 2);
assert.equal(positive.report.available, true);
assert.equal(positive.feedback.status, "skipped");
assert.equal(positive.betaSession.status, "completed");
assert.deepEqual(sink.getEvents().map(e => e.eventType), ["session_started", "session_completed"]);

let refusedReads = 0;
const refusedInput = { identityAction: "create", workingMode: "independent", consentDecision: "refuse", feedbackAction: "skip" };
Object.defineProperty(refusedInput, "cvText", { get() { refusedReads += 1; return "MUST NOT READ"; } });
Object.defineProperty(refusedInput, "jdText", { get() { refusedReads += 1; return "MUST NOT READ"; } });
const refused = await runPrivateBetaUiJourneyEntryPoint({ uiInput: refusedInput, ...journeyOptions });
assert.equal(refused.completed, false);
assert.equal(refused.error.code, "CONSENT_REFUSED");
assert.equal(refusedReads, 0);

const submitted = await runPrivateBetaUiJourneyEntryPoint({
  uiInput: {
    identityAction: "create", workingMode: "independent", consentDecision: "accept", targetRole: "Role",
    cvText: "CV", jdText: "JD", answers: "Opening", feedbackAction: "submit", feedbackComment: "Utile", uiLocale: "it"
  }, ...journeyOptions
});
assert.equal(submitted.feedback.status, "submitted");
assert.equal(submitted.feedback.comment, "Utile");

const interrupted = await runPrivateBetaUiJourneyEntryPoint({
  uiInput: { identityAction: "create", workingMode: "independent", consentDecision: "accept", interruptionRequested: true, cvText: "CV", jdText: "JD" },
  ...journeyOptions
});
assert.equal(interrupted.status, "interrupted");

let httpEntrypointCalls = 0;
const server = createPrivateBetaUiServer({
  locale: "it",
  journeyEntryPoint: async ({ uiInput }) => {
    httpEntrypointCalls += 1;
    return runPrivateBetaUiJourneyEntryPoint({ uiInput, ...journeyOptions });
  }
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
const page = await fetch(`http://127.0.0.1:${port}/private-beta`);
const html = await page.text();
assert.equal(page.status, 200);
assert.ok(html.includes('action="/private-beta/journey"'));
assert.ok(html.includes('name="consentDecision"'));
assert.ok(html.includes('name="cvText"'));
assert.ok(html.includes('name="userNotes"'));
assert.ok(html.indexOf('name="userNotes"') < html.indexOf('name="jdText"'));
assert.ok(html.includes('name="feedbackAction"'));
const response = await fetch(`http://127.0.0.1:${port}/private-beta/journey`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ identityAction:"create", workingMode:"independent", consentDecision:"accept", targetRole:"Role", cvText:"CV", jdText:"JD", answers:"Opening", feedbackAction:"skip", uiLocale:"it", sessionLocale:"it" })
});
const responseHtml = await response.text();
assert.equal(response.status, 200);
assert.equal(httpEntrypointCalls, 1);
assert.ok(responseHtml.includes('id="beta-result"'));
await new Promise(resolve => server.close(resolve));

// Localization: newly introduced visible text lives in resource files, not renderer constants.
const rendererSource = await (await import("fs/promises")).readFile(new URL("../src/app/renderPrivateBetaUiJourneyHtml.js", import.meta.url), "utf8");
for (const phrase of ["Completa i passaggi in ordine", "Avvia esperienza Beta", "Privacy e consenso", "Invia feedback"]) {
  assert.equal(rendererSource.includes(phrase), false);
}

console.log("ME-01B Real Beta UI Journey Integration tests PASSED");
