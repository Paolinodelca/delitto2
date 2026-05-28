import { loadProductInterviewModes } from "./loadProductInterviewModes.js";

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function firstAvailable(list = [], fallback = "") {
  return Array.isArray(list) && list.length > 0 ? list[0] : fallback;
}

function resolveAllowedValue({
  requestedValue,
  defaultValue,
  availableValues = [],
  fallbackValue = ""
}) {
  const cleanRequested = normalizeString(requestedValue);
  const cleanDefault = normalizeString(defaultValue);
  const available = Array.isArray(availableValues) ? availableValues : [];

  if (cleanRequested && available.includes(cleanRequested)) {
    return cleanRequested;
  }

  if (cleanDefault && available.includes(cleanDefault)) {
    return cleanDefault;
  }

  return firstAvailable(available, fallbackValue);
}

export function resolveProductExperience({
  productMode = "pro",
  interviewDepth = "",
  interviewStyle = "",
  interviewIntent = ""
} = {}) {
  const modes = loadProductInterviewModes();

  const resolvedProductMode =
    normalizeString(productMode).toLowerCase() || "pro";

  const productConfig =
    modes?.[resolvedProductMode] || modes?.pro || {};

  const available = productConfig?.availableExperienceOptions || {};

  return {
    productMode: resolvedProductMode,

    interviewDepth: resolveAllowedValue({
      requestedValue: interviewDepth,
      defaultValue: productConfig?.interviewDepth,
      availableValues: available?.interviewDepth,
      fallbackValue: "standard"
    }),

    interviewStyle: resolveAllowedValue({
      requestedValue: interviewStyle,
      defaultValue: productConfig?.defaultInterviewStyle,
      availableValues: available?.interviewStyle,
      fallbackValue: "structured_corporate"
    }),

    interviewIntent: resolveAllowedValue({
      requestedValue: interviewIntent,
      defaultValue: productConfig?.interviewIntent,
      availableValues: available?.interviewIntent,
      fallbackValue: "simulation"
    })
  };
}