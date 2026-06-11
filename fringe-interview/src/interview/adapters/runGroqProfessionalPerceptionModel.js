import { setTimeout as delay } from "timers/promises";

function getRequiredApiKey() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("runGroqAnswerAnnotationModel: missing GROQ_API_KEY environment variable.");
  }

  return apiKey;
}

function getModelName() {
  return process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
}

function isRetryableStatus(status) {
  return [429, 500, 502, 503, 504].includes(status);
}

function extractSuggestedWaitMs(rawText) {
  const text = String(rawText || "");

  const match = text.match(/try again in\s+([0-9.]+)s/i);
  if (!match) {
    return null;
  }

  const seconds = Number.parseFloat(match[1]);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return null;
  }

  return Math.ceil(seconds * 1000);
}

async function callGroqOnce({ apiKey, model, systemPrompt, userPrompt }) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    })
  });

  const rawText = await response.text().catch(() => "");

  if (!response.ok) {
    const error = new Error(
      `runGroqAnswerAnnotationModel: Groq request failed with status ${response.status}.`
    );

    error.status = response.status;
    error.rawText = rawText;
    error.suggestedWaitMs = extractSuggestedWaitMs(rawText);
    throw error;
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    const error = new Error("runGroqAnswerAnnotationModel: response body was not valid JSON.");
    error.rawText = rawText;
    throw error;
  }

  return data?.choices?.[0]?.message?.content?.trim() || "";
}

export async function runGroqProfessionalPerceptionModel({
  systemPrompt,
  userPrompt,
  task = "answerAnnotation"
}) {
  if (typeof systemPrompt !== "string" || !systemPrompt.trim()) {
    throw new Error("runGroqAnswerAnnotationModel: systemPrompt is required.");
  }

  if (typeof userPrompt !== "string" || !userPrompt.trim()) {
    throw new Error("runGroqAnswerAnnotationModel: userPrompt is required.");
  }

  const apiKey = getRequiredApiKey();
  const model = getModelName();

  const fallbackRetryDelaysMs = [0, 2500, 8000, 14000];
  let lastError = null;

  for (let attempt = 0; attempt < fallbackRetryDelaysMs.length; attempt += 1) {
    const fallbackWaitMs = fallbackRetryDelaysMs[attempt];

    if (fallbackWaitMs > 0) {
      await delay(fallbackWaitMs);
    }

    try {
      const content = await callGroqOnce({
        apiKey,
        model,
        systemPrompt,
        userPrompt
      });

      return {
        task,
        model,
        rawContent: content
      };
    } catch (error) {
      lastError = error;

      const status = error?.status;
      const rawText = error?.rawText || "";
      const suggestedWaitMs = error?.suggestedWaitMs ?? null;

      console.error(`Groq answer annotation error task: ${task}`);
      if (status) {
        console.error(`Groq answer annotation error status: ${status}`);
      }
      if (rawText) {
        console.error(
          `Groq answer annotation error body: ${rawText.slice(0, 1200)}`
        );
      } else {
        console.error(`Groq answer annotation error message: ${error.message}`);
      }

      if (!isRetryableStatus(status) || attempt === fallbackRetryDelaysMs.length - 1) {
        throw error;
      }

      if (suggestedWaitMs && suggestedWaitMs > 0) {
        const paddedWaitMs = suggestedWaitMs + 1500;
        await delay(paddedWaitMs);
      }
    }
  }

  throw lastError || new Error("runGroqAnswerAnnotationModel: unknown failure.");
}