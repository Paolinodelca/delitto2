import { loadStructuredQuestionBank } from "../src/interview/loadStructuredQuestionBank.js";
import { rankStructuredQuestions } from "../src/interview/rankStructuredQuestions.js";
import { deriveQuestionSelectionStrategy } from "../src/interview/deriveQuestionSelectionStrategy.js";
import { selectQuestionToneVariant } from "../src/interview/selectQuestionToneVariant.js";
import { buildStructuredInterviewPreview } from "../src/interview/buildStructuredInterviewPreview.js";

function runScenario(label, mockProfile) {
  console.log(`\n==============================`);
  console.log(`SCENARIO: ${label}`);
  console.log(`==============================\n`);

  const interviewContextProfile = {
    version: 1,
    ...mockProfile
  };

  const { structuredQuestionBank } = loadStructuredQuestionBank();

  const rankedResult = rankStructuredQuestions({
    interviewContextProfile,
    structuredQuestionBank
  });

  const { questionSelectionStrategy } = deriveQuestionSelectionStrategy({
    interviewContextProfile,
    rankedStructuredQuestions: rankedResult?.rankedStructuredQuestions
  });

  const resolvedResult = selectQuestionToneVariant({
    structuredQuestionBank,
    questionSelectionStrategy
  });

  const { structuredInterviewPreview } = buildStructuredInterviewPreview({
    interviewContextProfile,
    questionSelectionStrategy,
    resolvedStructuredQuestions: resolvedResult?.resolvedStructuredQuestions
  });

  console.log("Context:");
  console.log(JSON.stringify(interviewContextProfile, null, 2));

  console.log("\nStrategy:");
  console.log(JSON.stringify(questionSelectionStrategy, null, 2));

  console.log("\nTimeline:");
  structuredInterviewPreview.previewTimeline.forEach((q) => {
    console.log(
      `${q.order}. [${q.stage}] ${q.key}\n   → ${q.prompt}`
    );
  });
}

function main() {
  runScenario("JUNIOR - SUPPORTIVE", {
    seniorityContext: "junior",
    companyContext: "corporate_structured",
    defaultTone: "supportive",
    personPerceptionFocus: ["curiosity", "coachability", "energy"],
    questionStrategyBias: ["potential", "clarity", "team_fit"]
  });

  runScenario("LEAD - INCISIVE", {
    seniorityContext: "lead",
    companyContext: "corporate_structured",
    defaultTone: "incisive",
    personPerceptionFocus: ["decisiveness", "composure_under_pressure"],
    questionStrategyBias: ["validation", "decision_quality", "leadership_signal"]
  });

  runScenario("CONSULTANCY - PRESSURE", {
    seniorityContext: "senior",
    companyContext: "consultancy_client_facing",
    defaultTone: "pressure",
    personPerceptionFocus: ["resilience", "client_handling", "speed"],
    questionStrategyBias: ["pressure_test", "clarity", "delivery"]
  });
}

main();