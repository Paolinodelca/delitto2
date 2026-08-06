import assert from "assert";
import {
  startPrivateBetaOnboarding,
  advancePrivateBetaOnboarding,
  resumePrivateBetaOnboarding
} from "../src/app/privateBetaOnboarding.js";

const started = startPrivateBetaOnboarding();
assert.equal(started.status, "in_progress");
assert.equal(started.currentStep, "identity_state");
assert.deepEqual(started.step.choices.map((choice) => choice.id), ["create", "recover"]);
assert.equal(started.step.choices.length <= 3, true);
assert.equal(Object.isFrozen(started), true);
assert.equal(Object.isFrozen(started.step), true);
assert.equal(Object.isFrozen(started.resumeToken), true);

const identitySelected = advancePrivateBetaOnboarding(started, "recover");
assert.equal(identitySelected.currentStep, "working_mode");
assert.equal(identitySelected.selections.identityState, "recover");
assert.deepEqual(identitySelected.step.choices.map((choice) => choice.id), ["independent", "with_tutor"]);
assert.match(identitySelected.step.help, /non concede accesso/i);

const resumed = resumePrivateBetaOnboarding(JSON.parse(JSON.stringify(identitySelected.resumeToken)));
assert.deepEqual(resumed, identitySelected);

const independent = advancePrivateBetaOnboarding(identitySelected, "independent");
assert.equal(independent.currentStep, "immediate_goal");
assert.deepEqual(independent.step.choices.map((choice) => choice.id), [
  "understand_professional_impression",
  "prepare_interview",
  "improve_cv"
]);
assert.equal(independent.step.choices.length, 3);

const completed = advancePrivateBetaOnboarding(independent, "prepare_interview");
assert.equal(completed.status, "completed");
assert.equal(completed.completed, true);
assert.equal(completed.currentStep, null);
assert.equal(completed.step, null);
assert.deepEqual(completed.selections, {
  identityState: "recover",
  workingMode: "independent",
  immediateGoal: "prepare_interview"
});
assert.deepEqual(resumePrivateBetaOnboarding(completed.resumeToken), completed);

const tutor = advancePrivateBetaOnboarding(
  advancePrivateBetaOnboarding(startPrivateBetaOnboarding(), "create"),
  "with_tutor"
);
assert.deepEqual(tutor.step.choices.map((choice) => choice.id), [
  "organize_candidate_information",
  "build_professional_narrative",
  "prepare_candidate"
]);
assert.match(tutor.step.help, /Potrai affrontare gli altri/i);

assert.throws(
  () => advancePrivateBetaOnboarding(started, "unknown"),
  /PRIVATE_BETA_ONBOARDING_INVALID_CHOICE: identity_state/
);
assert.throws(
  () => advancePrivateBetaOnboarding(completed, "prepare_interview"),
  /PRIVATE_BETA_ONBOARDING_ALREADY_COMPLETED/
);
assert.throws(
  () => resumePrivateBetaOnboarding({ version: "1.0", selections: { identityState: null, workingMode: "with_tutor" } }),
  /PRIVATE_BETA_ONBOARDING_INVALID_RESUME_TOKEN/
);
assert.throws(
  () => resumePrivateBetaOnboarding({ version: "1.0", selections: { identityState: "create", workingMode: "with_tutor", immediateGoal: "improve_cv" } }),
  /PRIVATE_BETA_ONBOARDING_INVALID_RESUME_TOKEN/
);

console.log("Private Beta onboarding foundation tests PASSED");
