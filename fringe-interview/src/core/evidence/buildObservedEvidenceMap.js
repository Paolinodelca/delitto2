/**
 * FRINGE Evidence Engine
 *
 * Trasforma CV e risposte
 * in evidenze osservabili.
 */

export function buildObservedEvidenceMap({
  interviewState
}) {
  return {
    evidenceItems: [],
    notObserved: [],
    extensions: {}
  };
}