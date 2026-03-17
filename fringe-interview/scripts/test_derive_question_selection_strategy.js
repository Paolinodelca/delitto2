import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { deriveInterviewContextProfile } from "../src/interview/deriveInterviewContextProfile.js";
import { loadStructuredQuestionBank } from "../src/interview/loadStructuredQuestionBank.js";
import { rankStructuredQuestions } from "../src/interview/rankStructuredQuestions.js";
import { deriveQuestionSelectionStrategy } from "../src/interview/deriveQuestionSelectionStrategy.js";

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

  const output = {
    source: {
      parserInputPath: input.sourcePath
    },
    interviewContextProfile: contextResult?.interviewContextProfile,
    questionSelectionStrategy: strategyResult?.questionSelectionStrategy
  };

  const outputDir = resolveProjectPath("tmp", "question-selection-strategy");
  await ensureDir(outputDir);

  const outputPath = resolveProjectPath(
    "tmp",
    "question-selection-strategy",
    "question_selection_strategy.json"
  );

  await writeFile(outputPath, JSON.stringify(output, null, 2), "utf8");

  console.log("");
  console.log("=== Context profile ===");
  console.log(JSON.stringify(output.interviewContextProfile, null, 2));

  console.log("");
  console.log("=== Question selection strategy ===");
  console.log(JSON.stringify(output.questionSelectionStrategy, null, 2));

  console.log("");
  console.log("=== Output file ===");
  console.log(`- ${outputPath}`);

  console.log("");
  console.log("=== Done ===");
  console.log("Question selection strategy derived successfully.");
  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error("Question selection strategy derivation test failed.");
  console.error(error);
  console.error("");
  process.exit(1);
});