import assert from "assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
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
  c: "2026-07-22T08:00:00.000Z", a: "2026-07-22T08:01:00.000Z", b: "2026-07-22T08:02:00.000Z",
  d: "2026-07-22T08:03:00.000Z", e: "2026-07-22T08:04:00.000Z", f: "2026-07-22T08:05:00.000Z"
};
const factories = () => ({ idFactory: (() => { let i = 0; return () => `hard-${++i}`; })(), tokenFactory: () => "hardening-token-".repeat(4) });
function created() { return createBetaSession({ now: () => t.c, ...factories() }); }
function invalidCopy(session, mutate) { const copy = structuredClone(session); mutate(copy); return validateBetaSession(copy); }

async function storeContract(store) {
  const value = created();
  assert.equal(value.session.revision, 1);
  await store.save({ ...value, expectedRevision: 0 });
  const base = await store.load({ sessionId: value.session.sessionId, resumeToken: value.resumeToken });
  const updateA = transitionBetaSession(base, { toStatus: "in_progress", interviewStatus: "in_progress", now: () => t.a });
  const updateB = transitionBetaSession(base, { toStatus: "interrupted", now: () => t.a });
  assert.equal(updateA.revision, 2); assert.equal(updateB.revision, 2);
  await store.save({ session: updateA, resumeToken: value.resumeToken, expectedRevision: 1 });
  await assert.rejects(() => store.save({ session: updateB, resumeToken: value.resumeToken, expectedRevision: 1 }), /revision conflict/);
  const jumped = structuredClone(updateA); jumped.revision = 4; jumped.lifecycle.updatedAt = t.b;
  await assert.rejects(() => store.save({ session: jumped, resumeToken: value.resumeToken, expectedRevision: 2 }), /increase by exactly one/);
  const sameTimestamp = updateBetaSessionProgress(updateA, { currentStep: "same-time", now: () => t.a });
  await store.save({ session: sameTimestamp, resumeToken: value.resumeToken });
  assert.equal((await store.load({ sessionId: value.session.sessionId, resumeToken: value.resumeToken })).revision, 3);
  await assert.rejects(() => store.load({ sessionId: value.session.sessionId, resumeToken: "wrong-token-value-with-minimum-length-12345" }), /Invalid resume credentials/);
}

async function main() {
  const value = created(); const session = value.session;
  assert.equal(session.revision, 1); assert.equal(session.resumeTokenHash, hashResumeToken(value.resumeToken)); assert.equal("resumeToken" in session, false);
  assert.equal(validateBetaSession(session).valid, true);
  assert.equal(invalidCopy(session, s => { s.extra = true; }).valid, false);
  assert.equal(invalidCopy(session, s => { s.interview.extra = true; }).valid, false);
  assert.equal(invalidCopy(session, s => { s.lifecycle.extra = true; }).valid, false);
  assert.equal(invalidCopy(session, s => { s.inputRefs = [{ type: "x", id: "y", extra: 1 }]; }).valid, false);
  assert.equal(invalidCopy(session, s => { s.revision = 0; }).valid, false);
  assert.equal(invalidCopy(session, s => { s.lifecycle.updatedAt = "2026-07-21T00:00:00.000Z"; }).valid, false);
  assert.equal(invalidCopy(session, s => { s.lifecycle.interruptedAt = "bad"; }).valid, false);
  assert.equal(invalidCopy(session, s => { s.lifecycle.completedAt = t.a; }).valid, false);
  assert.equal(invalidCopy(session, s => { s.status = "completed"; s.interview.status = "completed"; s.lifecycle.completedAt = t.a; }).valid, false);
  assert.equal(invalidCopy(session, s => { s.interview.runtimeRef = { type: "runtime", id: "1" }; }).valid, false);
  assert.equal(invalidCopy(session, s => { s.status = "interrupted"; }).valid, false);

  const before = structuredClone(session);
  const started = transitionBetaSession(session, { toStatus: "in_progress", interviewStatus: "in_progress", now: () => t.a });
  assert.deepEqual(session, before); assert.equal(session.revision, 1); assert.equal(started.revision, 2);
  const progressed = updateBetaSessionProgress(started, { runtimeRef: { id: "r1", type: "runtime" }, inputRefs: [{ id: "b", type: "input" }, { type: "input", id: "a" }], now: () => t.b });
  assert.equal(progressed.revision, 3); assert.deepEqual(progressed.inputRefs.map(x => x.id), ["a", "b"]);
  const interrupted = transitionBetaSession(progressed, { toStatus: "interrupted", now: () => t.d });
  assert.equal(interrupted.lifecycle.interruptedAt, t.d);
  const resumed = transitionBetaSession(interrupted, { toStatus: "in_progress", now: () => t.e });
  assert.equal(resumed.lifecycle.interruptedAt, null);
  const linked = attachBetaSessionResult(resumed, { resultRef: { type: "report", id: "1" }, now: () => t.f });
  const completed = transitionBetaSession(linked, { toStatus: "completed", interviewStatus: "completed", now: () => t.f });
  assert.equal(completed.revision, 7); assert.equal(buildBetaSessionResumeState(completed).revision, 7); assert.equal(buildBetaSessionResumeState(completed).canResume, false);
  assert.throws(() => updateBetaSessionProgress(completed, { now: () => t.f }), /cannot be updated/);
  assert.throws(() => transitionBetaSession(completed, { toStatus: "in_progress", now: () => t.f }), /Invalid beta session transition/);
  assert.throws(() => updateBetaSessionProgress(started, { now: () => t.c }), /cannot precede/);
  assert.throws(() => attachBetaSessionResult(interrupted, { resultRef: { type: "report", id: "x" }, now: () => t.e }), /only to in-progress/);

  await storeContract(createMemoryBetaSessionStore());
  const root = await mkdtemp(path.join(os.tmpdir(), "imago-session-hardening-"));
  try {
    await storeContract(createJsonFileBetaSessionStore({ storageDirectory: root }));
    const corruptStore = createJsonFileBetaSessionStore({ storageDirectory: root });
    const corrupt = created();
    const file = path.join(root, `${corrupt.session.sessionId}.json`);
    await writeFile(file, "{invalid json", "utf8");
    await assert.rejects(() => corruptStore.load({ sessionId: corrupt.session.sessionId, resumeToken: corrupt.resumeToken }), /JSON/);
    await writeFile(file, JSON.stringify({ sessionId: corrupt.session.sessionId }), "utf8");
    await assert.rejects(() => corruptStore.load({ sessionId: corrupt.session.sessionId, resumeToken: corrupt.resumeToken }), /Stored beta session is invalid/);
    assert.ok((await readFile(file, "utf8")).length > 0);
  } finally { await rm(root, { recursive: true, force: true }); }
  console.log("test_beta_session_core_hardening PASS");
}
main().catch(error => { console.error("test_beta_session_core_hardening FAIL"); console.error(error); process.exit(1); });
