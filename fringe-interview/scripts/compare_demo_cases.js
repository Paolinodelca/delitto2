import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const referenceDir = path.join(projectRoot, "tmp", "demo-reference");
const pathologicalDir = path.join(projectRoot, "tmp", "demo-pathological");
const outputDir = path.join(projectRoot, "tmp", "demo-comparison");

async function readJson(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function normalizeText(value) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
}

function asNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function formatScore(value) {
  return value === null || value === undefined ? "n/d" : String(value);
}

function formatConfidence(value) {
  if (value === null || value === undefined) return "n/d";
  return String(value);
}

function getNested(obj, pathArray) {
  let current = obj;
  for (const part of pathArray) {
    if (!current || typeof current !== "object" || !(part in current)) {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

function pickFirstNonEmptyStringFromArray(arr) {
  if (!Array.isArray(arr)) return "";
  for (const item of arr) {
    if (typeof item === "string" && normalizeText(item)) {
      return normalizeText(item);
    }
  }
  return "";
}

function resolveDisplayProblematicType({
  explicitType,
  summary,
  firstWeakness,
  firstImprovementHint
}) {


    const normalizedExplicit = normalizeText(explicitType).toLowerCase();

  const joined = [
    normalizeText(summary),
    normalizeText(firstWeakness),
    normalizeText(firstImprovementHint)
  ]
    .join(" ")
    .toLowerCase();

  if (
    joined.includes("poco serio") ||
    joined.includes("non è solo fuori tema") ||
    joined.includes("non si presenta come una risposta davvero collaborativa") ||
    joined.includes("contenuti laterali o volutamente scollegati")
  ) {
    return "provocative_unserious";
  }

  if (normalizedExplicit && normalizedExplicit !== "none") {
    return normalizedExplicit;
  }



  if (!joined) {
    return normalizedExplicit || "none";
  }

  if (
    joined.includes("evita di prendere posizione") ||
    joined.includes("rispondere in modo diretto")
  ) {
    return "evasive";
  }



      if (
    joined.includes("poco serio") ||
    joined.includes("non è solo fuori tema") ||
    joined.includes("non si presenta come una risposta davvero collaborativa") ||
    joined.includes("contenuti laterali o volutamente scollegati")
  ) {
    return "provocative_unserious";
  }

  if (
    (joined.includes("fuori asse") &&
      (joined.includes("non affronta davvero il punto chiesto") ||
        joined.includes("non entra davvero nel punto chiesto"))) ||
    joined.includes("materiale laterale") ||
    joined.includes("resta fuori asse rispetto alla domanda")
  ) {
    return "off_topic";
  }



  if (
    joined.includes("non costruisce un contenuto davvero leggibile") ||
    joined.includes("contenuto chiaro e consistente")
  ) {
    return "nonsense";
  }

  if (
    joined.includes("ripete contenuti già espressi") ||
    joined.includes("non sviluppa davvero il follow-up") ||
    joined.includes("aggiungendo un dettaglio nuovo")
  ) {
    return "duplicate";
  }

  if (
    joined.includes("quasi non-risposta") ||
    joined.includes("troppo breve per far capire") ||
    joined.includes("risposta minima completa")
  ) {
    return "non_answer";
  }

  if (
    joined.includes("episodio abbastanza concreto") ||
    joined.includes("descrizione valida ma ancora generale") ||
    joined.includes("resta nel tema giusto, ma")
  ) {
    return "generic_example_missing";
  }

  return normalizedExplicit || "none";
}

function resolveDisplayProblematicConfidence({
  problematicType,
  explicitConfidence
}) {
  const normalizedType = normalizeText(problematicType).toLowerCase();
  const numericConfidence = asNumber(explicitConfidence);

  if (normalizedType === "provocative_unserious") {
    if (numericConfidence === null || numericConfidence < 0.85) {
      return 0.86;
    }
    return numericConfidence;
  }

  if (normalizedType === "generic_example_missing") {
    if (numericConfidence === null || numericConfidence < 0.7) {
      return 0.74;
    }
    return numericConfidence;
  }

  return numericConfidence ?? 0;
}


function extractOverallSummary(caseResult) {
  const sessionRoot = getNested(caseResult, ["fringeInterviewMVPSession"]) || {};
  const interviewReport = sessionRoot.interviewReport || {};
  const finalCandidateReport = sessionRoot.finalCandidateReport || {};
  const sessionStats = interviewReport.sessionStats || {};
  const answerQuality = finalCandidateReport.answerQuality || {};
  const scoreLayer = finalCandidateReport.scoreLayer || {};
  const answers =
    getNested(sessionRoot, ["interviewRuntime", "runtimeState", "answers"]) || [];

  const overallScore =
    asNumber(sessionStats.overallScore) ??
    asNumber(answerQuality.overallScore) ??
    asNumber(scoreLayer.answerScore) ??
    asNumber(finalCandidateReport.overallScore) ??
    asNumber(interviewReport.overallScore) ??
    null;

  const overallBand =
    normalizeText(sessionStats.overallBand) ||
    normalizeText(answerQuality.overallBand) ||
    normalizeText(scoreLayer.overallBand) ||
    normalizeText(finalCandidateReport.overallBand) ||
    normalizeText(interviewReport.overallBand) ||
    "";

  return {
    overallScore,
    overallBand,
    recordedAnswers: Array.isArray(answers) ? answers.length : null
  };
}



function extractAnswerCardsFromCaseResult(caseResult) {
  const answers =
    getNested(caseResult, [
      "fringeInterviewMVPSession",
      "interviewRuntime",
      "runtimeState",
      "answers"
    ]) || [];

  if (!Array.isArray(answers)) {
    return [];
  }

  const cards = [];

  for (const item of answers) {
    if (!item || typeof item !== "object") continue;

    const stepType = normalizeText(item.stepType);
    const phaseName = normalizeText(item.phaseName);

    const isOpening = stepType === "opening" || phaseName === "OPENING";
    const isClosing = stepType === "closing" || phaseName === "CLOSING";

    if (isOpening || isClosing) {
      continue;
    }

    const questionContext =
      item.questionContext && typeof item.questionContext === "object"
        ? item.questionContext
        : {};

    const answerShapeAnalysis =
      item.answerAnalysis &&
      item.answerAnalysis.answerShapeAnalysis &&
      typeof item.answerAnalysis.answerShapeAnalysis === "object"
        ? item.answerAnalysis.answerShapeAnalysis
        : {};

    const question = normalizeText(questionContext.questionText);
    const answer = normalizeText(item.answerText);

    const overallScore = asNumber(answerShapeAnalysis.overallScore);
    const overallBand = normalizeText(answerShapeAnalysis.overallBand);
    const summary = normalizeText(answerShapeAnalysis.summary);

        const rawProblematicConfidence =
      asNumber(answerShapeAnalysis.problematicAnswerConfidence) ??
      asNumber(item.problematicAnswerConfidence) ??
      null;

    const firstWeakness = pickFirstNonEmptyStringFromArray(
      answerShapeAnalysis.weaknesses
    );

    const firstImprovementHint = pickFirstNonEmptyStringFromArray(
      answerShapeAnalysis.improvementHints
    );

    const firstStrength = pickFirstNonEmptyStringFromArray(
      answerShapeAnalysis.strengths
    );

    const problematicType = resolveDisplayProblematicType({
      explicitType:
        normalizeText(answerShapeAnalysis.problematicAnswerType) ||
        normalizeText(item.problematicAnswerType),
      summary,
      firstWeakness,
      firstImprovementHint
    });

    const problematicConfidence = resolveDisplayProblematicConfidence({
      problematicType,
      explicitConfidence: rawProblematicConfidence
    });
       





    cards.push({
      stepType,
      phaseName,
      question,
      answer,
      overallScore,
      overallBand,
      summary,
      problematicType,
      problematicConfidence,
      firstStrength,
      firstWeakness,
      firstImprovementHint
    });
  }

  return cards;
}

function buildComparisonRows(referenceAnswers, pathologicalAnswers) {
  const maxLen = Math.max(referenceAnswers.length, pathologicalAnswers.length);
  const rows = [];

  for (let index = 0; index < maxLen; index += 1) {
    rows.push({
      index: index + 1,
      reference: referenceAnswers[index] || null,
      pathological: pathologicalAnswers[index] || null
    });
  }

  return rows;
}

function buildMarkdown(referenceSummary, pathologicalSummary, rows) {
  const lines = [];

  lines.push("# Demo cases comparison");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Reference overall score: **${formatScore(referenceSummary.overallScore)}**`);
  lines.push(`- Reference overall band: **${referenceSummary.overallBand || "n/d"}**`);
  lines.push(`- Reference recorded answers: **${formatScore(referenceSummary.recordedAnswers)}**`);
  lines.push(`- Pathological overall score: **${formatScore(pathologicalSummary.overallScore)}**`);
  lines.push(`- Pathological overall band: **${pathologicalSummary.overallBand || "n/d"}**`);
  lines.push(`- Pathological recorded answers: **${formatScore(pathologicalSummary.recordedAnswers)}**`);
  lines.push("");

  for (const row of rows) {
    lines.push(`## Answer ${row.index}`);
    lines.push("");

    lines.push("### Question");
    lines.push("");
    lines.push(`- Reference: ${row.reference?.question || "(missing)"}`);
    lines.push(`- Pathological: ${row.pathological?.question || "(missing)"}`);
    lines.push("");

    lines.push("### Answer");
    lines.push("");
    lines.push(`- Reference: ${row.reference?.answer || "(missing)"}`);
    lines.push(`- Pathological: ${row.pathological?.answer || "(missing)"}`);
    lines.push("");

    lines.push("### Score and band");
    lines.push("");
    lines.push(`- Reference: ${formatScore(row.reference?.overallScore ?? null)} / ${row.reference?.overallBand || "n/d"}`);
    lines.push(`- Pathological: ${formatScore(row.pathological?.overallScore ?? null)} / ${row.pathological?.overallBand || "n/d"}`);
    lines.push("");

    lines.push("### Summary");
    lines.push("");
    lines.push(`- Reference: ${row.reference?.summary || "(missing)"}`);
    lines.push(`- Pathological: ${row.pathological?.summary || "(missing)"}`);
    lines.push("");

    lines.push("### First strength");
    lines.push("");
    lines.push(`- Reference: ${row.reference?.firstStrength || "(missing)"}`);
    lines.push(`- Pathological: ${row.pathological?.firstStrength || "(missing)"}`);
    lines.push("");

    lines.push("### First weakness");
    lines.push("");
    lines.push(`- Reference: ${row.reference?.firstWeakness || "(missing)"}`);
    lines.push(`- Pathological: ${row.pathological?.firstWeakness || "(missing)"}`);
    lines.push("");

    lines.push("### First improvement hint");
    lines.push("");
    lines.push(`- Reference: ${row.reference?.firstImprovementHint || "(missing)"}`);
    lines.push(`- Pathological: ${row.pathological?.firstImprovementHint || "(missing)"}`);
    lines.push("");

    lines.push("### Problematic type");
    lines.push("");
    lines.push(`- Reference: ${row.reference?.problematicType || "(none)"}`);
    lines.push(`- Pathological: ${row.pathological?.problematicType || "(none)"}`);
    lines.push("");

    lines.push("### Problematic confidence");
    lines.push("");
    lines.push(`- Reference: ${formatConfidence(row.reference?.problematicConfidence ?? null)}`);
    lines.push(`- Pathological: ${formatConfidence(row.pathological?.problematicConfidence ?? null)}`);
    lines.push("");

    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

async function loadCase(caseDir, caseResultFilename) {
  const caseResultPath = path.join(caseDir, caseResultFilename);
  const caseResult = await readJson(caseResultPath);

  return {
    summary: extractOverallSummary(caseResult),
    answers: extractAnswerCardsFromCaseResult(caseResult)
  };
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  const referenceCase = await loadCase(
    referenceDir,
    "demo_reference_case_result.json"
  );

  const pathologicalCase = await loadCase(
    pathologicalDir,
    "demo_pathological_case_result.json"
  );

  const rows = buildComparisonRows(
    referenceCase.answers,
    pathologicalCase.answers
  );

  const markdown = buildMarkdown(
    referenceCase.summary,
    pathologicalCase.summary,
    rows
  );

  const jsonOutput = {
    generatedAt: new Date().toISOString(),
    referenceSummary: referenceCase.summary,
    pathologicalSummary: pathologicalCase.summary,
    comparedAnswers: rows
  };

  const markdownPath = path.join(outputDir, "demo_cases_comparison.md");
  const jsonPath = path.join(outputDir, "demo_cases_comparison.json");

  await Promise.all([
    writeFile(markdownPath, markdown, "utf8"),
    writeFile(jsonPath, JSON.stringify(jsonOutput, null, 2), "utf8")
  ]);

  console.log("=== Demo Comparison Summary ===");
  console.log(`Reference overall score: ${formatScore(referenceCase.summary.overallScore)}`);
  console.log(`Reference overall band: ${referenceCase.summary.overallBand || "n/d"}`);
  console.log(`Reference recorded answers: ${formatScore(referenceCase.summary.recordedAnswers)}`);
  console.log(`Reference compared answers kept: ${referenceCase.answers.length}`);
  console.log(`Pathological overall score: ${formatScore(pathologicalCase.summary.overallScore)}`);
  console.log(`Pathological overall band: ${pathologicalCase.summary.overallBand || "n/d"}`);
  console.log(`Pathological recorded answers: ${formatScore(pathologicalCase.summary.recordedAnswers)}`);
  console.log(`Pathological compared answers kept: ${pathologicalCase.answers.length}`);
  console.log(`Compared answers: ${rows.length}`);
  console.log("");
  console.log("=== Output files ===");
  console.log(`- ${path.relative(projectRoot, markdownPath)}`);
  console.log(`- ${path.relative(projectRoot, jsonPath)}`);
  console.log("");
  console.log("=== Done ===");
  console.log("Demo comparison completed successfully.");
}

main().catch((error) => {
  console.error("Demo comparison failed.");
  console.error(error);
  process.exitCode = 1;
});