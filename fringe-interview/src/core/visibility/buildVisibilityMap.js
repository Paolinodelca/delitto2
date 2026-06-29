/**
 * FRINGE Visibility Engine
 *
 * Confronta:
 *
 * Role Credibility Map
 *
 * con
 *
 * Observed Evidence Map
 */

export function buildVisibilityMap({
  roleCredibilityMap,
  observedEvidenceMap
}) {
  return {
    visibleStrengths: [],
    underVisibleSignals: [],
    recoverableSignals: [],
    priorityOpportunities: [],
    extensions: {}
  };
}