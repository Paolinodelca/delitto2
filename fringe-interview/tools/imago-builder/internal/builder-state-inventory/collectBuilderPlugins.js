const { compareStrings } = require("./shared");

function collectBuilderPlugins(scan) {
  const pluginRoot = `${scan.roots.builder}/plugins/`;
  const names = new Set();

  scan.builderFiles.forEach((relativePath) => {
    if (!relativePath.startsWith(pluginRoot)) return;
    const pluginName = relativePath.slice(pluginRoot.length).split("/")[0];
    if (pluginName) names.add(pluginName);
  });

  return Array.from(names)
    .sort(compareStrings)
    .map((name) => ({
      name,
      relativePath: `${pluginRoot}${name}`,
      entryPoint: scan.builderFiles.includes(`${pluginRoot}${name}/index.js`)
        ? `${pluginRoot}${name}/index.js`
        : null,
    }));
}

module.exports = { collectBuilderPlugins };
