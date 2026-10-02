const QUESTION_OBJECTIVES = Object.freeze({
  decision_tradeoffs: Object.freeze(["decision_tradeoff_accountability"])
});
const OBJECTIVE_ACTIONS = Object.freeze({
  decision_tradeoff_accountability: Object.freeze(["decision_tradeoff_probe", "decision_tradeoffs"])
});

function text(value) { return typeof value === "string" ? value.trim() : ""; }
function actionKey(value) { return text(value).replace(/^interviewQuestion:/, ""); }

function expectedDaRuntimeSessionRef(planning) {
  const purpose = Array.isArray(planning?.purposes)
    ? planning.purposes.find((item) => item?.goal === "decision_accountability")
    : null;
  return purpose?.runtimeSession?.id
    ? `knowledgeAcquisitionRuntimeSession:${purpose.runtimeSession.id}`
    : "";
}

function provesObjectiveSatisfaction(item, expectedRuntimeSessionRef) {
  if (!item || item.semanticType !== "decision_accountability") return false;
  if (!item.knowledgeSnapshot || !text(item.knowledgeRef || item.knowledgeSnapshot?.snapshotId)) return false;
  if (!text(item.sourceExecutionRef) || !text(item.sourceEvidenceRef)) return false;
  if (!expectedRuntimeSessionRef || text(item.sourceRuntimeSessionRef) !== expectedRuntimeSessionRef) return false;
  if (item?.semanticExecutionTrace?.status && item.semanticExecutionTrace.status !== "succeeded") return false;
  if (item?.semanticExecutionTrace?.category && item.semanticExecutionTrace.category !== "knowledge_produced") return false;
  return OBJECTIVE_ACTIONS.decision_tradeoff_accountability.includes(actionKey(item.sourceRuntimeActionRef));
}

export function evaluateDecisionTradeoffQuestionNecessity({ questionKey, planning, runtimeKnowledgeResults } = {}) {
  if (text(questionKey) !== "decision_tradeoffs") {
    return Object.freeze({ applicable: false, decision: "preserve", reasonCode: "question_not_pd050_bounded" });
  }
  const objectives = QUESTION_OBJECTIVES.decision_tradeoffs;
  const expectedRuntimeSessionRef = expectedDaRuntimeSessionRef(planning);
  if (!expectedRuntimeSessionRef) {
    return Object.freeze({ applicable: true, decision: "preserve", reasonCode: "objective_lineage_unavailable", objectives });
  }
  const satisfied = (Array.isArray(runtimeKnowledgeResults) ? runtimeKnowledgeResults : [])
    .some((item) => provesObjectiveSatisfaction(item, expectedRuntimeSessionRef));
  return Object.freeze({
    applicable: true,
    decision: satisfied ? "suppress" : "preserve",
    reasonCode: satisfied ? "all_pd050_objectives_satisfied" : "decision_tradeoff_accountability_unsatisfied",
    objectives
  });
}

export const PD050_DECISION_TRADEOFF_OBJECTIVES = QUESTION_OBJECTIVES;
