import { mkdir, readFile, rename, unlink, writeFile } from "fs/promises";
import path from "path";
import { clone, normalizeString, resumeTokenMatches } from "../shared.js";
import { validateBetaSession } from "../validateBetaSession.js";
function safeFileName(sessionId) { const normalized = normalizeString(sessionId); if (!/^[A-Za-z0-9_-]+$/.test(normalized)) throw new Error("sessionId contains unsupported characters."); return `${normalized}.json`; }
function validateStored(session) { const validation = validateBetaSession(session); if (!validation.valid) throw new Error(`Stored beta session is invalid: ${validation.errors.join("; ")}`); }
function assertRevision(existing, incoming, expectedRevision) {
  if (!existing) { if (incoming.revision !== 1) throw new Error("New beta sessions must start at revision 1."); if (expectedRevision !== undefined && expectedRevision !== 0) throw new Error("Expected revision for a new beta session must be 0."); return; }
  const expected = expectedRevision ?? (incoming.revision - 1);
  if (expected !== existing.revision) throw new Error(`Beta session revision conflict: expected ${expected}, stored ${existing.revision}.`);
  if (incoming.revision !== existing.revision + 1) throw new Error("Beta session revision must increase by exactly one.");
}
export function createJsonFileBetaSessionStore({ storageDirectory } = {}) {
  const root = path.resolve(storageDirectory || path.join("tmp", "beta-sessions"));
  return {
    async save({ session, resumeToken, expectedRevision } = {}) {
      const validation = validateBetaSession(session); if (!validation.valid) throw new Error(`Cannot save invalid beta session: ${validation.errors.join("; ")}`);
      await mkdir(root, { recursive: true }); const target = path.join(root, safeFileName(session.sessionId));
      let existing = null;
      try { existing = JSON.parse(await readFile(target, "utf8")); validateStored(existing); } catch (error) { if (error?.code === "ENOENT") existing = null; else if (error instanceof SyntaxError) throw new Error(`Stored beta session JSON is invalid: ${error.message}`); else throw error; }
      if (existing && (existing.sessionId !== session.sessionId || existing.testerId !== session.testerId || existing.resumeTokenHash !== session.resumeTokenHash)) throw new Error("Stored beta session identity cannot be changed.");
      const expectedHash = existing?.resumeTokenHash || session.resumeTokenHash;
      if (!resumeTokenMatches(resumeToken, expectedHash)) throw new Error("Invalid resume credentials.");
      assertRevision(existing, session, expectedRevision);
      const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
      try { await writeFile(temporary, `${JSON.stringify(session, null, 2)}\n`, { encoding: "utf8", flag: "wx" }); await rename(temporary, target); }
      catch (error) { await unlink(temporary).catch(() => {}); throw error; }
      return clone(session);
    },
    async load({ sessionId, resumeToken } = {}) {
      const target = path.join(root, safeFileName(sessionId)); let session;
      try { session = JSON.parse(await readFile(target, "utf8")); } catch (error) { if (error?.code === "ENOENT") return null; if (error instanceof SyntaxError) throw new Error(`Stored beta session JSON is invalid: ${error.message}`); throw error; }
      validateStored(session);
      if (!resumeTokenMatches(resumeToken, session.resumeTokenHash)) throw new Error("Invalid resume credentials.");
      return clone(session);
    }
  };
}
export default createJsonFileBetaSessionStore;
