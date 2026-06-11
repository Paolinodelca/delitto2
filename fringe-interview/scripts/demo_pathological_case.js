import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import {
  deriveInterviewPlanFromJobFit,
  buildInterviewQuestionSet,
  composeInterviewSession,
  createInterviewRuntime,
  advanceInterviewRuntime,
  collectInterviewReport,
  buildFinalCandidateReport
} from "../src/interview/index.js";

import renderInteractiveInterviewShellHtml from "../src/app/renderInteractiveInterviewShellHtml.js";
import renderFringeInterviewReportHtml from "../src/app/renderFringeInterviewReportHtml.js";
import { buildInteractiveSessionPayload } from "../src/app/buildInteractiveSessionPayload.js";
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

async function writePrettyJson(filePath, data) {
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function printSection(title) {
  console.log(`\n=== ${title} ===`);
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function assertInterviewRuntimeEnvelope(runtimeResult, stepName) {
  if (!runtimeResult || typeof runtimeResult !== "object") {
    throw new Error(`${stepName}: runtime result is missing or invalid.`);
  }

  if (!runtimeResult.interviewRuntime || typeof runtimeResult.interviewRuntime !== "object") {
    throw new Error(`${stepName}: interviewRuntime is missing in returned result.`);
  }
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

function applyDemoQuestionOverrides(interviewSession, roleFamily = "generic_professional") {
  if (!interviewSession || typeof interviewSession !== "object") {
    return interviewSession;
  }

  const session = interviewSession;
  const isOperations = roleFamily === "operations_industrial";
  const isAnalytical = roleFamily === "analytical_business";
  const isCreative = roleFamily === "creative_design";

  if (session.openingBlock) {
    session.openingBlock.openingPrompt = isOperations
      ? "Mi racconti rapidamente il tuo percorso mettendo in evidenza le esperienze più rilevanti per ruoli di coordinamento operativo e gestione delle priorità?"
      : isAnalytical
        ? "Mi racconti rapidamente il tuo percorso mettendo in evidenza le esperienze più rilevanti in analisi, reporting e supporto decisionale?"
        : isCreative
          ? "Mi racconti rapidamente il tuo percorso mettendo in evidenza le esperienze più rilevanti sul piano creativo, progettuale o di linguaggio visivo?"
          : "Mi racconti rapidamente il tuo percorso mettendo in evidenza le esperienze più rilevanti per questo ruolo?";
  }

  if (Array.isArray(session.coreQuestionBlocks)) {
    session.coreQuestionBlocks = session.coreQuestionBlocks.map((block) => {
      const question = String(block?.question || "").toLowerCase();

      if (
        question.includes("quali parti della tua esperienza") ||
        question.includes("rilevanti per questa posizione")
      ) {
        return {
          ...block,
          question: isOperations
            ? "Guardando questo ruolo, quali parti della tua esperienza pensi siano davvero trasferibili nella gestione operativa, nel coordinamento e nelle priorità?"
            : isAnalytical
              ? "Guardando questo ruolo, quali parti della tua esperienza pensi siano davvero trasferibili in analisi, reporting e lettura dei dati?"
              : isCreative
                ? "Guardando questo ruolo, quali parti della tua esperienza pensi siano davvero trasferibili sul piano creativo, progettuale o di linguaggio?"
                : "Guardando questo ruolo, quali parti della tua esperienza pensi siano davvero trasferibili?"
        };
      }

      if (
        question.includes("in quale tipo di contesto lavori meglio") ||
        question.includes("tipo di contesto")
      ) {
        return {
          ...block,
          question: isOperations
            ? "In quale tipo di contesto operativo lavori meglio e che ambiente ti aiuta a gestire bene coordinamento, execution e priorità?"
            : isAnalytical
              ? "In quale tipo di contesto lavori meglio quando devi analizzare dati, costruire reporting e supportare decisioni?"
              : isCreative
                ? "In quale tipo di contesto lavori meglio quando devi sviluppare idee, linguaggio e proposta creativa?"
                : "In quale tipo di contesto lavori meglio e che ambiente ti aiuta a rendere di più?"
        };
      }

      if (
        question.includes("raccontami una situazione in cui hai ricevuto resistenza") ||
        question.includes("obiezioni o disaccordo")
      ) {
        return {
          ...block,
          question: isOperations
            ? "Raccontami una situazione in cui hai ricevuto resistenza su priorità, tempi o modalità operative. Come hai gestito il confronto e che posizione hai preso?"
            : isAnalytical
              ? "Raccontami una situazione in cui una tua analisi o lettura dei dati ha incontrato resistenza. Come hai gestito il confronto?"
              : isCreative
                ? "Raccontami una situazione in cui una tua proposta creativa ha incontrato resistenza o obiezioni. Come hai difeso o adattato la tua posizione?"
                : "Raccontami una situazione in cui hai ricevuto resistenza o disaccordo su una tua analisi o proposta. Come hai gestito la situazione e che posizione hai preso?"
        };
      }

      if (
        question.includes("quale decisione hai preso") ||
        question.includes("trade-off") ||
        question.includes("lasciare indietro")
      ) {
        return {
          ...block,
          question: isOperations
            ? "In quella situazione, quale priorità hai protetto davvero e quale trade-off operativo hai accettato?"
            : isAnalytical
              ? "In quella situazione, quale decisione hai preso sulla base dei dati e quale trade-off hai accettato?"
              : isCreative
                ? "In quella situazione, quale scelta progettuale hai difeso davvero e quale compromesso hai accettato?"
                : "In quella situazione, quale decisione hai preso davvero e quale trade-off hai accettato?"
        };
      }

      return block;
    });
  }

  if (Array.isArray(session.followupBlocks)) {
    session.followupBlocks = session.followupBlocks.map((block) => {
      const followups = Array.isArray(block?.followups) ? block.followups : [];
      const first = String(followups[0] || "").toLowerCase();

      if (
        first.includes("di cosa eri esattamente responsabile") ||
        first.includes("contributo personale") ||
        first.includes("responsabilità diretta")
      ) {
        return {
          ...block,
          followups: [
            isOperations
              ? "In quella situazione, di cosa eri direttamente responsabile tu nella gestione operativa e che cosa invece dipendeva dal team o dal contesto?"
              : isAnalytical
                ? "In quella situazione, di cosa eri direttamente responsabile tu nell'analisi o nell'impostazione del reporting e che cosa invece dipendeva da altri?"
                : isCreative
                  ? "In quella situazione, quale parte della proposta o della decisione creativa dipendeva davvero da te e quale invece dal contesto o dagli altri?"
                  : "In quella situazione, di cosa eri direttamente responsabile tu e che cosa invece dipendeva dal team o dal contesto?"
          ]
        };
      }

      if (
        first.includes("fammi un esempio") ||
        first.includes("esempio concreto") ||
        first.includes("un caso preciso")
      ) {
        return {
          ...block,
          followups: [
            "Fammi un esempio concreto, con contesto, scelta fatta e risultato."
          ]
        };
      }

      return block;
    });
  }

  if (session.closingBlock) {
    session.closingBlock.closingPrompt = isOperations
      ? "Se dovessi riassumere in pochi punti che cosa porti in un ruolo di operations o coordinamento, cosa diresti?"
      : isAnalytical
        ? "Se dovessi riassumere in pochi punti che cosa porti in un ruolo analitico o di reporting, cosa diresti?"
        : isCreative
          ? "Se dovessi riassumere in pochi punti che cosa porti in un ruolo creativo o progettuale, cosa diresti?"
          : "Se dovessi riassumere in pochi punti che cosa porti in questo ruolo, cosa diresti?";
  }

  return session;
}




function buildPathologicalAnswer(step, index) {
  const phaseName = step?.phaseName || "";
  const stepType = step?.stepType || "";
  const followupText = Array.isArray(step?.payload?.followups)
    ? String(step.payload.followups[0] || "")
    : "";

  const promptText =
    step?.prompt ||
    step?.question ||
    step?.text ||
    step?.payload?.question ||
    followupText ||
    "";

  const q = String(promptText).toLowerCase();

  if (stepType === "adaptive_followup_pack") {
    if (
      q.includes("direttamente responsabile") ||
      q.includes("dipendeva dal team") ||
      q.includes("responsabilità diretta") ||
      q.includes("responsabilita diretta")
    ) {
      return "Come ho già detto prima.";
    }

    if (
      q.includes("esempio concreto") ||
      q.includes("fammi un esempio") ||
      q.includes("caso")
    ) {
      return "Mah, dipende.";
    }

    return "L'ho già spiegato.";
  }

  if (phaseName === "OPENING") {
    return "Volentieri. Ti racconto il mio percorso mettendo a fuoco le esperienze più rilevanti per questo ruolo e dove penso di poter trasferire valore rapidamente.";
  }

  if (phaseName === "ROLE_CONTEXT") {
    if (
      q.includes("puoi raccontarmi il tuo percorso") ||
      q.includes("passo successivo naturale")
    ) {
      return "Dipende dai casi.";
    }

    if (
      q.includes("quali parti della tua esperienza") ||
      q.includes("davvero trasferibili")
    ) {
      return "Nel mio percorso ho sviluppato una forte capacità di lavorare su priorità complesse, coordinamento trasversale e interfaccia con stakeholder diversi. Mi riconosco in contesti in cui serve visione operativa, capacità di sintesi e orientamento al risultato. Penso quindi che la mia esperienza sia trasferibile perché porto metodo, flessibilità e attitudine a gestire situazioni articolate mantenendo il focus sugli obiettivi.";
    }

    if (
      q.includes("in quale tipo di contesto lavori meglio") ||
      q.includes("tipo di contesto") ||
      q.includes("ambiente ti aiuta a rendere di più")
    ) {
      return "Più o meno un po' tutto, nel senso che bisogna capire la situazione ma anche no, dipende e comunque la cosa importante è restare dinamici.";
    }

    return "Dipende dai casi.";
  }

  if (phaseName === "PRESSURE_PROBE") {
    return "Quando ricevo pressione o pushback, cerco di mantenere la relazione ma prendo posizione. Mi è capitato di gestire disaccordi su priorità e tempi: ho esplicitato i vincoli, chiarito cosa fosse realistico consegnare e difeso una scelta operativa senza perdere il focus sul risultato.";
  }

  if (phaseName === "CLOSING") {
    return "Sì.";
  }

  return `Risposta patologica ${index + 1}`;
}



async function main() {
  const pipelinePath = resolveProjectPath(
    "tmp",
    "parser-pipeline-groq",
    "full_parser_pipeline_result.json"
  );

  const outputDir = resolveProjectPath("tmp", "demo-pathological");
  await mkdir(outputDir, { recursive: true });

  const pipelineResult = await readJsonFile(pipelinePath);

  const interviewPlanResult = deriveInterviewPlanFromJobFit({
    candidateProfile: pipelineResult.candidateProfile,
    roleProfile: pipelineResult.roleProfile,
    jobFitAnalysis: pipelineResult.jobFitAnalysis
  });

  const questionSetResult = await buildInterviewQuestionSet({
    interviewPlan: interviewPlanResult.interviewPlan
  });

  const sessionResult = composeInterviewSession({
    interviewPlan: interviewPlanResult.interviewPlan,
    interviewQuestionSet: questionSetResult.interviewQuestionSet
  });

const detectedRoleFamily = detectRoleFamily({
  targetRole:
    pipelineResult?.roleProfile?.roleProfile?.title ||
    pipelineResult?.roleProfile?.title ||
    "",
  roleTitle:
    pipelineResult?.roleProfile?.roleProfile?.title ||
    pipelineResult?.roleProfile?.title ||
    "",
  jobDescription:
    pipelineResult?.jobFitAnalysis?.jobFitAnalysis?.jobDescription ||
    ""
});


 sessionResult.interviewSession = applyDemoQuestionOverrides(
  sessionResult.interviewSession,
  detectedRoleFamily.roleFamily
);

  let runtimeResult = await createInterviewRuntime({
    interviewSession: sessionResult.interviewSession
  });

  assertInterviewRuntimeEnvelope(runtimeResult, "createInterviewRuntime");

  let stepCounter = 0;
  const maxSteps = 20;

  while (!runtimeResult?.interviewRuntime?.runtimeState?.isCompleted) {
    if (stepCounter >= maxSteps) {
      throw new Error(
        `demo_pathological_case: maxSteps (${maxSteps}) reached before completion.`
      );
    }

        const currentStep = runtimeResult?.interviewRuntime?.currentStep || null;

    console.log(
      `[STEP ${stepCounter + 1}] phase=${currentStep?.phaseName || "(none)"} | stepType=${currentStep?.stepType || "(none)"} | question=${
        currentStep?.question ||
        currentStep?.prompt ||
        currentStep?.text ||
        currentStep?.payload?.question ||
        (Array.isArray(currentStep?.payload?.followups)
          ? currentStep.payload.followups[0]
          : "") ||
        "(none)"
      }`
    );

    const answerText = buildPathologicalAnswer(currentStep, stepCounter);

    runtimeResult = await advanceInterviewRuntime({
      interviewSession: sessionResult.interviewSession,
      interviewRuntime: runtimeResult.interviewRuntime,
      answerText
    });

    assertInterviewRuntimeEnvelope(
      runtimeResult,
      `advanceInterviewRuntime #${stepCounter + 1}`
    );

    stepCounter += 1;
  }

  const interviewReportResult = collectInterviewReport({
    interviewRuntime: runtimeResult.interviewRuntime
  });

  if (!interviewReportResult?.interviewReport) {
    throw new Error("demo_pathological_case: interviewReport is missing.");
  }

  const finalReportResult = buildFinalCandidateReport({
    candidateProfile: pipelineResult.candidateProfile,
    roleProfile: pipelineResult.roleProfile,
    jobFitAnalysis: pipelineResult.jobFitAnalysis,
    interviewReport: interviewReportResult.interviewReport
  });

  if (!finalReportResult?.finalCandidateReport) {
    throw new Error("demo_pathological_case: finalCandidateReport is missing.");
  }

  const intakeState = buildDemoIntakeState();
  const shellOptions = buildDemoShellOptions(intakeState);

  const pathologicalSessionResult = {
    fringeInterviewMVPSession: {
      parserResult: {
        candidateProfile: pipelineResult.candidateProfile,
        roleProfile: pipelineResult.roleProfile,
        jobFitAnalysis: pipelineResult.jobFitAnalysis
      },
      interviewPlan: interviewPlanResult.interviewPlan,
      interviewQuestionSet: questionSetResult.interviewQuestionSet,
      interviewSession: sessionResult.interviewSession,
      interviewRuntime: runtimeResult.interviewRuntime,
      interviewReport: interviewReportResult.interviewReport,
      finalCandidateReport: finalReportResult.finalCandidateReport,
      meta: {
        locale: "it",
        uiLocale: shellOptions.uiLocale,
        sessionLocale: shellOptions.sessionLocale,
        scenarioType: shellOptions.scenarioType,
        inputMode: shellOptions.inputMode,
        inputSource: shellOptions.inputSource,
        frictionType: shellOptions.frictionType,
        requestedPlan: "free",
        targetRole: intakeState.targetRole,
        roleFamily: detectedRoleFamily.roleFamily,
        roleFamilyConfidence: detectedRoleFamily.confidence,

        jobDescription: intakeState.jobDescription
      }
    }
  };

  const interactivePayload = buildInteractiveSessionPayload({
    sessionResult: pathologicalSessionResult,
    intakeState,
    shellOptions
  });

  const setupHtml = renderInteractiveInterviewShellHtml({
    sessionResult: pathologicalSessionResult,
    shellOptions
  });

  const reportHtml = renderFringeInterviewReportHtml({
    sessionResult: pathologicalSessionResult
  });

  await writePrettyJson(
    path.join(outputDir, "demo_pathological_case_result.json"),
    pathologicalSessionResult
  );

  await writePrettyJson(
    path.join(outputDir, "interview_plan_used.json"),
    interviewPlanResult
  );

  await writePrettyJson(
    path.join(outputDir, "interview_question_set_used.json"),
    questionSetResult
  );

  await writePrettyJson(
    path.join(outputDir, "interview_session_used.json"),
    sessionResult
  );

  await writePrettyJson(
    path.join(outputDir, "interview_runtime_used.json"),
    runtimeResult
  );

  await writePrettyJson(
    path.join(outputDir, "interview_report_used.json"),
    interviewReportResult
  );

  await writePrettyJson(
    path.join(outputDir, "final_candidate_report.json"),
    finalReportResult
  );

  await writePrettyJson(
    path.join(outputDir, "interactive_session_payload.json"),
    interactivePayload
  );

  await writePrettyJson(
    path.join(outputDir, "interactive_intake_state.json"),
    { intakeState, shellOptions }
  );

  await writeFile(
    path.join(outputDir, "fringe_interview_interactive_shell_setup.html"),
    setupHtml,
    "utf8"
  );

  await writeFile(
    path.join(outputDir, "fringe_interview_interactive_shell_report.html"),
    reportHtml,
    "utf8"
  );

  const answers = ensureArray(runtimeResult?.interviewRuntime?.runtimeState?.answers);
  const finalStats = interviewReportResult?.interviewReport?.sessionStats || {};

  printSection("Summary");
  console.log("Demo pathological case generated successfully.");
  console.log("Recorded answers:", answers.length);
  console.log("Completed:", runtimeResult?.interviewRuntime?.runtimeState?.isCompleted ?? false);
  console.log("Steps used:", stepCounter);
  console.log("Overall report score:", finalStats?.overallScore ?? "(missing)");
  console.log("Overall band:", finalStats?.overallBand || "(missing)");

  printSection("Output files");
  console.log("- tmp/demo-pathological/demo_pathological_case_result.json");
  console.log("- tmp/demo-pathological/fringe_interview_interactive_shell_setup.html");
  console.log("- tmp/demo-pathological/fringe_interview_interactive_shell_report.html");
  console.log("- tmp/demo-pathological/interactive_session_payload.json");
  console.log("- tmp/demo-pathological/final_candidate_report.json");

  printSection("How to use");
  console.log("1) Run: node scripts/demo_pathological_case.js");
  console.log("2) Open: tmp/demo-pathological/fringe_interview_interactive_shell_report.html");
  console.log("3) Use this output to test duplicate, weak, evasive and off-context answers.");

  printSection("Done");
  console.log("Demo pathological case completed successfully.");
}

main().catch((error) => {
  console.error("\nDemo pathological case failed.");
  console.error(error);
  process.exit(1);
});