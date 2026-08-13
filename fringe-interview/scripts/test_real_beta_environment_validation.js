import assert from "assert";
import { readFile, access } from "fs/promises";
import { constants as fsConstants } from "fs";
import { runIntegratedPrivateBetaJourney } from "../src/app/privateBetaJourneyIntegration.js";

const requiredConfigs = [
  "config/parser_prompts.json",
  "config/parser_schemas.json",
  "config/interview_styles.json",
  "config/interview_depth_profiles.json",
  "config/product_interview_modes.json",
  "config/product_experience_options.json",
  "config/followup_packs.it.json",
  "config/professional_perception_schema.json"
];

async function exists(path) {
  try { await access(path, fsConstants.R_OK); return true; } catch { return false; }
}

const cvText = await readFile("fixtures/sample_cv_01.txt", "utf8");
const jdText = await readFile("fixtures/sample_jd_01.txt", "utf8");
assert.ok(cvText.length > 400, "realistic CV fixture must be non-trivial");
assert.ok(jdText.length > 300, "realistic JD fixture must be non-trivial");

const missingConfigs = [];
for (const path of requiredConfigs) if (!(await exists(path))) missingConfigs.push(path);
assert.ok(missingConfigs.length > 0, "validator expected supplied baseline configuration gap to remain observable");
assert.equal(Boolean(process.env.GROQ_API_KEY), false, "validation environment unexpectedly contains GROQ_API_KEY");

let refusedReads = 0;
const refusedMaterials = {};
Object.defineProperty(refusedMaterials, "cvText", { enumerable: true, get() { refusedReads += 1; return cvText; } });
Object.defineProperty(refusedMaterials, "jdText", { enumerable: true, get() { refusedReads += 1; return jdText; } });
const refused = await runIntegratedPrivateBetaJourney({
  onboardingChoices: ["create", "independent", "prepare_interview"],
  consentDecision: "refuse",
  materials: refusedMaterials,
  now: (() => { let n = 0; return () => new Date(Date.parse("2026-08-13T12:00:00.000Z") + n++ * 1000).toISOString(); })(),
  betaSessionIdFactory: () => "me01-refused",
  betaSessionTokenFactory: () => "me01-refused-resume-token-12345678901234567890"
});
assert.equal(refused.completed, false);
assert.equal(refused.error.code, "CONSENT_REFUSED");
assert.equal(refusedReads, 0, "personal material was read before consent");

const actualPath = await runIntegratedPrivateBetaJourney({
  onboardingChoices: ["create", "independent", "prepare_interview"],
  consentDecision: "accept",
  materials: {
    cvText,
    jdText,
    targetRole: "Product Operations Manager",
    modelAdapter: async () => { throw new Error("ME01_PROVIDER_SHOULD_NOT_BE_REACHED_BEFORE_MISSING_CONFIG_IS_FIXED"); },
    answers: ["Presento liberamente il mio percorso professionale."]
  },
  now: (() => { let n = 0; return () => new Date(Date.parse("2026-08-13T12:10:00.000Z") + n++ * 1000).toISOString(); })(),
  betaSessionIdFactory: () => "me01-real-material",
  betaSessionTokenFactory: () => "me01-real-material-resume-token-12345678901234567890"
});
assert.equal(actualPath.completed, false);
assert.equal(actualPath.status, "blocked");
assert.equal(JSON.stringify(actualPath).includes(cvText.slice(0, 80)), false, "safe failure leaked CV material");

console.log(JSON.stringify({
  validation: "PASS_BLOCKERS_DETECTED",
  betaReady: false,
  missingConfigs,
  providerConfigured: false,
  realMaterialConsentGuard: "PASS",
  safeFailure: "PASS"
}, null, 2));
