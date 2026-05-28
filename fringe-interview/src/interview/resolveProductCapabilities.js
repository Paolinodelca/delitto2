import { loadProductInterviewModes } from "./loadProductInterviewModes.js";

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function resolveProductCapabilities(productMode = "pro") {
  const modes = loadProductInterviewModes();

  const resolvedProductMode =
    normalizeString(productMode).toLowerCase() || "pro";

  const productConfig =
    modes?.[resolvedProductMode] || modes?.pro || {};

  return {
    productMode: resolvedProductMode,
    label: productConfig?.label || resolvedProductMode,
    capabilities: clone(productConfig?.capabilities || {})
  };
}