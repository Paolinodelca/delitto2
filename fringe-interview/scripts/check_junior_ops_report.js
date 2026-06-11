import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const candidatePaths = [
  "tmp/pro-report-v2/pro_report_v2.json",
  "tmp/app-mvp-session/fringe_interview_mvp_session_result.json",
  "tmp/demo-reference/demo_reference_case_result.json"
];

function readJsonIfExists(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    console.error("Cannot parse JSON:", relativePath, error.message);
    return null;
  }
}

function findReportRoot(obj) {
  if (!obj || typeof obj !== "object") return null;
  if (obj.proReportV2) return obj.proReportV2;
  if (obj.fringeInterviewMVPSession?.proReportV2) return obj.fringeInterviewMVPSession.proReportV2;
  if (obj.result?.proReportV2) return obj.result.proReportV2;
  return null;
}

let source = null;
let report = null;

for (const relativePath of candidatePaths) {
  const data = readJsonIfExists(relativePath);
  const found = findReportRoot(data);
  if (found) {
    source = relativePath;
    report = found;
    break;
  }
}

if (!report) {
  console.error("No proReportV2 found.");
  console.error("Expected one of:");
  for (const p of candidatePaths) console.error("-", p);
  process.exit(1);
}

const overview = report.overview || {};
const plan = overview.operationalActionPlan || {};
const priorities = Array.isArray(plan.globalPriorities) ? plan.globalPriorities : [];
const answers = report.answersWorkspace?.items || [];

console.log("");
console.log("SOURCE:", source);
console.log("=== OPERATIONAL ACTION PLAN ===");
console.log("Count:", priorities.length);
for (const [i, p] of priorities.entries()) {
  console.log("");
  console.log(`${i + 1}. [${p.weight || "-"}] ${p.title || "(no title)"}`);
  console.log("   level:", p.level || "-");
  console.log("   why:", p.why || "-");
  console.log("   action:", p.action || "-");
  console.log("   seenIn:", Array.isArray(p.seenIn) ? p.seenIn.join(", ") : "-");
}

console.log("");
console.log("=== ANSWERS QUICK CHECK ===");
console.log("Answers:", answers.length);
for (const a of answers) {
  console.log("");
  console.log(`Risposta ${a.answerIndex} — score ${a.score}`);
  console.log("problem:", a.problematicAnswerType || "-");
  console.log("offTopic:", a.offTopicRisk || "-");
  console.log("summary:", a.summary || "-");

  const missing = a.cvSupportRead?.missingSignals || [];
  const usable = a.cvSupportRead?.usableSignals || [];
  if (missing.length) console.log("missing:", missing.join(" | "));
  if (usable.length) console.log("cv signals:", usable.join(" | "));
}

console.log("");
console.log("Manual checks:");
console.log("- Junior profile should not be treated as senior/leader.");
console.log("- Decision/trade-off answer should not show unrelated BI-tool gaps.");
console.log("- CV signals should be concrete but not always identical.");
console.log("- Operational priorities should be useful and not generic.");
