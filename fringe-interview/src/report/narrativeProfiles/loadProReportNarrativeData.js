import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(
  __dirname,
  "..",
  "narrativeData",
  "proReport"
);

const cache = new Map();

function readNarrativeFile(roleFamily, locale) {
  try {
    const filePath = path.join(DATA_DIR, `${roleFamily}.json`);
    const raw = readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);

    return (
      parsed?.locales?.[locale] ||
      parsed?.locales?.it ||
      null
    );
  } catch {
    return null;
  }
}

export default function loadProReportNarrativeData({
  roleFamily = "care_helping_professions",
  locale = "it"
} = {}) {
  const normalizedRoleFamily =
    roleFamily || "care_helping_professions";

  const normalizedLocale =
    locale || "it";

  const cacheKey = `${normalizedRoleFamily}:${normalizedLocale}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const fallback =
    readNarrativeFile("generic_professional", normalizedLocale) ||
    readNarrativeFile("care_helping_professions", normalizedLocale) ||
    {};

  const selected =
    readNarrativeFile(normalizedRoleFamily, normalizedLocale) ||
    {};

  const result = {
    ...fallback,
    ...selected,
    ui:
      selected?.ui ||
      fallback?.ui ||
      {}
  };

  cache.set(cacheKey, result);

  return result;
}