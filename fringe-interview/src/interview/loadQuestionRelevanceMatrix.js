import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedMatrix = null;

export default function loadQuestionRelevanceMatrix() {
  if (cachedMatrix) {
    return cachedMatrix;
  }

  const filePath = path.resolve(__dirname, "../../config/question_relevance_matrix.json");
  const raw = readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);

  cachedMatrix = parsed;
  return parsed;
}