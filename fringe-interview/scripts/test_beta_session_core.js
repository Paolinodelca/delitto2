import assert from "assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import {
  attachBetaSessionResult,
  buildBetaSessionResumeState,
  createBetaSession,
  createJsonFileBetaSessionStore,
  createMemoryBetaSessionStore,
  transitionBetaSession,
  updateBetaSessionProgress,
  validateBetaSession
} from "../src/session/index.js";
import { hashResumeToken } from "../src/session/shared.js";

const t = {
  created: "2026-07-21T10:00:00.000Z", started: "2026-07-21T10:01:00.000Z",
  progress: "2026-07-21T10:02:00.000Z", interrupted: "2026-07-21T10:03:00.000Z",
  resumed: "2026-07-21T10:04:00.000Z", result: "2026-07-21T10:05:00.000Z",
  completed: "2026-07-21T10:06:00.000Z"
};
function factories(seed = "alpha-token-") { let i = 0; return { idFactory: () => `${seed}${++i}`, tokenFactory: () => seed.repeat(8).slice(0, 48) }; }
function create(seed) { return createBetaSession({ now: () => t.created, ...factories(seed) }); }
function invalidCopy(session, mutate) { const copy = structuredClone(session); mutate(copy); return validateBetaSession(copy); }

async function storeContract(store, jsonRoot = null) {
  const created = create("store-token-");
  assert.equal(created.session.revision, 1);
  await store.save({ ...created, expectedRevision: 0 });
  const loaded = await store.load({ sessionId: created.session.sessionId, resumeToken: created.resumeToken });
  assert.deepEqual(loaded, created.session);

  const started = transitionBetaSession(loaded, { toStatus: "in_progress", interviewStatus: "in_progress", currentStep: "interview", now: () => t.started });
  await store.save({ session: started, resumeToken: created.resumeToken, expectedRevision: 1 });
  const progressed = updateBetaSessionProgress(started, { currentStep: "CASE_1", inputRefs: [{ type: "input_source", id: "cv" }], runtimeRef: { type: "interview_runtime", id: "runtime-1" }, now: () => t.progress });
  await store.save({ session: progressed, resumeToken: created.resumeToken, expectedRevision: 2 });

  const concurrentA = transitionBetaSession(progressed, { toStatus: "interrupted", now: () => t.interrupted });
  const concurrentB = updateBetaSessionProgress(progressed, { currentStep: "CASE_2", now: () => t.interrupted });
  await store.save({ session: concurrentA, resumeToken: created.resumeToken, expectedRevision: 3 });
  await assert.rejects(() => store.save({ session: concurrentB, resumeToken: created.resumeToken, expectedRevision: 3 }), /revision conflict/);
  await assert.rejects(() => store.save({ session: { ...concurrentA, revision: 6 }, resumeToken: created.resumeToken, expectedRevision: 4 }), /increase by exactly one|invalid beta session/i);
  await assert.rejects(() => store.save({ session: started, resumeToken: created.resumeToken, expectedRevision: 1 }), /revision conflict/);

  const interrupted = await store.load({ sessionId: created.session.sessionId, resumeToken: created.resumeToken });
  const resume = buildBetaSessionResumeState(interrupted);
  assert.equal(resume.revision, 4); assert.equal(resume.canResume, true); assert.equal("resumeTokenHash" in resume, false);
  const resumed = transitionBetaSession(interrupted, { toStatus: "in_progress", now: () => t.resumed });
  await store.save({ session: resumed, resumeToken: created.resumeToken, expectedRevision: 4 });
  const withResult = attachBetaSessionResult(resumed, { resultRef: { type: "final_candidate_report", id: "report-1" }, now: () => t.result });
  await store.save({ session: withResult, resumeToken: created.resumeToken, expectedRevision: 5 });
  const completed = transitionBetaSession(withResult, { toStatus: "completed", interviewStatus: "completed", currentStep: "report_ready", now: () => t.completed });
  await store.save({ session: completed, resumeToken: created.resumeToken, expectedRevision: 6 });
  assert.equal((await store.load({ sessionId: completed.sessionId, resumeToken: created.resumeToken })).revision, 7);
  await assert.rejects(() => store.load({ sessionId: completed.sessionId, resumeToken: "wrong-token-value-with-minimum-length-123" }), /Invalid resume credentials/);

  if (jsonRoot) {
    const [file] = await readdir(jsonRoot);
    const persisted = JSON.parse(await readFile(path.join(jsonRoot, file), "utf8"));
    assert.equal("resumeToken" in persisted, false); assert.equal(persisted.revision, 7);
    await writeFile(path.join(jsonRoot, file), "{broken", "utf8");
    await assert.rejects(() => store.load({ sessionId: completed.sessionId, resumeToken: created.resumeToken }), /JSON is invalid/);
  }
}

