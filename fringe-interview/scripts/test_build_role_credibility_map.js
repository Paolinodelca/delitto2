import buildRoleCredibilityMap from "../src/core/roleEngine/buildRoleCredibilityMap.js";

const map = buildRoleCredibilityMap({
  targetContext: {
    targetRole: "Product Operations Manager",
    roleFamily: "operations_industrial",
    seniorityExpected: "mid/senior"
  }
});

console.log(JSON.stringify(map, null, 2));

if (!Array.isArray(map.dimensions)) {
  throw new Error("Role credibility map dimensions missing.");
}

const roleSpecific = map.dimensions.find(
  (dimension) => dimension.id === "role_specific_competence"
);

if (!roleSpecific || roleSpecific.signals.length === 0) {
  throw new Error("Operations role specific signals missing.");
}

console.log("Role credibility map test passed.");