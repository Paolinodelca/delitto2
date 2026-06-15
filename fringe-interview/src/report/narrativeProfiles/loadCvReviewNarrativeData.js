import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(
  __dirname,
  "..",
  "narrativeData",
  "cvReview"
);

const cache = new Map();

function readNarrativeFile(roleFamily = "generic_professional") {
  const filePath = path.join(DATA_DIR, `${roleFamily}.json`);

  try {
    const raw = readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function loadCvReviewNarrativeData({
  roleFamily = "generic_professional",
  locale = "it"
} = {}) {
  const cacheKey = `${roleFamily}:${locale}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const parsed =
    readNarrativeFile(roleFamily) ||
    readNarrativeFile("generic_professional");

  const result =
    parsed?.locales?.[locale] ||
    parsed?.locales?.it ||
    null;

  cache.set(cacheKey, result);
  return result;
}

export function applyTemplate(template = "", values = {}) {
  let result = typeof template === "string" ? template : "";

  Object.entries(values).forEach(([key, value]) => {
    result = result.replaceAll(`{{${key}}}`, String(value ?? ""));
  });

  return result;
}