import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { assembleReportSectionData } from "../src/report/assembleReportSectionData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", ...segments);
}

async function readJsonFile(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function printBucket(title, items) {
  console.log(`\n${title}:`);
  if (!items.length) {
    console.log("- none");
    return;
  }

  items.forEach((item) => {
    const hasData = item.data ? "yes" : "no";
    console.log(`- ${item.key} [${item.visibility}] data=${hasData}`);
  });
}

async function main() {
  const inputPath = resolveProjectPath(
    "tmp",
    "final-candidate-report",
    "final_candidate_report.json"
  );

  const proReportPath = resolveProjectPath(
    "tmp",
    "pro-report-v2",
    "pro_report_v2.json"
  );

  const finalCandidateReportJson = await readJsonFile(inputPath);
  const proReportJson = await readJsonFile(proReportPath);

  const finalCandidateReport = finalCandidateReportJson?.finalCandidateReport || {};
  const proReportV2 = proReportJson?.proReportV2 || {};

  const reportData = {
    overview: {
      openingPositioning: proReportV2?.overview?.openingPositioning || null,
      blockingPriorities: proReportV2?.overview?.blockingPriorities || null,
      featuredAnswers: proReportV2?.overview?.featuredAnswers || null,
      sensitiveQuestionsDashboard: proReportV2?.overview?.sensitiveQuestionsDashboard || null,
      cvSlim: proReportV2?.overview?.cvSlim || null,
      finalChecklist: proReportV2?.overview?.finalChecklist || null,

      headlineSummary: {
        headline: finalCandidateReport?.executiveRead?.headline || "",
        subheadline: finalCandidateReport?.executiveRead?.subheadline || ""
      },

      fitSummary: {
        recommendationBand: finalCandidateReport?.roleFit?.recommendationBand || "",
        fitScore: finalCandidateReport?.overall?.metrics?.["Score di aderenza"] ?? null,
        answerScore: finalCandidateReport?.overall?.metrics?.["Score qualità risposte"] ?? null
      },

      topErrors: {
        items: (proReportV2?.overview?.blockingPriorities?.items || []).map((item) => item.description)
      },

      cvMini: {
        candidateSummary: finalCandidateReport?.overall?.candidateSummary || "",
        firstCorrections: (finalCandidateReport?.cvAdvice?.cvImprovementHints || []).slice(0, 3)
      },

      miniTips: {
        items: (finalCandidateReport?.improvements?.finalAdvice || []).slice(0, 3)
      }
    },

    answersWorkspace: proReportV2?.answersWorkspace || {}
  };

  const freeOverview = assembleReportSectionData({
    planKey: "free",
    sectionKey: "overview",
    reportData
  });

  const proOverview = assembleReportSectionData({
    planKey: "pro",
    sectionKey: "overview",
    reportData
  });

  const proAnswers = assembleReportSectionData({
    planKey: "pro",
    sectionKey: "answers",
    reportData
  });

  console.log("=== FREE / overview assembled ===");
  printBucket("Enabled", freeOverview.enabled);
  printBucket("Preview", freeOverview.preview);
  printBucket("Locked", freeOverview.locked);

  console.log("\n=== PRO / overview assembled ===");
  printBucket("Enabled", proOverview.enabled);
  printBucket("Preview", proOverview.preview);
  printBucket("Locked", proOverview.locked);

  console.log("\n=== PRO / answers assembled ===");
  printBucket("Enabled", proAnswers.enabled);
  printBucket("Preview", proAnswers.preview);
  printBucket("Locked", proAnswers.locked);

  console.log("\n=== Sample module payload ===");
  const openingModule = proOverview.enabled.find((item) => item.key === "openingPositioning");
  console.log(JSON.stringify(openingModule, null, 2));
}

main().catch((error) => {
  console.error("test_assemble_report_section_data failed.");
  console.error(error);
  process.exit(1);
});