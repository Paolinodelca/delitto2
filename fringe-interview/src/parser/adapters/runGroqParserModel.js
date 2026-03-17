const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function getRequiredApiKey() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    throw new Error(
      "runGroqParserModel: missing GROQ_API_KEY environment variable."
    );
  }

  return apiKey.trim();
}

function getGroqModel() {
  const model = process.env.GROQ_MODEL;

  if (!model || !model.trim()) {
    return DEFAULT_GROQ_MODEL;
  }

  return model.trim();
}

function normalizeText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetryStatus(status) {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function buildRequestBody({ model, systemText, userText, temperature, maxTokens }) {
  const requestBody = {
    model,
    temperature,
    messages: [
      { role: "system", content: systemText },
      { role: "user", content: userText }
    ]
  };

  if (typeof maxTokens === "number" && Number.isFinite(maxTokens) && maxTokens > 0) {
    requestBody.max_tokens = maxTokens;
  }

  return requestBody;
}

async function executeGroqRequest({
  task,
  apiKey,
  model,
  systemText,
  userText,
  temperature,
  maxTokens
}) {
  const requestBody = buildRequestBody({
    model,
    systemText,
    userText,
    temperature,
    maxTokens
  });

  const response = await fetch(DEFAULT_GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  const rawText = await response.text().catch(() => "");

  return {
    response,
    rawText
  };
}

export async function runGroqParserModel({
  task = "unknown",
  system,
  user,
  temperature = 0.2,
  maxTokens,
  maxRetries = 2,
  retryDelayMs = 1200
}) {
  const apiKey = getRequiredApiKey();
  const model = getGroqModel();

  const systemText = normalizeText(system);
  const userText = normalizeText(user);

  if (!systemText) {
    throw new Error("runGroqParserModel: system prompt is required.");
  }

  if (!userText) {
    throw new Error("runGroqParserModel: user prompt is required.");
  }

  let lastStatus = null;
  let lastRawText = "";

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const { response, rawText } = await executeGroqRequest({
      task,
      apiKey,
      model,
      systemText,
      userText,
      temperature,
      maxTokens
    });

    lastStatus = response.status;
    lastRawText = rawText;

    if (!response.ok) {
      const retryable = shouldRetryStatus(response.status);
      const hasAnotherAttempt = attempt < maxRetries;

      console.error("Groq parser error task:", task);
      console.error("Groq parser error status:", response.status);
      console.error("Groq parser error body:", rawText.slice(0, 2000));

      if (retryable && hasAnotherAttempt) {
        const waitMs = retryDelayMs * (attempt + 1);
        console.error(`Groq parser retrying in ${waitMs} ms...`);
        await sleep(waitMs);
        continue;
      }

      throw new Error(
        `runGroqParserModel: Groq request failed with status ${response.status}.`
      );
    }

    let data;

    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("Groq parser non-JSON body:", rawText.slice(0, 2000));
      throw new Error("runGroqParserModel: response body is not valid JSON.");
    }

    const content = data?.choices?.[0]?.message?.content;

    if (typeof content !== "string" || !content.trim()) {
      console.error(
        "Groq parser empty response payload:",
        JSON.stringify(data).slice(0, 2000)
      );
      throw new Error("runGroqParserModel: empty model content.");
    }

    return {
      outputText: content.trim(),
      meta: {
        provider: "groq",
        model,
        task,
        attemptsUsed: attempt + 1
      }
    };
  }

  throw new Error(
    `runGroqParserModel: Groq request failed after retries. Last status: ${lastStatus}. Last body: ${lastRawText.slice(0, 500)}`
  );
}