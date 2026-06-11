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


function buildSyntheticAnswer(step, index) {
  const phaseName = step?.phaseName || "";
  const label = step?.label || "";
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
      q.includes("di cosa eri esattamente responsabile") ||
      q.includes("esattamente responsabile") ||
      q.includes("responsabilità diretta") ||
      q.includes("responsabilita diretta") ||
      q.includes("contributo personale") ||
      q.includes("ownership") ||
      q.includes("direttamente responsabile tu") ||
      q.includes("dipendeva dal team") ||
      q.includes("dipendeva dal contesto")
    ) {
      return "In quella situazione ero direttamente responsabile dell’impostazione del lavoro, della scelta delle metriche da mantenere nel report e della sintesi finale da condividere con gli stakeholder. Il team contribuiva nella raccolta dei dati e nel confronto sui vincoli, ma la decisione su che cosa proteggere in consegna e che cosa ridurre dipendeva da me. Ho difeso un impianto più essenziale, ho lasciato fuori alcune analisi meno affidabili e il report è stato poi usato per riallineare priorità e tempi operativi.";
    }

    if (
      q.includes("fammi un esempio") ||
      q.includes("esempio concreto") ||
      q.includes("example") ||
      q.includes("caso")
    ) {
      return "Un esempio concreto: in un reporting settimanale stavamo producendo molte tabelle ma poca capacità di lettura. Ho ridotto il set di indicatori, tenuto solo quelli con qualità dati sufficiente e costruito una sintesi più netta per operations e stakeholder. Abbiamo perso un po’ di completezza apparente, ma abbiamo guadagnato velocità di lettura, chiarezza decisionale e allineamento sulle azioni da fare.";
    }

    return `Approfondisco ${label || `step ${index + 1}`}: il mio contributo diretto riguardava priorità, struttura dell’output e qualità della decisione finale, non solo supporto esecutivo.`;
  }

  if (phaseName === "OPENING") {
    return "Volentieri. In più occasioni ho lavorato su attività in cui non bastava analizzare dati: bisognava anche rimettere ordine, chiarire priorità e rendere l’output utilizzabile da chi doveva decidere. In un lavoro di reporting operativo, per esempio, mi sono trovato a ripulire indicatori poco affidabili, riallineare richieste diverse degli stakeholder e ricostruire una sintesi più chiara. È proprio questo il filo che vedo con questo ruolo: prendere complessità, darle struttura e trasformarla in esecuzione più leggibile.";
  }

  if (phaseName === "WALKTHROUGH") {
    return "Nel mio percorso ho lavorato su reporting operativo, analisi dei dati e coordinamento con interlocutori diversi, spesso in situazioni in cui serviva rimettere ordine e rendere le informazioni più utili alle decisioni. La parte più rilevante è che non mi sono limitato a produrre analisi: in più occasioni ho dovuto scegliere che cosa approfondire, che cosa semplificare e come presentare il lavoro in modo utile per chi doveva agire.";
  }

  if (phaseName === "ROLE_CONTEXT") {
    if (
      q.includes("quali parti della tua esperienza") ||
      q.includes("rilevanti per questa posizione") ||
      q.includes("esperienza ritieni più rilevanti")
    ) {
      return "Le parti più trasferibili rispetto a questo ruolo sono tre. Primo: la capacità di leggere processi poco ordinati e capire quali informazioni servano davvero a chi decide. Secondo: il coordinamento con stakeholder diversi per trasformare richieste generiche in un output operativo utilizzabile. Terzo: la gestione delle priorità quando non tutto può essere trattato con lo stesso livello di dettaglio. In una situazione concreta ho dovuto scegliere se mantenere un reporting molto completo ma poco affidabile, oppure ridurre il perimetro e proteggere le metriche davvero utili. Ho scelto la seconda strada, spiegando il trade-off e ottenendo un output più credibile.";
    }

    if (
      q.includes("in quale tipo di contesto lavori meglio") ||
      q.includes("tipo di contesto") ||
      q.includes("contesto lavori meglio")
    ) {
      return "Lavoro meglio in contesti in cui gli obiettivi sono chiari ma il percorso per arrivarci richiede autonomia, confronto e capacità di fare ordine. Rendo bene quando c’è una componente cross-funzionale, perché mi trovo a mio agio nel raccogliere vincoli diversi, dare una struttura comune e riportare il lavoro a priorità comprensibili. Per esempio, nelle situazioni in cui il rischio era disperdersi in troppe richieste parallele, il mio contributo è stato spesso quello di chiarire che cosa fosse davvero prioritario, che cosa potesse aspettare e quale sequenza fosse più sostenibile.";
    }

    return "Quello che mi rende credibile per questo passaggio è una combinazione abbastanza precisa: metodo analitico, orientamento operativo e abitudine a lavorare dove le richieste sono molte ma non tutte hanno lo stesso peso. In una situazione concreta mi sono trovato a rivedere un reporting che era diventato troppo ricco e poco leggibile: ho ricostruito con gli stakeholder quali metriche servissero davvero, ho ridotto il perimetro delle analisi e ho rimesso in sequenza le priorità. Il risultato è stato un output meno completo in apparenza, ma più utile per decidere, coordinare il lavoro successivo e dare una base più chiara alle scelte operative.";
  }

  if (phaseName === "CASE_1") {
    return "Ti faccio un caso concreto. In un’attività di reporting periodico ci siamo accorti che il materiale prodotto era ricco ma poco usabile: troppe metriche, dati non sempre omogenei e stakeholder che tiravano in direzioni diverse. Ho ricostruito con il team quali indicatori fossero davvero affidabili, ho ridotto il set da presentare e ho cambiato la logica della sintesi finale. La scelta non è stata neutra, perché abbiamo sacrificato una parte di completezza per aumentare chiarezza e usabilità. Il risultato è stato un report meno rumoroso, discusso più rapidamente e usato meglio per decidere azioni e priorità.";
  }

  if (phaseName === "DECISION_PROBE") {
    return "In quella situazione ho deciso di proteggere affidabilità e leggibilità, anche a costo di lasciare fuori alcune analisi secondarie che avrebbero dato più volume ma meno utilità. Il trade-off era chiaro: meno copertura apparente, ma una base più solida per decidere. Mi sono assunto la responsabilità della scelta, l’ho spiegata agli stakeholder e ho difeso il fatto che, in quel momento, fosse più importante consegnare uno strumento chiaro che un documento molto completo ma poco governabile.";
  }

  if (phaseName === "PRESSURE_PROBE") {
    return "Sì, mi è capitato. In una fase di allineamento con stakeholder diversi c’era pressione per mantenere nel reporting anche elementi ancora deboli sul piano dei dati, perché qualcuno li considerava utili a livello politico o di visibilità. Io ho preso una posizione abbastanza netta: ho spiegato che inserire indicatori fragili avrebbe creato più confusione che valore, ho proposto una versione più essenziale e ho chiarito quali elementi avremmo reinserito solo dopo una validazione migliore. Nel breve abbiamo rinunciato a una parte di copertura, ma in cambio abbiamo ottenuto una base più credibile e una discussione più focalizzata sulle azioni reali da fare.";
  }

  if (phaseName === "DEPTH_CHECK") {
    return "Quando mi muovo in contesti incerti seguo una logica abbastanza costante: chiarisco il problema reale, identifico i criteri che contano di più, poi scelgo che cosa proteggere e che cosa invece può restare secondario. Col tempo ho imparato che una decisione è più robusta quando il trade-off viene esplicitato subito, invece di essere nascosto dietro una falsa completezza.";
  }

  if (phaseName === "CLOSING") {
    return "Se dovessi riassumermi in pochi punti, direi questo: porto capacità di leggere il contesto, trasformare complessità in priorità operative e sostenere decisioni anche quando serve fare scelte non neutre. Porto anche un modo di lavorare utile quando bisogna coordinare richieste diverse, dare struttura al lavoro e trasformare analisi e reporting in uno strumento davvero utilizzabile per allineare stakeholder e far avanzare l’esecuzione.";
  }

  return `Rispondo al punto ${label || `step ${index + 1}`} con un esempio concreto, spiegando contesto, azioni, scelta fatta e risultato.`;
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
    ? "Quali elementi della tua esperienza ti rendono più credibile oggi per un ruolo di coordinamento operativo e gestione delle priorità?"
    : isAnalytical
      ? "Quali elementi della tua esperienza ti rendono più credibile oggi per un ruolo in analisi, reporting e supporto decisionale?"
      : isCreative
        ? "Quali elementi della tua esperienza ti rendono più credibile oggi per un ruolo creativo, progettuale o di linguaggio visivo?"
        : "Quali elementi della tua esperienza ti rendono più credibile oggi per questo ruolo?";
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

