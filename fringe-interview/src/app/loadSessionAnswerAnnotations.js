import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", "..", ...segments);
}

async function readJsonFile(filePath) {
  const raw = await readFile(filePath, "utf8");

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(
      [
        `loadSessionAnswerAnnotations: invalid JSON in file ${filePath}`,
        `Original error: ${error.message}`
      ].join("\n")
    );
  }
}

export async function loadSessionAnswerAnnotations({
  fileName = "session_answer_annotations_result.json"
} = {}) {
  const filePath = resolveProjectPath("tmp", "answer-annotation", fileName);
  return readJsonFile(filePath);
}