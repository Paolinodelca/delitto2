const childProcess = require("child_process");
const builder = require("../tools/imago-builder");
const inventoryModule = require(
  "../tools/imago-builder/internal/builder-state-inventory"
);

function run(script) {
  const result = childProcess.spawnSync(process.execPath, [script], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  return result.status === 0;
}

const checks = {
  foundationTest: run("scripts/test_builder_state_inventory_foundation.js"),
  regressionTest: run("scripts/test_builder_state_inventory_regression.js"),
  internalBuilderAvailable:
    typeof inventoryModule.buildBuilderStateInventory === "function",
  internalValidatorAvailable:
    typeof inventoryModule.validateBuilderStateInventory === "function",
  internalSerializerAvailable:
    typeof inventoryModule.serializeBuilderStateInventory === "function",
  inventoryNotPublic:
    !Object.prototype.hasOwnProperty.call(builder, "buildBuilderStateInventory") &&
    !Object.prototype.hasOwnProperty.call(builder, "validateBuilderStateInventory") &&
    !Object.prototype.hasOwnProperty.call(builder, "serializeBuilderStateInventory"),
};

const failed = Object.entries(checks)
  .filter(([, value]) => value !== true)
  .map(([name]) => name);

console.log(JSON.stringify({
  check: "Builder State Inventory Health",
  status: failed.length === 0 ? "PASS" : "FAIL",
  checks,
  failed,
}, null, 2));

if (failed.length > 0) process.exit(1);
console.log("Builder State Inventory Health: PASS");
