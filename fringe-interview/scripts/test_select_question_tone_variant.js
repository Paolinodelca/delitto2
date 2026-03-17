import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { deriveInterviewContextProfile } from "../src/interview/deriveInterviewContextProfile.js";
import { loadStructuredQuestionBank } from "../src/interview/loadStructuredQuestionBank.js";
import { rankStructuredQuestions } from "../src/interview/rankStructuredQuestions.js";
import { deriveQuestionSelectionStrategy } from "../src/interview/deriveQuestionSelectionStrategy.js";
import { selectQuestionToneVariant } from "../src/interview/selectQuestionToneVariant.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", ...segments);
}

async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

async function readJsonFile(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function loadParserBasedInput() {
  const parserPipelinePath = resolveProjectPath(
    "tmp",
    "parser-pipeline-groq",
    "full_parser_pipeline_result.json"
  );

  try {
    const parsed = await readJsonFile(parserPipelinePath);
    return {
      candidateProfile: parsed?.candidateProfile,
      roleProfile: parsed?.roleProfile,
      jobFitAnalysis: parsed?.jobFitAnalysis,
      sourcePath: parserPipelinePath
    };
  } catch {
    const appMvpPath = resolveProjectPath(
      "tmp",
      "app-mvp",
      "fringe_interview_mvp_result.json"
    );

    const parsed = await readJsonFile(appMvpPath);
    const root = parsed?.fringeInterviewMVP || parsed;

    return {
      candidateProfile: root?.parserResult?.candidateProfile,
      roleProfile: root?.parserResult?.roleProfile,
      jobFitAnalysis: root?.parserResult?.jobFitAnalysis,
      sourcePath: appMvpPath
    };
  }
}

async function main() {
  const input = await loadParserBasedInput();

  const contextResult = deriveInterviewContextProfile({
    candidateProfile: input.candidateProfile,
    roleProfile: input.roleProfile,
    jobFitAnalysis: input.jobFitAnalysis
  });

  const bankResult = loadStructuredQuestionBank();

  const rankingResult = rankStructuredQuestions({
    structuredQuestionBank: bankResult?.structuredQuestionBank,
    interviewContextProfile: contextResult?.interviewContextProfile
  });

  const strategyResult = deriveQuestionSelectionStrategy({
    interviewContextProfile: contextResult?.interviewContextProfile,
    rankedStructuredQuestions: rankingResult?.rankedStructuredQuestions
  });

  const resolvedResult = selectQuestionToneVariant({
    structuredQuestionBank: bankResult?.structuredQuestionBank,
    questionSelectionStrategy: strategyResult?.questionSelectionStrategy
  });

  const output = {
    source: {
      parserInputPath: input.sourcePath
    },
    interviewContextProfile: contextResult?.interviewContextProfile,
    questionSelectionStrategy: strategyResult?.questionSelectionStrategy,
    resolvedStructuredQuestions: resolvedResult?.resolvedStructuredQuestions
  };

  const outputDir = resolveProjectPath("tmp", "resolved-structured-questions");
  await ensureDir(outputDir);

  const outputPath = resolveProjectPath(
    "tmp",
    "resolved-structured-questions",
    "resolved_structured_questions.json"
  );

  await writeFile(outputPath, JSON.stringify(output, null, 2), "utf8");

  const resolvedQuestions =
    resolvedResult?.resolvedStructuredQuestions?.resolvedQuestions || [];

  console.log("");
  console.log("=== Requested tone ===");
  console.log(
    resolvedResult?.resolvedStructuredQuestions?.metadata?.requestedTone || "standard"
  );

  console.log("");
  console.log("=== Resolved structured questions ===");
  resolvedQuestions.forEach((item, index) => {
    console.log(
      `${index + 1}. ${item.key} | category=${item.category} | toneUsed=${item.toneUsed} | source=${item.resolutionSource}`
    );
    console.log(`   prompt: ${item.prompt}`);
  });

  console.log("");
  console.log("=== Output file ===");
  console.log(`- ${outputPath}`);

  console.log("");
  console.log("=== Done ===");
  console.log("Structured question tone resolution test completed successfully.");
  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error("Structured question tone resolution test failed.");
  console.error(error);
  console.error("");
  process.exit(1);
});