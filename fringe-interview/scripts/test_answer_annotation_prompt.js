import { writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { buildAnswerAnnotationPrompt } from "../src/interview/buildAnswerAnnotationPrompt.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", ...segments);
}

async function main() {
  const exampleAnswer = {
    answerId: "example_01",
    questionLabel: "Leadership",
    questionPrompt:
      "Hai mai guidato o orientato altre persone anche senza essere manager formalmente?",
    answerText:
      "Nel mio ruolo precedente non ero formalmente manager, ma coordinavo due analisti che preparavano i dati per le valutazioni di fattibilità delle commesse. Ho definito con loro il metodo di analisi e le priorità settimanali, in modo che il lavoro fosse utile alle decisioni del titolare. Questo ha ridotto parecchio il tempo necessario per capire quali progetti portare avanti.",
    reviewMode: "interview"
  };

  const prompt = await buildAnswerAnnotationPrompt(exampleAnswer);

  const outputPath = resolveProjectPath(
    "tmp",
    "answer-annotation",
    "answer_annotation_prompt_preview.json"
  );

  await writeFile(outputPath, JSON.stringify(prompt, null, 2), "utf8");

  console.log("");
  console.log("Answer annotation prompt generated.");
  console.log("File written to:");
  console.log(outputPath);
  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error("Answer annotation prompt test failed.");
  console.error(error);
  console.error("");
});