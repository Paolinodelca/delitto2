import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", "..", ...segments);
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function readInterviewLengthModesFile() {
  const filePath = resolveProjectPath("config", "interview_length_modes.json");
  const raw = readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function validateLengthModesConfig(config) {
  if (!config || typeof config !== "object") {
    throw new Error("loadInterviewLengthModes: config must be an object.");
  }

  const defaultMode = normalizeString(config.defaultMode);
  const supportedModes = ensureArray(config.supportedModes)
    .map(normalizeString)
    .filter(Boolean);
  const modes = config.modes;

  if (!defaultMode) {
    throw new Error("loadInterviewLengthModes: defaultMode is required.");
  }

  if (!supportedModes.length) {
    throw new Error("loadInterviewLengthModes: supportedModes must not be empty.");
  }

  if (!modes || typeof modes !== "object") {
    throw new Error("loadInterviewLengthModes: modes is required.");
  }

  for (const modeKey of supportedModes) {
    const mode = modes[modeKey];

    if (!mode || typeof mode !== "object") {
      throw new Error(
        `loadInterviewLengthModes: mode definition missing for "${modeKey}".`
      );
    }
  }

  if (!supportedModes.includes(defaultMode)) {
    throw new Error(
      "loadInterviewLengthModes: defaultMode must be included in supportedModes."
    );
  }

  return {
    version: Number.isFinite(config.version) ? config.version : 1,
    defaultMode,
    supportedModes,
    modes
  };
}

export function loadInterviewLengthModes() {
  const config = readInterviewLengthModesFile();

  return {
    interviewLengthModes: validateLengthModesConfig(config)
  };
}