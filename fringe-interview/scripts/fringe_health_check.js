 import { readFileSync, existsSync } from "fs";

const checks = [];

function addCheck(name, fn) {
  checks.push({ name, fn });
}

function readJson(path) {
  if (!existsSync(path)) {
    throw new Error(`Missing file: ${path}`);
  }

  return JSON.parse(readFileSync(path, "utf8"));
}

addCheck("Config JSON files", () => {
  [
    "config/interview_styles.json",
    "config/interview_depth_profiles.json",
    "config/product_interview_modes.json",
    "config/followup_packs.it.json",
    "config/followup_packs.json"
  ].forEach(readJson);
});

addCheck("Product modes", () => {
  const modes = readJson("config/product_interview_modes.json");

  ["free", "pro", "premium"].forEach((key) => {
    if (!modes[key]) {
      throw new Error(`Missing product mode: ${key}`);
    }

    ["interviewDepth", "defaultInterviewStyle", "interviewIntent"].forEach((field) => {
      if (!modes[key][field]) {
        throw new Error(`Missing ${field} in product mode: ${key}`);
      }
    });
  });
});

addCheck("Interview styles", () => {
  const styles = readJson("config/interview_styles.json");

  Object.entries(styles).forEach(([key, style]) => {
    if (!style.label) {
      throw new Error(`Missing label in interview style: ${key}`);
    }

    if (!Array.isArray(style.preferredFollowupTypes)) {
      throw new Error(`Missing preferredFollowupTypes array in style: ${key}`);
    }
  });
});

addCheck("Product modes reference existing styles/depths", () => {
  const modes = readJson("config/product_interview_modes.json");
  const styles = readJson("config/interview_styles.json");
  const depths = readJson("config/interview_depth_profiles.json");

  Object.entries(modes).forEach(([modeKey, mode]) => {
    if (!depths[mode.interviewDepth]) {
      throw new Error(
        `Product mode ${modeKey} references missing depth: ${mode.interviewDepth}`
      );
    }

    if (!styles[mode.defaultInterviewStyle]) {
      throw new Error(
        `Product mode ${modeKey} references missing style: ${mode.defaultInterviewStyle}`
      );
    }

    (mode.availableInterviewStyles || []).forEach((styleKey) => {
      if (!styles[styleKey]) {
        throw new Error(
          `Product mode ${modeKey} references unavailable style: ${styleKey}`
        );
      }
    });
  });
});

addCheck("Product modes expose required capabilities", () => {
  const modes = readJson("config/product_interview_modes.json");

  const requiredCapabilities = [
    "showRecruiterPanel",
    "showPatternMemory",
    "showDetailedAnswerWorkspace",
    "showPremiumRewriteWorkspace",
    "allowStyleSelection",
    "allowDeepAssessment",
    "showPrintableProOutput"
  ];

  Object.entries(modes).forEach(([modeKey, mode]) => {
    const capabilities = mode?.capabilities || {};

    requiredCapabilities.forEach((capabilityKey) => {
      if (typeof capabilities[capabilityKey] !== "boolean") {
        throw new Error(
          `Missing boolean capability '${capabilityKey}' in mode '${modeKey}'`
        );
      }
    });
  });
});


addCheck("Product capability policy consistency", () => {
  const modes = readJson("config/product_interview_modes.json");

  const pro = modes?.pro?.capabilities || {};
  const premium = modes?.premium?.capabilities || {};
  const free = modes?.free?.capabilities || {};

  if (free.showRecruiterPanel !== false) {
    throw new Error("FREE should not expose showRecruiterPanel by default.");
  }

  if (pro.showRecruiterPanel !== true) {
    throw new Error("PRO should expose showRecruiterPanel.");
  }

  if (pro.showPremiumRewriteWorkspace !== false) {
    throw new Error("PRO should not expose showPremiumRewriteWorkspace.");
  }

  if (premium.showPremiumRewriteWorkspace !== true) {
    throw new Error("PREMIUM should expose showPremiumRewriteWorkspace.");
  }
});

addCheck("Followup packs contain required adaptive triggers", () => {
  const packsIt = readJson("config/followup_packs.it.json").packs || {};

  [
    "consistency_probe",
    "decision_tradeoff_probe",
    "responsibility_probe",
    "achievement_quantification",
    "stakeholder_examples",
    "transferability_probe"
  ].forEach((triggerKey) => {
    if (!packsIt[triggerKey]) {
      throw new Error(`Missing IT followup pack: ${triggerKey}`);
    }
  });
});

let failed = 0;

console.log("\nFRINGE Health Check\n");

for (const check of checks) {
  try {
    check.fn();
    console.log(`✅ ${check.name}`);
  } catch (error) {
    failed += 1;
    console.log(`❌ ${check.name}`);
    console.log(`   ${error.message}`);
  }
}

console.log("");

if (failed > 0) {
  console.log(`Health check failed: ${failed} issue(s).`);
  process.exit(1);
}

console.log("All health checks passed.");