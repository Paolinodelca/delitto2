import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import buildProReportV2 from "../src/report/buildProReportV2.js";
import renderProReportHtml from "../src/app/renderProReportHtml.js";
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

  const outputDir = resolveProjectPath("tmp", "pro-report-v2");
  await mkdir(outputDir, { recursive: true });

  const sessionResult = await readJsonFile(inputPath);
  const mvp = sessionResult?.fringeInterviewMVPSession || {};

  const candidateProfile =
  mvp?.parserResult?.candidateProfile?.candidateProfile ||
  mvp?.candidateProfile?.candidateProfile ||
  mvp?.candidateProfile ||
  {};

  const finalCandidateReport = mvp?.finalCandidateReport || {};
  const interviewReport = mvp?.interviewReport || {};
  const runtimeAnswers = mvp?.interviewRuntime?.runtimeState?.answers || [];
  const rawInput = mvp?.rawInput || {};
  const localeKey = finalCandidateReport?.locale || "it";
  const openingPositioning = finalCandidateReport?.openingPositioning || {};
  const meta = mvp?.meta || {};
  const detectedRoleFamily = detectRoleFamily({
  targetRole:
    meta?.targetRole ||
    finalCandidateReport?.overall?.roleTitle ||
    mvp?.roleProfile?.title ||
    "",
  roleTitle:
    finalCandidateReport?.overall?.roleTitle ||
    mvp?.roleProfile?.title ||
    "",
  jobDescription:
    meta?.jobDescription ||
    rawInput?.jobDescription ||
    mvp?.jobDescription ||
    ""
  });

const roleFamily = meta?.roleFamily || detectedRoleFamily.roleFamily || "generic_professional";
const roleFamilyConfidence =
  meta?.roleFamilyConfidence ?? detectedRoleFamily.confidence ?? 0;


  
  const proReport = buildProReportV2({
    productMode: "pro",
  productCapabilities: {
  showRecruiterPanel: true,
  showPatternMemory: true,
  showDetailedAnswerWorkspace: true,
  showPremiumRewriteWorkspace: false,
  allowStyleSelection: true,
  allowDeepAssessment: false,
  showPrintableProOutput: true
  },
    candidate: candidateProfile,
    role: mvp?.roleProfile || {},
    fit: mvp?.jobFitAnalysis || {},
    report: interviewReport,
    finalCandidateReport,
    runtimeAnswers,
    openingPositioning,
    localeKey,
    roleFamily,
    roleFamilyConfidence,
    rawInput
  });

  await writeFile(
    path.join(outputDir, "pro_report_v2.json"),
    JSON.stringify(proReport, null, 2),
    "utf8"
  );

  const html = renderProReportHtml({
    proReportV2: proReport?.proReportV2 || {}
  });

  await writeFile(
    path.join(outputDir, "pro_report_v2_preview.html"),
    html,
    "utf8"
  );

  console.log("PRO report v2 JSON:");
  console.log(path.join(outputDir, "pro_report_v2.json"));
  console.log("PRO report v2 HTML:");
  console.log(path.join(outputDir, "pro_report_v2_preview.html"));
}

main().catch((error) => {
  console.error("test_render_pro_report_v2 failed.");
  console.error(error);
  process.exit(1);
});