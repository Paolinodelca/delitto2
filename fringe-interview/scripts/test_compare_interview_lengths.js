import { loadStructuredQuestionBank } from "../src/interview/loadStructuredQuestionBank.js";
import { rankStructuredQuestions } from "../src/interview/rankStructuredQuestions.js";
import { deriveQuestionSelectionStrategy } from "../src/interview/deriveQuestionSelectionStrategy.js";
import { selectQuestionToneVariant } from "../src/interview/selectQuestionToneVariant.js";
import { buildStructuredInterviewPreview } from "../src/interview/buildStructuredInterviewPreview.js";

const baseContextProfile = {
  version: 1,
  seniorityContext: "lead",
  companyContext: "corporate_structured",
  defaultTone: "incisive",
  personPerceptionFocus: ["decisiveness", "composure_under_pressure"],
  questionStrategyBias: ["validation", "decision_quality", "leadership_signal"]
};

function runLengthScenario(interviewLengthMode) {
  console.log(`\n==============================`);
  console.log(`INTERVIEW LENGTH MODE: ${interviewLengthMode}`);
  console.log(`==============================\n`);

  const { structuredQuestionBank } = loadStructuredQuestionBank();

  const rankedResult = rankStructuredQuestions({
    interviewContextProfile: baseContextProfile,
    structuredQuestionBank
  });

  const { questionSelectionStrategy } = deriveQuestionSelectionStrategy({
    interviewContextProfile: baseContextProfile,
    rankedStructuredQuestions: rankedResult?.rankedStructuredQuestions,
    interviewLengthMode
  });

  const resolvedResult = selectQuestionToneVariant({
    structuredQuestionBank,
    questionSelectionStrategy
  });

  const { structuredInterviewPreview } = buildStructuredInterviewPreview({
    interviewContextProfile: baseContextProfile,
    questionSelectionStrategy,
    resolvedStructuredQuestions: resolvedResult?.resolvedStructuredQuestions
  });

  console.log("Strategy:");
  console.log(JSON.stringify(questionSelectionStrategy, null, 2));

  console.log("\nTimeline:");
  structuredInterviewPreview.previewTimeline.forEach((q) => {
    console.log(`${q.order}. [${q.stage}] ${q.key}`);
    console.log(`   → ${q.prompt}`);
  });
}

function main() {
  runLengthScenario("short");
  runLengthScenario("standard");
  runLengthScenario("deep");
}

main();