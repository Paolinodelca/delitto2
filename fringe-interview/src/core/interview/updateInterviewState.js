/**
 * FRINGE Interview Engine
 *
 * Mantiene e aggiorna lo stato dinamico del colloquio.
 *
 * Il colloquio non procede per "numero di domanda",
 * ma per copertura progressiva dei segnali da rendere osservabili.
 *
 * Questo modulo NON genera il report.
 * Questo modulo NON valuta la persona.
 * Questo modulo aggiorna lo stato delle evidenze raccolte.
 */

export function updateInterviewState({
  interviewState = {},
  lastAnswer = {},
  evidenceCollectionPlan = {},
  observedEvidence = {}
} = {}) {
  return {
    ...interviewState,

    lastAnswer,

    lastObservedEvidence: observedEvidence,

    evidenceCollectionPlan,

    updatedAt: new Date().toISOString(),

    extensions: {
      ...(interviewState?.extensions || {})
    }
  };
}

export default updateInterviewState;