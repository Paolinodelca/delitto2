import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  deriveInterviewPlanFromJobFit,
  buildInterviewQuestionSet
} from "../src/interview/index.js";
import { runGroqParserModel } from "../src/parser/adapters/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", ...segments);
}

async function readJsonFile(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function writePrettyJson(filePath, data) {
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function printSection(title) {
  console.log(`\n=== ${title} ===`);
}

function extractPrimaryQuestionKeys(questionSetResult) {
  return (questionSetResult?.interviewQuestionSet?.contextualSelection
    ?.resolvedStructuredQuestions?.resolvedQuestions || [])
    .map((item) => item?.key)
    .filter(Boolean);
}

function extractPrimaryQuestionTexts(questionSetResult) {
  return (questionSetResult?.interviewQuestionSet?.primaryQuestions || [])
    .map((item) => item?.question)
    .filter(Boolean);
}

function extractPrimaryQuestionSources(questionSetResult) {
  return (questionSetResult?.interviewQuestionSet?.primaryQuestions || [])
    .map((item) => `${item?.narrativeRole || "UNKNOWN"}:${item?.source || "unknown"}`)
    .filter(Boolean);
}

function formatList(values) {
  return values.length > 0 ? values.join(" | ") : "(none)";
}


function buildQuestionModelAdapter() {
  return async ({ task, system, user }) => {
    const result = await runGroqParserModel({
      task,
      system,
      user,
      temperature: 0.2
    });

    return result?.outputText || "";
  };
}


async function main() {
  const pipelinePath = resolveProjectPath(
    "tmp",
    "parser-pipeline-groq",
    "full_parser_pipeline_result.json"
  );

  const outputDir = resolveProjectPath("tmp", "question-selection");
  await mkdir(outputDir, { recursive: true });

  const pipelineResult = await readJsonFile(pipelinePath);

  const candidateProfile = pipelineResult?.candidateProfile || null;
  const roleProfile = pipelineResult?.roleProfile || null;
  const jobFitAnalysis = pipelineResult?.jobFitAnalysis || null;

  const interviewPlanResult = deriveInterviewPlanFromJobFit({
    candidateProfile,
    roleProfile,
    jobFitAnalysis
  });

  const modelAdapter = buildQuestionModelAdapter();

  const baselineQuestionSetResult = await buildInterviewQuestionSet({
    interviewPlan: interviewPlanResult.interviewPlan,
    candidateProfile,
    roleProfile,
    jobFitAnalysis,
    modelAdapter
  });

  const recentQuestionKeys = [
    "transferability_examples",
    "decision_tradeoffs",
    "pressure_handling"
  ];

  const recentQuestionHistory = [
    {
      key: "transferability_examples",
      category: "role_fit",
      signals: ["transferability", "clarity", "ownership"]
    },
    {
      key: "decision_tradeoffs",
      category: "seniority_calibration",
      signals: ["decision_quality", "tradeoff_reasoning", "judgment"]
    },
    {
      key: "pressure_handling",
      category: "person_perception",
      signals: ["composure_under_pressure", "resilience", "prioritization"]
    }
  ];

  const rotatedQuestionSetResult = await buildInterviewQuestionSet({
    interviewPlan: interviewPlanResult.interviewPlan,
    candidateProfile,
    roleProfile,
    jobFitAnalysis,
    recentQuestionKeys,
    recentQuestionHistory,
    modelAdapter
  });

  await writePrettyJson(
    path.join(outputDir, "interview_plan.json"),
    interviewPlanResult
  );

  await writePrettyJson(
    path.join(outputDir, "interview_question_set_baseline.json"),
    baselineQuestionSetResult
  );

  await writePrettyJson(
    path.join(outputDir, "interview_question_set_rotated.json"),
    rotatedQuestionSetResult
  );

  await writePrettyJson(
    path.join(outputDir, "interview_question_set.json"),
    rotatedQuestionSetResult
  );

  printSection("Baseline Summary");
  console.log(
    "Interview style:",
    baselineQuestionSetResult?.interviewQuestionSet?.sessionStrategy?.interviewStyle || "(missing)"
  );

  console.log(
    "Primary questions count:",
    baselineQuestionSetResult?.interviewQuestionSet?.primaryQuestions?.length ?? 0
  );

  console.log(
    "Primary question texts:",
    formatList(extractPrimaryQuestionTexts(baselineQuestionSetResult))
  );

  console.log(
    "Primary question sources:",
    formatList(extractPrimaryQuestionSources(baselineQuestionSetResult))
  );

  console.log(
    "Contextual resolved keys:",
    formatList(extractPrimaryQuestionKeys(baselineQuestionSetResult))
  );

  console.log(
    "LLM gap question:",
    baselineQuestionSetResult?.interviewQuestionSet?.llmGapQuestion?.question || "(none)"
  );

  console.log(
    "LLM gap question error:",
    baselineQuestionSetResult?.interviewQuestionSet?.llmGapQuestionGenerationError || "(none)"
  );

  printSection("Rotated Summary");
  console.log(
    "Recent question keys used for rotation:",
    formatList(recentQuestionKeys)
  );

  console.log(
    "Primary questions count:",
    rotatedQuestionSetResult?.interviewQuestionSet?.primaryQuestions?.length ?? 0
  );

  console.log(
    "Primary question texts:",
    formatList(extractPrimaryQuestionTexts(rotatedQuestionSetResult))
  );

  console.log(
    "Primary question sources:",
    formatList(extractPrimaryQuestionSources(rotatedQuestionSetResult))
  );

  console.log(
    "Contextual resolved keys:",
    formatList(extractPrimaryQuestionKeys(rotatedQuestionSetResult))
  );

  console.log(
    "LLM gap question:",
    rotatedQuestionSetResult?.interviewQuestionSet?.llmGapQuestion?.question || "(none)"
  );

  console.log(
    "LLM gap question error:",
    rotatedQuestionSetResult?.interviewQuestionSet?.llmGapQuestionGenerationError || "(none)"
  );

  printSection("Output files");
  console.log("- tmp/question-selection/interview_plan.json");
  console.log("- tmp/question-selection/interview_question_set_baseline.json");
  console.log("- tmp/question-selection/interview_question_set_rotated.json");
  console.log("- tmp/question-selection/interview_question_set.json");

  printSection("Done");
  console.log("Question selection test completed successfully.");
}

main().catch((error) => {
  console.error("\nQuestion selection test failed.");
  console.error(error);
  process.exit(1);
});