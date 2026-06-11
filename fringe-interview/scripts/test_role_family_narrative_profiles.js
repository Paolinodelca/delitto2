import getRoleFamilyNarrativeProfile from "../src/report/roleFamilyNarrativeProfiles.js";

const families = [
  "generic_professional",
  "operations_logistics_industrial",
  "administration_finance_backoffice",
  "analytical_business",
  "sales_commercial_retail",
  "customer_service_success",
  "care_helping_professions",
  "education_training",
  "technical_engineering_it",
  "creative_design_marketing"
];

for (const family of families) {
  const it = getRoleFamilyNarrativeProfile(family, "it");
  const en = getRoleFamilyNarrativeProfile(family, "en");

  if (!it?.label || !Array.isArray(it?.vocabulary)) {
    throw new Error(`Missing IT narrative profile for ${family}`);
  }

  if (!en?.label || !Array.isArray(en?.vocabulary)) {
    throw new Error(`Missing EN narrative profile for ${family}`);
  }
}

console.log("✅ Role family narrative profiles loaded correctly.");