function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function splitSnakeCase(value) {
  if (!isNonEmptyString(value)) {
    return [];
  }

  return value.split("_").filter((part) => part.length > 0);
}

function capitalize(value) {
  return value.length === 0
    ? ""
    : `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function toPascalCase(value) {
  return splitSnakeCase(value).map(capitalize).join("");
}

function toCamelCase(value) {
  const pascalName = toPascalCase(value);

  return pascalName.length === 0
    ? null
    : `${pascalName.charAt(0).toLowerCase()}${pascalName.slice(1)}`;
}

function toConstantCase(value) {
  return isNonEmptyString(value)
    ? value.toUpperCase()
    : null;
}

function chooseExplicitOrDerived(explicitValue, derivedValue) {
  return isNonEmptyString(explicitValue)
    ? explicitValue
    : derivedValue;
}

function buildMeasurementModuleNaming({ measureId, naming = {} } = {}) {
  const safeNaming =
    naming !== null &&
    typeof naming === "object" &&
    !Array.isArray(naming)
      ? naming
      : {};

  const snakeName = isNonEmptyString(measureId)
    ? measureId
    : null;

  const pascalName = snakeName !== null
    ? toPascalCase(snakeName)
    : null;

  const camelName = snakeName !== null
    ? toCamelCase(snakeName)
    : null;

  const constantName = snakeName !== null
    ? toConstantCase(snakeName)
    : null;

  return {
    moduleDirectory: chooseExplicitOrDerived(
      safeNaming.moduleDirectory,
      camelName
    ),

    pascalName: chooseExplicitOrDerived(
      safeNaming.pascalName,
      pascalName
    ),

    camelName: chooseExplicitOrDerived(
      safeNaming.camelName,
      camelName
    ),

    snakeName: chooseExplicitOrDerived(
      safeNaming.snakeName,
      snakeName
    ),

    constantName: chooseExplicitOrDerived(
      safeNaming.constantName,
      constantName
    ),
  };
}

module.exports = {
  buildMeasurementModuleNaming,
};
