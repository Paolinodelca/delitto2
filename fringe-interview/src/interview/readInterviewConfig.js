import { readFile } from "fs/promises";
import { readFileSync } from "fs";
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
        `readInterviewConfig: invalid JSON in file ${filePath}`,
        `Original error: ${error.message}`
      ].join("\n")
    );
  }
}

function readLocaleConfigSync() {
  const filePath = resolveProjectPath("config", "app_locale.json");

  try {
    const raw = readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return {
      defaultLocale: "en",
      fallbackLocale: "en"
    };
  }
}

function getLocalizedConfigCandidates(baseName) {
  const localeConfig = readLocaleConfigSync();
  const defaultLocale = typeof localeConfig?.defaultLocale === "string"
    ? localeConfig.defaultLocale.trim()
    : "en";
  const fallbackLocale = typeof localeConfig?.fallbackLocale === "string"
    ? localeConfig.fallbackLocale.trim()
    : "en";

  const names = [];

  if (defaultLocale) {
    names.push(`${baseName}.${defaultLocale}.json`);
  }

  if (fallbackLocale && fallbackLocale !== defaultLocale) {
    names.push(`${baseName}.${fallbackLocale}.json`);
  }

  names.push(`${baseName}.json`);

  return names;
}

async function loadLocalizedConfig(baseName) {
  const candidates = getLocalizedConfigCandidates(baseName);

  for (const fileName of candidates) {
    const filePath = resolveProjectPath("config", fileName);

    try {
      return await readJsonFile(filePath);
    } catch (error) {
      if (error.code === "ENOENT") {
        continue;
      }

      if (String(error.message || "").includes("invalid JSON")) {
        throw error;
      }
    }
  }

  throw new Error(
    `readInterviewConfig: no configuration file found for base name "${baseName}".`
  );
}

export async function loadQuestionFamilies() {
  return loadLocalizedConfig("question_families");
}

export async function loadFollowupPacks() {
  return loadLocalizedConfig("followup_packs");
}

export async function loadInterviewConfig() {
  const [questionFamilies, followupPacks] = await Promise.all([
    loadQuestionFamilies(),
    loadFollowupPacks()
  ]);

  return {
    questionFamilies,
    followupPacks
  };
}