async function main() {
  const pipelinePath = resolveProjectPath(
    "tmp",
    "parser-pipeline-groq",
    "full_parser_pipeline_result.json"
  );

  const outputDir = resolveProjectPath("tmp", "demo-reference");
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
        `demo_reference_case: maxSteps (${maxSteps}) reached before completion.`
      );
    }

    const currentStep = runtimeResult?.interviewRuntime?.currentStep || null;
    const answerText = buildSyntheticAnswer(currentStep, stepCounter);

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
    throw new Error("demo_reference_case: interviewReport is missing.");
  }

  const finalReportResult = buildFinalCandidateReport({
    candidateProfile: pipelineResult.candidateProfile,
    roleProfile: pipelineResult.roleProfile,
    jobFitAnalysis: pipelineResult.jobFitAnalysis,
    interviewReport: interviewReportResult.interviewReport
  });

  if (!finalReportResult?.finalCandidateReport) {
    throw new Error("demo_reference_case: finalCandidateReport is missing.");
  }

  const intakeState = buildDemoIntakeState();
  const shellOptions = buildDemoShellOptions(intakeState);

  const demoSessionResult = {
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
    sessionResult: demoSessionResult,
    intakeState,
    shellOptions
  });

  const setupHtml = renderInteractiveInterviewShellHtml({
    sessionResult: demoSessionResult,
    shellOptions
  });

  const reportHtml = renderFringeInterviewReportHtml({
    sessionResult: demoSessionResult
  });

  await writePrettyJson(
    path.join(outputDir, "demo_reference_case_result.json"),
    demoSessionResult
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
  const firstAnswer = answers[0]?.answerAnalysis?.answerShapeAnalysis || {};
  const finalStats = interviewReportResult?.interviewReport?.sessionStats || {};

  printSection("Summary");
  console.log("Demo reference case generated successfully.");
  console.log("Recorded answers:", answers.length);
  console.log("Completed:", runtimeResult?.interviewRuntime?.runtimeState?.isCompleted ?? false);
  console.log("Steps used:", stepCounter);
  console.log("First answer score:", firstAnswer?.overallScore ?? "(missing)");
  console.log("Overall report score:", finalStats?.overallScore ?? "(missing)");
  console.log("Overall band:", finalStats?.overallBand || "(missing)");

  printSection("Output files");
  console.log("- tmp/demo-reference/demo_reference_case_result.json");
  console.log("- tmp/demo-reference/fringe_interview_interactive_shell_setup.html");
  console.log("- tmp/demo-reference/fringe_interview_interactive_shell_report.html");
  console.log("- tmp/demo-reference/interactive_session_payload.json");
  console.log("- tmp/demo-reference/final_candidate_report.json");

  printSection("How to use");
  console.log("1) Run: node scripts/demo_reference_case.js");
  console.log("2) Open: tmp/demo-reference/fringe_interview_interactive_shell_report.html");
  console.log("3) Use this output as the single controlled lab for report quality checks.");

  printSection("Done");
  console.log("Demo reference case completed successfully.");
}

main().catch((error) => {
  console.error("\nDemo reference case failed.");
  console.error(error);
  process.exit(1);
});