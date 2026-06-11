import detectRoleTarget from "../src/report/detectRoleTarget.js";

const cases = [
  {
    roleFamily: "care_helping_professions",
    targetRole: "servizi educativi per infanzia e famiglie",
    expected: "family_support"
  },
  {
    roleFamily: "care_helping_professions",
    targetRole: "sportelli di ascolto e prevenzione per giovani",
    expected: "youth_prevention"
  },
  {
    roleFamily: "care_helping_professions",
    targetRole: "servizi educativi individuali e di gruppo per persone con disabilità",
    expected: "disability_support"
  },
  {
    roleFamily: "care_helping_professions",
    targetRole: "",
    expected: ""
  },
  {
    roleFamily: "analytical_business",
    targetRole: "Business Analyst",
    expected: ""
  }
];

for (const item of cases) {
  const result = detectRoleTarget({
    roleFamily: item.roleFamily,
    targetRole: item.targetRole
  });

  if (result !== item.expected) {
    throw new Error(
      `detectRoleTarget failed for "${item.targetRole}". Expected "${item.expected}", got "${result}".`
    );
  }
}

console.log("✅ detectRoleTarget works correctly.");