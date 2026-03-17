function stripCodeFences(text) {
  const trimmed = text.trim();

  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  return trimmed
    .replace(/^```[a-zA-Z0-9_-]*\s*/, "")
    .replace(/\s*```$/, "")
    .trim();
}

function findFirstBalancedJsonObject(text) {
  const start = text.indexOf("{");

  if (start === -1) {
    throw new Error("No JSON object start found in model output.");
  }

  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let i = start; i < text.length; i += 1) {
    const char = text[i];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
        continue;
      }

      if (char === "\\") {
        isEscaped = true;
        continue;
      }

      if (char === "\"") {
        inString = false;
      }

      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return text.slice(start, i + 1);
      }

      continue;
    }
  }

  throw new Error("Could not find a complete balanced JSON object in model output.");
}

export function extractJsonObject(modelOutput) {
  if (typeof modelOutput !== "string") {
    throw new Error("extractJsonObject: modelOutput must be a string.");
  }

  const cleaned = stripCodeFences(modelOutput);

  try {
    return JSON.parse(cleaned);
  } catch {
    const jsonSlice = findFirstBalancedJsonObject(cleaned);

    try {
      return JSON.parse(jsonSlice);
    } catch (error) {
      throw new Error(
        [
          "Failed to parse JSON from model output.",
          `Original parse error: ${error.message}`
        ].join("\n")
      );
    }
  }
}