import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  createCandidateProfilePrompt,
  createRoleProfilePrompt,
  createJobFitAnalysisPrompt,
  runFullParserPipeline
} from "../src/parser/index.js";
import { runGroqParserModel } from "../src/parser/adapters/index.js";
import { getActiveLocale } from "../src/i18n/getAppLocale.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", ...segments);
}

async function readTextFile(filePath) {
  return readFile(filePath, "utf8");
}

async function writePrettyJson(filePath, data) {
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function printSection(title) {
  console.log(`\n=== ${title} ===`);
}

async function main() {
  const fixturesDir = resolveProjectPath("fixtures");
  const outputDir = resolveProjectPath("tmp", "parser-locale-awareness");

  await mkdir(outputDir, { recursive: true });

  const cvText = await readTextFile(path.join(fixturesDir, "sample_cv_01.txt"));
  const jdText = await readTextFile(path.join(fixturesDir, "sample_jd_01.txt"));

  printSection("Locale");
  console.log("Active locale:", getActiveLocale());

  const candidatePrompt = await createCandidateProfilePrompt({
    cvText,
    userNotes: ""
  });

  const rolePrompt = await createRoleProfilePrompt({
    jdText,
    roleNotes: ""
  });

  await writePrettyJson(
    path.join(outputDir, "candidate_prompt_preview.json"),
    candidatePrompt
  );

  await writePrettyJson(
    path.join(outputDir, "role_prompt_preview.json"),
    rolePrompt
  );

  printSection("Prompt preview");
  console.log(
    "Candidate prompt mentions language:",
    candidatePrompt.modelInput.user.includes("Active output language:")
      ? "yes"
      : "no"
  );
  console.log(
    "Role prompt mentions language:",
    rolePrompt.modelInput.user.includes("Active output language:")
      ? "yes"
      : "no"
  );

  printSection("Running full parser pipeline with locale-aware prompts");
  const result = await runFullParserPipeline({
    cvText,
    jdText,
    userNotes: "",
    roleNotes: "",
    modelAdapter: ({ task, system, user }) =>
      runGroqParserModel({
        task,
        system,
        user,
        temperature: 0.2
      })
  });

  await writePrettyJson(
    path.join(outputDir, "full_parser_pipeline_locale_result.json"),
    result
  );

  console.log(
    "Candidate summary:",
    result?.candidateProfile?.candidateProfile?.summary || "(missing)"
  );
  console.log(
    "Role summary:",
    result?.roleProfile?.roleProfile?.summary || "(missing)"
  );
  console.log(
    "First priority topic:",
    result?.jobFitAnalysis?.jobFitAnalysis?.interviewFocus?.[0]?.topic || "(missing)"
  );

  printSection("Output files");
  console.log("- tmp/parser-locale-awareness/candidate_prompt_preview.json");
  console.log("- tmp/parser-locale-awareness/role_prompt_preview.json");
  console.log("- tmp/parser-locale-awareness/full_parser_pipeline_locale_result.json");

  printSection("Done");
  console.log("Parser locale awareness test completed successfully.");
}

main().catch((error) => {
  console.error("\nParser locale awareness test failed.");
  console.error(error);
  process.exit(1);
});