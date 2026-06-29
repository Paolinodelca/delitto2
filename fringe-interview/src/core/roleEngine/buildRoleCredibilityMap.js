/**
 * FRINGE Role Engine
 *
 * Costruisce la Role Credibility Map partendo dal
 * Role Understanding.
 *
 * NON genera domande.
 * NON interpreta il candidato.
 * Descrive solamente ciò che il ruolo richiede
 * affinché un candidato risulti credibile.
 */

export function buildRoleCredibilityMap({
  roleUnderstanding,
  candidateContext,
  targetContext
}) {
  return {
    roleTitle: "",
    seniority: "",
    confidence: 0,

    stablePillars: [],

    roleSpecificSignals: [],

    extensions: {}
  };
}