import loadQuestionRelevanceMatrix from "../src/interview/loadQuestionRelevanceMatrix.js";
import evaluateQuestionFamilyRelevance from "../src/interview/evaluateQuestionFamilyRelevance.js";

async function main() {
  const matrix = await loadQuestionRelevanceMatrix();

  const scenarios = [
    {
      label: "Junior operational role",
      seniority: "junior",
      roleTraits: {
        leadership: false,
        stakeholder_exposure: false,
        execution_intensity: true
      }
    },
    {
      label: "Mid project / coordination role",
      seniority: "mid",
      roleTraits: {
        leadership: true,
        stakeholder_exposure: true,
        execution_intensity: true
      }
    },
    {
      label: "Senior leadership role",
      seniority: "senior",
      roleTraits: {
        leadership: true,
        stakeholder_exposure: true,
        execution_intensity: false
      }
    }
  ];

  const familyKeys = [
    "opening_positioning",
    "role_fit",
    "motivation_for_change",
    "decision_tradeoff",
    "conflict_pressure",
    "ownership_scope",
    "learning_reflection",
    "profile_gap_management"
  ];

  for (const scenario of scenarios) {
    console.log(`\n=== ${scenario.label} ===`);

    for (const familyKey of familyKeys) {
      const result = evaluateQuestionFamilyRelevance({
        matrix,
        familyKey,
        seniority: scenario.seniority,
        roleTraits: scenario.roleTraits
      });

      console.log(
        `${familyKey} -> band=${result.band} score=${result.score} reasons=${result.reasons.join(", ")}`
      );
    }
  }
}

main().catch((error) => {
  console.error("test_question_relevance_matrix failed.");
  console.error(error);
  process.exit(1);
});