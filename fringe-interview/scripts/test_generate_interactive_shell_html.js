import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import renderInteractiveInterviewShellHtml from "../src/app/renderInteractiveInterviewShellHtml.js";
import renderFringeInterviewReportHtml from "../src/app/renderFringeInterviewReportHtml.js";
import { buildInteractiveSessionPayload } from "../src/app/buildInteractiveSessionPayload.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", ...segments);
}

async function readJsonFile(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function printSection(title) {
  console.log(`\\n=== ${title} ===`);
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
  let sessionSourceLabel = "none";

  try {
    sessionResult = await readJsonFile(preferredInputPath);
    sessionSourceLabel = "preferred";
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

  const interactivePayload = buildInteractiveSessionPayload({
    sessionResult,
    intakeState,
    shellOptions
  });

  const setupHtml = renderInteractiveInterviewShellHtml({
    sessionResult,
    shellOptions
  });

  const reportHtml = renderFringeInterviewReportHtml({
    sessionResult
  });

  const setupHtmlOutputPath = path.join(
    outputDir,
    "fringe_interview_interactive_shell_setup.html"
  );

  const reportHtmlOutputPath = path.join(
    outputDir,
    "fringe_interview_interactive_shell_report.html"
  );

  const payloadOutputPath = path.join(
    outputDir,
    "interactive_session_payload.json"
  );

  const setupOnlyPayloadOutputPath = path.join(
    outputDir,
    "interactive_session_payload_setup_only.json"
  );

  const intakeOutputPath = path.join(
    outputDir,
    "interactive_intake_state.json"
  );

  await writeFile(setupHtmlOutputPath, setupHtml, "utf8");
  await writeFile(reportHtmlOutputPath, reportHtml, "utf8");
  await writeFile(
    payloadOutputPath,
    JSON.stringify(interactivePayload, null, 2),
    "utf8"
  );
  await writeFile(
    setupOnlyPayloadOutputPath,
    JSON.stringify(
      {
        interactiveSessionPayload: {
          locale: interactivePayload?.interactiveSessionPayload?.locale || "it",
          uiLocale: interactivePayload?.interactiveSessionPayload?.uiLocale || "it",
          sessionLocale:
            interactivePayload?.interactiveSessionPayload?.sessionLocale || "it",
          scenarioType:
            interactivePayload?.interactiveSessionPayload?.scenarioType ||
            "interview",
          inputMode:
            interactivePayload?.interactiveSessionPayload?.inputMode || "text",
          inputSource:
            interactivePayload?.interactiveSessionPayload?.inputSource ||
            "upload",
          frictionType:
            interactivePayload?.interactiveSessionPayload?.frictionType || "none",
          candidateInput:
            interactivePayload?.interactiveSessionPayload?.candidateInput || {}
        }
      },
      null,
      2
    ),
    "utf8"
  );
  await writeFile(
    intakeOutputPath,
    JSON.stringify(
      {
        intakeState,
        shellOptions
      },
      null,
      2
    ),
    "utf8"
  );

  printSection("Summary");
  console.log("Standalone interactive shell generated successfully.");
  console.log(
    "Session source:",
    sessionSourceLabel === "preferred"
      ? "tmp/app-mvp-session/fringe_interview_mvp_session_result.json"
      : sessionSourceLabel === "fallback"
        ? "tmp/app-mvp/fringe_interview_mvp_result.json"
        : "no session file found, shell generated in intake-only mode"
  );
  console.log("Resolved input JSON:", inputPath || "none");
  console.log("Setup-only HTML:", setupHtmlOutputPath);
  console.log("Report-preview HTML:", reportHtmlOutputPath);
  console.log("Output payload JSON:", payloadOutputPath);
  console.log("Setup-only payload JSON:", setupOnlyPayloadOutputPath);
  console.log("Output intake JSON:", intakeOutputPath);

  printSection("Payload preview");
  console.log(
    JSON.stringify(
      {
        locale: interactivePayload?.interactiveSessionPayload?.locale || null,
        uiLocale:
          interactivePayload?.interactiveSessionPayload?.uiLocale || null,
        sessionLocale:
          interactivePayload?.interactiveSessionPayload?.sessionLocale || null,
        scenarioType:
          interactivePayload?.interactiveSessionPayload?.scenarioType || null,
        inputMode:
          interactivePayload?.interactiveSessionPayload?.inputMode || null,
        inputSource:
          interactivePayload?.interactiveSessionPayload?.inputSource || null,
        frictionType:
          interactivePayload?.interactiveSessionPayload?.frictionType || null,
        targetRole:
          interactivePayload?.interactiveSessionPayload?.candidateInput
            ?.targetRole || null,
        hasJobDescription:
          !!interactivePayload?.interactiveSessionPayload?.candidateInput
            ?.jobDescription,
        hasCvFile:
          !!interactivePayload?.interactiveSessionPayload?.candidateInput
            ?.cvFile?.isProvided
      },
      null,
      2
    )
  );

  printSection("How to use");
  console.log(
    "1) Open fringe_interview_interactive_shell_setup.html to test the intake/setup experience."
  );
  console.log(
    "2) Open fringe_interview_interactive_shell_report.html to inspect the report view with preloaded data."
  );

  printSection("Done");
  console.log("Interactive shell generation test completed successfully.");
}

main().catch((error) => {
  console.error("\\nInteractive shell generation test failed.");
  console.error(error);
  process.exit(1);
});