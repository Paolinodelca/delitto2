const {
  compareStrings,
  isPlainObject,
  isSafeRelativePath,
} = require("./shared");

function isSortedUniqueStrings(values) {
  return (
    Array.isArray(values) &&
    values.every((value) => typeof value === "string") &&
    JSON.stringify(values) === JSON.stringify(Array.from(new Set(values)).sort(compareStrings))
  );
}

function validatePathList(values, field, errors) {
  if (!isSortedUniqueStrings(values)) {
    errors.push(`${field} must be a sorted array of unique strings.`);
    return;
  }
  values.forEach((value, index) => {
    if (!isSafeRelativePath(value)) errors.push(`${field}[${index}] must be repository-relative.`);
  });
}

function validateBuilderStateInventory(inventory = {}) {
  const errors = [];
  const warnings = [];

  if (!isPlainObject(inventory)) {
    return {
      isValid: false,
      errors: ["BuilderStateInventory must be an object."],
      warnings,
    };
  }

  if (inventory.inventoryVersion !== "1.0") {
    errors.push('inventoryVersion must be "1.0".');
  }

  if (!isPlainObject(inventory.repository)) {
    errors.push("repository must be an object.");
  } else {
    if (inventory.repository.root !== ".") errors.push('repository.root must be ".".');
    ["builderRoot", "scriptsRoot"].forEach((field) => {
      if (!isSafeRelativePath(inventory.repository[field])) {
        errors.push(`repository.${field} must be repository-relative.`);
      }
    });
  }

  if (!isPlainObject(inventory.structure)) {
    errors.push("structure must be an object.");
  } else {
    if (!isSafeRelativePath(inventory.structure.root)) {
      errors.push("structure.root must be repository-relative.");
    }
    validatePathList(inventory.structure.directories, "structure.directories", errors);
    validatePathList(inventory.structure.files, "structure.files", errors);
  }

  if (!Array.isArray(inventory.plugins)) {
    errors.push("plugins must be an array.");
  } else {
    const names = inventory.plugins.map((plugin) =>
      isPlainObject(plugin) && typeof plugin.name === "string" ? plugin.name : null
    );
    if (
      names.some((name) => name === null) ||
      JSON.stringify(names) !==
        JSON.stringify(Array.from(new Set(names)).sort(compareStrings))
    ) {
      errors.push("plugins must be sorted by unique name.");
    }
    inventory.plugins.forEach((plugin, index) => {
      if (!isPlainObject(plugin)) {
        errors.push(`plugins[${index}] must be an object.`);
        return;
      }
      if (typeof plugin.name !== "string" || plugin.name.length === 0) {
        errors.push(`plugins[${index}].name must be a non-empty string.`);
      }
      if (!isSafeRelativePath(plugin.relativePath)) {
        errors.push(`plugins[${index}].relativePath must be repository-relative.`);
      }
      if (plugin.entryPoint !== null && !isSafeRelativePath(plugin.entryPoint)) {
        errors.push(`plugins[${index}].entryPoint must be null or repository-relative.`);
      }
    });
  }

  if (!Array.isArray(inventory.publicEntryPoints)) {
    errors.push("publicEntryPoints must be an array.");
  } else {
    const paths = inventory.publicEntryPoints.map((entryPoint) =>
      isPlainObject(entryPoint) && typeof entryPoint.relativePath === "string"
        ? entryPoint.relativePath
        : null
    );
    if (
      paths.some((relativePath) => relativePath === null) ||
      JSON.stringify(paths) !==
        JSON.stringify(Array.from(new Set(paths)).sort(compareStrings))
    ) {
      errors.push("publicEntryPoints must be sorted by unique relativePath.");
    }
    inventory.publicEntryPoints.forEach((entryPoint, index) => {
      if (!isPlainObject(entryPoint)) {
        errors.push(`publicEntryPoints[${index}] must be an object.`);
        return;
      }
      if (!isSafeRelativePath(entryPoint.relativePath)) {
        errors.push(`publicEntryPoints[${index}].relativePath must be repository-relative.`);
      }
      if (!isSortedUniqueStrings(entryPoint.exports)) {
        errors.push(`publicEntryPoints[${index}].exports must be sorted unique strings.`);
      }
    });
  }

  validatePathList(inventory.tests, "tests", errors);
  validatePathList(inventory.regressions, "regressions", errors);
  validatePathList(inventory.healthChecks, "healthChecks", errors);
  validatePathList(inventory.documentation, "documentation", errors);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

module.exports = { validateBuilderStateInventory };
