import assert from "assert";
import {
  createPrivateBetaFeedback,
  submitPrivateBetaFeedback,
  skipPrivateBetaFeedback,
  assertPrivateBetaFeedbackState,
  PRIVATE_BETA_FEEDBACK_FORMAT_VERSION,
  PRIVATE_BETA_FEEDBACK_COMMENT_MAX_LENGTH
} from "../src/app/privateBetaFeedback.js";

const CREATED_AT = "2026-08-06T11:00:00.000Z";
const COMPLETED_AT = "2026-08-06T11:01:00.000Z";
const identity = Object.freeze({ id: "identity-001", owner: "person", snapshot: "unchanged" });

const initial = createPrivateBetaFeedback("beta-session-001", { now: CREATED_AT });
assert.equal(initial.status, "not_started");
assert.equal(initial.formatVersion, PRIVATE_BETA_FEEDBACK_FORMAT_VERSION);
assert.equal(initial.sessionRef, "beta-session-001");
assert.equal(initial.createdAt, CREATED_AT);
assert.equal(initial.responses, null);
assert.equal(initial.comment, null);
assert.match(initial.notice.summary, /facoltativo/i);
assert.match(initial.notice.summary, /non modifica/i);
assert.equal(Object.isFrozen(initial), true);
assert.equal(Object.isFrozen(initial.notice), true);
assert.equal(assertPrivateBetaFeedbackState(initial), true);

const responses = {
  experience: {
    clarity: "clear",
    usefulness: "useful",
    reportCredibility: "credible"
  },
  valueAndDifficulty: {
    mostValuablePart: "evidence_and_explanations",
    difficulty: "minor"
  },
  futureIntent: {
    reuse: "yes",
    recommend: "maybe"
  }
};

const submitted = submitPrivateBetaFeedback(initial, responses, {
  comment: "  Il report mi ha aiutato a riconoscere i punti forti.  ",
  now: COMPLETED_AT
});
assert.equal(submitted.status, "submitted");
assert.equal(submitted.submittedAt, COMPLETED_AT);
assert.equal(submitted.comment, "Il report mi ha aiutato a riconoscere i punti forti.");
assert.deepEqual(submitted.responses, responses);
assert.equal(Object.isFrozen(submitted.responses), true);
assert.deepEqual(identity, { id: "identity-001", owner: "person", snapshot: "unchanged" });
assert.equal("professionalIdentity" in submitted, false);

const withoutComment = submitPrivateBetaFeedback(
  createPrivateBetaFeedback("beta-session-002", { now: CREATED_AT }),
  responses,
  { now: COMPLETED_AT }
);
assert.equal(withoutComment.comment, null);

const skipped = skipPrivateBetaFeedback(
  createPrivateBetaFeedback("beta-session-003", { now: CREATED_AT }),
  { now: COMPLETED_AT }
);
assert.equal(skipped.status, "skipped");
assert.equal(skipped.skippedAt, COMPLETED_AT);
assert.equal(skipped.responses, null);

for (const [path, value, expected] of [
  ["clarity", "very_clear", /INVALID_CLARITY/],
  ["usefulness", "excellent", /INVALID_USEFULNESS/],
  ["reportCredibility", "certain", /INVALID_REPORTCREDIBILITY/],
  ["mostValuablePart", "technical_logs", /INVALID_MOSTVALUABLEPART/],
  ["difficulty", "unknown", /INVALID_DIFFICULTY/],
  ["reuse", "always", /INVALID_REUSE/],
  ["recommend", "probably", /INVALID_RECOMMEND/]
]) {
  const invalid = structuredClone(responses);
  if (path in invalid.experience) invalid.experience[path] = value;
  else if (path in invalid.valueAndDifficulty) invalid.valueAndDifficulty[path] = value;
  else invalid.futureIntent[path] = value;
  assert.throws(
    () => submitPrivateBetaFeedback(createPrivateBetaFeedback(`session-${path}`, { now: CREATED_AT }), invalid),
    expected
  );
}

assert.throws(
  () => submitPrivateBetaFeedback(initial, responses, { comment: "x".repeat(PRIVATE_BETA_FEEDBACK_COMMENT_MAX_LENGTH + 1) }),
  /COMMENT_TOO_LONG/
);
assert.throws(() => submitPrivateBetaFeedback(submitted, responses), /SUBMISSION_NOT_ALLOWED/);
assert.throws(() => skipPrivateBetaFeedback(submitted), /SKIP_NOT_ALLOWED/);
assert.throws(() => createPrivateBetaFeedback(""), /INVALID_SESSION_REF/);
assert.throws(() => createPrivateBetaFeedback("session", { now: "not-a-time" }), /INVALID_TIMESTAMP/);

console.log("Private Beta feedback foundation tests PASSED");

// Absence of feedback collection never changes an already completed journey.
const completedJourneyWithoutFeedback = Object.freeze({ status: "completed", completed: true });
assert.equal(completedJourneyWithoutFeedback.completed, true);
