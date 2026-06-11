import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import buildCvReviewReportV1 from "../src/report/buildCvReviewReportV1.js";
import detectRoleFamily from "../src/interview/detectRoleFamily.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", ...segments);
}

async function readJsonFile(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function main() {
  const inputPath = resolveProjectPath(
    "tmp",
    "app-mvp-session",
    "fringe_interview_mvp_session_result.json"
  );

  const outputDir = resolveProjectPath("tmp", "cv-review-v1");
  await mkdir(outputDir, { recursive: true });

  const sessionResult = await readJsonFile(inputPath);
  const mvp = sessionResult?.fringeInterviewMVPSession || {};

  const candidateProfile =
    mvp?.parserResult?.candidateProfile?.candidateProfile ||
    mvp?.candidateProfile?.candidateProfile ||
    mvp?.candidateProfile ||
    {};

  const targetRole =
    mvp?.meta?.targetRole ||
    mvp?.finalCandidateReport?.overall?.roleTitle ||
    "";

  const detectedRoleFamily = detectRoleFamily({
    targetRole,
    roleTitle: targetRole,
    jobDescription:
      mvp?.meta?.jobDescription ||
      mvp?.rawInput?.jobDescription ||
      ""
  });

  const cvReviewReport = buildCvReviewReportV1({
    candidateProfile,
    roleFamily: detectedRoleFamily.roleFamily,
    targetRole
  });

  await writeFile(
    path.join(outputDir, "cv_review_report_v1.json"),
    JSON.stringify(cvReviewReport, null, 2),
    "utf8"
  );

  console.log("✅ CV Review Report V1 built:");
  console.log(path.join(outputDir, "cv_review_report_v1.json"));
}

main().catch((error) => {
  console.error("test_build_cv_review_report_v1 failed.");
  console.error(error);
  process.exit(1);
});