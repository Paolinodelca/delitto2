import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { buildInteractiveSessionPayload } from "../src/app/index.js";

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

function buildDemoIntakeState() {
  return {
    scenarioType: "interview",
    inputMode: "text",
    uiLocale: "it",
    sessionLocale: "it",
    inputSource: "upload",
    frictionType: "none",
    targetRole: "Product Operations Manager",
    jobDescription:
      "Cerchiamo una figura capace di coordinare processi cross-funzionali, lavorare con team prodotto e operations, gestire priorità, stakeholder e miglioramento continuo.",
    cvFile: {
      name: "sample_cv_paolo.pdf",
      size: 248731,
      type: "application/pdf",
      lastModified: Date.now()
    }
  };
}

function buildDemoShellOptions(intakeState) {
  return {
    scenarioType: intakeState?.scenarioType || "interview",
    inputMode: intakeState?.inputMode || "text",
    uiLocale: intakeState?.uiLocale || "it",
    sessionLocale: intakeState?.sessionLocale || "it",
    inputSource: intakeState?.inputSource || "upload",
    frictionType: intakeState?.frictionType || "none"
  };
}

async function main() {
  const preferredInputPath = resolveProjectPath(
    "tmp",
    "app-mvp-session",
    "fringe_interview_mvp_session_result.json"
  );

  const fallbackInputPath = resolveProjectPath(
    "tmp",
    "app-mvp",
    "fringe_interview_mvp_result.json"
  );

  const outputDir = resolveProjectPath("tmp", "ui-local");
  await mkdir(outputDir, { recursive: true });

  let inputPath = preferredInputPath;
  let sessionResult = null;
  let sessionSourceLabel = "preferred";

  try {
    sessionResult = await readJsonFile(preferredInputPath);
  } catch {
    try {
      inputPath = fallbackInputPath;
      sessionResult = await readJsonFile(fallbackInputPath);
      sessionSourceLabel = "fallback";
    } catch {
      inputPath = null;
      sessionResult = {};
      sessionSourceLabel = "empty";
    }
  }

  const intakeState = buildDemoIntakeState();
  const shellOptions = buildDemoShellOptions(intakeState);

  const payload = buildInteractiveSessionPayload({
    sessionResult,
    intakeState,
    shellOptions
  });

  const outputPath = path.join(outputDir, "interactive_session_payload.json");
  const inputSnapshotPath = path.join(outputDir, "interactive_payload_input_snapshot.json");

  await writePrettyJson(outputPath, payload);
  await writePrettyJson(inputSnapshotPath, {
    sessionSourceLabel,
    inputPath,
    intakeState,
    shellOptions
  });

  const interactive = payload?.interactiveSessionPayload || {};
  const candidateInput = interactive?.candidateInput || {};
  const inputLayer = interactive?.inputLayer || {};
  const meta = interactive?.meta || {};

  printSection("Summary");
  console.log("Payload generated successfully.");
  console.log(
    "Session source:",
    sessionSourceLabel === "preferred"
      ? "tmp/app-mvp-session/fringe_interview_mvp_session_result.json"
      : sessionSourceLabel === "fallback"
        ? "tmp/app-mvp/fringe_interview_mvp_result.json"
        : "no session file found, payload generated from intake-only mode"
  );
  console.log("Resolved input JSON:", inputPath || "none");
  console.log("Output JSON:", outputPath);
  console.log("Input snapshot JSON:", inputSnapshotPath);

  printSection("Payload preview");
  console.log(
    JSON.stringify(
      {
        locale: interactive?.locale || null,
        uiLocale: interactive?.uiLocale || null,
        sessionLocale: interactive?.sessionLocale || null,
        scenarioType: interactive?.scenarioType || null,
        inputMode: interactive?.inputMode || null,
        inputSource: interactive?.inputSource || null,
        frictionType: interactive?.frictionType || null,
        candidateInput: {
          targetRole: candidateInput?.targetRole || null,
          hasJobDescription: !!candidateInput?.jobDescription,
          hasCvFile: !!candidateInput?.cvFile?.isProvided,
          cvFileName: candidateInput?.cvFile?.name || null
        },
        inputLayer: {
          voiceRequested: !!inputLayer?.voiceMode?.requested,
          voiceFutureMode: !!inputLayer?.voiceMode?.isFutureMode
        },
        meta: {
          locale: meta?.locale || null,
          hasJobDescription: !!meta?.hasJobDescription,
          hasCvFile: !!meta?.hasCvFile
        },
        preservedBlocks: {
          hasParserResult: !!interactive?.parserResult && Object.keys(interactive?.parserResult || {}).length > 0,
          hasInterviewPlan: !!interactive?.interviewPlan && Object.keys(interactive?.interviewPlan || {}).length > 0,
          hasInterviewSession: !!interactive?.interviewSession && Object.keys(interactive?.interviewSession || {}).length > 0,
          hasInterviewRuntime: !!interactive?.interviewRuntime && Object.keys(interactive?.interviewRuntime || {}).length > 0,
          hasInterviewReport: !!interactive?.interviewReport && Object.keys(interactive?.interviewReport || {}).length > 0,
          hasFinalCandidateReport:
            !!interactive?.finalCandidateReport &&
            Object.keys(interactive?.finalCandidateReport || {}).length > 0
        }
      },
      null,
      2
    )
  );

  printSection("Done");
  console.log("Interactive session payload test completed successfully.");
}

main().catch((error) => {
  console.error("\nInteractive session payload test failed.");
  console.error(error);
  process.exit(1);
});