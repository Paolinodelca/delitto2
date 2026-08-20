import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { runAnswerAnnotation } from "../src/interview/runAnswerAnnotation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", ...segments);
}

async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

async function main() {
  const outputDir = resolveProjectPath("tmp", "answer-annotation");
  await ensureDir(outputDir);

  console.log("");
  console.log("=== Running answer annotation via Groq ===");

  const result = await runAnswerAnnotation({
    answerId: "example_01",
    questionLabel: "Leadership",
    questionPrompt:
      "Hai mai guidato o orientato altre persone anche senza essere manager formalmente?",
    answerText:
      "Nel mio ruolo precedente non ero formalmente manager, ma coordinavo due analisti che preparavano i dati per le valutazioni di fattibilità delle commesse. Ho definito con loro il metodo di analisi e le priorità settimanali, in modo che il lavoro fosse utile alle decisioni del titolare. Questo ha ridotto del 20% il tempo necessario per capire quali progetti portare avanti. Da quell’esperienza ho imparato che, anche senza un titolo formale, la chiarezza del metodo e delle priorità può orientare davvero il lavoro degli altri.",
    reviewMode: "interview"
  });

  const outputPath = path.join(
    outputDir,
    "answer_annotation_result.json"
  );

  await writeFile(outputPath, JSON.stringify(result, null, 2), "utf8");

  console.log("");
  console.log("=== Summary ===");
  console.log("Task:", result?.meta?.task || "—");
  console.log("Locale:", result?.meta?.locale || "—");
  console.log("Model:", result?.meta?.model || "—");
  console.log(
    "Overall band:",
    result?.answerAnnotation?.summary?.overallBand || "—"
  );
  console.log(
    "Top strength:",
    result?.answerAnnotation?.summary?.topStrength || "—"
  );
  console.log(
    "Top improvement area:",
    result?.answerAnnotation?.summary?.topImprovementArea || "—"
  );
  const aa = result?.answerAnnotation || {};
  console.log("Provider calls:", result?.meta?.providerCallCount || "—");
  console.log("Annotation count:", Array.isArray(aa.annotations) ? aa.annotations.length : 0);
  console.log("Strengths count:", Array.isArray(aa.strengths) ? aa.strengths.length : 0);
  console.log("Weaknesses count:", Array.isArray(aa.weaknesses) ? aa.weaknesses.length : 0);
  console.log("Coach tip present:", Boolean(aa.coachTip));
  console.log("Upgrade suggestion present:", Boolean(aa.upgradeSuggestion));
  console.log("Improved answer draft:", aa.improvedAnswerDraft?.isProvided === true ? "provided" : "not provided");
  for (const annotation of aa.annotations || []) {
    console.log(
      `Annotation ${annotation.annotationId} span exact:`,
      aa.answerText.slice(annotation.start, annotation.end) === annotation.excerpt
    );
  }

  console.log("");
  console.log("=== Output file ===");
  console.log(`- ${outputPath}`);
  console.log("");
  console.log("=== Done ===");
  console.log("Answer annotation Groq test completed successfully.");
  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error("Answer annotation Groq test failed.");
  console.error(error);
  console.error("");
});