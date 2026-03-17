import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { deriveInterviewContextProfile } from "../src/interview/deriveInterviewContextProfile.js";
import { loadStructuredQuestionBank } from "../src/interview/loadStructuredQuestionBank.js";
import { rankStructuredQuestions } from "../src/interview/rankStructuredQuestions.js";
import { deriveQuestionSelectionStrategy } from "../src/interview/deriveQuestionSelectionStrategy.js";
import { selectQuestionToneVariant } from "../src/interview/selectQuestionToneVariant.js";
import { buildStructuredInterviewPreview } from "../src/interview/buildStructuredInterviewPreview.js";

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

  const previewResult = buildStructuredInterviewPreview({
    interviewContextProfile: contextResult?.interviewContextProfile,
    questionSelectionStrategy: strategyResult?.questionSelectionStrategy,
    resolvedStructuredQuestions: resolvedResult?.resolvedStructuredQuestions
  });

  const output = {
    source: {
      parserInputPath: input.sourcePath
    },
    structuredInterviewPreview: previewResult?.structuredInterviewPreview
  };

  const outputDir = resolveProjectPath("tmp", "structured-interview-preview");
  await ensureDir(outputDir);

  const outputPath = resolveProjectPath(
    "tmp",
    "structured-interview-preview",
    "structured_interview_preview.json"
  );

  await writeFile(outputPath, JSON.stringify(output, null, 2), "utf8");

  const preview = output?.structuredInterviewPreview || {};
  const timeline = Array.isArray(preview?.previewTimeline) ? preview.previewTimeline : [];

  console.log("");
  console.log("=== Structured interview preview summary ===");
  console.log(JSON.stringify(preview?.summary || {}, null, 2));

  console.log("");
  console.log("=== Preview timeline ===");
  timeline.forEach((item) => {
    console.log(
      `${item.order}. ${item.key} | category=${item.category} | stage=${item.stage} | tone=${item.toneUsed} | source=${item.resolutionSource}`
    );
    console.log(`   prompt: ${item.prompt}`);
  });

  console.log("");
  console.log("=== Output file ===");
  console.log(`- ${outputPath}`);

  console.log("");
  console.log("=== Done ===");
  console.log("Structured interview preview generated successfully.");
  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error("Structured interview preview generation failed.");
  console.error(error);
  console.error("");
  process.exit(1);
});