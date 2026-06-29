/**
 * FRINGE Action Engine
 *
 * Trasforma la Visibility Map
 * in azioni concrete.
 */

export function buildActionPlan({
  visibilityMap
}) {
  return {
    priorities: [],
    checklist: [],
    answerStrategy: [],
    cvStrategy: [],
    extensions: {}
  };
}