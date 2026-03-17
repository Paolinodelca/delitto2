import { extractJsonObject } from "./extractJsonObject.js";
import { validateParserResult } from "./validateParserResult.js";

function normalizeModelResponse(response) {
  if (typeof response === "string") {
    return response;
  }

  if (response && typeof response === "object") {
    if (typeof response.outputText === "string") {
      return response.outputText;
    }

    if (typeof response.text === "string") {
      return response.text;
    }

    if (typeof response.content === "string") {
      return response.content;
    }
  }

  throw new Error(
    "runParserTask: model response must be a string or an object containing outputText, text, or content."
  );
}

export async function runParserTask({ promptPayload, modelAdapter }) {
  if (!promptPayload || typeof promptPayload !== "object") {
    throw new Error("runParserTask: promptPayload is required.");
  }

  if (!promptPayload.task || !promptPayload.modelInput) {
    throw new Error("runParserTask: promptPayload must include task and modelInput.");
  }

  if (typeof modelAdapter !== "function") {
    throw new Error("runParserTask: modelAdapter must be a function.");
  }

  const { task, modelInput } = promptPayload;

  const rawResponse = await modelAdapter({
    task,
    system: modelInput.system,
    user: modelInput.user
  });

  const rawText = normalizeModelResponse(rawResponse);
  const parsed = extractJsonObject(rawText);

  validateParserResult({
    task,
    result: parsed
  });

  return {
    task,
    rawText,
    parsed
  };
}