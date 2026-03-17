import path from "path";
import { fileURLToPath } from "url";
import { readJsonFile } from "./readJsonFile.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", "..", ...segments);
}

export async function loadParserPrompts() {
  const filePath = resolveProjectPath("config", "parser_prompts.json");
  return readJsonFile(filePath);
}

export async function loadParserSchema() {
  const filePath = resolveProjectPath("config", "parser_schema.json");
  return readJsonFile(filePath);
}

export async function loadParserConfig() {
  const [prompts, schema] = await Promise.all([
    loadParserPrompts(),
    loadParserSchema()
  ]);

  return {
    prompts,
    schema
  };
}