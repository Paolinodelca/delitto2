module.exports = {
  ...require("./buildCapabilityContribution"),
  ...require("./validateCapabilityContribution"),

  ...require("./buildCapabilityDefinition"),
  ...require("./validateCapabilityDefinition"),

  ...require("./buildCapabilityContributionMatch"),
  ...require("./validateCapabilityContributionMatch"),

  ...require("./buildCapabilityAggregationContext"),
  ...require("./validateCapabilityAggregationContext"),

  ...require("./buildCapabilityResult"),
  ...require("./validateCapabilityResult"),

  ...require("./healthBuildCapabilityCore"),
};