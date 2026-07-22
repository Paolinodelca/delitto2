function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value !== null && typeof value === "object") {
    return Object.keys(value)
      .sort((left, right) => left.localeCompare(right, "en"))
      .reduce((result, key) => {
        result[key] = sortValue(value[key]);
        return result;
      }, {});
  }
  return value;
}

function serializeBuilderStateInventory(inventory) {
  return `${JSON.stringify(sortValue(inventory), null, 2)}\n`;
}

module.exports = { serializeBuilderStateInventory };
