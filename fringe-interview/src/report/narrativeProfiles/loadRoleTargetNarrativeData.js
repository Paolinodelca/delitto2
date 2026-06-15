import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(
  __dirname,
  "..",
  "narrativeData",
  "roleTargets"
);

const cache = new Map();

export default function loadRoleTargetNarrativeData({
  roleFamily = "generic_professional",
  roleTarget = "",
  locale = "it"
} = {}) {
  const cacheKey = `${roleFamily}:${roleTarget}:${locale}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const filePath = path.join(DATA_DIR, `${roleFamily}.json`);
    const raw = readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);

    const localeData =
      parsed?.locales?.[locale] ||
      parsed?.locales?.it ||
      {};

    const result = localeData?.targets?.[roleTarget] || null;

    cache.set(cacheKey, result);
    return result;
  } catch {
    cache.set(cacheKey, null);
    return null;
  }
}