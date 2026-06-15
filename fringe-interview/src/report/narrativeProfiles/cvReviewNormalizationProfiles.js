import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NORMALIZATION_DATA_DIR = path.resolve(
  __dirname,
  "..",
  "narrativeData",
  "normalization"
);

const cache = new Map();

function readJsonProfile(roleFamily) {
  if (cache.has(roleFamily)) {
    return cache.get(roleFamily);
  }

  const filePath = path.join(
    NORMALIZATION_DATA_DIR,
    `${roleFamily}.json`
  );

  try {
    const raw = readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    cache.set(roleFamily, parsed);
    return parsed;
  } catch {
    cache.set(roleFamily, null);
    return null;
  }
}

export function getCvReviewNormalizationProfile(
  roleFamily = "generic_professional"
) {
  return readJsonProfile(roleFamily);
}

export default getCvReviewNormalizationProfile;