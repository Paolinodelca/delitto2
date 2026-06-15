import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { runCandidateProfileParser } from "../src/parser/index.js";
import { runGroqParserModel } from "../src/parser/adapters/index.js";
import buildCvReviewReportV1 from "../src/report/buildCvReviewReportV1.js";
import normalizeParsedCandidateProfileForCvReview from "../src/report/normalizeParsedCandidateProfileForCvReview.js";

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

function unwrapCandidateProfile(parserResult) {
  return parserResult?.candidateProfile || parserResult;
}

async function main() {
  const fixturesDir = resolveProjectPath("fixtures");
  const outputDir = resolveProjectPath("tmp", "cv-review-parser-giulia");

  await mkdir(outputDir, { recursive: true });

  const cvText = await readTextFile(
    path.join(fixturesDir, "giulia_cv_originale.txt")
  );

  const parserResult = await runCandidateProfileParser({
    cvText,
    userNotes:
      "CV di Giulia. Valutare il profilo rispetto a servizi educativi, relazione di aiuto, sostegno alla persona, disabilità e contesti educativi.",
    modelAdapter: ({ task, system, user }) =>
      runGroqParserModel({
        task,
        system,
        user,
        temperature: 0.2
      })
  });

  const candidateProfile = normalizeParsedCandidateProfileForCvReview(
  unwrapCandidateProfile(parserResult.parsed),
  { roleFamily: "care_helping_professions" }
);



  const targets = [
    "",
    "servizi educativi per infanzia e famiglie",
    "sportelli di ascolto e prevenzione per giovani",
    "servizi educativi individuali e di gruppo per persone con disabilità"
  ];

  const reports = targets.map((targetRole) =>
    buildCvReviewReportV1({
      candidateProfile,
      roleFamily: "care_helping_professions",
      targetRole
    })
  );

  const result = {
    source: "parser_groq",
    candidateProfile,
    reports
  };

  await writePrettyJson(
    path.join(outputDir, "cv_review_from_parser_giulia.json"),
    result
  );

  console.log("✅ CV Review from parser built:");
  console.log(
    path.join(outputDir, "cv_review_from_parser_giulia.json")
  );
}

main().catch((error) => {
  console.error("test_cv_review_from_parser_giulia failed.");
  console.error(error);
  process.exit(1);
});