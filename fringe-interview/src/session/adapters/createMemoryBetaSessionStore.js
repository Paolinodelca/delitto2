import { clone, resumeTokenMatches } from "../shared.js";
import { validateBetaSession } from "../validateBetaSession.js";
function assertRevision(existing, incoming, expectedRevision) {
  if (!existing) {
    if (incoming.revision !== 1) throw new Error("New beta sessions must start at revision 1.");
    if (expectedRevision !== undefined && expectedRevision !== 0) throw new Error("Expected revision for a new beta session must be 0.");
    return;
  }
  const expected = expectedRevision ?? (incoming.revision - 1);
  if (expected !== existing.revision) throw new Error(`Beta session revision conflict: expected ${expected}, stored ${existing.revision}.`);
  if (incoming.revision !== existing.revision + 1) throw new Error("Beta session revision must increase by exactly one.");
}
export function createMemoryBetaSessionStore() {
  const sessions = new Map();
  return {
    async save({ session, resumeToken, expectedRevision } = {}) {
      const validation = validateBetaSession(session);
      if (!validation.valid) throw new Error(`Cannot save invalid beta session: ${validation.errors.join("; ")}`);
      const existing = sessions.get(session.sessionId);
      if (existing && (existing.testerId !== session.testerId || existing.resumeTokenHash !== session.resumeTokenHash)) throw new Error("Stored beta session identity cannot be changed.");
      const expectedHash = existing?.resumeTokenHash || session.resumeTokenHash;
      if (!resumeTokenMatches(resumeToken, expectedHash)) throw new Error("Invalid resume credentials.");
      assertRevision(existing, session, expectedRevision);
      sessions.set(session.sessionId, clone(session));
      return clone(session);
    },
    async load({ sessionId, resumeToken } = {}) {
      const session = sessions.get(sessionId); if (!session) return null;
      if (!resumeTokenMatches(resumeToken, session.resumeTokenHash)) throw new Error("Invalid resume credentials.");
      return clone(session);
    }
  };
}
export default createMemoryBetaSessionStore;
