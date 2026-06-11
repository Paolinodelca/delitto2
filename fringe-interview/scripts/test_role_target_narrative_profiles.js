import getRoleTargetNarrativeProfile, {
  ROLE_TARGET_NARRATIVE_PROFILES
} from "../src/report/roleTargetNarrativeProfiles.js";

const requiredTargets = {
  care_helping_professions: [
    "family_support",
    "youth_prevention",
    "disability_support"
  ],
  administration_finance_backoffice: [
    "accounting_bookkeeping",
    "administrative_assistant",
    "payroll_hr_admin"
  ],
  sales_commercial_retail: [
    "retail_sales",
    "b2b_sales",
    "insurance_financial_sales"
  ],
  technical_engineering_it: [
    "software_development",
    "it_support_systems",
    "industrial_engineering"
  ],
  analytical_business: [
    "business_analysis",
    "data_reporting",
    "project_operations"
  ]
};

for (const [family, targets] of Object.entries(requiredTargets)) {
  if (!ROLE_TARGET_NARRATIVE_PROFILES[family]) {
    throw new Error(`Missing role target family: ${family}`);
  }

  targets.forEach((target) => {
    const it = getRoleTargetNarrativeProfile({
      roleFamily: family,
      roleTarget: target,
      locale: "it"
    });

    const en = getRoleTargetNarrativeProfile({
      roleFamily: family,
      roleTarget: target,
      locale: "en"
    });

    if (!it?.label || !Array.isArray(it?.focus)) {
      throw new Error(`Missing IT role target profile: ${family}.${target}`);
    }

    if (!en?.label || !Array.isArray(en?.focus)) {
      throw new Error(`Missing EN role target profile: ${family}.${target}`);
    }
  });
}

console.log("✅ Role target narrative profiles loaded correctly.");