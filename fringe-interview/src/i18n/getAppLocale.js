import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", "..", ...segments);
}

function safeReadLocaleConfig() {
  const filePath = resolveProjectPath("config", "app_locale.json");

  try {
    const raw = readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return {
      defaultLocale: "en",
      fallbackLocale: "en",
      supportedLocales: ["en"]
    };
  }
}

export function getAppLocaleConfig() {
  return safeReadLocaleConfig();
}

export function getActiveLocale() {
  const config = safeReadLocaleConfig();

  if (typeof config?.defaultLocale === "string" && config.defaultLocale.trim()) {
    return config.defaultLocale.trim();
  }

  return "en";
}

export function getFallbackLocale() {
  const config = safeReadLocaleConfig();

  if (typeof config?.fallbackLocale === "string" && config.fallbackLocale.trim()) {
    return config.fallbackLocale.trim();
  }

  return "en";
}