import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getFallbackLocale } from "./getAppLocale.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) { return path.resolve(__dirname, "..", "..", ...segments); }
function normalizeLocale(value, fallback = "it") { const raw = String(value || fallback).toLowerCase(); return raw.startsWith("en") ? "en" : "it"; }
function readLocale(locale) {
  const filePath = resolveProjectPath("config", `private_beta_ui.${locale}.json`);
  return JSON.parse(readFileSync(filePath, "utf8"));
}
export function loadPrivateBetaUiMessages(locale = "it") {
  const normalized = normalizeLocale(locale, "it");
  try { return Object.freeze(readLocale(normalized)); }
  catch { return Object.freeze(readLocale(normalizeLocale(getFallbackLocale(), "en"))); }
}
export default loadPrivateBetaUiMessages;