async function main() {
  const created = create("alpha-token-");
  assert.equal(created.session.schemaVersion, "1.1");
  assert.equal(created.session.revision, 1);
  assert.equal(created.session.resumeTokenHash, hashResumeToken(created.resumeToken));
  assert.equal("resumeToken" in created.session, false);
  assert.equal(validateBetaSession(created.session).valid, true);

  const sourceSnapshot = structuredClone(created.session);
  const started = transitionBetaSession(created.session, { toStatus: "in_progress", interviewStatus: "in_progress", now: () => t.started });
  assert.deepEqual(created.session, sourceSnapshot); assert.equal(created.session.revision, 1); assert.equal(started.revision, 2);
  const progressInput = [{ type: "input_source", id: "cv-1" }]; const progressSnapshot = structuredClone(progressInput);
  const progressed = updateBetaSessionProgress(started, { inputRefs: progressInput, runtimeRef: { type: "runtime", id: "r1" }, now: () => t.progress });
  assert.deepEqual(progressInput, progressSnapshot); assert.equal(progressed.revision, 3);
  assert.throws(() => updateBetaSessionProgress(progressed, { now: () => t.started }), /cannot precede|move backwards/);
  assert.throws(() => attachBetaSessionResult(created.session, { resultRef: { type: "report", id: "r" } }), /only to in-progress/);
  assert.throws(() => transitionBetaSession(created.session, { toStatus: "completed" }), /Invalid beta session transition/);

  const cases = [
    ["top extra", s => { s.extra = true; }], ["interview extra", s => { s.interview.extra = true; }],
    ["lifecycle extra", s => { s.lifecycle.extra = true; }], ["reference extra", s => { s.inputRefs = [{ type: "x", id: "y", extra: 1 }]; }],
    ["bad revision", s => { s.revision = 0; }], ["bad timestamp", s => { s.lifecycle.updatedAt = "not-a-date"; }],
    ["updated before created", s => { s.lifecycle.updatedAt = "2026-07-20T00:00:00.000Z"; }],
    ["interrupted before created", s => { s.status = "interrupted"; s.lifecycle.interruptedAt = "2026-07-20T00:00:00.000Z"; }],
    ["completed field on active", s => { s.lifecycle.completedAt = t.completed; }],
    ["illegal state pair", s => { s.status = "created"; s.interview.status = "in_progress"; }],
    ["runtime before start", s => { s.interview.runtimeRef = { type: "runtime", id: "r" }; }],
    ["result before start", s => { s.resultRef = { type: "report", id: "r" }; }]
  ];
  for (const [name, mutate] of cases) assert.equal(invalidCopy(created.session, mutate).valid, false, name);

  const interrupted = transitionBetaSession(progressed, { toStatus: "interrupted", now: () => t.interrupted });
  assert.equal(interrupted.lifecycle.interruptedAt, t.interrupted);
  const resumed = transitionBetaSession(interrupted, { toStatus: "in_progress", now: () => t.resumed });
  assert.equal(resumed.lifecycle.interruptedAt, null);
  const withResult = attachBetaSessionResult(resumed, { resultRef: { type: "report", id: "r" }, now: () => t.result });
  const completed = transitionBetaSession(withResult, { toStatus: "completed", interviewStatus: "completed", now: () => t.completed });
  assert.throws(() => updateBetaSessionProgress(completed, { currentStep: "x" }), /cannot be updated/);

  await storeContract(createMemoryBetaSessionStore());
  const root = await mkdtemp(path.join(os.tmpdir(), "imago-beta-session-"));
  try { await storeContract(createJsonFileBetaSessionStore({ storageDirectory: root }), root); }
  finally { await rm(root, { recursive: true, force: true }); }
  console.log("test_beta_session_core PASS");
}
main().catch(error => { console.error("test_beta_session_core FAIL"); console.error(error); process.exit(1); });
